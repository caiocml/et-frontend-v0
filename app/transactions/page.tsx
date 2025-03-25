"use client"

import AuthenticatedLayout from "@/components/authenticated-layout"
import { useState, useEffect, FormEvent, useRef } from "react"
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
  Calendar as CalendarIcon,
  Tag,
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Info,
  Upload
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageTransition } from "@/components/page-transition"
import UtilApiService from "@/lib/utilApiService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

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

// Add to existing interfaces
enum CreditDebitEnum {
  DEBIT = 0,
  CREDIT = 1
}

enum TransactionTypeEnum {
  SINGLE = 0,
  RECURRING = 1,
  INSTALLMENTS = 2
}

export default function TransactionsPage() {
  const [transactionData, setTransactionData] = useState<TransactionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Add these new state variables for the modal
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [paymentTypesList, setPaymentTypesList] = useState<PaymentType[]>([])
  const [categoriesList, setCategoriesList] = useState<Category[]>([])

  // Form state
  const [newTransaction, setNewTransaction] = useState({
    amount: 0.00,
    note: "",
    transactionDate: new Date(),
    paymentTypeId: 0,
    creditDebit: CreditDebitEnum.DEBIT,
    categoryId: 0,
    installmentsNumber: 1,
    transactionType: TransactionTypeEnum.SINGLE
  })

  const [importModalOpen, setImportModalOpen] = useState(false)

  const [commonValues, setCommonValues] = useState({
    categoryId: 0,
    paymentTypeId: 0,
    transactionType: TransactionTypeEnum.SINGLE,
    creditDebit: CreditDebitEnum.DEBIT
  })

  // Fetch categories and payment types when component mounts
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
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  // Fetch payment methods and categories for the dropdown
  const fetchFormData = async () => {
    try {
      // Fetch payment methods
      const paymentTypesResponse = await UtilApiService.get('/paymentType');
      if (paymentTypesResponse) {
        setPaymentTypesList(paymentTypesResponse);
        
        // Set default payment type if available
        if (paymentTypesResponse.length > 0) {
          setNewTransaction(prev => ({
            ...prev,
            paymentTypeId: paymentTypesResponse[0].id
          }));
        }
      }
      
      // Fetch categories
      const categoriesResponse = await UtilApiService.get('/categories');
      if (categoriesResponse) {
        setCategoriesList(categoriesResponse);
        
        // Set default category if available
        if (categoriesResponse.length > 0) {
          setNewTransaction(prev => ({
            ...prev,
            categoryId: categoriesResponse[0].id
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error("Failed to load form data. Please try again.")
    }
  };

  // Handle opening the add transaction modal
  const handleOpenAddModal = () => {
    fetchFormData();
    setAddModalOpen(true);
  };

  // Add this utility function for amount formatting
  const formatAmountInput = (value: string): string => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Handle empty or single digit input
    if (digits.length === 0) return '0.00';
    if (digits.length === 1) return `0.0${digits}`;
    if (digits.length === 2) return `0.${digits}`;
    
    // Format with decimal point
    const decimalPosition = digits.length - 2;
    return `${digits.slice(0, decimalPosition)}.${digits.slice(decimalPosition)}`;
  };

  // Update the handleFormChange function to include special handling for amount
  const handleFormChange = (field: string, value: any) => {
    if (field === 'amount' && typeof value === 'string') {
      // Format the amount with cents-first approach
      const formattedAmount = formatAmountInput(value);
      setNewTransaction(prev => ({
        ...prev,
        amount: parseFloat(formattedAmount)
      }));
    } else {
      setNewTransaction(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle transaction type change and reset installments if needed
  const handleTransactionTypeChange = (value: TransactionTypeEnum) => {
    const installmentsNumber = value === TransactionTypeEnum.SINGLE ? 1 : 2;
    
    setNewTransaction(prev => ({
      ...prev,
      transactionType: value,
      installmentsNumber
    }));
  };

  // Format date for API
  const formatDateForApi = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  // Update the handleAddTransaction function to include toast success
  const handleAddTransaction = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        ...newTransaction,
        transactionDate: formatDateForApi(newTransaction.transactionDate)
      };
      
      const response = await UtilApiService.post('/transactions/' + transactionData.categoryId, transactionData);
      
      if (response) {
        // Reset form
        resetTransactionForm();
        
        // Show success toast
        toast.success("Transaction added successfully!")
        
        // Refresh transactions list
        fetchTransactions(currentPage, itemsPerPage);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error("Failed to add transaction")
    }
  };

  const resetTransactionForm = () => {
    setNewTransaction({
      amount: 0.00,
      note: "",
      transactionDate: new Date(),
      paymentTypeId: 0,
      creditDebit: CreditDebitEnum.DEBIT,
      categoryId: 0,
      installmentsNumber: 1,
      transactionType: TransactionTypeEnum.SINGLE
    });
  };

  return (
    <AuthenticatedLayout>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setImportModalOpen(true)}>
                <Upload className="h-3 w-3" />
                Add with file
              </Button>
              <Button className="flex items-center gap-2" onClick={handleOpenAddModal}>
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>
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

          {/* Add Transaction Modal */}
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Enter the details for your new transaction.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddTransaction}>
                <div className="grid gap-4 py-4">
                  {/* First row: Amount, Transaction Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                        <Input
                          id="amount"
                          className="pl-7 text-right"
                          value={newTransaction.amount.toFixed(2)}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^\d]/g, '');
                            handleFormChange('amount', rawValue);
                          }}
                          placeholder="0.00"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transactionType">Transaction Type</Label>
                      <Select 
                        value={newTransaction.transactionType.toString()} 
                        onValueChange={(value) => handleTransactionTypeChange(parseInt(value) as TransactionTypeEnum)}
                      >
                        <SelectTrigger id="transactionType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TransactionTypeEnum.SINGLE.toString()}>Single</SelectItem>
                          <SelectItem value={TransactionTypeEnum.RECURRING.toString()}>Recurring</SelectItem>
                          <SelectItem value={TransactionTypeEnum.INSTALLMENTS.toString()}>Installments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Second row: Note */}
                  <div className="space-y-2">
                    <Label htmlFor="note">Note</Label>
                    <Input
                      id="note"
                      value={newTransaction.note}
                      onChange={(e) => handleFormChange('note', e.target.value)}
                      placeholder="Transaction description"
                      required
                    />
                  </div>
                  
                  {/* Third row: Date and Credit/Debit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transactionDate">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            id="transactionDate"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTransaction.transactionDate ? format(newTransaction.transactionDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0" 
                          align="start"
                          side="bottom"
                          sideOffset={5}
                        >
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  const prevMonth = new Date(newTransaction.transactionDate);
                                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                                  setNewTransaction({...newTransaction, transactionDate: prevMonth});
                                }}
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Previous month</span>
                              </Button>
                              
                              <div className="flex gap-1">
                                <Select
                                  value={newTransaction.transactionDate.getFullYear().toString()}
                                  onValueChange={(value) => {
                                    const newDate = new Date(newTransaction.transactionDate);
                                    newDate.setFullYear(parseInt(value));
                                    setNewTransaction({...newTransaction, transactionDate: newDate});
                                  }}
                                >
                                  <SelectTrigger className="h-7 w-[4.5rem]">
                                    <SelectValue placeholder="Year" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                                      <SelectItem key={year} value={year.toString()}>
                                        {year}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                <Select
                                  value={newTransaction.transactionDate.getMonth().toString()}
                                  onValueChange={(value) => {
                                    const newDate = new Date(newTransaction.transactionDate);
                                    newDate.setMonth(parseInt(value));
                                    setNewTransaction({...newTransaction, transactionDate: newDate});
                                  }}
                                >
                                  <SelectTrigger className="h-7 w-[6rem]">
                                    <SelectValue placeholder="Month" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                                      'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                      <SelectItem key={month} value={index.toString()}>
                                        {month}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  const nextMonth = new Date(newTransaction.transactionDate);
                                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                                  setNewTransaction({...newTransaction, transactionDate: nextMonth});
                                }}
                              >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Next month</span>
                              </Button>
                            </div>
                            
                            <div className="mb-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setNewTransaction({...newTransaction, transactionDate: new Date()})}
                              >
                                Today
                              </Button>
                            </div>
                            
                            <CalendarComponent
                              mode="single"
                              selected={newTransaction.transactionDate}
                              onSelect={(date) => handleFormChange('transactionDate', date || new Date())}
                              initialFocus
                              defaultMonth={newTransaction.transactionDate}
                              month={newTransaction.transactionDate}
                              classNames={{
                                day: cn(
                                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                                  "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                ),
                                head_row: "flex w-full",
                                head_cell: "text-muted-foreground w-9 font-normal text-[0.8rem] flex justify-center",
                                row: "flex w-full mt-2",
                                cell: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
                                nav: "hidden",
                                caption: "flex justify-center pt-1 relative items-center",
                                caption_label: "text-sm font-medium hidden",
                                table: "w-full border-collapse space-y-1 rounded-md",
                                month: "space-y-4"
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creditDebit">Type</Label>
                      <Select 
                        value={newTransaction.creditDebit.toString()} 
                        onValueChange={(value) => handleFormChange('creditDebit', parseInt(value))}
                      >
                        <SelectTrigger id="creditDebit">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={CreditDebitEnum.DEBIT.toString()}>Expense (Debit)</SelectItem>
                          <SelectItem value={CreditDebitEnum.CREDIT.toString()}>Income (Credit)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Fourth row: Payment Method and Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentTypeId">Payment Method</Label>
                      <Select 
                        value={newTransaction.paymentTypeId.toString()} 
                        onValueChange={(value) => handleFormChange('paymentTypeId', parseInt(value))}
                      >
                        <SelectTrigger id="paymentTypeId">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentTypesList.map((payment) => (
                            <SelectItem key={payment.id} value={payment.id.toString()}>
                              {payment.description} (*{payment.lastCardNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Category</Label>
                      <Select 
                        value={newTransaction.categoryId.toString()} 
                        onValueChange={(value) => handleFormChange('categoryId', parseInt(value))}
                      >
                        <SelectTrigger id="categoryId">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesList.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Show installments field when transaction type is not SINGLE */}
                  {newTransaction.transactionType !== TransactionTypeEnum.SINGLE && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="installmentsNumber">Number of Installments</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0">
                              <span className="sr-only">Info</span>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 text-sm">
                            {newTransaction.transactionType === TransactionTypeEnum.INSTALLMENTS ? (
                              <p>For Installments: The transaction amount is divided by the number of installments.</p>
                            ) : (
                              <p>For Recurring: The same transaction amount is repeated for the specified number of times.</p>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Input
                        id="installmentsNumber"
                        type="number"
                        min="2"
                        value={newTransaction.installmentsNumber}
                        onChange={(e) => handleFormChange('installmentsNumber', parseInt(e.target.value))}
                        required
                      />
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Transaction</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* CSV Import Modal */}
          <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>Import Transactions from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to add multiple transactions at once.
                </DialogDescription>
              </DialogHeader>
              
              <CSVImportForm 
                onClose={() => setImportModalOpen(false)}
                onSuccess={() => {
                  setImportModalOpen(false)
                  fetchTransactions(currentPage, itemsPerPage)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </AuthenticatedLayout>
  )
}

// CSV Import Form Component
interface CSVImportFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CSVImportForm({ onClose, onSuccess }: CSVImportFormProps): React.ReactNode {
  const [categoriesList, setCategoriesList] = useState<Category[]>([])
  const [paymentTypesList, setPaymentTypesList] = useState<PaymentType[]>([])
  const [step, setStep] = useState(1)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [separator, setSeparator] = useState(";")
  const [fileError, setFileError] = useState("")
  const [parsedData, setParsedData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [useCommonValues, setUseCommonValues] = useState(true)
  const [commonValues, setCommonValues] = useState({
    categoryId: 0,
    paymentTypeId: 0,
    transactionType: TransactionTypeEnum.SINGLE,
    creditDebit: CreditDebitEnum.DEBIT
  })
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: false,
    processed: 0,
    total: 0,
    errors: 0
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories and payment types when component mounts
  useEffect(() => {
    fetchData()
  }, [])

  // Function to fetch payment types and categories
  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await UtilApiService.get('/categories')
      if (categoriesResponse) {
        setCategoriesList(categoriesResponse)
        
        // Set default category
        if (categoriesResponse.length > 0) {
          setCommonValues(prev => ({
            ...prev,
            categoryId: categoriesResponse[0].id
          }))
        }
      }
      
      // Fetch payment types
      const paymentTypesResponse = await UtilApiService.get('/paymentType')
      if (paymentTypesResponse) {
        setPaymentTypesList(paymentTypesResponse)
        
        // Set default payment type
        if (paymentTypesResponse.length > 0) {
          setCommonValues(prev => ({
            ...prev,
            paymentTypeId: paymentTypesResponse[0].id
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching payment types and categories:', error)
      toast.error('Failed to load payment types and categories')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      setCsvFile(null)
      setFileError("")
      return
    }

    const file = files[0]
    
    // Validate file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setFileError("Only CSV or TXT files are allowed")
      setCsvFile(null)
      return
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size cannot exceed 5MB")
      setCsvFile(null)
      return
    }
    
    setCsvFile(file)
    setFileError("")
  }
  
  const handleFileUpload = async () => {
    if (!csvFile) return
    
    setStep(2)
    
    try {
      const text = await csvFile.text()
      const rows = text.split('\n').filter(row => row.trim().length > 0)
      
      if (rows.length === 0) {
        setFileError("The file appears to be empty")
        setStep(1)
        return
      }
      
      // Extract headers and rows
      const headerRow = rows[0].split(separator)
      setHeaders(headerRow.map(h => h.trim()))
      
      // Parse data rows
      const dataRows = rows.slice(1).map(row => {
        const values = row.split(separator)
        
        // Create an object mapping headers to values
        return headerRow.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || ''
          return obj
        }, {} as Record<string, string>)
      })
      
      setParsedData(dataRows)
      
      // Initialize column mapping with empty values
      const initialMapping = headerRow.reduce((obj, header) => {
        obj[header.trim()] = "ignore"
        return obj
      }, {} as Record<string, string>)
      
      setColumnMapping(initialMapping)
    } catch (error) {
      console.error('Error parsing CSV file:', error)
      setFileError("Failed to parse the file. Please check the file format and try again.")
      setStep(1)
    }
  }
  
  const handleColumnMappingChange = (header: string, value: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [header]: value
    }))
  }
  
  const handleCommonValueChange = (field: string, value: any) => {
    setCommonValues(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const validateAndPrepareTransactions = () => {
    const errors: string[] = []
    
    // Validate that required fields are mapped
    const requiredFields = ['amount', 'note', 'transactionDate']
    let missingRequiredFields = false
    
    requiredFields.forEach(field => {
      if (!Object.values(columnMapping).some(value => value === field)) {
        errors.push(`Required field '${field}' is not mapped to any column`)
        missingRequiredFields = true
      }
    })
    
    // Count how many columns are mapped (excluding "ignore")
    const mappedColumnsCount = Object.values(columnMapping).filter(value => value !== "ignore").length
    
    if (mappedColumnsCount < 4) {
      errors.push(`You need to map at least 4 columns to create a transaction. Currently mapped: ${mappedColumnsCount}`)
      missingRequiredFields = true
    }
    
    if (missingRequiredFields) {
      setValidationErrors(errors)
      return null
    }
    
    // Check if we have category name or payment type name as fields
    const hasCategoryName = Object.values(columnMapping).includes('categoryName')
    const hasPaymentTypeName = Object.values(columnMapping).includes('paymentTypeName')
    
    // Prepare transactions
    const transactions = parsedData.map((row, index) => {
      const transaction: any = { ...commonValues }
      const tempFields: Record<string, any> = {}
      
      // Map columns to transaction fields
      Object.keys(columnMapping).forEach(header => {
        const field = columnMapping[header]
        if (field && field !== "ignore" && row[header] !== undefined) {
          let value = row[header]
          
          // Convert values based on field type
          switch (field) {
            case 'amount':
              value = parseFloat(value.replace(',', '.'))
              if (isNaN(value)) {
                errors.push(`Row ${index + 1}: Invalid amount value "${row[header]}"`)
                value = 0
              }
              break
            case 'transactionDate':
              try {
                const date = new Date(value)
                if (isNaN(date.getTime())) throw new Error("Invalid date")
                value = format(date, "yyyy-MM-dd")
              } catch (e) {
                errors.push(`Row ${index + 1}: Invalid date value "${row[header]}"`)
                value = format(new Date(), "yyyy-MM-dd")
              }
              break
            case 'installmentsNumber':
              value = parseInt(value)
              if (isNaN(value) || value < 1) {
                errors.push(`Row ${index + 1}: Invalid installments number "${row[header]}"`)
                value = 1
              }
              break
            case 'transactionType':
              // Convert text to enum if needed
              if (typeof value === 'string') {
                const lowerValue = value.toLowerCase()
                if (lowerValue.includes('single')) value = TransactionTypeEnum.SINGLE
                else if (lowerValue.includes('recurring')) value = TransactionTypeEnum.RECURRING
                else if (lowerValue.includes('installment')) value = TransactionTypeEnum.INSTALLMENTS
                else {
                  errors.push(`Row ${index + 1}: Invalid transaction type "${row[header]}"`)
                  value = TransactionTypeEnum.SINGLE
                }
              }
              break
            case 'creditDebit':
              // Convert text to enum if needed
              if (typeof value === 'string') {
                const lowerValue = value.toLowerCase()
                if (lowerValue.includes('credit') || lowerValue.includes('income')) value = CreditDebitEnum.CREDIT
                else if (lowerValue.includes('debit') || lowerValue.includes('expense')) value = CreditDebitEnum.DEBIT
                else {
                  errors.push(`Row ${index + 1}: Invalid credit/debit value "${row[header]}"`)
                  value = CreditDebitEnum.DEBIT
                }
              }
              break
            case 'categoryName':
            case 'paymentTypeName':
              // Store these in temporary fields, we'll process them later
              tempFields[field] = value
              return // Don't add directly to transaction
          }
          
          if (field !== 'categoryName' && field !== 'paymentTypeName') {
            transaction[field] = value
          }
        }
      })
      
      // Process category name if provided
      if (tempFields.categoryName) {
        const categoryName = tempFields.categoryName.trim().toLowerCase()
        const category = categoriesList.find(c => 
          c.title.toLowerCase() === categoryName
        )
        
        if (category) {
          transaction.categoryId = category.id
        } else {
          errors.push(`Row ${index + 1}: Category "${tempFields.categoryName}" not found`)
        }
      }
      
      // Process payment type name if provided
      if (tempFields.paymentTypeName) {
        const paymentTypeName = tempFields.paymentTypeName.trim().toLowerCase()
        const paymentType = paymentTypesList.find(p => 
          p.description.toLowerCase() === paymentTypeName || 
          `${p.description} (*${p.lastCardNumber})`.toLowerCase() === paymentTypeName
        )
        
        if (paymentType) {
          transaction.paymentTypeId = paymentType.id
        } else {
          errors.push(`Row ${index + 1}: Payment method "${tempFields.paymentTypeName}" not found`)
        }
      }
      
      return transaction
    })
    
    setValidationErrors(errors)
    
    // If there are validation errors, return the transactions but show the errors
    return errors.length > 0 ? { transactions, hasErrors: true } : { transactions, hasErrors: false }
  }
  
  const handleImport = async () => {
    const result = validateAndPrepareTransactions()
    
    if (!result) return
    
    // If there are non-critical errors, ask user if they want to continue
    if (result.hasErrors) {
      if (validationErrors.length > 0) {
        // Show errors, but don't proceed with import yet
        return
      }
    }
    
    const transactions = result.transactions
    
    setStep(3)
    setProcessingStatus({
      isProcessing: true,
      processed: 0,
      errors: 0,
      total: transactions.length
    })
    
    let successCount = 0
    let errorCount = 0
    
    // Process transactions sequentially
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i]
      
      try {
        await UtilApiService.post('/transactions/' + transaction.categoryId, transaction)
        successCount++
      } catch (error) {
        console.error('Error adding transaction:', error)
        errorCount++
      }
      
      setProcessingStatus({
        isProcessing: true,
        processed: i + 1,
        errors: errorCount,
        total: transactions.length
      })
    }
    
    setProcessingStatus({
      isProcessing: false,
      processed: transactions.length,
      errors: errorCount,
      total: transactions.length
    })
    
    if (errorCount === 0) {
      toast.success(`Successfully imported ${successCount} transactions`)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } else {
      toast.warning(`Imported ${successCount} transactions with ${errorCount} errors`)
    }
  }
  
  const resetForm = () => {
    setCsvFile(null)
    setSeparator(";")
    setFileError("")
    setParsedData([])
    setHeaders([])
    setColumnMapping({})
    setStep(1)
    setValidationErrors([])
    setProcessingStatus({
      isProcessing: false,
      processed: 0,
      errors: 0,
      total: 0
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  return (
    <>
      {step === 1 && (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="csvFile">Upload CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {fileError && (
              <p className="text-sm text-red-500">{fileError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Only CSV or TXT files. Maximum size: 5MB.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="separator">CSV Separator</Label>
            <Select value={separator} onValueChange={setSeparator}>
              <SelectTrigger id="separator" className="w-full">
                <SelectValue placeholder="Choose separator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=";">Semicolon (;)</SelectItem>
                <SelectItem value=",">Comma (,)</SelectItem>
                <SelectItem value="|">Pipe (|)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleFileUpload}
              disabled={!csvFile}
            >
              Next
            </Button>
          </DialogFooter>
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Map CSV columns to transaction fields</h3>
              <div className="text-sm">
                <span className={`font-medium ${Object.values(columnMapping).filter(v => v !== "ignore").length >= 4 ? 'text-green-600' : 'text-amber-600'}`}>
                  {Object.values(columnMapping).filter(v => v !== "ignore").length}
                </span>
                <span className="text-muted-foreground"> / 4 columns mapped</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Please assign each column from your CSV file to a transaction field (minimum 4 columns required)
            </p>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {headers.map((header, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 items-center">
                <Label className="font-medium">{header}</Label>
                <Select 
                  value={columnMapping[header]} 
                  onValueChange={(value) => handleColumnMappingChange(header, value)}
                >
                  <SelectTrigger id={`map-${header}`}>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ignore">Ignore this column</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="note">Note/Description</SelectItem>
                    <SelectItem value="transactionDate">Transaction Date</SelectItem>
                    <SelectItem value="installmentsNumber">Installments Number</SelectItem>
                    <SelectItem value="transactionType">Transaction Type</SelectItem>
                    <SelectItem value="creditDebit">Credit/Debit</SelectItem>
                    <SelectItem value="categoryId">Category ID</SelectItem>
                    <SelectItem value="categoryName">Category Name</SelectItem>
                    <SelectItem value="paymentTypeId">Payment Method ID</SelectItem>
                    <SelectItem value="paymentTypeName">Payment Method Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="useCommonValues" 
                checked={useCommonValues}
                onCheckedChange={(checked) => setUseCommonValues(!!checked)}
              />
              <Label htmlFor="useCommonValues">
                Use common values for all transactions
              </Label>
            </div>
          </div>
          
          {useCommonValues && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commonCategory">Category</Label>
                  <Select 
                    value={commonValues.categoryId.toString()} 
                    onValueChange={(value) => handleCommonValueChange('categoryId', parseInt(value))}
                  >
                    <SelectTrigger id="commonCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesList.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commonPaymentType">Payment Method</Label>
                  <Select 
                    value={commonValues.paymentTypeId.toString()} 
                    onValueChange={(value) => handleCommonValueChange('paymentTypeId', parseInt(value))}
                  >
                    <SelectTrigger id="commonPaymentType">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypesList.map((payment: PaymentType) => (
                        <SelectItem key={payment.id} value={payment.id.toString()}>
                          {payment.description} (*{payment.lastCardNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commonTransactionType">Transaction Type</Label>
                  <Select 
                    value={commonValues.transactionType.toString()} 
                    onValueChange={(value) => handleCommonValueChange('transactionType', parseInt(value))}
                  >
                    <SelectTrigger id="commonTransactionType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TransactionTypeEnum.SINGLE.toString()}>Single</SelectItem>
                      <SelectItem value={TransactionTypeEnum.RECURRING.toString()}>Recurring</SelectItem>
                      <SelectItem value={TransactionTypeEnum.INSTALLMENTS.toString()}>Installments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commonCreditDebit">Credit/Debit</Label>
                  <Select 
                    value={commonValues.creditDebit.toString()} 
                    onValueChange={(value) => handleCommonValueChange('creditDebit', parseInt(value))}
                  >
                    <SelectTrigger id="commonCreditDebit">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CreditDebitEnum.DEBIT.toString()}>Expense (Debit)</SelectItem>
                      <SelectItem value={CreditDebitEnum.CREDIT.toString()}>Income (Credit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          {validationErrors.length > 0 && (
            <div className="pt-4">
              <p className="text-sm font-medium text-red-500">Please resolve the following issues:</p>
              <ul className="text-sm text-red-500 list-disc pl-5 mt-1 max-h-[100px] overflow-y-auto">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              type="button" 
              onClick={handleImport}
              disabled={Object.values(columnMapping).filter(v => v !== "ignore").length < 4}
            >
              Import Transactions
            </Button>
          </DialogFooter>
        </div>
      )}
      
      {step === 3 && (
        <div className="space-y-4 py-4">
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-medium">
              {processingStatus.isProcessing ? 'Importing Transactions...' : 'Import Complete'}
            </h3>
            
            <div className="w-full bg-secondary rounded-full h-2.5 mb-4">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${(processingStatus.processed / processingStatus.total) * 100}%` }}
              ></div>
            </div>
            
            <p className="text-sm">
              Processed {processingStatus.processed} of {processingStatus.total} transactions
              {processingStatus.errors > 0 && ` (${processingStatus.errors} errors)`}
            </p>
          </div>
          
          <DialogFooter>
            {processingStatus.isProcessing ? (
              <Button type="button" disabled>
                Processing...
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Import Another File
                </Button>
                <Button type="button" onClick={onClose}>
                  Close
                </Button>
              </>
            )}
          </DialogFooter>
        </div>
      )}
    </>
  )
} 