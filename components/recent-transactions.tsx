import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useState, useEffect } from "react"
import UtilApiService from "@/lib/utilApiService"
import Link from "next/link"
import { format } from "date-fns"

// Transaction interface based on API response
interface Transaction {
  id: number
  amount: number
  note: string
  transactionDate: string
  paymentType: {
    description: string
  }
  creditDebit: "CREDIT" | "DEBIT"
  category: {
    title: string
  }
}

// API response interface
interface TransactionResponse {
  transactions: Transaction[]
  totalElements: number
  totalPages: number
  page: number
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      setLoading(true)
      try {
        const response = await UtilApiService.get('/transactions?page=1&size=3&direction=desc')
        if (response) {
          setTransactions(response.transactions)
        }
      } catch (err) {
        console.error('Failed to fetch recent transactions:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentTransactions()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMM dd, yyyy")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Failed to load recent transactions
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No recent transactions found
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium">{transaction.note}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.transactionDate)} • {transaction.category.title}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`text-sm font-medium ${
                      transaction.creditDebit === "CREDIT"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.creditDebit === "CREDIT" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                  {transaction.creditDebit === "CREDIT" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400 ml-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/transactions">
          <Button className="w-full mt-4" variant="outline">
            View All Transactions
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

