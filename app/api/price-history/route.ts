import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const pairSymbol = url.searchParams.get("pair")
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")
    const days = Number.parseInt(url.searchParams.get("days") || "30")

    if (!pairSymbol) {
      return NextResponse.json({ error: "Pair symbol is required" }, { status: 400 })
    }

    // Get the pair ID first
    const { data: pairData } = await supabaseAdmin.from("trading_pairs").select("id").eq("symbol", pairSymbol).single()

    if (!pairData) {
      return NextResponse.json({ error: "Trading pair not found" }, { status: 404 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error, count } = await supabaseAdmin
      .from("price_history")
      .select("*", { count: "exact" })
      .eq("pair_id", pairData.id)
      .gte("timestamp", startDate.toISOString())
      .order("timestamp", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching price history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      history: data,
      count,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("Error in price history API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { pair_symbol, price, timestamp, source } = await request.json()

    if (!pair_symbol || !price) {
      return NextResponse.json(
        {
          error: "Pair symbol and price are required",
        },
        { status: 400 },
      )
    }

    // Get the pair ID first
    const { data: pairData } = await supabaseAdmin.from("trading_pairs").select("id").eq("symbol", pair_symbol).single()

    if (!pairData) {
      return NextResponse.json({ error: "Trading pair not found" }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from("price_history")
      .insert({
        pair_id: pairData.id,
        price,
        timestamp: timestamp || new Date().toISOString(),
        source: source || "manual",
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding price history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also update the current price in the trading pair
    await supabaseAdmin
      .from("trading_pairs")
      .update({
        current_price: price,
        last_updated: new Date().toISOString(),
      })
      .eq("id", pairData.id)

    return NextResponse.json({
      success: true,
      history: data,
      message: "Price history added successfully",
    })
  } catch (error: any) {
    console.error("Error in add price history API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Price history ID is required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("price_history").delete().eq("id", id)

    if (error) {
      console.error("Error deleting price history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Price history deleted successfully",
    })
  } catch (error: any) {
    console.error("Error in delete price history API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

