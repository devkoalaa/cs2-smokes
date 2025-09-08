"use client"

import { MobileSidebar } from "@/components/mobile-sidebar"
import { useMobileSidebar } from "@/contexts/MobileSidebarContext"

export function GlobalMobileSidebar() {
  const { isOpen, setIsOpen } = useMobileSidebar()

  return <MobileSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
}
