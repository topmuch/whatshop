'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Pencil, Trash2, GripVertical, Truck, MapPin } from 'lucide-react'

// ─── TYPES ──────────────────────────────────────────────────────────────────────

interface ShippingZoneData {
  id: string
  shopId: string
  name: string
  price: number
  sortOrder: number
}

interface ZoneFormState {
  name: string
  price: string
}

// ─── SORTABLE ITEM ──────────────────────────────────────────────────────────────

function SortableZoneItem({
  zone,
  onEdit,
  onDelete,
}: {
  zone: ShippingZoneData
  onEdit: (zone: ShippingZoneData) => void
  onDelete: (zone: ShippingZoneData) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: zone.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 sm:p-4"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="flex-shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Réorganiser"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>

      {/* Zone info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5 flex-shrink-0 text-muted-foreground" />
          <span className="font-medium text-sm truncate">{zone.name}</span>
        </div>
        <span className="text-sm text-primary font-semibold pl-5.5">
          {zone.price.toLocaleString('fr-FR')} FCFA
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onEdit(zone)}
          aria-label={`Modifier ${zone.name}`}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(zone)}
          aria-label={`Supprimer ${zone.name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export function ShippingZonesManager() {
  const shop = useAppStore((s) => s.shop)
  const shopId = shop?.id ?? ''
  const shopSlug = shop?.slug ?? ''

  const [zones, setZones] = useState<ShippingZoneData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZoneData | null>(null)
  const [form, setForm] = useState<ZoneFormState>({ name: '', price: '' })
  const [formError, setFormError] = useState<string | null>(null)

  // Delete confirmation state
  const [deleteZone, setDeleteZone] = useState<ShippingZoneData | null>(null)
  const [deleting, setDeleting] = useState(false)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ─── FETCH ZONES ────────────────────────────────────────────────────────────

  const fetchZones = useCallback(async () => {
    if (!shopId || !shopSlug) return
    try {
      const res = await fetch(`/api/shops/${shopSlug}/shipping-zones`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erreur serveur' }))
        throw new Error(data.error || 'Erreur de chargement')
      }
      const data = await res.json()
      setZones(data.zones)
    } catch (err) {
      console.error('Failed to fetch shipping zones:', err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors du chargement des zones de livraison')
    } finally {
      setLoading(false)
    }
  }, [shopId, shopSlug])

  useEffect(() => {
    setLoading(true)
    fetchZones()
  }, [fetchZones])

  // ─── DIALOG HELPERS ─────────────────────────────────────────────────────────

  const openCreateDialog = () => {
    setEditingZone(null)
    setForm({ name: '', price: '' })
    setFormError(null)
    setDialogOpen(true)
  }

  const openEditDialog = (zone: ShippingZoneData) => {
    setEditingZone(zone)
    setForm({ name: zone.name, price: String(zone.price) })
    setFormError(null)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingZone(null)
    setForm({ name: '', price: '' })
    setFormError(null)
  }

  // ─── VALIDATE & SUBMIT ──────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const trimmedName = form.name.trim()

    if (!trimmedName) {
      setFormError('Le nom de la zone est requis')
      return false
    }
    if (trimmedName.length > 50) {
      setFormError('Le nom ne doit pas dépasser 50 caractères')
      return false
    }

    const priceNum = Number(form.price)
    if (!form.price || isNaN(priceNum) || !Number.isFinite(priceNum)) {
      setFormError('Veuillez entrer un prix valide')
      return false
    }
    if (priceNum <= 0) {
      setFormError('Le prix doit être supérieur à 0')
      return false
    }
    if (priceNum > 100000) {
      setFormError('Le prix ne peut pas dépasser 100 000 FCFA')
      return false
    }

    setFormError(null)
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm() || !shopId) return

    setSaving(true)
    try {
      if (editingZone) {
        // Update
        const res = await fetch(`/api/shipping-zones/${editingZone.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            price: Math.round(Number(form.price)),
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Erreur de mise à jour')
        }
        toast.success('Zone de livraison modifiée')
      } else {
        // Create
        const res = await fetch(`/api/shops/${shopSlug}/shipping-zones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            price: Math.round(Number(form.price)),
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Erreur de création')
        }
        toast.success('Zone de livraison ajoutée')
      }
      closeDialog()
      await fetchZones()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur serveur'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  // ─── DELETE ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteZone) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/shipping-zones/${deleteZone.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de suppression')
      }
      toast.success('Zone de livraison supprimée')
      setDeleteZone(null)
      await fetchZones()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur serveur'
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  // ─── DRAG & DROP ────────────────────────────────────────────────────────────

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = zones.findIndex((z) => z.id === active.id)
    const newIndex = zones.findIndex((z) => z.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(zones, oldIndex, newIndex)
    setZones(reordered)

    // Update sortOrder for each zone
    try {
      const updates = reordered.map((zone, index) =>
        fetch(`/api/shipping-zones/${zone.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: index }),
        })
      )
      await Promise.all(updates)
    } catch {
      toast.error('Erreur lors de la réorganisation')
      await fetchZones()
    }
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  if (!shopId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Veuillez d&apos;abord créer une boutique
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Zones de livraison</CardTitle>
              <CardDescription>
                Gérez les frais de livraison par zone
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={openCreateDialog}
            size="sm"
            className="gap-1.5 self-start"
          >
            <Plus className="size-4" />
            Ajouter une zone
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : zones.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <MapPin className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Aucune zone de livraison</p>
              <p className="text-sm text-muted-foreground">
                Ajoutez des zones pour définir les frais de livraison
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={zones.map((z) => z.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {zones.map((zone) => (
                  <SortableZoneItem
                    key={zone.id}
                    zone={zone}
                    onEdit={openEditDialog}
                    onDelete={setDeleteZone}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {zones.length > 0 && !loading && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            {zones.length} zone{zones.length > 1 ? 's' : ''} de livraison · Glissez pour réorganiser
          </p>
        )}
      </CardContent>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? 'Modifier la zone' : 'Nouvelle zone de livraison'}
            </DialogTitle>
            <DialogDescription>
              {editingZone
                ? 'Modifiez les informations de la zone de livraison.'
                : 'Définissez une nouvelle zone de livraison avec ses frais.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="zone-name">Nom de la zone</Label>
              <Input
                id="zone-name"
                placeholder="Ex: Abidjan, intérieur du pays..."
                value={form.name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                  setFormError(null)
                }}
                maxLength={50}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="zone-price">Frais de livraison (FCFA)</Label>
              <Input
                id="zone-price"
                type="number"
                placeholder="1500"
                min={1}
                max={100000}
                value={form.price}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                  setFormError(null)
                }}
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving
                ? 'Enregistrement...'
                : editingZone
                  ? 'Enregistrer'
                  : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteZone} onOpenChange={(open) => !open && setDeleteZone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette zone ?</AlertDialogTitle>
            <AlertDialogDescription>
              La zone «&nbsp;{deleteZone?.name}&nbsp;» ({deleteZone?.price.toLocaleString('fr-FR')} FCFA)
              sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}