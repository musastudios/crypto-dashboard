"use client"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { CryptoDataProvider } from "@/components/crypto-data-provider"
import { TabProvider } from "@/hooks/use-tab-context"

export default function Dashboard() {
  return (
    <CryptoDataProvider>
      <TabProvider>
        <SidebarProvider>
          <div className="flex h-screen w-full overflow-hidden bg-background">
            <DashboardSidebar />
            <DashboardContent />
          </div>
        </SidebarProvider>
      </TabProvider>
    </CryptoDataProvider>
  )
}

