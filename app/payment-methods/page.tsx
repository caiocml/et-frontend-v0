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
import { Search, Plus, Edit, Trash2, CreditCard, Smartphone, Wallet, QrCode, FileText } from "lucide-react"
import UtilApiService from "@/lib/utilApiService"
import { toast } from "@/components/ui/use-toast"

// Custom PIX icon component
const PixIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 30 30"
    width="24"
    height="24"
    stroke="currentColor"
    fill="none"
    strokeWidth="0.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M 15 1.0996094 C 13.975 1.0996094 12.949922 1.4895313 12.169922 2.2695312 L 7.1894531 7.25 L 7.3398438 7.25 C 8.6098437 7.25 9.7992188 7.740625 10.699219 8.640625 L 14.189453 12.130859 C 14.639453 12.570859 15.360547 12.570859 15.810547 12.130859 L 19.300781 8.640625 C 20.200781 7.740625 21.390156 7.25 22.660156 7.25 L 22.810547 7.25 L 17.830078 2.2695312 C 17.050078 1.4895313 16.025 1.0996094 15 1.0996094 z M 5.6894531 8.75 L 2.2695312 12.169922 C 0.70953125 13.729922 0.70953125 16.270078 2.2695312 17.830078 L 5.6894531 21.25 L 7.3398438 21.25 C 8.2098438 21.25 9.030625 20.910781 9.640625 20.300781 L 13.130859 16.810547 C 14.160859 15.780547 15.839141 15.780547 16.869141 16.810547 L 20.359375 20.300781 C 20.969375 20.910781 21.790156 21.25 22.660156 21.25 L 24.310547 21.25 L 27.730469 17.830078 C 29.290469 16.270078 29.290469 13.729922 27.730469 12.169922 L 24.310547 8.75 L 22.660156 8.75 C 21.790156 8.75 20.969375 9.0892188 20.359375 9.6992188 L 16.869141 13.189453 C 16.359141 13.699453 15.68 13.960938 15 13.960938 C 14.32 13.960938 13.640859 13.699453 13.130859 13.189453 L 9.640625 9.6992188 C 9.030625 9.0892187 8.2098437 8.75 7.3398438 8.75 L 5.6894531 8.75 z M 15 17.539062 C 14.7075 17.539062 14.414453 17.649141 14.189453 17.869141 L 10.699219 21.359375 C 9.7992188 22.259375 8.6098437 22.75 7.3398438 22.75 L 7.1894531 22.75 L 12.169922 27.730469 C 13.729922 29.290469 16.270078 29.290469 17.830078 27.730469 L 22.810547 22.75 L 22.660156 22.75 C 21.390156 22.75 20.200781 22.259375 19.300781 21.359375 L 15.810547 17.869141 C 15.585547 17.649141 15.2925 17.539062 15 17.539062 z" fill="currentColor" stroke="none" />
  </svg>
);

// Define our payment method type
interface PaymentMethod {
  id: string | number
  description: string
  cardBrandName: string
  cardBankName: string
  expirationDay: number
  daysToCloseInvoice: number
  lastCardNumber: number
  methodId?: number
  bankNumber?: number
  agencyNumber?: number
  accountNumber?: number
  createdAt?: string
}

