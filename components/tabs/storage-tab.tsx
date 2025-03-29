"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Pencil, Trash2, Plus, RefreshCw, AlertCircle, Check, FileText, Clock, Database, HardDrive } from "lucide-react"
import { useCryptoData } from "@/components/crypto-data-provider"
import { Badge } from "@/components/ui/badge"

// Add the export keyword to the StorageTab function declaration
export function StorageTab() {
  const [activeTab, setActiveTab] = useState("transactions")
  const { activePair, uploadedFiles } = useCryptoData()

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Database Storage</CardTitle>
          <CardDescription>Manage your stored crypto trading data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="pairs">Trading Pairs</TabsTrigger>
              <TabsTrigger value="prices">Price History</TabsTrigger>
              <TabsTrigger value="uploads">Uploads</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="mt-4">
              <TransactionsManager activePair={activePair} />
            </TabsContent>
            <TabsContent value="pairs" className="mt-4">
              <TradingPairsManager />
            </TabsContent>
            <TabsContent value="prices" className="mt-4">
              <PriceHistoryManager activePair={activePair} />
            </TabsContent>
            <TabsContent value="uploads" className="mt-4">
              <UploadsManager uploadedFiles={uploadedFiles} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function UploadsManager({ uploadedFiles }: { uploadedFiles: any[] }) {
  const [dbStats, setDbStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchDatabaseStats()
  }, [])

  const fetchDatabaseStats = async () => {
    setIsLoading(true)
    try {
      // This would be a real API call in a production app
      // For now, we'll simulate some stats
      setTimeout(() => {
        setDbStats({
          totalTransactions: 1243,
          totalPairs: 8,
          totalPricePoints: 532,
          lastUpdated: new Date().toISOString(),
          storageSize: 2.4, // MB
          databaseName: "crypto_analytics",
          region: "us-east-1",
        })
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching database stats:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Files
            </CardTitle>
            <CardDescription>CSV files uploaded to the application</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadedFiles.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-md border p-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{file.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(file.uploadedAt)}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        <Badge variant="outline">{file.rows} rows</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No files uploaded yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Information
            </CardTitle>
            <CardDescription>Supabase database statistics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[200px] items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : dbStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold">{dbStats.totalTransactions.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Trading Pairs</p>
                    <p className="text-2xl font-bold">{dbStats.totalPairs}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Price Points</p>
                    <p className="text-2xl font-bold">{dbStats.totalPricePoints.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Storage Size</p>
                    <p className="text-2xl font-bold">{dbStats.storageSize} MB</p>
                  </div>
                </div>

                <div className="rounded-md bg-muted p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Database:</span>
                    <span className="font-medium">{dbStats.databaseName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Region:</span>
                    <span className="font-medium">{dbStats.region}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">{formatDate(dbStats.lastUpdated)}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={fetchDatabaseStats}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Stats
                </Button>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No database information available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Management
          </CardTitle>
          <CardDescription>Manage your database storage and backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
              <Database className="mb-2 h-8 w-8 text-primary" />
              <h3 className="text-lg font-medium">Export Data</h3>
              <p className="mb-4 text-sm text-muted-foreground">Export your transaction data to CSV</p>
              <Button variant="outline" className="w-full">
                Export to CSV
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
              <HardDrive className="mb-2 h-8 w-8 text-primary" />
              <h3 className="text-lg font-medium">Create Backup</h3>
              <p className="mb-4 text-sm text-muted-foreground">Create a backup of your database</p>
              <Button variant="outline" className="w-full">
                Create Backup
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border p-6 text-center">
              <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
              <h3 className="text-lg font-medium">Clear Data</h3>
              <p className="mb-4 text-sm text-muted-foreground">Clear all data from the database</p>
              <Button variant="destructive" className="w-full">
                Clear Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionsManager({ activePair }: { activePair: string | null }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const limit = 10

  useEffect(() => {
    fetchTransactions()
  }, [activePair, page])

  const fetchTransactions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const offset = (page - 1) * limit
      let url = `/api/transactions?limit=${limit}&offset=${offset}`

      if (activePair) {
        url += `&pair=${activePair}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transactions")
      }

      setTransactions(data.transactions)
      setTotalCount(data.count || 0)
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching transactions")
      console.error("Error fetching transactions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction)
    setEditFormData({
      side: transaction.side,
      filled_price: transaction.filled_price,
      executed_amount: transaction.executed_amount,
      total: transaction.total,
      fee: transaction.fee || 0,
      role: transaction.role || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (transaction: any) => {
    setSelectedTransaction(transaction)
    setIsDeleteDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedTransaction) return

    setIsLoading(true)
    setError(null)
    setActionSuccess(null)

    try {
      const response = await fetch("/api/transactions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedTransaction.id,
          transaction: editFormData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update transaction")
      }

      setActionSuccess("Transaction updated successfully")
      setIsEditDialogOpen(false)
      fetchTransactions()
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the transaction")
      console.error("Error updating transaction:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return

    setIsLoading(true)
    setError(null)
    setActionSuccess(null)

    try {
      const response = await fetch("/api/transactions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedTransaction.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete transaction")
      }

      setActionSuccess("Transaction deleted successfully")
      setIsDeleteDialogOpen(false)
      fetchTransactions()
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the transaction")
      console.error("Error deleting transaction:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Stored Transactions</h3>
        <Button size="sm" onClick={fetchTransactions} disabled={isLoading}>
          {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {actionSuccess && (
        <Alert variant="default" className="bg-primary/10 text-primary">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Pair</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono">{formatDate(tx.transaction_time)}</TableCell>
                  <TableCell>{tx.trading_pairs.symbol}</TableCell>
                  <TableCell>{tx.side}</TableCell>
                  <TableCell className="text-right">{tx.filled_price.toFixed(6)}</TableCell>
                  <TableCell className="text-right">{Number(tx.executed_amount).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(tx.total)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(tx)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(tx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(page - 1)
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = page

              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(pageNum)
                    }}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {totalPages > 5 && page < totalPages - 2 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(totalPages)
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
                  if (page < totalPages) setPage(page + 1)
                }}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Make changes to the transaction details below.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="side" className="text-right">
                Side
              </Label>
              <Select
                value={editFormData.side}
                onValueChange={(value) => setEditFormData({ ...editFormData, side: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filled_price" className="text-right">
                Price
              </Label>
              <Input
                id="filled_price"
                type="number"
                step="0.000001"
                value={editFormData.filled_price}
                onChange={(e) => setEditFormData({ ...editFormData, filled_price: Number.parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="executed_amount" className="text-right">
                Amount
              </Label>
              <Input
                id="executed_amount"
                type="number"
                step="0.000001"
                value={editFormData.executed_amount}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, executed_amount: Number.parseFloat(e.target.value) })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right">
                Total
              </Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={editFormData.total}
                onChange={(e) => setEditFormData({ ...editFormData, total: Number.parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fee" className="text-right">
                Fee
              </Label>
              <Input
                id="fee"
                type="number"
                step="0.01"
                value={editFormData.fee}
                onChange={(e) => setEditFormData({ ...editFormData, fee: Number.parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maker">Maker</SelectItem>
                  <SelectItem value="Taker">Taker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TradingPairsManager() {
  const [pairs, setPairs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPair, setSelectedPair] = useState<any | null>(null)
  const [newPairData, setNewPairData] = useState({
    symbol: "",
    base_currency: "",
    quote_currency: "",
  })
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const limit = 10

  useEffect(() => {
    fetchPairs()
  }, [page])

  const fetchPairs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const offset = (page - 1) * limit
      const response = await fetch(`/api/trading-pairs?limit=${limit}&offset=${offset}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch trading pairs")
      }

      setPairs(data.pairs)
      setTotalCount(data.count || 0)
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching trading pairs")
      console.error("Error fetching trading pairs:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPair = async () => {
    setIsLoading(true)
    setError(null)
    setActionSuccess(null)

    try {
      const response = await fetch("/api/trading-pairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPairData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add trading pair")
      }

      setActionSuccess("Trading pair added successfully")
      setIsAddDialogOpen(false)
      setNewPairData({
        symbol: "",
        base_currency: "",
        quote_currency: "",
      })
      fetchPairs()
    } catch (err: any) {
      setError(err.message || "An error occurred while adding the trading pair")
      console.error("Error adding trading pair:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (pair: any) => {
    setSelectedPair(pair)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPair) return

    setIsLoading(true)
    setError(null)
    setActionSuccess(null)

    try {
      const response = await fetch("/api/trading-pairs", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedPair.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete trading pair")
      }

      setActionSuccess("Trading pair deleted successfully")
      setIsDeleteDialogOpen(false)
      fetchPairs()
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the trading pair")
      console.error("Error deleting trading pair:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Trading Pairs</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={fetchPairs} disabled={isLoading}>
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Pair
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {actionSuccess && (
        <Alert variant="default" className="bg-primary/10 text-primary">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Base Currency</TableHead>
              <TableHead>Quote Currency</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading trading pairs...
                </TableCell>
              </TableRow>
            ) : pairs.length > 0 ? (
              pairs.map((pair) => (
                <TableRow key={pair.id}>
                  <TableCell>{pair.symbol}</TableCell>
                  <TableCell>{pair.base_currency}</TableCell>
                  <TableCell>{pair.quote_currency}</TableCell>
                  <TableCell className="text-right">
                    {pair.current_price ? pair.current_price.toFixed(6) : "N/A"}
                  </TableCell>
                  <TableCell>{pair.last_updated ? formatDate(pair.last_updated) : "Never"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pair)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No trading pairs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(page - 1)
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = page

              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(pageNum)
                    }}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page < totalPages) setPage(page + 1)
                }}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Add Trading Pair Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trading Pair</DialogTitle>
            <DialogDescription>Enter the details for the new trading pair.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="symbol" className="text-right">
                Symbol
              </Label>
              <Input
                id="symbol"
                placeholder="e.g., BTC_USDT"
                value={newPairData.symbol}
                onChange={(e) => setNewPairData({ ...newPairData, symbol: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="base_currency" className="text-right">
                Base Currency
              </Label>
              <Input
                id="base_currency"
                placeholder="e.g., BTC"
                value={newPairData.base_currency}
                onChange={(e) => setNewPairData({ ...newPairData, base_currency: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quote_currency" className="text-right">
                Quote Currency
              </Label>
              <Input
                id="quote_currency"
                placeholder="e.g., USDT"
                value={newPairData.quote_currency}
                onChange={(e) => setNewPairData({ ...newPairData, quote_currency: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPair} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Trading Pair"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Trading Pair Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trading Pair</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trading pair? This action cannot be undone. Note: Trading pairs with
              associated transactions cannot be deleted.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Trading Pair"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PriceHistoryManager({ activePair }: { activePair: string | null }) {
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<any | null>(null)
  const [newPriceData, setNewPriceData] = useState({
    price: "",
    timestamp: new Date().toISOString().slice(0, 16),
    source: "manual",
  })
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [selectedPair, setSelectedPair] = useState<string | null>(activePair)
  const [pairs, setPairs] = useState<any[]>([])
  const [days, setDays] = useState(30)

  const limit = 10

  useEffect(() => {
    fetchPairs()
  }, [])

  useEffect(() => {
    setSelectedPair(activePair)
  }, [activePair])

  useEffect(() => {
    if (selectedPair) {
      fetchPriceHistory()
    }
  }, [selectedPair, page, days])

  const fetchPairs = async () => {
    try {
      const response = await fetch("/api/trading-pairs?limit=100")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch trading pairs")
      }

      setPairs(data.pairs)
    } catch (err: any) {
      console.error("Error fetching trading pairs:", err)
    }
  }

  const fetchPriceHistory = async () => {
    if (!selectedPair) return

    setIsLoading(true)
    setError(null)

    try {
      const offset = (page - 1) * limit
      const response = await fetch(
        `/api/price-history?pair=${selectedPair}&limit=${limit}&offset=${offset}&days=${days}`,
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch price history")
      }

      setPriceHistory(data.history)
      setTotalCount(data.count || 0)
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching price history")
      console.error("Error fetching price history:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPrice = async () => {
    if (!selectedPair) return

    setIsLoading(true)
    setError(null)
    setActionSuccess(null)

    try {
      const response = await fetch("/api/price-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pair_symbol: selectedPair,
          price: Number.parseFloat(newPriceData.price),
          timestamp: new Date(newPriceData.timestamp).toISOString(),
          source: newPriceData.source,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add price history")
      }

      setActionSuccess("Price history added successfully")
      setIsAddDialogOpen(false)
      setNewPriceData({
        price: "",
        timestamp: new Date().toISOString().slice(0, 16),
        source: "manual",
      })
      fetchPriceHistory()
    } catch (err: any) {
      setError(err.message || "An error occurred while adding the price history")
      console.error("Error adding price history:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (price: any) => {
    setSelectedPrice(price)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPrice) return

    setIsLoading(true)
    setError(null)
    setActionSuccess(null)

    try {
      const response = await fetch("/api/price-history", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedPrice.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete price history")
      }

      setActionSuccess("Price history deleted successfully")
      setIsDeleteDialogOpen(false)
      fetchPriceHistory()
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the price history")
      console.error("Error deleting price history:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-medium">Price History</h3>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedPair || ""} onValueChange={setSelectedPair}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select pair" />
            </SelectTrigger>
            <SelectContent>
              {pairs.map((pair) => (
                <SelectItem key={pair.id} value={pair.symbol}>
                  {pair.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={days.toString()} onValueChange={(value) => setDays(Number.parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={fetchPriceHistory} disabled={isLoading || !selectedPair}>
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>

          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} disabled={!selectedPair}>
            <Plus className="mr-2 h-4 w-4" />
            Add Price
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {actionSuccess && (
        <Alert variant="default" className="bg-primary/10 text-primary">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading price history...
                </TableCell>
              </TableRow>
            ) : !selectedPair ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Select a trading pair to view price history.
                </TableCell>
              </TableRow>
            ) : priceHistory.length > 0 ? (
              priceHistory.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>{formatDate(price.timestamp)}</TableCell>
                  <TableCell className="text-right">{price.price.toFixed(6)}</TableCell>
                  <TableCell>{price.source}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(price)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No price history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(page - 1)
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = page

              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(pageNum)
                    }}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page < totalPages) setPage(page + 1)
                }}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Add Price Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Price History</DialogTitle>
            <DialogDescription>Enter the price details for {selectedPair}.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.000001"
                placeholder="e.g., 0.000123"
                value={newPriceData.price}
                onChange={(e) => setNewPriceData({ ...newPriceData, price: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timestamp" className="text-right">
                Timestamp
              </Label>
              <Input
                id="timestamp"
                type="datetime-local"
                value={newPriceData.timestamp}
                onChange={(e) => setNewPriceData({ ...newPriceData, timestamp: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                Source
              </Label>
              <Select
                value={newPriceData.source}
                onValueChange={(value) => setNewPriceData({ ...newPriceData, source: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="exchange">Exchange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPrice} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Price"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Price Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Price History</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this price history entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Price History"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

