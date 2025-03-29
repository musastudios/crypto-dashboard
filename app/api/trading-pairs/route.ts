import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    const { data, error, count } = await supabaseAdmin
      .from("trading_pairs")
      .select("*", { count: "exact" })
      .order("symbol")
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching trading pairs:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      pairs: data,
      count,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("Error in trading pairs API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { symbol, base_currency, quote_currency } = await request.json()

    if (!symbol || !base_currency || !quote_currency) {
      return NextResponse.json(
        {
          error: "Symbol, base currency, and quote currency are required",
        },
        { status: 400 },
      )
    }

    // Check if pair already exists
    const { data: existingPair } = await supabaseAdmin.from("trading_pairs").select("id").eq("symbol", symbol).single()

    if (existingPair) {
      return NextResponse.json(
        {
          error: "Trading pair already exists",
        },
        { status: 409 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from("trading_pairs")
      .insert({
        symbol,
        base_currency,
        quote_currency,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating trading pair:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pair: data,
      message: "Trading pair created successfully",
    })
  } catch (error: any) {
    console.error("Error in create trading pair API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Trading pair ID is required" }, { status: 400 })
    }

    // Check if there are transactions using this pair
    const { count } = await supabaseAdmin
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("pair_id", id)

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete trading pair with associated transactions",
        },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin.from("trading_pairs").delete().eq("id", id)

    if (error) {
      console.error("Error deleting trading pair:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Trading pair deleted successfully",
    })
  } catch (error: any) {
    console.error("Error in delete trading pair API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, current_price } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Trading pair ID is required" }, { status: 400 })
    }

    const updates: any = {
      last_updated: new Date().toISOString(),
    }

    if (current_price !== undefined) {
      updates.current_price = current_price
    }

    const { error } = await supabaseAdmin.from("trading_pairs").update(updates).eq("id", id)

    if (error) {
      console.error("Error updating trading pair:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Trading pair updated successfully",
    })
  } catch (error: any) {
    console.error("Error in update trading pair API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

