"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "@/components/tabs/overview-tab"
import { TransactionsTab } from "@/components/tabs/transactions-tab"
import { CalculatorTab } from "@/components/tabs/calculator-tab"
import { UploadTab } from "@/components/tabs/upload-tab"
import { StorageTab } from "@/components/tabs/storage-tab"
import { useCryptoData } from "@/components/crypto-data-provider"
import { useTabContext } from "@/hooks/use-tab-context"

export function DashboardContent() {
  const { activeTab, setActiveTab } = useTabContext()
  const { hasData } = useCryptoData()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions" disabled={!hasData}>
              Transactions
            </TabsTrigger>
            <TabsTrigger value="calculator" disabled={!hasData}>
              Profit Calculator
            </TabsTrigger>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <TabsContent value="overview" className="h-full">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="transactions" className="h-full">
            <TransactionsTab />
          </TabsContent>
          <TabsContent value="calculator" className="h-full">
            <CalculatorTab />
          </TabsContent>
          <TabsContent value="upload" className="h-full">
            <UploadTab />
          </TabsContent>
          <TabsContent value="storage" className="h-full">
            <StorageTab />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  )
}

