import { NextResponse } from "next/server"

export async function GET(request: Request) {
  let symbolParam: string | null = null;
  
  try {
    const url = new URL(request.url)
    symbolParam = url.searchParams.get("symbol")

    if (!symbolParam) {
      return NextResponse.json(
        { error: "Symbol parameter is required", mockData: true, rate: 0 }, 
        { status: 200 }
      )
    }

    // Parse the symbol
    const [baseCurrency, quoteCurrency] = symbolParam.split("_")

    if (!baseCurrency || !quoteCurrency) {
      return NextResponse.json(
        { 
          error: "Invalid symbol format. Expected format: BASE_QUOTE (e.g., BTC_USD)", 
          mockData: true, 
          rate: getMockPrice(symbolParam) 
        },
        { status: 200 }
      )
    }

    // Get the API key from environment variables
    const apiKey = process.env.COINAPI_KEY

    if (!apiKey) {
      console.warn("API key not configured, using mock data")
      return NextResponse.json(
        { 
          error: "API key not configured", 
          mockData: true, 
          rate: getMockPrice(symbolParam) 
        }, 
        { status: 200 }
      )
    }

    try {
      // Call CoinAPI
      const response = await fetch(`https://rest.coinapi.io/v1/exchangerate/${baseCurrency}/${quoteCurrency}`, {
        headers: {
          "X-CoinAPI-Key": apiKey,
        },
      })

      if (!response.ok) {
        // If we hit rate limits or other API issues
        if (response.status === 429) {
          console.warn("Rate limit exceeded for CoinAPI")
        } else {
          console.warn(`API error: ${response.status}`)
        }
        
        const mockPrice = getMockPrice(symbolParam)
        
        // Try to store the mock price in the database
        try {
          const { updatePriceInDatabase } = await import("@/lib/api")
          await updatePriceInDatabase(symbolParam, mockPrice)
        } catch (dbError) {
          console.error("Failed to update mock price in database:", dbError)
        }
        
        return NextResponse.json(
          { 
            error: `API error: ${response.status}`, 
            mockData: true, 
            rate: mockPrice 
          },
          { status: 200 }
        )
      }

      const data = await response.json()

      // Store the price in the database
      try {
        const { updatePriceInDatabase } = await import("@/lib/api")
        await updatePriceInDatabase(symbolParam, data.rate)
      } catch (dbError) {
        console.error("Failed to update price in database:", dbError)
      }

      return NextResponse.json({
        symbol: symbolParam,
        rate: data.rate,
        time: data.time,
        mockData: false,
      })
    } catch (fetchError) {
      console.error("Error fetching from CoinAPI:", fetchError)
      const mockPrice = getMockPrice(symbolParam)
      
      // Try to store the mock price in the database
      try {
        const { updatePriceInDatabase } = await import("@/lib/api")
        await updatePriceInDatabase(symbolParam, mockPrice)
      } catch (dbError) {
        console.error("Failed to update mock price in database:", dbError)
      }
      
      return NextResponse.json(
        { 
          error: "Failed to fetch price data", 
          mockData: true, 
          rate: mockPrice 
        }, 
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Unexpected error in price API:", error)
    return NextResponse.json(
      { 
        error: "Unexpected error", 
        mockData: true, 
        rate: getMockPrice(symbolParam || "UNKNOWN") 
      }, 
      { status: 200 }
    )
  }
}

// Mock function for fallback
function getMockPrice(symbol: string): number {
  const basePrice = symbol.includes("BTC")
    ? 50000
    : symbol.includes("ETH")
      ? 3000
      : symbol.includes("SNEK")
        ? 0.003
        : 0.1

  const randomFactor = 0.95 + Math.random() * 0.1
  return basePrice * randomFactor
}

