"use client"

import { AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

export function TransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait">
      <div key={pathname}>{children}</div>
    </AnimatePresence>
  )
} 