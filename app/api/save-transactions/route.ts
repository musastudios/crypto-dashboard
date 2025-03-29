import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const { transactions } = await request.json()

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "Invalid transactions data" }, { status: 400 })
    }

    console.log(`Processing ${transactions.length} transactions...`)

    // Process transactions in batches to avoid hitting limits
    const results = []
    const batchSize = 50 // Reduced batch size for better reliability

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(transactions.length / batchSize)}...`,
      )

      // Process each transaction in the batch
      for (const tx of batch) {
        try {
          // Check if the trading pair exists
          const { data: existingPair, error: pairError } = await supabaseAdmin
            .from("trading_pairs")
            .select("id")
            .eq("symbol", tx.Pairs)
            .single()

          if (pairError && pairError.code !== "PGRST116") {
            // PGRST116 is "no rows returned" which is expected
            console.error("Error checking for existing pair:", pairError)
            results.push({ status: "error", transaction: tx, error: pairError })
            continue
          }

          let pairId

          if (existingPair) {
            pairId = existingPair.id
            console.log(`Found existing pair: ${tx.Pairs} with ID: ${pairId}`)
          } else {
            // Create new trading pair
            const [baseCurrency, quoteCurrency] = tx.Pairs.split("_")

            const { data: newPair, error: insertPairError } = await supabaseAdmin
              .from("trading_pairs")
              .insert({
                symbol: tx.Pairs,
                base_currency: baseCurrency || "UNKNOWN",
                quote_currency: quoteCurrency || "USDT",
              })
              .select("id")
              .single()

            if (insertPairError) {
              console.error("Error inserting new pair:", insertPairError)
              results.push({ status: "error", transaction: tx, error: insertPairError })
              continue
            }

            pairId = newPair?.id
            console.log(`Created new pair: ${tx.Pairs} with ID: ${pairId}`)
          }

          if (pairId) {
            // Check if transaction already exists to avoid duplicates
            const { data: existingTx, error: txCheckError } = await supabaseAdmin
              .from("transactions")
              .select("id")
              .eq("pair_id", pairId)
              .eq("transaction_time", tx.Time)
              .eq("filled_price", tx["Filled Price"])
              .eq("executed_amount", Number.parseFloat(tx["Executed Amount"]))
              .single()

            if (txCheckError && txCheckError.code !== "PGRST116") {
              console.error("Error checking for existing transaction:", txCheckError)
            }

            if (existingTx) {
              console.log(`Transaction already exists, skipping...`)
              results.push({ status: "skipped", transaction: tx })
              continue
            }

            // Insert transaction
            const { error: insertTxError } = await supabaseAdmin.from("transactions").insert({
              pair_id: pairId,
              transaction_time: tx.Time,
              side: tx.Side,
              filled_price: tx["Filled Price"],
              executed_amount: Number.parseFloat(tx["Executed Amount"]),
              total: tx.Total,
              fee: tx.Fee || 0,
              role: tx.Role || "Unknown",
            })

            if (insertTxError) {
              console.error("Error inserting transaction:", insertTxError)
              results.push({ status: "error", transaction: tx, error: insertTxError })
            } else {
              console.log(`Successfully inserted transaction for ${tx.Pairs} at ${tx.Time}`)
              results.push({ status: "success", transaction: tx })
            }
          } else {
            console.error("Failed to get pair ID")
            results.push({ status: "error", transaction: tx, error: "Failed to get pair ID" })
          }
        } catch (txError) {
          console.error("Error processing transaction:", txError)
          results.push({ status: "error", transaction: tx, error: txError })
        }
      }
    }

    const successCount = results.filter((r) => r.status === "success").length
    const errorCount = results.filter((r) => r.status === "error").length
    const skippedCount = results.filter((r) => r.status === "skipped").length

    return NextResponse.json({
      success: true,
      message: `Processed ${transactions.length} transactions: ${successCount} successful, ${errorCount} failed, ${skippedCount} skipped`,
      results,
    })
  } catch (error) {
    console.error("Error saving transactions:", error)
    return NextResponse.json({ error: "Failed to save transactions", details: error }, { status: 500 })
  }
}

