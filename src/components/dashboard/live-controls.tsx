'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type Product } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Radio, Check, Loader2, Eye, Package, X } from 'lucide-react'
import { toast } from 'sonner'

export function LiveControls() {
  const { shop, setShop } = useAppStore()

  const [isLiveMode, setIsLiveMode] = useState(false)
  const [liveProductId, setLiveProductId] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [settingProduct, setSettingProduct] = useState(false)

  // Load current state from shop
  useEffect(() => {
    if (!shop) return
    setIsLiveMode(shop.isLiveMode || false)
    setLiveProductId(shop.liveProductId || '')
  }, [shop])

  // Fetch products
  useEffect(() => {
    if (!shop) return
    setLoading(true)
    fetch(`/api/shops/${shop.slug}/products`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => toast.error('Erreur de chargement des produits'))
      .finally(() => setLoading(false))
  }, [shop])

  // Get the live product name
  const liveProduct = products.find((p) => p.id === liveProductId)

  // Toggle live mode
  const handleToggle = useCallback(async () => {
    if (!shop) return
    setToggling(true)
    try {
      const res = await fetch('/api/live/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          isActive: !isLiveMode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      setIsLiveMode(data.shop.isLiveMode)
      if (!data.shop.isLiveMode) {
        setLiveProductId('')
      }
      setShop({ ...shop, isLiveMode: data.shop.isLiveMode, liveProductId: data.shop.liveProductId || '' })
      toast.success(data.shop.isLiveMode ? '🔴 Mode Live activé !' : 'Mode Live désactivé')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setToggling(false)
    }
  }, [shop, isLiveMode, setShop])

  // Set live product
  const handleSetProduct = useCallback(async (productId: string) => {
    if (!shop) return
    setSettingProduct(true)
    try {
      const res = await fetch('/api/live/set-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          productId: productId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      setLiveProductId(data.shop.liveProductId || '')
      setShop({ ...shop, liveProductId: data.shop.liveProductId || '' })
      toast.success(productId ? `Produit en avant : ${liveProduct?.name || 'inconnu'}` : 'Aucun produit sélectionné')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSettingProduct(false)
    }
  }, [shop, liveProduct, setShop])

  if (!shop) return null

  const liveProducts = products.filter((p) => p.isAvailable)

  return (
    <Card className="border-2 border-dashed border-red-200 dark:border-red-900 bg-gradient-to-br from-white via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-red-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="h-5 w-5 text-red-600" />
          Mode Live
          {isLiveMode && (
            <Badge variant="destructive" className="animate-pulse">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-white" />
              EN DIRECT
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Affiche un seul produit en avant sur votre boutique publique. Parfait pour les lives TikTok.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Activer le mode live</p>
            <p className="text-xs text-muted-foreground">
              {isLiveMode ? 'Votre boutique affiche le produit en avant' : 'Les clients verront votre catalogue normal'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
              isLiveMode ? 'bg-red-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={isLiveMode}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isLiveMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Product Selector — only visible when live */}
        {isLiveMode && (
          <div className="space-y-2 rounded-lg border p-4">
            <Label className="text-sm font-medium">Produit à mettre en avant</Label>
            {loading ? (
              <div className="space-y-2">
                <div className="h-9 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-9 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <Select
                  value={liveProductId || '__none__'}
                  onValueChange={(val) => handleSetProduct(val === '__none__' ? '' : val)}
                  disabled={settingProduct}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un produit..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="__none__">
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        Aucun produit (catalogue normal)
                      </span>
                    </SelectItem>
                    {liveProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex items-center gap-2">
                          <Check className={`h-4 w-4 ${p.id === liveProductId ? 'text-red-600' : 'text-transparent'}`} />
                          {p.name} — {p.price.toLocaleString('fr-FR')} FCFA
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {settingProduct && (
                  <p className="text-xs text-muted-foreground text-center">
                    <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                    Mise à jour...
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Preview of what viewers see */}
        {isLiveMode && liveProduct && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
              <Eye className="h-4 w-4" />
              Aperçu vue client
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-3 space-y-2 border">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-sm font-bold text-red-600">🔴 EN DIRECT</span>
              </div>
              <div className="text-sm font-semibold">{liveProduct.name}</div>
              <div className="text-sm text-muted-foreground">
                {liveProduct.price?.toLocaleString('fr-FR')} FCFA
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                URL : <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://boutiko.pro'}/{shop.slug}
                </code>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}