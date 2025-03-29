// API functions for fetching cryptocurrency data

export async function fetchCurrentPrice(symbol: string): Promise<number | null> {
  try {
    // Format the symbol for CoinAPI
    // Convert from format like "SNEK_USDT" to "SNEK/USDT"
    const [baseCurrency, quoteCurrency] = symbol.split("_")

    if (!baseCurrency || !quoteCurrency) {
      console.error("Invalid symbol format:", symbol)
      return null
    }

    // Format for CoinAPI
    const apiSymbol = `${baseCurrency}/${quoteCurrency}`

    // Get the API key from environment variables
    const apiKey = process.env.COINAPI_KEY

    if (!apiKey) {
      console.error("CoinAPI key not found in environment variables")
      return mockPriceData(symbol)
    }

    const response = await fetch(`https://rest.coinapi.io/v1/exchangerate/${baseCurrency}/${quoteCurrency}`, {
      headers: {
        "X-CoinAPI-Key": apiKey,
      },
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!response.ok) {
      console.warn(`Failed to fetch price for ${symbol}, status: ${response.status}`)

      // If we hit rate limits or other API issues, use mock data
      if (response.status === 429) {
        console.warn("Rate limit exceeded for CoinAPI")
      }

      return mockPriceData(symbol)
    }

    const data = await response.json()
    return data.rate || null
  } catch (error) {
    console.error("Error fetching current price:", error)
    return mockPriceData(symbol)
  }
}

// Mock function to generate realistic price data for demo purposes
function mockPriceData(symbol: string): number {
  // Generate a realistic price based on the symbol
  // This is just for demonstration when the API is unavailable
  const basePrice = symbol.includes("BTC")
    ? 50000
    : symbol.includes("ETH")
      ? 3000
      : symbol.includes("SNEK")
        ? 0.003
        : 0.1

  // Add some randomness (±5%)
  const randomFactor = 0.95 + Math.random() * 0.1
  return basePrice * randomFactor
}

// Function to update price in Supabase
export async function updatePriceInDatabase(pairSymbol: string, price: number): Promise<void> {
  const { supabase } = await import("./supabase")

  try {
    // First check if the pair exists
    const { data: existingPair } = await supabase.from("trading_pairs").select("id").eq("symbol", pairSymbol).single()

    if (existingPair) {
      // Update existing pair
      await supabase
        .from("trading_pairs")
        .update({
          current_price: price,
          last_updated: new Date().toISOString(),
        })
        .eq("id", existingPair.id)

      // Add to price history
      await supabase.from("price_history").insert({
        pair_id: existingPair.id,
        price: price,
        timestamp: new Date().toISOString(),
      })
    } else {
      // Create new pair
      const [baseCurrency, quoteCurrency] = pairSymbol.split("_")

      const { data: newPair } = await supabase
        .from("trading_pairs")
        .insert({
          symbol: pairSymbol,
          base_currency: baseCurrency || "UNKNOWN",
          quote_currency: quoteCurrency || "USDT",
          current_price: price,
          last_updated: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (newPair) {
        // Add to price history
        await supabase.from("price_history").insert({
          pair_id: newPair.id,
          price: price,
          timestamp: new Date().toISOString(),
        })
      }
    }
  } catch (error) {
    console.error("Error updating price in database:", error)
  }
}

