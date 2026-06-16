'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore, type Product } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import { openWhatsApp } from '@/lib/shared'
import { Button } from '@/components/ui/button'
import { MessageCircle, Share2, Loader2, Store } from 'lucide-react'

interface LiveModeViewProps {
  shopId: string
  shopSlug: string
  shopName: string
  whatsapp: string
  primaryColor?: string
  accentColor?: string
  logo?: string
}

/**
 * Full-screen live mode view: single product spotlight with EN DIRECT badge.
 * Rendered by the public shop when isLiveMode is true.
 * Fetches the live product and displays it in a TikTok-optimized layout.
 * Polls every 10s so viewers see product changes quickly.
 */
export function LiveModeView({ shopId, shopSlug, shopName, whatsapp, primaryColor, accentColor, logo }: LiveModeViewProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const accent = accentColor || primaryColor || '#EC4899'

  useEffect(() => {
    if (!shopId) return
    setLoading(true)
    setError(null)

    let cancelled = false
    const controller = new AbortController()

    const intervalMs = 10000 // Re-fetch every 10s

    async function fetchLive() {
      try {
        // Fetch shop data to get liveProductId + check if live is still on
        const shopRes = await fetch(`/api/shops/${shopSlug}`, {
          signal: controller.signal,
        })
        if (cancelled || !shopRes.ok) return

        const shopData = await shopRes.json()

        if (!shopData.isLiveMode) {
          // Live mode was turned off — signal parent to show normal shop
          setError('LIVE_OFF')
          return
        }

        if (!shopData.liveProductId) {
          // No product pinned yet
          setProduct(null)
          setLoading(false)
          return
        }

        // Fetch products and find the live one
        const res = await fetch(`/api/shops/${shopSlug}/products`, {
          signal: controller.signal,
        })
        if (cancelled || !res.ok) return

        const data: Product[] = await res.json()
        const live = data.find((p: Product) => p.id === shopData.liveProductId)
        if (live) {
          setProduct(live)
          setError(null)
        } else {
          // Product was deleted or removed
          setProduct(null)
        }
      } catch {
        if (!cancelled) setError('network')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLive()
    const interval = setInterval(fetchLive, intervalMs)

    return () => {
      cancelled = true
      controller.abort()
      clearInterval(interval)
    }
  }, [shopId, shopSlug])

  const handleOrder = useCallback(() => {
    if (!product) return
    openWhatsApp({ name: product.name, price: product.price }, whatsapp, 1)
  }, [product, whatsapp])

  const handleShare = useCallback(() => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/${shopSlug}`
    if (navigator.share) {
      navigator.share({ title: `${shopName} — 🔴 EN DIRECT`, url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }, [shopSlug, shopName])

  // ─── LIVE OFF → return null so parent renders normal shop ───────────
  if (error === 'LIVE_OFF') {
    return null
  }

  // ─── LOADING ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="text-sm text-gray-400">Connexion au live...</p>
      </div>
    )
  }

  // ─── NO PRODUCT PINNED YET ──────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center gap-4 px-4">
        {/* Live banner even when no product */}
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-3 px-4">
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span className="text-sm font-bold tracking-wide">🔴 EN DIRECT</span>
            <span className="text-sm font-medium opacity-90">— {shopName}</span>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <p className="text-sm text-gray-400 font-medium">
            En attente du produit...
          </p>
          <p className="text-xs text-gray-600">Le produit apparaîtra automatiquement</p>
        </div>
      </div>
    )
  }

  // ─── NETWORK ERROR ──────────────────────────────────────────────────
  if (error === 'network') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 px-4 bg-gray-950">
        <p className="text-sm text-gray-400">Erreur de connexion. Reconnexion...</p>
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      </div>
    )
  }

  // ─── LIVE VIEW: PRODUCT SPOTLIGHT ───────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black flex flex-col">
      {/* Sticky Live Banner */}
      <div className="sticky top-0 z-50 bg-red-600 text-white text-center py-2.5 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <span className="text-sm sm:text-base font-bold tracking-wide">
            🔴 EN DIRECT
          </span>
          <span className="text-sm sm:text-base font-medium opacity-90 hidden sm:inline">
            — {shopName}
          </span>
        </div>
      </div>

      {/* Product Spotlight */}
      <div className="flex-1 flex flex-col items-center px-4 py-6 sm:py-8">
        {/* Product Image — full width on mobile, max 400px on larger */}
        <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden bg-gray-800 shadow-2xl shadow-red-500/10 mb-6">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
              <span className="text-6xl">🛍️</span>
            </div>
          )}

          {/* Gradient overlay with product info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-16">
            <h2 className="text-xl sm:text-3xl font-bold text-white leading-tight mb-1 drop-shadow-lg">
              {product.name}
            </h2>
            {(product.shortDescription || product.description) && (
              <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                {product.shortDescription || product.description}
              </p>
            )}
            <p
              className="text-xl sm:text-3xl font-black"
              style={{ color: accent }}
            >
              {formatPrice(product.price)}
            </p>
          </div>
        </div>

        {/* Stock indicator */}
        {product.stock !== null && product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <div className="mb-4 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
            <span className="text-xs font-medium text-amber-400">
              ⚡ Plus que {product.stock} en stock
            </span>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="w-full max-w-[400px] space-y-3">
          <Button
            size="lg"
            className="w-full h-14 sm:h-16 gap-2 text-lg sm:text-xl font-bold rounded-2xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-transform"
            style={{ backgroundColor: '#25D366', color: '#ffffff' }}
            onClick={handleOrder}
          >
            <MessageCircle className="h-6 w-6" />
            Commander via WhatsApp
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 gap-2 rounded-2xl border-white/20 text-white hover:bg-white/10 active:scale-[0.98] transition-transform"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
            Partager le lien du live
          </Button>
        </div>

        {/* Shop branding at bottom */}
        <div className="mt-8 flex items-center gap-2 text-white/40">
          {logo ? (
            <img
              src={logo}
              alt=""
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <Store className="h-4 w-4" />
          )}
          <span className="text-xs font-medium">{shopName}</span>
        </div>
      </div>
    </div>
  )
}