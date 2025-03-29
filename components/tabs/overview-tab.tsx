"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCryptoData } from "@/components/crypto-data-provider"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  RefreshCw,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Clock,
} from "lucide-react"
import { PriceChart } from "@/components/charts/price-chart"
import { VolumeChart } from "@/components/charts/volume-chart"
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

export function OverviewTab() {
  const {
    hasData,
    getTransactionStats,
    activePair,
    currentPrice,
    isLoadingPrice,
    refreshCurrentPrice,
    lastPriceUpdate,
    isPriceMocked,
    transactions,
    isLoadingFromDB,
    loadFromDatabase,
    tradingPairs,
    setActivePair,
  } = useCryptoData()

  const [latestTransactions, setLatestTransactions] = useState<any[]>([])
  const [isLoadingLatest, setIsLoadingLatest] = useState(false)

  const stats = getTransactionStats()

  // Calculate price difference between current and average
  const priceDifference =
    currentPrice && stats.avgSellPrice ? ((currentPrice - stats.avgSellPrice) / stats.avgSellPrice) * 100 : 0

  // Load latest transactions across all pairs
  useEffect(() => {
    const fetchLatestTransactions = async () => {
      setIsLoadingLatest(true)
      try {
        const response = await fetch("/api/transactions?limit=5")
        const data = await response.json()

        if (response.ok && data.transactions) {
          setLatestTransactions(data.transactions)
        }
      } catch (error) {
        console.error("Error fetching latest transactions:", error)
      } finally {
        setIsLoadingLatest(false)
      }
    }

    fetchLatestTransactions()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Current Price Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Market Price</CardTitle>
          <Button variant="ghost" size="icon" onClick={refreshCurrentPrice} disabled={isLoadingPrice || !activePair}>
            <RefreshCw className={`h-4 w-4 ${isLoadingPrice ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingPrice ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{currentPrice ? currentPrice.toFixed(6) : "N/A"}</div>

                {isPriceMocked && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-amber-500">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Using estimated price data. CoinAPI may have rate limits or the pair might not be available.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">
                  {activePair ? activePair.replace("_", "/") : "No pair selected"}
                </p>
                {lastPriceUpdate && (
                  <p className="text-xs text-muted-foreground">Last updated: {formatDate(lastPriceUpdate)}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Average Sell Price Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Sell Price</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{stats.avgSellPrice > 0 ? stats.avgSellPrice.toFixed(6) : "N/A"}</div>
          </div>
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">Based on {stats.totalSells} sell transactions</p>

            {/* Price comparison */}
            {currentPrice && stats.avgSellPrice > 0 && (
              <div className="mt-1 flex items-center gap-1">
                <Badge variant={priceDifference >= 0 ? "default" : "destructive"} className="h-5 px-1">
                  <span className="flex items-center text-xs">
                    {priceDifference >= 0 ? (
                      <ArrowUp className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDown className="mr-1 h-3 w-3" />
                    )}
                    {formatPercentage(Math.abs(priceDifference))}
                  </span>
                </Badge>
                <span className="text-xs text-muted-foreground">vs current market price</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Net Profit/Loss Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit/Loss</CardTitle>
          {stats.netProfit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(stats.netProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            {hasData ? `From ${activePair ? activePair.replace("_", "/") : "all pairs"}` : "No data available"}
          </p>
        </CardContent>
      </Card>

      {/* Volume Card */}
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trading Volume</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Buy Volume</span>
              <span className="text-xl font-bold">{formatCurrency(stats.totalBuyVolume)}</span>
              <span className="text-xs text-muted-foreground">{stats.totalBuys} transactions</span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Sell Volume</span>
              <span className="text-xl font-bold">{formatCurrency(stats.totalSellVolume)}</span>
              <span className="text-xs text-muted-foreground">{stats.totalSells} transactions</span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Volume</span>
              <span className="text-xl font-bold">{formatCurrency(stats.totalVolume)}</span>
              <span className="text-xs text-muted-foreground">{stats.totalBuys + stats.totalSells} transactions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Transactions */}
      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Latest Transactions</CardTitle>
          <CardDescription>Most recent transactions across all pairs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLatest ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading latest transactions...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : latestTransactions.length > 0 ? (
                  latestTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono">{formatDate(tx.transaction_time)}</TableCell>
                      <TableCell>{tx.trading_pairs.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={tx.side === "Buy" ? "default" : "secondary"}>{tx.side}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{tx.filled_price.toFixed(6)}</TableCell>
                      <TableCell className="text-right">
                        {Number.parseFloat(tx.executed_amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(tx.total)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Trading Pairs Summary */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>Trading Pairs</CardTitle>
          <CardDescription>Available pairs in database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tradingPairs.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto">
                <div className="space-y-2">
                  {tradingPairs.map((pair) => (
                    <div
                      key={pair.id}
                      className={`flex items-center justify-between rounded-md p-2 cursor-pointer hover:bg-muted ${
                        activePair === pair.symbol ? "bg-muted" : ""
                      }`}
                      onClick={() => setActivePair(pair.symbol)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-1">
                          <Clock className="h-3 w-3 text-primary" />
                        </div>
                        <span>{pair.symbol.replace("_", "/")}</span>
                      </div>
                      <div className="text-sm">{pair.current_price ? pair.current_price.toFixed(6) : "N/A"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No trading pairs found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Price History</CardTitle>
          <CardDescription>
            {hasData
              ? `Transaction prices over time for ${activePair ? activePair.replace("_", "/") : "all pairs"}`
              : "Upload data to see price history"}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <PriceChart currentPrice={currentPrice} avgSellPrice={stats.avgSellPrice} />
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>Volume Distribution</CardTitle>
          <CardDescription>Buy vs Sell volume</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <VolumeChart />
        </CardContent>
      </Card>
    </div>
  )
}

