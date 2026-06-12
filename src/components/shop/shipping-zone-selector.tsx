'use client'

import { useEffect, useState } from 'react'
import { useAppStore, type ShippingZone } from '@/lib/store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { MapPin, Loader2 } from 'lucide-react'

export function ShippingZoneSelector() {
  const publicShop = useAppStore((s) => s.publicShop)
  const shopSlug = useAppStore((s) => s.shopSlug)
  const selectedShippingZone = useAppStore((s) => s.selectedShippingZone)
  const setSelectedShippingZone = useAppStore((s) => s.setSelectedShippingZone)

  const [zones, setZones] = useState<ShippingZone[]>([])
  const [loading, setLoading] = useState(true)

  // Use slug for the public API (no auth needed)
  const slug = shopSlug || ''

  useEffect(() => {
    if (!slug) return

    let cancelled = false

    async function fetchZones() {
      try {
        const res = await fetch(`/api/shops/${slug}/public-shipping-zones`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setZones(data.zones ?? [])
        }
      } catch {
        // Silently fail — shipping zones are optional
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchZones()

    return () => {
      cancelled = true
    }
  }, [slug])

  // Reset selection when shop changes
  useEffect(() => {
    setSelectedShippingZone(null)
    setZones([])
    setLoading(true)
  }, [slug, setSelectedShippingZone])

  // If still loading, no shop, or no zones -> don't render
  if (loading || !slug || zones.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        <MapPin className="size-3.5 text-muted-foreground" />
        Zone de livraison
      </Label>
      <Select
        value={selectedShippingZone?.id ?? ''}
        onValueChange={(value) => {
          const zone = zones.find((z) => z.id === value)
          if (zone) {
            setSelectedShippingZone(zone)
          } else {
            setSelectedShippingZone(null)
          }
        }}
      >
        <SelectTrigger className="w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Chargement...
            </span>
          ) : (
            <SelectValue placeholder="Choisir une zone de livraison" />
          )}
        </SelectTrigger>
        <SelectContent>
          {zones.map((zone) => (
            <SelectItem key={zone.id} value={zone.id}>
              <span className="flex items-center justify-between gap-4 w-full">
                <span>{zone.name}</span>
                <span className="text-muted-foreground text-xs ml-auto">
                  {zone.price.toLocaleString('fr-FR')} FCFA
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}