"use client"

import { useMemo } from "react"
import { useCryptoData } from "@/components/crypto-data-provider"
import { formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ReferenceLine,
} from "@/components/ui/chart"
import { RefreshCw } from "lucide-react"

export function PriceChart({
  currentPrice,
  avgSellPrice,
}: {
  currentPrice: number | null
  avgSellPrice: number | null
}) {
  const { transactions, hasData, priceHistory } = useCryptoData()

  const chartData = useMemo(() => {
    if (!hasData) {
      return []
    }

    // Create data points from transactions
    const transactionPoints = transactions.map((tx) => ({
      date: new Date(tx.Time),
      price: tx["Filled Price"],
      side: tx.Side,
      type: "transaction",
    }))

    // Create data points from price history
    const historyPoints = priceHistory.map((entry) => ({
      date: new Date(entry.timestamp),
      price: entry.price,
      side: "History",
      type: "history",
      source: entry.source,
    }))

    // Combine and sort all data points
    const allPoints = [...transactionPoints, ...historyPoints].sort((a, b) => a.date.getTime() - b.date.getTime())

    // Add current price point if available
    if (currentPrice && allPoints.length > 0) {
      allPoints.push({
        date: new Date(),
        price: currentPrice,
        side: "Current",
        type: "current",
      })
    }

    return allPoints
  }, [transactions, hasData, currentPrice, priceHistory])

  if (!hasData || chartData.length === 0) {
    return (
      <Card className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">Upload data to see price chart</p>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex h-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p>Loading price data...</p>
        </div>
      </Card>
    )
  }

  return (
    <ChartContainer className="h-full">
      <Chart>
        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 30, left: 40 }}>
          <XAxis
            dataKey="date"
            tickFormatter={(value) => formatDate(value)}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis tickFormatter={(value) => value.toFixed(6)} tickLine={false} axisLine={false} tickMargin={10} />

          {/* Average sell price reference line */}
          {avgSellPrice && avgSellPrice > 0 && (
            <ReferenceLine
              y={avgSellPrice}
              stroke="hsl(var(--warning))"
              strokeDasharray="3 3"
              label={{
                value: "Avg Sell",
                position: "insideTopRight",
                fill: "hsl(var(--warning))",
                fontSize: 12,
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={(props) => {
              // Color dots based on transaction side or data type
              if (props.payload) {
                const { side, type } = props.payload

                // Highlight current price with a larger dot
                if (side === "Current") {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={6}
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  )
                }

                // Show dots for price history with a different style
                if (type === "history") {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={3}
                      fill="hsl(var(--chart-1))"
                      stroke="hsl(var(--background))"
                      strokeWidth={1}
                      opacity={0.7}
                    />
                  )
                }

                // Show dots for buy/sell transactions
                const color = side === "Buy" ? "hsl(var(--success))" : "hsl(var(--destructive))"
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={4}
                    fill={color}
                    stroke="hsl(var(--background))"
                    strokeWidth={1}
                  />
                )
              }
              return null
            }}
            activeDot={{
              r: 6,
              style: { fill: "hsl(var(--chart-1))" },
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="border bg-background p-2 shadow-sm"
                items={[
                  {
                    label: "Date",
                    value: (data) => (data.side === "Current" ? "Current Price" : formatDate(data.date)),
                  },
                  {
                    label: "Price",
                    value: (data) => data.price.toFixed(6),
                  },
                  {
                    label: "Type",
                    value: (data) => (data.type === "history" ? `${data.side} (${data.source})` : data.side),
                  },
                ]}
              />
            }
          />
        </LineChart>
      </Chart>
    </ChartContainer>
  )
}

