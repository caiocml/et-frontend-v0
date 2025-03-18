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
  Plus,
  Repeat,
  CreditCard,
  Calendar,
  Tag,
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageTransition } from "@/components/page-transition"
import UtilApiService from "@/lib/utilApiService"

// Define our category type
interface Category {
  id: number
  userId: number
  title: string
  description: string
  createdAt: string
}

// Define our payment type
interface PaymentType {
  id: number
  description: string
  lastCardNumber: number
  cardBrandName: string
  cardBankName: string
  userId: number
  expirationDay: number
  daysToCloseInvoice: number
}

// Define our transaction type based on the new JSON structure
interface Transaction {
  id: number
  amount: number
  note: string
  transactionDate: string
  paymentType: PaymentType
  creditDebit: "CREDIT" | "DEBIT"
  paymentTypeId: number
  transactionType: "INSTALLMENTS" | "RECURRING" | "SINGLE"
  installmentsNumber: number
  category: Category
}

// Define response structure from API
interface TransactionResponse {
  totalElements: number
  elementsSize: number
  page: number
  totalPages: number
  transactions: Transaction[]
}

export default function TransactionsPage() {
  const [transactionData, setTransactionData] = useState<TransactionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchTransactions(currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage])

  const fetchTransactions = async (page: number, size: number) => {
    setLoading(true)
    try {
      const response = await UtilApiService.get(`/transactions?page=${page}&size=${size}`)
      
      if (response) {
        setTransactionData(response)
      } else {
        console.error('No data returned from API')
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (transactionData) {
      const maxPage = transactionData.totalPages
      if (newPage >= 1 && newPage <= maxPage) {
        setCurrentPage(newPage)
      }
    }
  }

  const filteredTransactions = transactionData?.transactions.filter(transaction => {
    const matchesSearch = search === "" || 
      transaction.note.toLowerCase().includes(search.toLowerCase()) ||
      transaction.category.title.toLowerCase().includes(search.toLowerCase()) ||
      transaction.paymentType.description.toLowerCase().includes(search.toLowerCase())
    
    const matchesFilter = 
      filter === "all" || 
      (filter === "credit" && transaction.creditDebit === "CREDIT") ||
      (filter === "debit" && transaction.creditDebit === "DEBIT")
    
    return matchesSearch && matchesFilter
  }) || []

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    if (!transactionData) return []
    
    const totalPages = transactionData.totalPages
    const current = currentPage
    const pages = []
    
    if (totalPages > 0) pages.push(1)
    
    if (current > 3) pages.push('...')
    
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }
    
    if (current < totalPages - 2) pages.push('...')
    
    if (totalPages > 1) pages.push(totalPages)
    
    return pages
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "INSTALLMENTS":
        return <CreditCard className="h-4 w-4" />
      case "RECURRING":
        return <Repeat className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <AuthenticatedLayout>
      <PageTransition>
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
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex-shrink-0 w-full sm:w-[180px]">
                  <Select value={filter} onValueChange={handleFilterChange}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>
                          {filter === "all" && "All Transactions"}
                          {filter === "credit" && "Credits Only"}
                          {filter === "debit" && "Debits Only"}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="credit">Credits Only</SelectItem>
                      <SelectItem value="debit">Debits Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-60">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : transactionData ? (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableCaption>
                        {transactionData.totalElements} transactions found
                        {search && ` (filtered)`} • Page {currentPage} of {transactionData.totalPages}
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Note</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Installments</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="font-medium">{transaction.note}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4" />
                                  {transaction.category.title}
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getTransactionTypeIcon(transaction.transactionType)}
                                  {transaction.transactionType === "INSTALLMENTS" && "Installments"}
                                  {transaction.transactionType === "RECURRING" && "Recurring"}
                                  {transaction.transactionType === "SINGLE" && "Single"}
                                </div>
                              </TableCell>
                              <TableCell>
                                {transaction.installmentsNumber > 1 ? 
                                  transaction.installmentsNumber : 
                                  "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  <span className="text-sm">
                                    {transaction.paymentType.description} 
                                    <span className="text-xs text-muted-foreground ml-1">
                                      (****{transaction.paymentType.lastCardNumber})
                                    </span>
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end">
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
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                              No transactions found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {transactionData.totalPages > 0 && (
                    <div className="flex items-center justify-between py-4">
                      <div className="flex-1 text-sm text-muted-foreground">
                        Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, transactionData.totalElements)}</span> to{" "}
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, transactionData.totalElements)}</span> of{" "}
                        <span className="font-medium">{transactionData.totalElements}</span> results
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          <Select 
                            value={String(itemsPerPage)} 
                            onValueChange={(value) => handleItemsPerPageChange(Number(value))}
                          >
                            <SelectTrigger className="h-8 w-[70px]">
                              <SelectValue placeholder={itemsPerPage} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronsLeft className="h-4 w-4" />
                            <span className="sr-only">First page</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous page</span>
                          </Button>
                          
                          {getPageNumbers().map((page, i) => (
                            typeof page === 'number' ? (
                              <Button
                                key={i}
                                variant={page === currentPage ? "default" : "outline"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Button>
                            ) : (
                              <span key={i} className="h-8 flex items-center px-2">
                                {page}
                              </span>
                            )
                          ))}
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={transactionData && currentPage >= transactionData.totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next page</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePageChange(transactionData.totalPages)}
                            disabled={transactionData && currentPage >= transactionData.totalPages}
                          >
                            <ChevronsRight className="h-4 w-4" />
                            <span className="sr-only">Last page</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Failed to load transaction data. Try refreshing the page.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </AuthenticatedLayout>
  )
} 