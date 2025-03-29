"use client"

import { useMemo } from "react"
import { useCryptoData } from "@/components/crypto-data-provider"
import { Card } from "@/components/ui/card"
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"
import { RefreshCw } from "lucide-react"

export function VolumeChart() {
  const { getTransactionStats, hasData, isLoadingFromDB } = useCryptoData()

  const chartData = useMemo(() => {
    if (!hasData) {
      return []
    }

    const stats = getTransactionStats()

    return [
      { name: "Buy", value: stats.totalBuyVolume },
      { name: "Sell", value: stats.totalSellVolume },
    ]
  }, [getTransactionStats, hasData])

  if (isLoadingFromDB) {
    return (
      <Card className="flex h-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p>Loading volume data...</p>
        </div>
      </Card>
    )
  }

  if (!hasData || chartData.length === 0) {
    return (
      <Card className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">Upload data to see volume chart</p>
      </Card>
    )
  }

  return (
    <ChartContainer className="h-full">
      <Chart>
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 30, left: 40 }}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="border bg-background p-2 shadow-sm"
                items={[
                  {
                    label: "Volume",
                    value: (data) => formatCurrency(data.value),
                  },
                ]}
              />
            }
          />
        </BarChart>
      </Chart>
    </ChartContainer>
  )
}

