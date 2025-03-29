"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface TabContextProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabContext = createContext<TabContextProps | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTabContext() {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error("useTabContext must be used within a TabProvider")
  }
  return context
} 