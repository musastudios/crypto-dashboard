"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCryptoData } from "@/components/crypto-data-provider"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function TransactionsTab() {
  const { activePair, loadFromDatabase, isLoadingFromDB, tradingPairs } = useCryptoData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSide, setFilterSide] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPair, setSelectedPair] = useState<string | null>(activePair)
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    setSelectedPair(activePair)
  }, [activePair])

  useEffect(() => {
    fetchTransactions()
  }, [selectedPair, currentPage])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const offset = (currentPage - 1) * itemsPerPage
      let url = `/api/transactions?limit=${itemsPerPage}&offset=${offset}`

      if (selectedPair) {
        url += `&pair=${selectedPair}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transactions")
      }

      // Transform the data to match our expected format
      const transformedData = data.transactions.map((tx: any) => ({
        id: tx.id,
        Time: tx.transaction_time,
        Pairs: tx.trading_pairs.symbol,
        Side: tx.side,
        "Filled Price": tx.filled_price,
        "Executed Amount": tx.executed_amount.toString(),
        Total: tx.total,
        Fee: tx.fee || 0,
        Role: tx.role || "",
      }))

      setTransactions(transformedData)
      setTotalCount(data.count || 0)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.Pairs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.Time.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSide = filterSide === "all" || tx.Side.toLowerCase() === filterSide.toLowerCase()

    return matchesSearch && matchesSide
  })

  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and filter your trading transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={filterSide} onValueChange={setFilterSide}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="buy">Buy Only</SelectItem>
                  <SelectItem value="sell">Sell Only</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedPair || "all"}
                onValueChange={(value) => {
                  setSelectedPair(value === "all" ? null : value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Select pair" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pairs</SelectItem>
                  {tradingPairs.map((pair) => (
                    <SelectItem key={pair.id} value={pair.symbol}>
                      {pair.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isLoading}>
              {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>

          <div className="mt-4 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading transactions...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, index) => (
                    <TableRow key={tx.id || index}>
                      <TableCell className="font-mono">{formatDate(tx.Time)}</TableCell>
                      <TableCell>{tx.Pairs}</TableCell>
                      <TableCell>
                        <Badge variant={tx.Side === "Buy" ? "default" : "secondary"}>{tx.Side}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{tx["Filled Price"].toFixed(6)}</TableCell>
                      <TableCell className="text-right">
                        {Number.parseFloat(tx["Executed Amount"]).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(tx.Total)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = currentPage

                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(pageNum)
                        }}
                        isActive={pageNum === currentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(totalPages)
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

