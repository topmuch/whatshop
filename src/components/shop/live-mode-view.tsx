'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore, type Product } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import { openWhatsApp } from '@/lib/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Share2, Loader2, ChevronRight } from 'lucide-react'

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
        const res = await fetch(`/api/shops/${shopSlug}/products`, {
          signal: controller.signal,
        })
        if (cancelled || !res.ok) return

        const data: Product[] = await res.json()
        // The public shop doesn't know which product is live — ask the shop API
        const shopRes = await fetch(`/api/shops/${shopSlug}`, {
          signal: controller.signal,
        })
        if (cancelled || !shopRes.ok) return

        const shopData = await shopRes.json()

        if (!shopData.isLiveMode || !shopData.liveProductId) {
          // Live mode was turned off
          setError('LIVE_OFF')
          return
        }

        const live = data.find((p: Product) => p.id === shopData.liveProductId)
        if (live) {
          setProduct(live)
          setError(null)
        } else {
          // Product was deleted or removed — show nothing
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

  // Listen for store changes (when seller switches product in dashboard)
  const publicShop = useAppStore((s) => s.publicShop)

  useEffect(() => {
    if (!publicShop) return
    if (publicShop.isLiveMode && publicShop.liveProductId) {
      setProduct((prev) => {
        if (prev && prev.id === publicShop.liveProductId) return prev
        // Product changed — need to fetch
        fetch(`/api/shops/${shopSlug}/products`)
          .then((r) => r.json())
          .then((data: Product[]) => {
            const found = data.find((p: Product) => p.id === publicShop.liveProductId)
            if (found) {
              setProduct(found)
              setError(null)
            }
          })
          .catch(() => {})
        return prev
      })
    }
  }, [publicShop?.isLiveMode, publicShop?.liveProductId, shopSlug])

  const handleOrder = () => {
    if (!product) return
    const msg = `Bonjour ! 👋\n\nJe suis en live et je souhaite commander :\n\n🛍️ ${product.name}\n💰 ${formatPrice(product.price)}\n\nVu depuis votre live sur ${shopName} !`
    openWhatsApp({ name: product.name, price: product.price }, whatsapp, 1)
  }

  const handleShare = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/${shopSlug}`
    if (navigator.share) {
      navigator.share({ title: `${shopName} — 🔴 EN DIRECT`, url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  // ─── LIVE OFF ────────────────────────────────────────────────────────
  if (error === 'LIVE_OFF') {
    return null // Let parent render the normal shop
  }

  // ─── LOADING ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="text-sm text-gray-500">Connexion au live...</p>
      </div>
    )
  }

  // ─── ERROR ────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
        <p className="text-sm text-gray-500 font-medium">
          🔴 En direct — En attente du produit...
        </p>
      </div>
    )
  }

  // ─── LIVE VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black flex flex-col">
      {/* Sticky Live Banner */}
      <div className="sticky top-0 z-50 bg-red-600 text-white text-center py-3 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Product Image */}
        <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden bg-gray-800 shadow-2xl shadow-red-500/10 mb-6">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
              <span className="text-6xl">🍽️</span>
            </div>
          )}

          {/* Product Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-1 drop-shadow-lg">
              {product.name}
            </h2>
            {product.shortDescription && (
              <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                {product.shortDescription}
              </p>
            )}
            <p
              className="text-2xl sm:text-3xl font-black"
              style={{ color: accent }}
            >
              {formatPrice(product.price)}
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-[400px] space-y-3">
          <Button
            size="lg"
            className="w-full h-14 gap-2 text-lg font-bold rounded-2xl shadow-lg shadow-green-500/20"
            style={{ backgroundColor: '#25D366', color: '#ffffff' }}
            onClick={handleOrder}
          >
            <MessageCircle className="h-6 w-6" />
            Commander via WhatsApp
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 gap-2 rounded-2xl border-white/30 text-white hover:bg-white/10"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
            Partager le lien
          </Button>
        </div>

        {/* Shop name at bottom */}
        <div className="mt-8 flex items-center gap-2 text-white/40">
          {logo ? (
            <img
              src={logo}
              alt=""
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="text-xs font-medium">{shopName}</span>
        </div>
      </div>
    </div>
  )
}