"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import Papa from "papaparse"
import { supabase } from "@/lib/supabase"
import { useSession } from "next-auth/react"

type Transaction = {
  id?: number
  Pairs: string
  Time: string
  Side: "Buy" | "Sell"
  "Filled Price": number
  "Executed Amount": string
  Total: number
  Fee: number
  Role: string
}

type PriceHistoryEntry = {
  id: number
  pair_id: number
  price: number
  timestamp: string
  source: string
}

type TradingPair = {
  id: number
  symbol: string
  base_currency: string
  quote_currency: string
  current_price: number | null
  last_updated: string | null
}

type CryptoDataContextType = {
  transactions: Transaction[]
  setTransactions: (data: Transaction[]) => void
  hasData: boolean
  activePair: string | null
  setActivePair: (pair: string | null) => void
  loadCSV: (file: File) => Promise<void>
  saveToDatabase: () => Promise<any>
  isSaving: boolean
  currentPrice: number | null
  isLoadingPrice: boolean
  refreshCurrentPrice: () => Promise<void>
  lastPriceUpdate: Date | null
  isPriceMocked: boolean
  isLoadingFromDB: boolean
  loadFromDatabase: (pairSymbol?: string) => Promise<void>
  priceHistory: PriceHistoryEntry[]
  loadPriceHistory: (pairSymbol: string, days?: number) => Promise<void>
  tradingPairs: TradingPair[]
  loadTradingPairs: () => Promise<void>
  uploadedFiles: any[]
  addUploadedFile: (file: any) => Promise<void>
  getTransactionStats: () => {
    totalBuyVolume: number
    totalSellVolume: number
    avgBuyPrice: number
    avgSellPrice: number
    totalBuys: number
    totalSells: number
    totalFees: number
    netProfit: number
    totalVolume: number
  }
  calculateProfitScenario: (
    buyPrice: number,
    amount: number,
    referencePrice?: number,
  ) => {
    potentialProfit: number
    additionalCoins: number
    percentageGain: number
  }
}

const CryptoDataContext = createContext<CryptoDataContextType | undefined>(undefined)

// Add this interface for the Papa.parse results
interface CSVRow {
  Pairs: string;
  Time: string;
  Side: string;
  "Filled Price": string | number;
  "Executed Amount": string | number;
  Total: string | number;
  Fee: string | number;
  Role?: string;
  [key: string]: any;
}

// Add this interface for the trading pairs data
interface TradingPairData {
  symbol: string;
  base_currency: string;
  quote_currency: string;
  id?: number;
  [key: string]: any;
}

