"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useCryptoData } from "@/components/crypto-data-provider"
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils"
import { ArrowRight, Calculator, RefreshCw, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CalculatorTab() {
  const {
    getTransactionStats,
    calculateProfitScenario,
    currentPrice,
    isLoadingPrice,
    refreshCurrentPrice,
    activePair,
    lastPriceUpdate,
    isPriceMocked,
    tradingPairs,
    setActivePair,
  } = useCryptoData()

  const stats = getTransactionStats()

  // Initialize with safe default values
  const [buyPrice, setBuyPrice] = useState<number>(0.001)
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000)
  const [calculationMode, setCalculationMode] = useState<"current" | "average">("current")
  const [selectedPair, setSelectedPair] = useState<string | null>(activePair)

  // Calculate price difference between current and average
  const priceDifference =
    currentPrice && stats.avgSellPrice ? ((currentPrice - stats.avgSellPrice) / stats.avgSellPrice) * 100 : 0

  // Update selected pair when active pair changes
  useEffect(() => {
    setSelectedPair(activePair)
  }, [activePair])

  // Update active pair when selected pair changes
  useEffect(() => {
    if (selectedPair && selectedPair !== activePair) {
      setActivePair(selectedPair)
    }
  }, [selectedPair])

  // Update buyPrice when reference price changes
  useEffect(() => {
    const referencePrice = calculationMode === "current" ? currentPrice || stats.avgSellPrice : stats.avgSellPrice

    if (referencePrice && referencePrice > 0) {
      setBuyPrice(referencePrice * 0.9) // Default to 90% of reference price
    }
  }, [calculationMode, currentPrice, stats.avgSellPrice])

  // Update investment amount to use total volume
  useEffect(() => {
    if (stats.totalVolume > 0) {
      setInvestmentAmount(stats.totalVolume)
    }
  }, [stats.totalVolume])

  const handleBuyPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value) && value > 0) {
      setBuyPrice(value)
    }
  }

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value) && value > 0) {
      setInvestmentAmount(value)
    }
  }

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0]
    const referencePrice = calculationMode === "current" ? currentPrice || stats.avgSellPrice : stats.avgSellPrice

    const newPrice = (referencePrice || 0.001) * (percentage / 100)
    setBuyPrice(Math.max(newPrice, 0.000001)) // Ensure minimum positive value
  }

  // Reference price for calculations based on selected mode
  const referencePrice = calculationMode === "current" ? currentPrice || stats.avgSellPrice : stats.avgSellPrice

  const scenario = calculateProfitScenario(buyPrice, investmentAmount, referencePrice)

  // Safe formatting for display values
  const safeReferencePrice = isNaN(referencePrice) ? "0.000000" : referencePrice.toFixed(6)
  const safeBuyPrice = isNaN(buyPrice) ? "0.000000" : buyPrice.toString()
  const safeInvestmentAmount = isNaN(investmentAmount) ? "1000" : investmentAmount.toString()

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profit Calculator</CardTitle>
          <CardDescription>Calculate potential profits by buying at a lower price</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Trading pair selection */}
            <div className="grid gap-2">
              <Label>Trading Pair</Label>
              <Select value={selectedPair || ""} onValueChange={(value) => setSelectedPair(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trading pair" />
                </SelectTrigger>
                <SelectContent>
                  {tradingPairs.map((pair) => (
                    <SelectItem key={pair.id} value={pair.symbol}>
                      {pair.symbol.replace("_", "/")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price comparison card */}
            {currentPrice && stats.avgSellPrice > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Market Price:</span>
                      <span className="font-medium">{currentPrice.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Sell Price:</span>
                      <span className="font-medium">{stats.avgSellPrice.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Difference:</span>
                      <div className="flex items-center">
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reference price selection */}
            <div className="grid gap-2">
              <Label>Reference Price</Label>
              <Tabs
                value={calculationMode}
                onValueChange={(v) => setCalculationMode(v as "current" | "average")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="current">Current Market Price</TabsTrigger>
                  <TabsTrigger value="average">Average Sell Price</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Reference price display */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reference-price">
                  {calculationMode === "current" ? "Current Market Price" : "Average Sell Price"}
                </Label>
                {calculationMode === "current" && currentPrice && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshCurrentPrice}
                    disabled={isLoadingPrice || !activePair}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingPrice ? "animate-spin" : ""}`} />
                  </Button>
                )}
              </div>

              {isLoadingPrice && calculationMode === "current" ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="flex items-center gap-2">
                  <Input id="reference-price" type="text" value={safeReferencePrice} disabled />

                  {isPriceMocked && calculationMode === "current" && (
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
              )}

              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">
                  {calculationMode === "current"
                    ? `Current market price for ${activePair ? activePair.replace("_", "/") : ""}`
                    : `Average price from ${stats.totalSells} sell transactions`}
                </p>

                {lastPriceUpdate && calculationMode === "current" && currentPrice && (
                  <p className="text-xs text-muted-foreground">Last updated: {formatDate(lastPriceUpdate)}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="buy-price">Target Buy Price</Label>
                <span className="text-xs text-muted-foreground">
                  {isNaN(buyPrice) || isNaN(referencePrice) || referencePrice === 0
                    ? "0%"
                    : ((buyPrice / referencePrice) * 100).toFixed(1) + "% of reference price"}
                </span>
              </div>
              <Input
                id="buy-price"
                type="number"
                step="0.000001"
                value={safeBuyPrice}
                onChange={handleBuyPriceChange}
              />
              <Slider defaultValue={[90]} max={100} min={50} step={1} onValueChange={handleSliderChange} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="investment">Investment Amount</Label>
              <Input id="investment" type="number" value={safeInvestmentAmount} onChange={handleInvestmentChange} />
              <p className="text-xs text-muted-foreground">Using total transaction volume as default investment</p>
            </div>

            <Button className="mt-2">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Profit
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            Potential profit using {calculationMode === "current" ? "current market" : "average sell"} price
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Investment</span>
                <span className="text-2xl font-bold">{formatCurrency(investmentAmount)}</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Potential Value</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(investmentAmount + (isNaN(scenario.potentialProfit) ? 0 : scenario.potentialProfit))}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium text-muted-foreground">Coins at Reference Price</div>
                  <div className="mt-1 text-xl font-bold">
                    {(referencePrice > 0 ? investmentAmount / referencePrice : 0).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium text-muted-foreground">Coins at Target Price</div>
                  <div className="mt-1 text-xl font-bold">
                    {(buyPrice > 0 ? investmentAmount / buyPrice : 0).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <div className="text-sm font-medium text-muted-foreground">Additional Coins</div>
                <div className="mt-1 text-xl font-bold">
                  {(isNaN(scenario.additionalCoins) ? 0 : scenario.additionalCoins).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {isNaN(scenario.percentageGain) ? "(+0.00%)" : `(+${scenario.percentageGain.toFixed(2)}%)`}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-primary/10 p-3">
                <div className="text-sm font-medium text-primary">Potential Profit</div>
                <div className="mt-1 text-xl font-bold text-primary">
                  {formatCurrency(isNaN(scenario.potentialProfit) ? 0 : scenario.potentialProfit)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

