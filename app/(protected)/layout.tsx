"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // If not authenticated after loading, redirect to login
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Only render layout if authenticated
  return isAuthenticated ? (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <TopNav />
        <div className="container mx-auto p-6 max-w-7xl">
          <main className="w-full">{children}</main>
        </div>
      </div>
    </div>
  ) : null
} 