export function CryptoDataProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activePair, setActivePair] = useState<string | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null)
  const [isPriceMocked, setIsPriceMocked] = useState(false)
  const [isLoadingFromDB, setIsLoadingFromDB] = useState(false)
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([])
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  const hasData = transactions.length > 0

  // Load trading pairs on initial load
  useEffect(() => {
    loadTradingPairs()
  }, [])

  // Load transactions for the active pair when it changes
  useEffect(() => {
    if (activePair) {
      loadFromDatabase(activePair)
      refreshCurrentPrice()
      loadPriceHistory(activePair)
    }
  }, [activePair])

  const loadTradingPairs = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.from("trading_pairs").select("*").order("symbol");

      if (error) {
        console.error("Error loading trading pairs:", error);
        return;
      }

      // Ensure data is properly typed
      const typedData = data as TradingPair[];
      setTradingPairs(typedData || []);

      // If we have pairs but no active pair, set the first one as active
      if (typedData && typedData.length > 0 && !activePair) {
        setActivePair(typedData[0].symbol);
      }
    } catch (error) {
      console.error("Error loading trading pairs:", error);
    }
  };

  const loadFromDatabase = async (pairSymbol?: string): Promise<void> => {
    setIsLoadingFromDB(true)

    try {
      let query = supabase
        .from("transactions")
        .select(`
          id,
          transaction_time,
          side,
          filled_price,
          executed_amount,
          total,
          fee,
          role,
          trading_pairs!inner(symbol, base_currency, quote_currency)
        `)
        .order("transaction_time", { ascending: false })

      if (pairSymbol) {
        query = query.eq("trading_pairs.symbol", pairSymbol)
      }

      // If user is authenticated, filter by their user_id
      if (userId) {
        query = query.eq("user_id", userId)
      } else {
        // If no user, still allow access to public data
        query = query.is("user_id", null)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error loading transactions:", error)
        return
      }

      // Transform the data to match our Transaction type
      const transformedData = data.map((item) => ({
        id: item.id,
        Pairs: item.trading_pairs.symbol,
        Time: item.transaction_time,
        Side: item.side as "Buy" | "Sell",
        "Filled Price": item.filled_price,
        "Executed Amount": item.executed_amount.toString(),
        Total: item.total,
        Fee: item.fee || 0,
        Role: item.role || "",
      }))

      setTransactions(transformedData)

      // If we have transactions but no active pair, set the pair from the first transaction
      if (transformedData.length > 0 && !activePair) {
        setActivePair(transformedData[0].Pairs)
      }
    } catch (error) {
      console.error("Error loading from database:", error)
    } finally {
      setIsLoadingFromDB(false)
    }
  }

  const loadPriceHistory = async (pairSymbol: string, days = 30): Promise<void> => {
    try {
      // First get the pair ID
      const { data: pairData } = await supabase.from("trading_pairs").select("id").eq("symbol", pairSymbol).single()

      if (!pairData) {
        console.error("Trading pair not found:", pairSymbol)
        return
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from("price_history")
        .select("*")
        .eq("pair_id", pairData.id)
        .gte("timestamp", startDate.toISOString())
        .order("timestamp", { ascending: true })

      if (error) {
        console.error("Error loading price history:", error)
        return
      }

      setPriceHistory(data || [])
    } catch (error) {
      console.error("Error loading price history:", error)
    }
  }

  const addUploadedFile = async (file: any): Promise<void> => {
    try {
      // Add to local state
      setUploadedFiles((prev) => [...prev, file])

      // Could also save to Supabase if needed
      // const { data, error } = await supabase
      //   .from("uploaded_files")
      //   .insert({
      //     filename: file.name,
      //     size: file.size,
      //     type: file.type,
      //     uploaded_at: new Date().toISOString()
      //   })
    } catch (error) {
      console.error("Error adding uploaded file:", error)
    }
  }

  const refreshCurrentPrice = async () => {
    if (!activePair) return

    setIsLoadingPrice(true)
    try {
      // Use our server-side API route to fetch the price
      const response = await fetch(`/api/price?symbol=${activePair}`)
      
      // Get fallback price from price history or default
      const fallbackPrice = priceHistory.length > 0 
        ? priceHistory[0].price 
        : 0.01 // Default fallback price
      
      if (!response.ok) {
        console.warn(`Error fetching price: ${response.status}`)
        setCurrentPrice(fallbackPrice)
        setIsPriceMocked(true)
        setLastPriceUpdate(new Date())
        return
      }
      
      const data = await response.json()

      if (data.rate !== undefined && data.rate !== null) {
        setCurrentPrice(data.rate)
        setLastPriceUpdate(new Date())
        setIsPriceMocked(data.mockData || false)
        
        if (data.error) {
          console.warn(`Price API warning: ${data.error}`)
        }
      } else {
        // Log the error with appropriate handling
        const errorMessage = data.error || "No rate data returned from API"
        console.warn(errorMessage)
        
        setCurrentPrice(fallbackPrice)
        setIsPriceMocked(true)
        setLastPriceUpdate(new Date())
      }
    } catch (error) {
      console.warn("Error fetching current price:", error)
      
      // Get fallback price from price history
      const fallbackPrice = priceHistory.length > 0 
        ? priceHistory[0].price 
        : 0.01 // Default fallback price
        
      setCurrentPrice(fallbackPrice)
      setIsPriceMocked(true)
      setLastPriceUpdate(new Date())
    } finally {
      setIsLoadingPrice(false)
    }
  }

  const loadCSV = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      Papa.parse<CSVRow>(file, {
        header: true,
        complete: (results) => {
          try {
            // Process and validate the data
            const parsedData = results.data
              .filter((item): item is CSVRow => item && typeof item === "object")
              .map((item) => {
                // Ensure numeric fields are properly converted
                const filledPrice = Number.parseFloat(String(item["Filled Price"])) || 0;
                const total = Number.parseFloat(String(item["Total"])) || 0;
                const fee = Number.parseFloat(String(item["Fee"])) || 0;

                return {
                  ...item,
                  "Filled Price": filledPrice,
                  Total: total,
                  Fee: fee,
                  Side: item.Side as "Buy" | "Sell"
                } as Transaction;
              });

            setTransactions(parsedData);

            // Set active pair from the first transaction
            if (parsedData.length > 0) {
              setActivePair(parsedData[0].Pairs);
            }

            // Track the uploaded file
            addUploadedFile({
              name: file.name,
              size: file.size,
              type: file.type,
              rows: parsedData.length,
              uploadedAt: new Date().toISOString(),
            });

            resolve();
          } catch (error) {
            console.error("Error processing CSV data:", error);
            reject(error);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          reject(error);
        },
      });
    });
  };

  const saveToDatabase = async () => {
    if (!hasData) return { success: false, error: "No data to save" }
    if (!userId) return { success: false, error: "You must be logged in to save data" }

    setIsSaving(true)
    try {
      const response = await fetch("/api/save-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          transactions,
          userId
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save transactions")
      }

      // Refresh trading pairs after saving
      await loadTradingPairs()

      return result
    } catch (error: any) {
      console.error("Error saving to database:", error)
      throw new Error(error.message || "Failed to save transactions")
    } finally {
      setIsSaving(false)
    }
  }

  const getTransactionStats = () => {
    if (!hasData) {
      return {
        totalBuyVolume: 0,
        totalSellVolume: 0,
        avgBuyPrice: 0,
        avgSellPrice: 0,
        totalBuys: 0,
        totalSells: 0,
        totalFees: 0,
        netProfit: 0,
        totalVolume: 0,
      }
    }

    try {
      const buys = transactions.filter((t) => t.Side === "Buy")
      const sells = transactions.filter((t) => t.Side === "Sell")

      const totalBuyVolume = buys.reduce((sum, t) => sum + (t.Total || 0), 0)
      const totalSellVolume = sells.reduce((sum, t) => sum + (t.Total || 0), 0)
      const totalVolume = totalBuyVolume + totalSellVolume

      const totalBuys = buys.length
      const totalSells = sells.length

      const avgBuyPrice = totalBuys > 0 ? buys.reduce((sum, t) => sum + (t["Filled Price"] || 0), 0) / totalBuys : 0

      const avgSellPrice = totalSells > 0 ? sells.reduce((sum, t) => sum + (t["Filled Price"] || 0), 0) / totalSells : 0

      const totalFees = transactions.reduce((sum, t) => sum + (typeof t.Fee === "number" ? t.Fee : 0), 0)

      const netProfit = totalSellVolume - totalBuyVolume - totalFees

      return {
        totalBuyVolume,
        totalSellVolume,
        avgBuyPrice,
        avgSellPrice,
        totalBuys,
        totalSells,
        totalFees,
        netProfit,
        totalVolume,
      }
    } catch (error) {
      console.error("Error calculating transaction stats:", error)
      return {
        totalBuyVolume: 0,
        totalSellVolume: 0,
        avgBuyPrice: 0,
        avgSellPrice: 0,
        totalBuys: 0,
        totalSells: 0,
        totalFees: 0,
        netProfit: 0,
        totalVolume: 0,
      }
    }
  }

  const calculateProfitScenario = (buyPrice: number, amount: number, referencePrice?: number) => {
    try {
      const stats = getTransactionStats()

      // If a reference price is provided, use it
      // Otherwise, if we have a current price, use it instead of historical average sell price
      const sellPrice = referencePrice || currentPrice || stats.avgSellPrice

      if (isNaN(buyPrice) || buyPrice <= 0 || isNaN(amount) || amount <= 0 || sellPrice <= 0) {
        return {
          potentialProfit: 0,
          additionalCoins: 0,
          percentageGain: 0,
        }
      }

      const currentCoins = amount / sellPrice
      const potentialCoins = amount / buyPrice
      const additionalCoins = potentialCoins - currentCoins
      const percentageGain = (additionalCoins / currentCoins) * 100
      const potentialProfit = additionalCoins * sellPrice

      return {
        potentialProfit,
        additionalCoins,
        percentageGain,
      }
    } catch (error) {
      console.error("Error calculating profit scenario:", error)
      return {
        potentialProfit: 0,
        additionalCoins: 0,
        percentageGain: 0,
      }
    }
  }

  return (
    <CryptoDataContext.Provider
      value={{
        transactions,
        setTransactions,
        hasData,
        activePair,
        setActivePair,
        loadCSV,
        saveToDatabase,
        isSaving,
        currentPrice,
        isLoadingPrice,
        refreshCurrentPrice,
        lastPriceUpdate,
        isPriceMocked,
        isLoadingFromDB,
        loadFromDatabase,
        priceHistory,
        loadPriceHistory,
        tradingPairs,
        loadTradingPairs,
        uploadedFiles,
        addUploadedFile,
        getTransactionStats,
        calculateProfitScenario,
      }}
    >
      {children}
    </CryptoDataContext.Provider>
  )
}

export function useCryptoData() {
  const context = useContext(CryptoDataContext)
  if (context === undefined) {
    throw new Error("useCryptoData must be used within a CryptoDataProvider")
  }
  return context
}