// Define payment method types as enum
const PaymentMethodTypes = [
  { id: 0, name: "PIX", icon: PixIcon },
  { id: 1, name: "Credit Card", icon: CreditCard },
  { id: 2, name: "Debit Card", icon: Wallet },
  { id: 3, name: "Transfer", icon: Smartphone },
  { id: 4, name: "Bank Slip", icon: FileText },
];

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
  const [methodId, setMethodId] = useState<number>(0)
  const [bankNumber, setBankNumber] = useState<number | undefined>(undefined)
  const [agencyNumber, setAgencyNumber] = useState<number | undefined>(undefined)
  const [accountNumber, setAccountNumber] = useState<number | undefined>(undefined)

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
    setMethodId(0)
    setBankNumber(undefined)
    setAgencyNumber(undefined)
    setAccountNumber(undefined)
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
    setMethodId(paymentMethod.methodId || 0)
    setBankNumber(paymentMethod.bankNumber)
    setAgencyNumber(paymentMethod.agencyNumber)
    setAccountNumber(paymentMethod.accountNumber)
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
          lastCardNumber,
          methodId,
          bankNumber,
          agencyNumber,
          accountNumber
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
                  lastCardNumber,
                  methodId,
                  bankNumber,
                  agencyNumber,
                  accountNumber
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
          lastCardNumber,
          methodId,
          bankNumber,
          agencyNumber,
          accountNumber
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
                      <TableHead>Method</TableHead>
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
                      filteredPaymentMethods.map((method) => {
                        const methodType = PaymentMethodTypes[method.methodId || 0];
                        const MethodIcon = methodType?.icon || CreditCard;
                        return (
                          <TableRow key={String(method.id)}>
                            <TableCell>
                              <div className="flex items-center">
                                <MethodIcon className="h-4 w-4 mr-2" />
                                <span>{methodType?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{method.description}</TableCell>
                            <TableCell>
                              {method.lastCardNumber > 0 && (
                                <div className="flex items-center">
                                  <span>{method.cardBrandName}</span>
                                  <span className="ml-2 text-muted-foreground">
                                    {formatCardNumber(method.lastCardNumber)}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{method.cardBankName}</TableCell>
                            <TableCell>{method.expirationDay > 0 ? `Day ${method.expirationDay}` : '-'}</TableCell>
                            <TableCell>{method.daysToCloseInvoice > 0 ? `${method.daysToCloseInvoice} days before` : '-'}</TableCell>
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
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Payment Method" : "Add New Payment Method"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the payment method details below." 
                : "Enter details for your new payment method."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[65vh] overflow-y-auto pr-2">
            <div className="space-y-6">
              {/* Method Type Section */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-center border-b pb-2">Method Type <span className="text-red-500">*</span></h3>
                <div className="grid grid-cols-5 gap-2">
                  {PaymentMethodTypes.map((type) => {
                    const TypeIcon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        type="button"
                        variant={methodId === type.id ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-16 px-2 py-2"
                        onClick={() => setMethodId(type.id)}
                      >
                        <TypeIcon className="h-5 w-5 mb-1" />
                        <span className="text-xs text-center">{type.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-1 px-1">
                <h3 className="text-sm font-medium text-center border-b pb-1 mb-2">Description <span className="text-red-500">*</span></h3>
                <Input 
                  id="description" 
                  placeholder="e.g., Santander Visa Card" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9"
                />
              </div>
              
              {/* Card Details Section */}
              <div className="space-y-3 border rounded-md p-4">
                <h3 className="text-base font-medium text-center border-b pb-2">Card Details</h3>
                <div className="space-y-4">
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
                </div>
              </div>
              
              {/* Bank Account Details Section */}
              <div className="space-y-3 border rounded-md p-4">
                <h3 className="text-base font-medium text-center border-b pb-2">Bank Account Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardBankName">Bank Name</Label>
                    <Input 
                      id="cardBankName" 
                      placeholder="e.g., Santander, Chase" 
                      value={cardBankName}
                      onChange={(e) => setCardBankName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankNumber">Bank Number</Label>
                      <Input 
                        id="bankNumber" 
                        type="number"
                        placeholder="Bank code" 
                        min={0}
                        value={bankNumber || ''}
                        onChange={(e) => setBankNumber(parseInt(e.target.value) || undefined)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agencyNumber">Agency Number</Label>
                      <Input 
                        id="agencyNumber" 
                        type="number"
                        placeholder="Agency number" 
                        min={0}
                        value={agencyNumber || ''}
                        onChange={(e) => setAgencyNumber(parseInt(e.target.value) || undefined)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input 
                        id="accountNumber" 
                        type="number"
                        placeholder="Account number" 
                        min={0}
                        value={accountNumber || ''}
                        onChange={(e) => setAccountNumber(parseInt(e.target.value) || undefined)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end mt-4">
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