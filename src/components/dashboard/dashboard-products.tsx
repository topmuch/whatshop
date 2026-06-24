'use client'

import { useAppStore } from '@/lib/store'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  ImageIcon,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
  Upload,
  Wand2,
} from 'lucide-react'
import { ProductWizard } from './product-wizard'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/shared'
import { getBusinessLabels } from '@/lib/business-labels'
import { getPlanConfig } from '@/lib/permissions'

interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  image?: string | null
  images?: string[]
  stock?: number | null
  isAvailable: boolean
  categoryId?: string | null
  category?: { id: string; name: string } | null
}

interface Category {
  id: string
  name: string
}

interface ProductFormData {
  name: string
  description: string
  price: string
  image: string
  images: string[]
  stock: string
  categoryId: string
  isAvailable: boolean
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  image: '',
  images: [],
  stock: '',
  categoryId: 'none',
  isAvailable: true,
}

export function DashboardProducts() {
  const { shop, setDashboardTab } = useAppStore()
  const labels = getBusinessLabels(shop?.businessType, shop?.sector)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Wizard mode
  const [wizardOpen, setWizardOpen] = useState(false)

  // Image upload
  const [imageUploading, setImageUploading] = useState(false)
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const extraImageInputRef = useRef<HTMLInputElement>(null)
  const [uploadTarget, setUploadTarget] = useState<'main' | number | null>(null)

  async function uploadProductFile(file: File): Promise<string | null> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Erreur lors du téléchargement')
      return null
    }
    const data = await res.json()
    return data.url
  }

  async function handleProductImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const url = await uploadProductFile(file)
      if (url) {
        if (uploadTarget === 'main') {
          setForm({ ...form, image: url })
        } else if (typeof uploadTarget === 'number') {
          const newImages = [...form.images]
          newImages[uploadTarget] = url
          setForm({ ...form, images: newImages })
        }
        toast.success('Image téléchargée !')
      }
    } finally {
      setImageUploading(false)
      setUploadTarget(null)
      if (mainImageInputRef.current) mainImageInputRef.current.value = ''
      if (extraImageInputRef.current) extraImageInputRef.current.value = ''
    }
  }

  const fetchProducts = useCallback(async () => {
    if (!shop) return
    try {
      const params = new URLSearchParams({ shopId: shop.id, all: 'true' })
      if (search) params.set('search', search)
      if (categoryFilter && categoryFilter !== 'all') params.set('categoryId', categoryFilter)

      const res = await fetch(`/api/products?${params}`)
      if (res.ok) {
        const data = await res.json()
        // API returns { products: [...], pagination: {...} } or plain array
        const productsArray = Array.isArray(data) ? data : (data.products || [])
        setProducts(productsArray)
      } else {
        const errData = await res.json().catch(() => ({ error: 'Erreur serveur' }))
        toast.error(errData.error || 'Erreur de chargement des produits')
      }
    } catch {
      toast.error('Erreur de connexion')
    }
  }, [shop, search, categoryFilter])

  const fetchCategories = useCallback(async () => {
    if (!shop) return
    try {
      const res = await fetch(`/api/categories?shopId=${shop.id}`)
      if (res.ok) {
        setCategories(await res.json())
      }
    } catch {
      // Ignore category fetch errors
    }
  }, [shop])

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false))
  }, [fetchProducts, fetchCategories])

  function openAddDialog() {
    const maxProducts = shop ? getPlanConfig(shop.plan).maxProducts : 20
    if (products.length >= maxProducts) {
      toast.error(`Limite atteinte (${products.length}/${maxProducts} produits). Passez à un plan supérieur pour ajouter plus de produits.`, {
        duration: 5000,
      })
      return
    }
    setEditingProduct(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      image: product.image || '',
      images: Array.isArray(product.images) ? [...product.images] : [],
      stock: String(product.stock || ''),
      categoryId: product.categoryId || 'none',
      isAvailable: product.isAvailable,
    })
    setDialogOpen(true)
  }

  function openDeleteDialog(product: Product) {
    setDeletingProduct(product)
    setDeleteOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || (!labels.priceOptional && !form.price)) {
      toast.error(labels.priceOptional ? 'Le nom est obligatoire' : 'Nom et prix sont obligatoires')
      return
    }

    setSaving(true)
    try {
      // Build images array: include the legacy image field as first image, then additional images
      const allImages = form.images.filter((img) => img.trim())
      const body = {
        shopId: shop!.id,
        name: form.name,
        description: form.description,
        price: form.price,
        image: form.image || null,
        images: allImages,
        stock: form.stock || null,
        categoryId: form.categoryId !== 'none' ? form.categoryId : null,
        isAvailable: form.isAvailable,
      }

      let res: Response
      if (editingProduct) {
        res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...body }),
        })
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Erreur lors de l'enregistrement")
        return
      }

      toast.success(editingProduct ? 'Produit modifié !' : 'Produit ajouté !')
      setDialogOpen(false)
      fetchProducts()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingProduct) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products?id=${deletingProduct.id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Erreur lors de la suppression')
        return
      }
      toast.success('Produit supprimé')
      setDeleteOpen(false)
      setDeletingProduct(null)
      fetchProducts()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{labels.productsTitle}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const maxProducts = shop ? getPlanConfig(shop.plan).maxProducts : 20
            if (products.length >= maxProducts) {
              toast.error(`Limite atteinte (${products.length}/${maxProducts} produits). Passez à un plan supérieur.`, { duration: 5000 })
              return
            }
            setWizardOpen(true)
          }} className="gap-2">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Wizard</span>
          </Button>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {labels.productsAddButton}
          </Button>
        </div>
      </div>

      {/* Plan limit warning */}
      {(() => {
        const maxProducts = shop ? getPlanConfig(shop.plan).maxProducts : 20
        const nearLimit = products.length >= maxProducts - 2 && products.length < maxProducts
        const atLimit = products.length >= maxProducts
        if (!nearLimit && !atLimit) return null
        return (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Limite de produits{atLimit ? ' atteinte' : ''}</p>
                <p className="text-sm text-amber-700">
                  {atLimit
                    ? `Vous avez ${products.length}/${maxProducts} produits. Passez à un plan supérieur pour ajouter plus de produits.`
                    : `Vous avez ${products.length}/${maxProducts} produits. ${maxProducts - products.length} reste${maxProducts - products.length > 1 ? 'nt' : ''} avant la limite.`}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100 w-full sm:w-fit">
              Mettre à niveau
            </Button>
          </div>
        )
      })()}

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={labels.productsSearch}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products list */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-1">{labels.productsEmpty}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || categoryFilter !== 'all'
                ? 'Aucun produit ne correspond à votre recherche.'
                : 'Ajoutez votre premier produit pour commencer à vendre.'}
            </p>
            {!search && categoryFilter === 'all' && (
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                {labels.productsAddButton}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>{labels.productLabel}</TableHead>
                      {labels.showPrice && <TableHead>Prix</TableHead>}
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-md object-cover bg-muted"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-48">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        {labels.showPrice && <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>}
                        <TableCell>
                          {product.category ? (
                            <Badge variant="secondary">{product.category.name}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.stock !== null ? (
                            <span className={product.stock === 0 ? 'text-destructive font-medium' : ''}>
                              {product.stock}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">∞</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={
                              product.isAvailable
                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                            }
                          >
                            {product.isAvailable ? 'Disponible' : 'Indisponible'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-xs text-primary hover:text-primary"
                              onClick={() => {
                                setDashboardTab('ai-tools')
                              }}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span className="hidden xl:inline">IA</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-md object-cover bg-muted shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          {product.category && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {product.category.name}
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`shrink-0 text-xs ${
                            product.isAvailable
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          {product.isAvailable ? 'Disponible' : 'Indisponible'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {labels.showPrice && <p className="font-semibold text-primary">{formatPrice(product.price)}</p>}
                        <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-xs text-primary hover:text-primary"
                              onClick={() => {
                                setDashboardTab('ai-tools')
                              }}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>IA</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                      </div>
                      {product.stock !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Stock : {product.stock === 0 ? <span className="text-destructive">Rupture</span> : product.stock}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? `Modifier ${labels.productLabel.toLowerCase()}` : labels.productsAddButton}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">{`Nom du ${labels.productLabel.toLowerCase()}`} *</Label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Robe Wax Colorée"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-desc">Description</Label>
              <Textarea
                id="product-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez votre produit..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-price">{labels.priceLabel}{!labels.priceOptional && ' *'}</Label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder={labels.pricePlaceholder}
                  required={!labels.priceOptional}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-stock">Stock</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="Laisser vide pour illimité"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image principale</Label>
              {/* Hidden file input for main image upload */}
              <input
                ref={mainImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleProductImageUpload}
              />
              <div className="flex items-center gap-2">
                {form.image ? (
                  <div className="relative shrink-0 group">
                    <img
                      src={form.image}
                      alt="Aperçu"
                      className="w-16 h-16 rounded-lg object-cover border bg-muted"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <button
                      type="button"
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600"
                      onClick={() => setForm({ ...form, image: '' })}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/20 flex items-center justify-center shrink-0">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                )}
                <Input
                  id="product-image"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-9 w-9"
                  disabled={imageUploading}
                  onClick={() => { setUploadTarget('main'); mainImageInputRef.current?.click() }}
                >
                  {imageUploading && uploadTarget === 'main' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Photos supplémentaires</Label>
              {/* Hidden file input for extra images */}
              <input
                ref={extraImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleProductImageUpload}
              />
              <div className="space-y-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {img ? (
                      <img
                        src={img}
                        alt={`Photo ${idx + 1}`}
                        className="w-10 h-10 rounded-md object-cover bg-muted shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <Input
                      value={img}
                      onChange={(e) => {
                        const newImages = [...form.images]
                        newImages[idx] = e.target.value
                        setForm({ ...form, images: newImages })
                      }}
                      placeholder={`URL de la photo ${idx + 2}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      disabled={imageUploading}
                      onClick={() => { setUploadTarget(idx); extraImageInputRef.current?.click() }}
                    >
                      {imageUploading && uploadTarget === idx ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => setForm({ ...form, images: [...form.images, ''] })}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une photo
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={form.categoryId}
                onValueChange={(val) => setForm({ ...form, categoryId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune catégorie</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="product-available" className="cursor-pointer">Disponible</Label>
                <p className="text-xs text-muted-foreground">Le produit sera visible dans votre boutique</p>
              </div>
              <Switch
                id="product-available"
                checked={form.isAvailable}
                onCheckedChange={(checked) => setForm({ ...form, isAvailable: checked })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingProduct ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Wizard Dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-xl top-[2%] translate-y-0 max-h-[96vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Créer un {labels.productLabel.toLowerCase()} — Wizard
            </DialogTitle>
          </DialogHeader>
          <ProductWizard
            shopId={shop!.id}
            categories={categories}
            businessType={shop?.businessType}
            sector={shop?.sector}
            onSuccess={() => {
              setWizardOpen(false)
              fetchProducts()
            }}
            onCancel={() => setWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{`Supprimer ce ${labels.productLabel.toLowerCase()} ?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {`Le ${labels.productLabel.toLowerCase()} "${deletingProduct?.name}" sera définitivement supprimé. Cette action est irréversible.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
