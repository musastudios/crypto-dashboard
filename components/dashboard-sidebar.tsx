"use client"

import {
  Home,
  BarChart3,
  LineChart,
  Upload,
  CandlestickChart,
  Calculator,
  History,
  Database,
  RefreshCw,
  HardDrive,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { useCryptoData } from "@/components/crypto-data-provider"
import { Button } from "@/components/ui/button"
import { useTabContext } from "@/hooks/use-tab-context"

export function DashboardSidebar() {
  const { activePair, refreshCurrentPrice, isLoadingPrice } = useCryptoData()
  const { setActiveTab } = useTabContext()

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col gap-2 px-4 py-2">
        <div className="flex items-center gap-2">
          <CandlestickChart className="h-6 w-6" />
          <span className="text-xl font-bold">Crypto Analytics</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {activePair ? `Active Pair: ${activePair}` : "No data loaded"}
          </div>
          {activePair && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={refreshCurrentPrice}
              disabled={isLoadingPrice}
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingPrice ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <button onClick={() => setActiveTab("overview")}>
                    <Home className="h-4 w-4" />
                    <span>Overview</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => setActiveTab("transactions")}>
                    <History className="h-4 w-4" />
                    <span>Transactions</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => setActiveTab("overview")}>
                    <LineChart className="h-4 w-4" />
                    <span>Price Chart</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => setActiveTab("overview")}>
                    <BarChart3 className="h-4 w-4" />
                    <span>Volume Analysis</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => setActiveTab("calculator")}>
                    <Calculator className="h-4 w-4" />
                    <span>Profit Calculator</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => setActiveTab("upload")}>
                    <Upload className="h-4 w-4" />
                    <span>Upload Data</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => setActiveTab("storage")}>
                    <HardDrive className="h-4 w-4" />
                    <span>Storage</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => setActiveTab("storage")}>
                    <Database className="h-4 w-4" />
                    <span>Database</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <SidebarTrigger />
          <ModeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

