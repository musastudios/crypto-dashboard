"use client"

import type React from "react"

import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Tooltip as RechartsTooltip,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  ReferenceLine as RechartsReferenceLine,
} from "recharts"

type ChartTooltipContentProps = {
  className?: string
  items: {
    label: string
    value: (data: any) => string
  }[]
  data?: any
}

export function ChartTooltipContent({ className, items, data }: ChartTooltipContentProps) {
  if (!data) {
    return null
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{item.label}:</span>
          <span className="font-medium">{item.value(data)}</span>
        </div>
      ))}
    </div>
  )
}

export function ChartContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      {children}
    </ResponsiveContainer>
  )
}

export function Chart({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Re-export the components with our aliases
export const LineChart = RechartsLineChart
export const Line = RechartsLine
export const XAxis = RechartsXAxis
export const YAxis = RechartsYAxis
export const ChartTooltip = RechartsTooltip
export const BarChart = RechartsBarChart
export const Bar = RechartsBar
export const ReferenceLine = RechartsReferenceLine

