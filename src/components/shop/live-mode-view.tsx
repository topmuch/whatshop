'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore, type Product } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import { openWhatsApp } from '@/lib/shared'
import { Button } from '@/components/ui/button'
import { MessageCircle, Share2, Loader2, Store, Flame, Clock, ChevronRight, Check, Zap } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [elapsed, setElapsed] = useState(0)
  const [ordered, setOrdered] = useState(false)

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

  // Live elapsed timer (counts up every second)
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const handleOrder = useCallback(() => {
    if (!product) return
    openWhatsApp({ name: product.name, price: product.price }, whatsapp, 1)
    setOrdered(true)
    setTimeout(() => setOrdered(false), 3000)
  }, [product, whatsapp])

  const handleShare = useCallback(() => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/${shopSlug}`
    if (navigator.share) {
      navigator.share({ title: `${shopName} — 🔴 EN DIRECT`, url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }, [shopSlug, shopName])

  // Resolve product image (main image or first from gallery)
  const productImage = product?.image || product?.images?.[0]

  // Format elapsed time → MM:SS
  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // ─── LIVE OFF → return null so parent renders normal shop ───────────
  if (error === 'LIVE_OFF') {
    return null
  }

  // ─── LOADING ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" />
          <div className="relative h-14 w-14 rounded-full border-4 border-red-500/30 border-t-red-500 animate-spin" />
        </div>
        <p className="text-sm font-medium tracking-wide text-zinc-400">Connexion au live...</p>
      </div>
    )
  }

  // ─── NO PRODUCT PINNED YET ──────────────────────────────────────────
  if (!product) {
    return (
      <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
        {/* Live banner */}
        <div className="bg-red-600 px-4 py-3 shadow-lg">
          <div className="mx-auto flex max-w-lg items-center justify-center gap-2.5 text-white">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="text-sm font-bold tracking-wide">EN DIRECT</span>
            <span className="text-sm font-medium opacity-90">— {shopName}</span>
          </div>
        </div>

        {/* Waiting state */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10"
          >
            <Flame className="h-8 w-8 text-red-500" />
          </motion.div>
          <p className="text-base font-semibold text-zinc-200">En attente du produit...</p>
          <p className="text-sm text-zinc-500">Le produit apparaîtra automatiquement</p>
        </div>
      </div>
    )
  }

  // ─── NETWORK ERROR ──────────────────────────────────────────────────
  if (error === 'network') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 px-4">
        <p className="text-sm text-zinc-400">Erreur de connexion. Reconnexion...</p>
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    )
  }

  const lowStock = product.stock !== null && product.stock !== undefined && product.stock <= 5 && product.stock > 0
  const description = product.shortDescription || product.description

  // ─── LIVE VIEW: PRODUCT SPOTLIGHT ───────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
      {/* ─── Sticky Live Banner ─── */}
      <div className="z-50 flex-shrink-0 bg-red-600 shadow-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5 text-white">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="text-sm font-bold tracking-wide">EN DIRECT</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-semibold tabular-nums">{formatElapsed(elapsed)}</span>
          </div>
        </div>
      </div>

      {/* ─── Scrollable Content ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-4 pb-32 pt-5 sm:pt-8">
          {/* ─── Product Image (clean, no text overlay) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-3xl bg-zinc-800 shadow-2xl"
            style={{ boxShadow: `0 20px 60px -15px ${accent}40` }}
          >
            <div className="relative aspect-[4/5] w-full">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  unoptimized
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 448px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900">
                  <span className="text-7xl opacity-50">🛍️</span>
                </div>
              )}
            </div>

            {/* Live badge floating on image */}
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="text-xs font-bold tracking-wide text-white">LIVE</span>
            </div>

            {/* Low stock badge floating on image */}
            {lowStock && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 shadow-lg">
                <Zap className="h-3 w-3 text-white" />
                <span className="text-xs font-bold text-white">Plus que {product.stock}</span>
              </div>
            )}
          </motion.div>

          {/* ─── Product Info Card ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
          >
            {/* Shop name + logo */}
            <div className="mb-3 flex items-center gap-2">
              {logo ? (
                <Image
                  src={logo}
                  alt=""
                  width={22}
                  height={22}
                  unoptimized
                  className="rounded-full object-cover ring-1 ring-white/20"
                />
              ) : (
                <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/10">
                  <Store className="h-3 w-3 text-zinc-300" />
                </div>
              )}
              <span className="text-xs font-semibold text-zinc-400">{shopName}</span>
            </div>

            {/* Product name */}
            <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl">
              {product.name}
            </h2>

            {/* Description */}
            {description && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                {description}
              </p>
            )}

            {/* Price + stock row */}
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Prix</p>
                <p
                  className="text-2xl font-black sm:text-3xl"
                  style={{ color: accent }}
                >
                  {formatPrice(product.price)}
                </p>
              </div>
              {lowStock && (
                <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-400">
                    Stock limité
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Fixed Bottom CTA Bar ─── */}
      <div className="flex-shrink-0 border-t border-white/10 bg-zinc-950/80 backdrop-blur-lg">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex gap-2.5">
            {/* WhatsApp CTA */}
            <Button
              size="lg"
              className="h-14 flex-1 gap-2 rounded-2xl text-base font-bold shadow-lg transition-transform active:scale-[0.97]"
              style={{ backgroundColor: '#25D366', color: '#ffffff' }}
              onClick={handleOrder}
            >
              <AnimatePresence mode="wait">
                {ordered ? (
                  <motion.span
                    key="ordered"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-5 w-5" />
                    Redirection...
                  </motion.span>
                ) : (
                  <motion.span
                    key="default"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Commander
                    <ChevronRight className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Share button */}
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14 shrink-0 rounded-2xl border-white/15 bg-white/5 p-0 text-white hover:bg-white/10 active:scale-95"
              onClick={handleShare}
              aria-label="Partager le live"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Powered by */}
          <p className="mt-2 text-center text-[10px] font-medium tracking-wide text-zinc-600">
            Live shopping propulsé par Boutiko
          </p>
        </div>
      </div>
    </div>
  )
}
