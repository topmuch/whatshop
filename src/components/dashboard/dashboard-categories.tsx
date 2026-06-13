'use client'

import { useAppStore } from '@/lib/store'
import { getBusinessLabels } from '@/lib/business-labels'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Tags, Plus, Edit2, Trash2, Package, Loader2, ImageIcon, X, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description?: string | null
  image?: string | null
  productCount: number
}

interface CategoryFormData {
  name: string
  description: string
  image: string
}

const emptyForm: CategoryFormData = {
  name: '',
  description: '',
  image: '',
}

export function DashboardCategories() {
  const { shop } = useAppStore()
  const labels = getBusinessLabels(shop?.businessType, shop?.sector)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCategories = useCallback(async () => {
    if (!shop) return
    try {
      const res = await fetch(`/api/categories?shopId=${shop.id}`)
      if (res.ok) {
        setCategories(await res.json())
      }
    } catch {
      toast.error(`Erreur de chargement des ${labels.categoryLabel.toLowerCase()}s`)
    } finally {
      setLoading(false)
    }
  }, [shop])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  function openAddDialog() {
    setEditingCategory(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
    })
    setDialogOpen(true)
  }

  function openDeleteDialog(category: Category) {
    setDeletingCategory(category)
    setDeleteOpen(true)
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors du téléchargement')
      }
      const data = await res.json()
      setForm((prev) => ({ ...prev, image: data.url }))
      toast.success('Image téléchargée avec succès')
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du téléchargement')
    } finally {
      setUploading(false)
    }
  }

  function handleRemoveImage() {
    setForm((prev) => ({ ...prev, image: '' }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) {
      toast.error('Le nom est obligatoire')
      return
    }

    setSaving(true)
    try {
      const body = {
        shopId: shop!.id,
        name: form.name,
        description: form.description,
        image: form.image || null,
      }

      let res: Response
      if (editingCategory) {
        res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCategory.id, ...body }),
        })
      } else {
        res = await fetch('/api/categories', {
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

      toast.success(editingCategory ? `${labels.categoryLabel} modifié !` : `${labels.categoryLabel} ajouté !`)
      setDialogOpen(false)
      fetchCategories()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories?id=${deletingCategory.id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Erreur lors de la suppression')
        return
      }
      toast.success(`${labels.categoryLabel} supprimé`)
      setDeleteOpen(false)
      setDeletingCategory(null)
      fetchCategories()
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{labels.categoriesTitle}</h1>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          {labels.categoriesAddButton}
        </Button>
      </div>

      {/* Categories grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Tags className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-1">{labels.categoriesEmpty}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre première catégorie pour organiser vos produits.
            </p>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Créer une catégorie
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="group hover:shadow-md transition-shadow overflow-hidden">
              {/* Category image preview */}
              <div className="h-28 bg-muted/30 relative">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                )}
                {/* Product count badge */}
                <div className="absolute bottom-2 right-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                    <Package className="h-3 w-3" />
                    {category.productCount} produit{category.productCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Tags className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{category.name}</h3>
                      {category.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? `Modifier ${labels.categoryLabel.toLowerCase()}` : labels.categoriesAddButton}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>{`Image du ${labels.categoryLabel.toLowerCase()}`}</Label>
              {form.image ? (
                <div className="relative rounded-lg overflow-hidden border h-36 bg-muted/30">
                  <img
                    src={form.image}
                    alt={`Image ${labels.categoryLabel.toLowerCase()}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-36 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/40 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-sm">Téléchargement...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8" />
                      <span className="text-sm font-medium">Cliquez pour ajouter une image</span>
                      <span className="text-xs text-muted-foreground/70">PNG, JPG, WebP (max 5 Mo)</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                  e.target.value = ''
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-name">{`Nom de ${labels.categoryLabel.toLowerCase()}`}</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Vêtements"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description de la catégorie..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCategory ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{`Supprimer ce ${labels.categoryLabel.toLowerCase()} ?`}</AlertDialogTitle>
            <AlertDialogDescription>
              Le {labels.categoryLabel.toLowerCase()} &quot;{deletingCategory?.name}&quot; et ses {deletingCategory?.productCount} produit(s) associé(s) seront affectés. Les produits ne seront pas supprimés mais perdront leur {labels.categoryLabel.toLowerCase()}.
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