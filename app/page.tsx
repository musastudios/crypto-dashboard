import type { Metadata } from "next"
import Dashboard from "@/components/dashboard"

export const metadata: Metadata = {
  title: "Crypto Trading Analytics Dashboard",
  description: "Analyze your crypto trading data with powerful visualization tools",
}

export default function Page() {
  return <Dashboard />
}

