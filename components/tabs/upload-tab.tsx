"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { Upload, FileUp, Check, AlertCircle, Database, RefreshCw, Info, FileText, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useCryptoData } from "@/components/crypto-data-provider"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "@/lib/utils"

export function UploadTab() {
  const { loadCSV, hasData, saveToDatabase, isSaving, uploadedFiles } = useCryptoData()
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveDetails, setSaveDetails] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)
    setSaveSuccess(false)
    setSaveError(null)
    setSaveDetails(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    try {
      await loadCSV(file)
      setSuccess(true)
      setProgress(100)
    } catch (err) {
      setError("Failed to parse CSV file. Please check the format.")
      console.error(err)
    } finally {
      setIsLoading(false)
      clearInterval(progressInterval)
    }
  }

  const handleSaveToDatabase = async () => {
    setSaveSuccess(false)
    setSaveError(null)
    setSaveDetails(null)

    try {
      const response = await saveToDatabase()

      if (response?.success) {
        setSaveSuccess(true)
        if (response.message) {
          setSaveDetails(response.message)
        }
      } else {
        throw new Error(response?.error || "Unknown error occurred")
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to save data to database.")
      console.error("Error saving to database:", err)
    }
  }

  const resetUpload = () => {
    setSuccess(false)
    setError(null)
    setProgress(0)
    setSaveSuccess(false)
    setSaveError(null)
    setSaveDetails(null)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Upload Trading Data</CardTitle>
          <CardDescription>Upload your crypto trading history CSV file to analyze your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
              isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!isLoading && !success ? (
              <>
                <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium">Drag and drop your CSV file here, or click to browse</p>
                <p className="text-xs text-muted-foreground">Supported format: CSV with trading history data</p>
                <input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={handleFileChange} />
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => document.getElementById("csv-upload")?.click()}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
              </>
            ) : isLoading ? (
              <div className="w-full max-w-xs">
                <p className="mb-2 text-center text-sm font-medium">Processing file...</p>
                <Progress value={progress} className="h-2 w-full" />
              </div>
            ) : success ? (
              <div className="flex flex-col items-center">
                <div className="mb-4 rounded-full bg-primary/20 p-2">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <p className="text-center font-medium">File uploaded successfully!</p>
                <Button variant="outline" className="mt-4" onClick={resetUpload}>
                  Upload Another File
                </Button>
              </div>
            ) : null}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasData && (
            <>
              <Separator className="my-6" />

              <div className="flex flex-col items-center">
                <h3 className="mb-2 text-lg font-medium">Save to Database</h3>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Store your transaction data in Supabase for future analysis
                </p>

                <Button onClick={handleSaveToDatabase} disabled={isSaving || !hasData} className="w-full max-w-xs">
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Save to Supabase
                    </>
                  )}
                </Button>

                {saveSuccess && (
                  <Alert variant="default" className="mt-4 bg-primary/10 text-primary">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      Data saved to database successfully!
                      {saveDetails && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="link" className="h-auto p-0 ml-1">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{saveDetails}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {saveError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{saveError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {hasData ? "Data loaded successfully. You can now analyze your transactions." : "No data loaded yet."}
          </p>
        </CardFooter>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>Recent file uploads</CardDescription>
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

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>CSV Format</CardTitle>
          <CardDescription>Required columns for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Required Fields</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  <span className="font-medium">Pairs</span>: Trading pair (e.g., SNEK_USDT)
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  <span className="font-medium">Time</span>: Transaction timestamp
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  <span className="font-medium">Side</span>: Buy or Sell
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  <span className="font-medium">Filled Price</span>: Price per unit
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Additional Fields</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  <span className="font-medium">Executed Amount</span>: Quantity traded
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  <span className="font-medium">Total</span>: Total transaction value
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  <span className="font-medium">Fee</span>: Transaction fee
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  <span className="font-medium">Role</span>: Maker or Taker
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Database Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  Store transaction history in Supabase
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  Track price history over time
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  Access your data from anywhere
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Analysis Tools</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  Price charts and trends
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  Volume analysis
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  Profit/loss calculations
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                  Investment scenarios
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

