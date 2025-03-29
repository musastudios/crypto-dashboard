import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const pairSymbol = url.searchParams.get("pair")
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    let query = supabaseAdmin
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
      .range(offset, offset + limit - 1)

    if (pairSymbol) {
      query = query.eq("trading_pairs.symbol", pairSymbol)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching transactions:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      transactions: data,
      count,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("Error in transactions API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("transactions").delete().eq("id", id)

    if (error) {
      console.error("Error deleting transaction:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Transaction deleted successfully" })
  } catch (error: any) {
    console.error("Error in delete transaction API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, transaction } = await request.json()

    if (!id || !transaction) {
      return NextResponse.json({ error: "Transaction ID and data are required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("transactions")
      .update({
        side: transaction.side,
        filled_price: transaction.filled_price,
        executed_amount: transaction.executed_amount,
        total: transaction.total,
        fee: transaction.fee || 0,
        role: transaction.role,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating transaction:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Transaction updated successfully" })
  } catch (error: any) {
    console.error("Error in update transaction API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

