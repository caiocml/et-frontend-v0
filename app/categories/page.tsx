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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import UtilApiService from "@/lib/utilApiService"
import { toast } from "@/components/ui/use-toast"

// Define our category type
interface Category {
  id: string | number
  title: string
  description: string
  createdAt: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  
  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  // Fetch categories from API
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await UtilApiService.get('/categories')
      
      if (response) {
        setCategories(response)
      } else {
        toast({
          title: "Error",
          description: "Failed to retrieve categories data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again later.",
        variant: "destructive"
      })
      // Fallback to empty categories array
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    category.title.toLowerCase().includes(search.toLowerCase()) ||
    category.description.toLowerCase().includes(search.toLowerCase())
  )

  // Reset form
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCurrentCategory(null)
    setIsEditing(false)
  }

  // Handle dialog open for creation
  const handleAddNew = () => {
    resetForm()
    setOpen(true)
  }

  // Handle dialog open for editing
  const handleEdit = (category: Category) => {
    setCurrentCategory(category)
    setTitle(category.title)
    setDescription(category.description)
    setIsEditing(true)
    setOpen(true)
  }

  // Handle form submission
  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      })
      return
    }

    // In a real app, you would call your API here
    if (isEditing && currentCategory) {
      // Update existing category
      const updatedCategories = categories.map(cat => 
        cat.id === currentCategory.id 
          ? { ...cat, title, description }
          : cat
      )
      setCategories(updatedCategories)
      toast({
        title: "Success",
        description: "Category updated successfully"
      })
    } else {
      // Create new category
      const newCategory: Category = {
        id: 1, // todo retirar esse id da criacao
        title,
        description,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setCategories([...categories, newCategory])
      toast({
        title: "Success",
        description: "Category created successfully"
      })
    }

    // Close dialog and reset form
    setOpen(false)
    resetForm()
  }

  // Handle category deletion
  const handleDelete = (id: string | number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      // In a real app, you would call your API here
      setCategories(categories.filter(cat => cat.id !== id))
      toast({
        title: "Success",
        description: "Category deleted successfully"
      })
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <Button className="flex items-center gap-2" onClick={handleAddNew}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Categories</CardTitle>
            <CardDescription>
              Manage categories for organizing your transactions. Categories help you track and report on your spending patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search categories..." 
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
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <TableRow key={String(category.id)}>
                          <TableCell className="font-medium">{category.title}</TableCell>
                          <TableCell>{category.description}</TableCell>
                          <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEdit(category)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(category.id)}
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
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          No categories found.
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

      {/* Add/Edit Category Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Category" : "Create New Category"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the category details below." 
                : "Add a new category to organize your transactions."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Food & Dining" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="e.g., Restaurants, groceries, food delivery" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  )
} 