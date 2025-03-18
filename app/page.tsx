"use client"

import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AccountsOverview } from "@/components/accounts-overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { QuickBillPay } from "@/components/quick-bill-pay"
import { BusinessMetrics } from "@/components/business-metrics"

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <TopNav />
        <div className="container mx-auto p-6 max-w-7xl">
          <main className="w-full">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <AccountsOverview />
                </div>
                <div className="lg:col-span-1">
                  <RecentTransactions />
                </div>
                <div className="lg:col-span-1">
                  <QuickBillPay />
                </div>
              </div>

              <BusinessMetrics />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

