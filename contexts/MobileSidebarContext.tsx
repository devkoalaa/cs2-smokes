"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface MobileSidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const MobileSidebarContext = createContext<MobileSidebarContextType | undefined>(undefined)

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(prev => !prev)
  }

  return (
    <MobileSidebarContext.Provider value={{ isOpen, setIsOpen, toggleSidebar }}>
      {children}
    </MobileSidebarContext.Provider>
  )
}

export function useMobileSidebar() {
  const context = useContext(MobileSidebarContext)
  if (context === undefined) {
    throw new Error('useMobileSidebar must be used within a MobileSidebarProvider')
  }
  return context
}
