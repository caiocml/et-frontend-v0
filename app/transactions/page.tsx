"use client"

import AuthenticatedLayout from "@/components/authenticated-layout"
import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download, 
  Plus 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageTransition } from "@/components/page-transition"
import UtilApiService from "@/lib/utilApiService"

// Define our transaction type
interface Transaction {
  id: string | number
  title: string
  amount: number
  date: string
  type: "income" | "expense"
  category: string
  status: "completed" | "pending" | "failed"
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  // Fetch transactions from API
  useEffect(() => {
    // In a real app, we would fetch from API
    // For now, let's use mock data
    setLoading(true)
    
    // Simulating API call with setTimeout
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        { 
          id: 1, 
          title: "Monthly Salary", 
          amount: 3500, 
          date: "2023-07-01", 
          type: "income", 
          category: "Salary",
          status: "completed"
        },
        { 
          id: 2, 
          title: "Rent Payment", 
          amount: -1200, 
          date: "2023-07-02", 
          type: "expense", 
          category: "Housing",
          status: "completed"
        },
        { 
          id: 3, 
          title: "Grocery Shopping", 
          amount: -156.32, 
          date: "2023-07-05", 
          type: "expense", 
          category: "Food",
          status: "completed"
        },
        { 
          id: 4, 
          title: "Freelance Project", 
          amount: 850, 
          date: "2023-07-10", 
          type: "income", 
          category: "Freelance",
          status: "completed"
        },
        { 
          id: 5, 
          title: "Utility Bills", 
          amount: -215.67, 
          date: "2023-07-15", 
          type: "expense", 
          category: "Utilities",
          status: "completed"
        },
        { 
          id: 6, 
          title: "Mobile Phone", 
          amount: -89.99, 
          date: "2023-07-18", 
          type: "expense", 
          category: "Technology",
          status: "completed"
        },
        { 
          id: 7, 
          title: "Stock Dividend", 
          amount: 125.50, 
          date: "2023-07-20", 
          type: "income", 
          category: "Investment",
          status: "completed"
        },
        { 
          id: 8, 
          title: "Restaurant Dinner", 
          amount: -78.45, 
          date: "2023-07-22", 
          type: "expense", 
          category: "Dining",
          status: "completed"
        },
        { 
          id: 9, 
          title: "Online Course", 
          amount: -199.99, 
          date: "2023-07-25", 
          type: "expense", 
          category: "Education",
          status: "pending"
        },
        { 
          id: 10, 
          title: "Side Project Income", 
          amount: 350, 
          date: "2023-07-28", 
          type: "income", 
          category: "Side Project",
          status: "pending"
        },
      ]
      
      setTransactions(mockTransactions)
      setLoading(false)
    }, 800)
  }, [])

  // Filter transactions based on search and filter
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    const matchesSearch = search === "" || 
      transaction.title.toLowerCase().includes(search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(search.toLowerCase())
    
    // Type filter
    const matchesFilter = 
      filter === "all" || 
      (filter === "income" && transaction.type === "income") ||
      (filter === "expense" && transaction.type === "expense")
    
    return matchesSearch && matchesFilter
  })

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              A complete history of your transactions. You can filter and search.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[160px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.title}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.status === "completed" ? "default" : 
                              transaction.status === "pending" ? "outline" : 
                              "destructive"
                            }>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <span
                                className={`text-sm font-medium ${
                                  transaction.type === "income"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                              </span>
                              {transaction.type === "income" ? (
                                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400 ml-1" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400 ml-1" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
} 