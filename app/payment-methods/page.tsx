"use client"

import AuthenticatedLayout from "@/components/authenticated-layout"
import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2, CreditCard } from "lucide-react"
import UtilApiService from "@/lib/utilApiService"
import { toast } from "@/components/ui/use-toast"

// Define our payment method type
interface PaymentMethod {
  id: string | number
  description: string
  cardBrandName: string
  cardBankName: string
  expirationDay: number
  daysToCloseInvoice: number
  lastCardNumber: number
  createdAt?: string
}

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod | null>(null)
  
  // Form states
  const [description, setDescription] = useState("")
  const [cardBrandName, setCardBrandName] = useState("")
  const [cardBankName, setCardBankName] = useState("")
  const [expirationDay, setExpirationDay] = useState<number>(1)
  const [daysToCloseInvoice, setDaysToCloseInvoice] = useState<number>(5)
  const [lastCardNumber, setLastCardNumber] = useState<number>(0)

  // Fetch payment methods from API
  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    setLoading(true)
    try {
      const response = await UtilApiService.get('/paymentType')
      
      if (response) {
        setPaymentMethods(response)
      } else {
        toast({
          title: "Error",
          description: "Failed to retrieve payment methods data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      toast({
        title: "Error",
        description: "Failed to load payment methods. Please try again later.",
        variant: "destructive"
      })
      // Fallback to empty payment methods array
      setPaymentMethods([])
    } finally {
      setLoading(false)
    }
  }

  // Filter payment methods based on search
  const filteredPaymentMethods = paymentMethods.filter(method => 
    method.description.toLowerCase().includes(search.toLowerCase()) ||
    method.cardBrandName.toLowerCase().includes(search.toLowerCase()) ||
    method.cardBankName.toLowerCase().includes(search.toLowerCase())
  )

  // Reset form
  const resetForm = () => {
    setDescription("")
    setCardBrandName("")
    setCardBankName("")
    setExpirationDay(1)
    setDaysToCloseInvoice(5)
    setLastCardNumber(0)
    setCurrentPaymentMethod(null)
    setIsEditing(false)
  }

  // Handle dialog open for creation
  const handleAddNew = () => {
    resetForm()
    setOpen(true)
  }

  // Handle dialog open for editing
  const handleEdit = (paymentMethod: PaymentMethod) => {
    setCurrentPaymentMethod(paymentMethod)
    setDescription(paymentMethod.description)
    setCardBrandName(paymentMethod.cardBrandName)
    setCardBankName(paymentMethod.cardBankName)
    setExpirationDay(paymentMethod.expirationDay)
    setDaysToCloseInvoice(paymentMethod.daysToCloseInvoice)
    setLastCardNumber(paymentMethod.lastCardNumber)
    setIsEditing(true)
    setOpen(true)
  }

  // Validate form
  const validateForm = () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Description is required",
        variant: "destructive"
      })
      return false
    }
    
    if (expirationDay < 1 || expirationDay > 31) {
      toast({
        title: "Error",
        description: "Expiration day must be between 1 and 31",
        variant: "destructive"
      })
      return false
    }
    
    if (daysToCloseInvoice < 0) {
      toast({
        title: "Error",
        description: "Days to close invoice must be a positive number",
        variant: "destructive"
      })
      return false
    }
    
    if (lastCardNumber < 0 || lastCardNumber > 9999) {
      toast({
        title: "Error",
        description: "Last card number must be between 0 and 9999",
        variant: "destructive"
      })
      return false
    }
    
    return true
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return
    
    try {
      if (isEditing && currentPaymentMethod) {
        // Update existing payment method
        const response = await UtilApiService.put(`/payment-methods/${currentPaymentMethod.id}`, {
          description,
          cardBrandName,
          cardBankName,
          expirationDay,
          daysToCloseInvoice,
          lastCardNumber
        })
        
        if (response) {
          // Update the local state with the updated payment method
          const updatedPaymentMethods = paymentMethods.map(method => 
            method.id === currentPaymentMethod.id 
              ? { 
                  ...method,
                  description,
                  cardBrandName,
                  cardBankName,
                  expirationDay,
                  daysToCloseInvoice,
                  lastCardNumber
                }
              : method
          )
          setPaymentMethods(updatedPaymentMethods)
          
          toast({
            title: "Success",
            description: "Payment method updated successfully"
          })
        }
      } else {
        // Create new payment method
        const paymentMethodData = {
          description,
          cardBrandName,
          cardBankName,
          expirationDay,
          daysToCloseInvoice,
          lastCardNumber
        }
        
        const response = await UtilApiService.post('/paymentType', paymentMethodData)
        
        if (response) {
          // Add the new payment method (with ID from the server) to the list
          setPaymentMethods([...paymentMethods, response])
          
          toast({
            title: "Success",
            description: "Payment method created successfully"
          })
        }
      }

      // Close dialog and reset form
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving payment method:', error)
      toast({
        title: "Error",
        description: isEditing 
          ? "Failed to update payment method. Please try again." 
          : "Failed to create payment method. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle payment method deletion
  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      try {
        // Call API to delete the payment method
        await UtilApiService.delete(`/payment-methods/${id}`)
        
        // Update local state by removing the deleted payment method
        setPaymentMethods(paymentMethods.filter(method => method.id !== id))
        
        toast({
          title: "Success",
          description: "Payment method deleted successfully"
        })
      } catch (error) {
        console.error('Error deleting payment method:', error)
        toast({
          title: "Error",
          description: "Failed to delete payment method. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const formatCardNumber = (last4: number) => {
    // Format the last 4 digits with leading zeros if needed
    return `**** **** **** ${last4.toString().padStart(4, '0')}`;
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <Button className="flex items-center gap-2" onClick={handleAddNew}>
            <Plus className="h-4 w-4" />
            Add Payment Method
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Manage your payment methods for transactions and subscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search payment methods..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
                      <TableHead>Card Details</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Expiration Day</TableHead>
                      <TableHead>Closing Period</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPaymentMethods.length > 0 ? (
                      filteredPaymentMethods.map((method) => (
                        <TableRow key={String(method.id)}>
                          <TableCell className="font-medium">{method.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              <span>{method.cardBrandName}</span>
                              <span className="ml-2 text-muted-foreground">
                                {formatCardNumber(method.lastCardNumber)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{method.cardBankName}</TableCell>
                          <TableCell>Day {method.expirationDay}</TableCell>
                          <TableCell>{method.daysToCloseInvoice} days before</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEdit(method)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(method.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No payment methods found.
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

      {/* Add/Edit Payment Method Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Payment Method" : "Add New Payment Method"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the payment method details below." 
                : "Enter details for your new payment method."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="description" 
                placeholder="e.g., Santander Visa Card" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardBrandName">Card Brand</Label>
                <Input 
                  id="cardBrandName" 
                  placeholder="e.g., Visa, Mastercard" 
                  value={cardBrandName}
                  onChange={(e) => setCardBrandName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardBankName">Bank Name</Label>
                <Input 
                  id="cardBankName" 
                  placeholder="e.g., Santander, Chase" 
                  value={cardBankName}
                  onChange={(e) => setCardBankName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expirationDay">Expiration Day</Label>
                <Input 
                  id="expirationDay" 
                  type="number" 
                  min={1}
                  max={31}
                  value={expirationDay}
                  onChange={(e) => setExpirationDay(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daysToCloseInvoice">Days to Close Invoice</Label>
                <Input 
                  id="daysToCloseInvoice" 
                  type="number"
                  min={0}
                  value={daysToCloseInvoice}
                  onChange={(e) => setDaysToCloseInvoice(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastCardNumber">Last 4 Digits</Label>
              <Input 
                id="lastCardNumber" 
                type="number"
                placeholder="Last 4 digits of your card" 
                min={0}
                max={9999}
                value={lastCardNumber || ''}
                onChange={(e) => setLastCardNumber(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => {
              setOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  )
} 