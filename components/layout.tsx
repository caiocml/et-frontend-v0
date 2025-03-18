"use client"

import type React from "react"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { useAuth } from "@/contexts/auth-context"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex h-screen bg-background">
      {isAuthenticated && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAuthenticated && <TopNav />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  )
}

