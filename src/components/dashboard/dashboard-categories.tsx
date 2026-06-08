'use client'

import { useAppStore } from '@/lib/store'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Tags, Plus, Edit2, Trash2, Package, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description?: string | null
  productCount: number
}

interface CategoryFormData {
  name: string
  description: string
}

const emptyForm: CategoryFormData = {
  name: '',
  description: '',
}

export function DashboardCategories() {
  const { shop } = useAppStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

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
      toast.error('Erreur de chargement des catégories')
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
    })
    setDialogOpen(true)
  }

  function openDeleteDialog(category: Category) {
    setDeletingCategory(category)
    setDeleteOpen(true)
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

      toast.success(editingCategory ? 'Catégorie modifiée !' : 'Catégorie ajoutée !')
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
      toast.success('Catégorie supprimée')
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
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Mes catégories</h1>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      {/* Categories grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Tags className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-1">Aucune catégorie</h3>
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
            <Card key={category.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                      <Tags className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    <span>{category.productCount} produit{category.productCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex gap-1">
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
              {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nom de la catégorie *</Label>
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
              <Button type="submit" disabled={saving}>
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
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              La catégorie &quot;{deletingCategory?.name}&quot; et ses {deletingCategory?.productCount} produit(s) associé(s) seront affectés. Les produits ne seront pas supprimés mais perdront leur catégorie.
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
