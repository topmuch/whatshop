'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAppStore, type Product } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import { openWhatsApp } from '@/lib/shared'
import { Button } from '@/components/ui/button'
import {
  Star,
  Eye,
  Flame,
  Share2,
  X,
  MessageCircle,
  CheckCircle2,
  Loader2,
  Store,
  Timer,
} from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const TIKTOK_COLORS = ['#FF0050', '#25F4EE', '#FE2C55', '#00F2EA', '#FF6B35', '#7C3AED']
const DEFAULT_LIVE_DURATION_MINUTES = 30

interface LiveModeViewProps {
  shopId: string
  shopSlug: string
  shopName: string
  whatsapp: string
  primaryColor?: string
  accentColor?: string
  logo?: string
}

interface ShopTestimonial {
  id: string
  clientName: string
  rating: number
  comment: string
}

/**
 * Full-screen live mode view: single product spotlight with EN DIRECT badge.
 * Rendered by the public shop when isLiveMode is true.
 * Fetches the live product + shop testimonials and displays them in a
 * TikTok-optimized layout. Polls every 10s for product changes.
 */
export function LiveModeView({ shopId, shopSlug, shopName, whatsapp, primaryColor, accentColor, logo }: LiveModeViewProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [testimonials, setTestimonials] = useState<ShopTestimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [viewers, setViewers] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [liveStartedAt, setLiveStartedAt] = useState<string | null>(null)
  const [durationMinutes] = useState(DEFAULT_LIVE_DURATION_MINUTES)
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null)
  const [glowColor, setGlowColor] = useState(TIKTOK_COLORS[0])
  const [nextGlowColor, setNextGlowColor] = useState(TIKTOK_COLORS[1])
  const [liveEnded, setLiveEnded] = useState(false)
  const [bgColorIndex, setBgColorIndex] = useState(0)
  const colorIndexRef = useRef(0)

  const accent = accentColor || primaryColor || '#EC4899'

  useEffect(() => {
    if (!shopId) return
    setLoading(true)
    setError(null)

    let cancelled = false
    const controller = new AbortController()

    async function fetchLive() {
      try {
        const shopRes = await fetch(`/api/shops/${shopSlug}`, { signal: controller.signal })
        if (cancelled || !shopRes.ok) return
        const shopData = await shopRes.json()

        if (!shopData.isLiveMode) {
          setError('LIVE_OFF')
          return
        }

        // Capture liveStartedAt from shop data
        if (shopData.liveStartedAt && !cancelled) {
          setLiveStartedAt(shopData.liveStartedAt)
        }

        if (!shopData.liveProductId) {
          setProduct(null)
          setLoading(false)
          return
        }

        const [prodRes, testRes] = await Promise.all([
          fetch(`/api/shops/${shopSlug}/products`, { signal: controller.signal }),
          fetch(`/api/shops/${shopSlug}/testimonials`, { signal: controller.signal }),
        ])
        if (cancelled || !prodRes.ok) return

        const products: Product[] = await prodRes.json()
        const live = products.find((p) => p.id === shopData.liveProductId)
        if (live) {
          setProduct(live)
          setError(null)
        } else {
          setProduct(null)
        }

        if (testRes.ok) {
          const testData: ShopTestimonial[] = await testRes.json()
          if (!cancelled) setTestimonials(testData)
        }
      } catch {
        if (!cancelled) setError('network')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLive()
    const interval = setInterval(fetchLive, 10000)

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

  // Countdown timer based on liveStartedAt + duration
  useEffect(() => {
    if (!liveStartedAt) return
    const endTime = new Date(liveStartedAt).getTime() + durationMinutes * 60 * 1000

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      setCountdownSeconds(remaining)
      if (remaining <= 0) setLiveEnded(true)
    }

    tick() // initial
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [liveStartedAt, durationMinutes])

  // Color cycling animation for TikTok-style glow (fast for full page effect)
  useEffect(() => {
    const interval = setInterval(() => {
      colorIndexRef.current = (colorIndexRef.current + 1) % TIKTOK_COLORS.length
      setGlowColor(TIKTOK_COLORS[colorIndexRef.current])
      setNextGlowColor(TIKTOK_COLORS[(colorIndexRef.current + 1) % TIKTOK_COLORS.length])
      setBgColorIndex(colorIndexRef.current)
    }, 2000) // Faster cycling for full page effect
    return () => clearInterval(interval)
  }, [])

  // Viewers count (social proof) — random refresh every 30s
  useEffect(() => {
    const update = () => setViewers(Math.floor(Math.random() * (150 - 15 + 1)) + 15)
    update()
    const i = setInterval(update, 30000)
    return () => clearInterval(i)
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

  const productImage = product?.image || product?.images?.[0]

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const formatCountdownBig = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return { minutes: String(m).padStart(2, '0'), seconds: String(sec).padStart(2, '0') }
  }

  const isUrgent = countdownSeconds !== null && countdownSeconds > 0 && countdownSeconds < 300 // < 5 min

  // Shop rating from testimonials
  const avgRating = testimonials.length > 0
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
    : 0
  const reviewCount = testimonials.length

  // Discount calculation
  const discount = product?.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0

  // Full-page animated gradient background
  const bgGradientStyle = {
    background: `linear-gradient(135deg, ${TIKTOK_COLORS[bgColorIndex]}22 0%, ${TIKTOK_COLORS[(bgColorIndex + 1) % TIKTOK_COLORS.length]}33 25%, ${TIKTOK_COLORS[(bgColorIndex + 2) % TIKTOK_COLORS.length]}22 50%, ${TIKTOK_COLORS[(bgColorIndex + 3) % TIKTOK_COLORS.length]}33 75%, ${TIKTOK_COLORS[(bgColorIndex + 4) % TIKTOK_COLORS.length]}22 100%)`,
    transition: 'background 2s ease-in-out',
  }

  // ─── LIVE OFF → return null so parent renders normal shop ───────────
  if (error === 'LIVE_OFF') {
    return null
  }

  // ─── LOADING ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-gray-950">
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" />
          <div className="relative h-14 w-14 rounded-full border-4 border-red-500/30 border-t-red-500 animate-spin" />
        </div>
        <p className="text-sm font-medium tracking-wide text-gray-400">Connexion au live...</p>
      </div>
    )
  }

  // ─── LIVE TERMINÉ ─────────────────────────────────────────────
  if (liveEnded && !error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gray-950 text-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-800">
            <span className="text-4xl">🔴</span>
          </div>
          <h2 className="text-2xl font-black tracking-wide">LIVE TERMINÉ</h2>
          <p className="text-sm text-gray-400">Merci d'avoir suivi ! Ce live est maintenant terminé.</p>
        </motion.div>
      </div>
    )
  }

  // ─── NO PRODUCT PINNED YET ──────────────────────────────────────────
  if (!product) {
    return (
      <div className="fixed inset-0 flex flex-col" style={bgGradientStyle}>
        <div className="absolute inset-0 bg-gray-950/90" />
        {/* Animated top glow bar */}
        <div
          className="relative z-10 h-1.5 w-full"
          style={{ backgroundColor: glowColor, transition: 'background-color 1s ease' }}
        />
        {/* Live banner */}
        <div className="relative z-10 bg-red-600 px-4 py-3 shadow-lg">
          <div className="mx-auto flex max-w-md items-center justify-center gap-2.5 text-white">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <span className="text-sm font-bold tracking-wide">EN DIRECT</span>
            <span className="text-sm font-medium opacity-90">— {shopName}</span>
            {countdownSeconds !== null && countdownSeconds > 0 && (
              <span className={`ml-2 flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-xs font-bold tabular-nums ${isUrgent ? 'animate-pulse text-yellow-200' : ''}`}>
                <Timer className="h-3 w-3" />
                {formatCountdown(countdownSeconds)}
              </span>
            )}
          </div>
        </div>

        {/* BIG COUNTDOWN TIMER */}
        {countdownSeconds !== null && countdownSeconds > 0 && (
          <div className="relative z-10 flex flex-col items-center pt-16">
            <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-6">Le live commence bientôt</p>
            <div className="flex items-center gap-4">
              <div className={`flex flex-col items-center ${isUrgent ? 'animate-pulse' : ''}`}>
                <div
                  className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-2xl font-black text-white text-5xl sm:text-7xl tabular-nums shadow-2xl"
                  style={{ backgroundColor: glowColor, transition: 'background-color 1s ease' }}
                >
                  {formatCountdownBig(countdownSeconds).minutes}
                </div>
                <span className="mt-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Minutes</span>
              </div>
              <span className={`text-4xl sm:text-6xl font-black tabular-nums ${isUrgent ? 'animate-pulse text-yellow-300' : 'text-gray-600'}`}>:</span>
              <div className={`flex flex-col items-center ${isUrgent ? 'animate-pulse' : ''}`}>
                <div
                  className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-2xl font-black text-white text-5xl sm:text-7xl tabular-nums shadow-2xl"
                  style={{ backgroundColor: nextGlowColor, transition: 'background-color 1s ease' }}
                >
                  {formatCountdownBig(countdownSeconds).seconds}
                </div>
                <span className="mt-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">Secondes</span>
              </div>
            </div>
          </div>
        )}

        {/* Waiting state */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-4">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10"
          >
            <Flame className="h-8 w-8 text-red-500" />
          </motion.div>
          <p className="text-base font-semibold text-gray-200">En attente du produit...</p>
          <p className="text-sm text-gray-500">Le produit apparaîtra automatiquement</p>
        </div>
      </div>
    )
  }

  // ─── NETWORK ERROR ──────────────────────────────────────────────────
  if (error === 'network') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950 px-4">
        <p className="text-sm text-gray-400">Erreur de connexion. Reconnexion...</p>
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      </div>
    )
  }

  const shortName = product.shortDescription || product.name
  const fullDescription = product.description || product.shortDescription || ''
  const countdown = countdownSeconds !== null && countdownSeconds > 0 ? formatCountdownBig(countdownSeconds) : null

  // ─── LIVE VIEW: PRODUCT SPOTLIGHT ───────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden text-white">
      {/* ─── FULL PAGE MULTICOLOR ANIMATED BACKGROUND ─── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${135 + bgColorIndex * 30}deg, ${TIKTOK_COLORS[bgColorIndex]}18 0%, ${TIKTOK_COLORS[(bgColorIndex + 1) % TIKTOK_COLORS.length]}28 20%, ${TIKTOK_COLORS[(bgColorIndex + 2) % TIKTOK_COLORS.length]}18 40%, ${TIKTOK_COLORS[(bgColorIndex + 3) % TIKTOK_COLORS.length]}28 60%, ${TIKTOK_COLORS[(bgColorIndex + 4) % TIKTOK_COLORS.length]}18 80%, ${TIKTOK_COLORS[(bgColorIndex + 5) % TIKTOK_COLORS.length]}28 100%)`,
          transition: 'background 2s ease-in-out',
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gray-950/80" />

      {/* ─── Animated top glow bar ─── */}
      <div
        className="relative z-50 h-1.5 w-full"
        style={{ backgroundColor: glowColor, transition: 'background-color 1s ease' }}
      />

      {/* ─── 1. HEADER LIVE ─── */}
      <header className="relative z-40 flex flex-shrink-0 items-center justify-center gap-2 bg-red-600 px-4 py-3 text-white shadow-lg">
        <div className="relative flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
          <span className="text-sm font-bold tracking-wider">EN DIRECT</span>
        </div>
        <span className="mx-2 text-white/80">—</span>
        <span className="truncate text-sm font-medium">{shopName}</span>
        {/* Countdown Timer in header */}
        {countdownSeconds !== null && countdownSeconds > 0 && (
          <div
            className={`ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 tabular-nums ${
              isUrgent
                ? 'animate-pulse bg-yellow-500 text-black'
                : 'bg-black/20 text-white'
            }`}
          >
            <Timer className={`h-3.5 w-3.5 ${isUrgent ? 'text-black' : ''}`} />
            <span className={`text-xs font-bold ${isUrgent ? 'text-sm' : ''}`}>{formatCountdown(countdownSeconds)}</span>
          </div>
        )}
        {/* Fallback to elapsed timer when no liveStartedAt */}
        {countdownSeconds === null && (
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1">
            <Timer className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold tabular-nums">{formatElapsed(elapsed)}</span>
          </div>
        )}
      </header>

      {/* ─── 2. CONTENU PRINCIPAL (responsive 2 colonnes sur desktop) ─── */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col md:flex-row">
          {/* IMAGE PRODUIT — 100% mobile, 50% desktop */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative w-full overflow-hidden bg-gray-800/80 backdrop-blur-sm aspect-[4/3] md:aspect-auto md:min-h-[600px] md:w-1/2"
          >
            {productImage ? (
              <Image
                src={productImage}
                alt={shortName}
                fill
                unoptimized
                priority
                className="object-contain md:object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                <span className="text-7xl opacity-50">🛍️</span>
              </div>
            )}

            {/* Badge promo sur l'image */}
            {discount > 0 && (
              <div className="absolute left-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-black shadow-lg md:px-4 md:py-2 md:text-base">
                -{discount}%
                <span className="ml-1 hidden sm:inline">PROMO LIVE</span>
              </div>
            )}

            {/* Badge LIVE sur l'image */}
            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 shadow-lg md:px-4 md:py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="text-xs font-bold tracking-wide text-white md:text-sm">LIVE</span>
            </div>
          </motion.div>

          {/* INFOS PRODUIT — 100% mobile (chevauche l'image), 50% desktop (colonne dédiée) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="relative z-10 flex w-full flex-col gap-4 rounded-t-3xl bg-gray-900/90 backdrop-blur-sm p-5 -mt-6 md:mt-0 md:w-1/2 md:rounded-none md:p-10"
          >
            {/* Contenu centré sur desktop */}
            <div className="mx-auto w-full max-w-lg space-y-6">
              {/* Shop name + logo */}
              <div className="flex items-center gap-2">
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
                    <Store className="h-3 w-3 text-gray-300" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-400">{shopName}</span>
              </div>

              {/* Titre court et lisible */}
              <h1 className="text-2xl font-bold leading-tight text-white md:text-3xl">
                {shortName}
              </h1>

              {/* Note et avis (depuis les testimonials boutique) */}
              {avgRating > 0 && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={i < Math.floor(avgRating) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-400">
                    {avgRating.toFixed(1)} ({reviewCount} avis)
                  </span>
                </div>
              )}

              {/* Prix */}
              <div className="flex flex-wrap items-baseline gap-4">
                <span
                  className="text-4xl font-black md:text-5xl"
                  style={{ color: accent }}
                >
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>

              {/* Urgence et Preuve Sociale */}
              <div className="flex flex-col gap-3 border-y border-gray-800 py-4">
                {product.stock !== null && product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                  <div className="flex items-center gap-2 font-semibold text-red-400">
                    <Flame size={20} className="animate-pulse" />
                    <span>🔴 Plus que {product.stock} en stock !</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Eye size={18} />
                  <span>{viewers} personnes regardent ce live</span>
                </div>
              </div>

              {/* BOUTONS */}
              <div className="space-y-3">
                <Button
                  className="w-full gap-3 rounded-xl bg-green-500 py-4 text-lg font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-95"
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
                        <CheckCircle2 className="h-6 w-6" />
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
                        <MessageCircle className="h-6 w-6" fill="white" />
                        COMMANDER VIA WHATSAPP
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800 py-3 font-medium text-white transition-all hover:bg-gray-700"
                >
                  <span>Voir les détails du produit</span>
                </button>

                {/* ─── BIG COUNTDOWN TIMER (below "voir les détails") ─── */}
                {countdown && (
                  <div className="flex flex-col items-center py-2">
                    <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">⏱ Temps restant du live</p>
                    <div className="flex items-center gap-3">
                      <div className={`flex flex-col items-center ${isUrgent ? 'animate-pulse' : ''}`}>
                        <div
                          className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl font-black text-white text-4xl sm:text-5xl tabular-nums shadow-2xl"
                          style={{ backgroundColor: glowColor, transition: 'background-color 1s ease' }}
                        >
                          {countdown.minutes}
                        </div>
                        <span className="mt-1.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Min</span>
                      </div>
                      <span className={`text-3xl sm:text-4xl font-black tabular-nums ${isUrgent ? 'text-yellow-300 animate-pulse' : 'text-gray-600'}`}>:</span>
                      <div className={`flex flex-col items-center ${isUrgent ? 'animate-pulse' : ''}`}>
                        <div
                          className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl font-black text-white text-4xl sm:text-5xl tabular-nums shadow-2xl"
                          style={{ backgroundColor: nextGlowColor, transition: 'background-color 1s ease' }}
                        >
                          {countdown.seconds}
                        </div>
                        <span className="mt-1.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Sec</span>
                      </div>
                    </div>
                    {isUrgent && (
                      <motion.p
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="mt-3 text-sm font-bold text-red-400 tracking-wide"
                      >
                        🔥 Le live se termine bientôt !
                      </motion.p>
                    )}
                  </div>
                )}

                {/* ─── BIG FLASHY BLINKING "PARTAGER CE LIVE" BUTTON ─── */}
                <motion.button
                  onClick={handleShare}
                  className="relative w-full overflow-hidden rounded-2xl py-5 text-lg font-black tracking-wide text-white shadow-2xl transition-transform active:scale-95"
                  animate={{
                    background: [
                      `linear-gradient(135deg, ${TIKTOK_COLORS[0]}, ${TIKTOK_COLORS[1]})`,
                      `linear-gradient(135deg, ${TIKTOK_COLORS[1]}, ${TIKTOK_COLORS[2]})`,
                      `linear-gradient(135deg, ${TIKTOK_COLORS[2]}, ${TIKTOK_COLORS[3]})`,
                      `linear-gradient(135deg, ${TIKTOK_COLORS[3]}, ${TIKTOK_COLORS[4]})`,
                      `linear-gradient(135deg, ${TIKTOK_COLORS[4]}, ${TIKTOK_COLORS[5]})`,
                      `linear-gradient(135deg, ${TIKTOK_COLORS[5]}, ${TIKTOK_COLORS[0]})`,
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  {/* Blinking overlay shimmer */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                    }}
                  />
                  <div className="relative flex items-center justify-center gap-3">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      <Share2 size={24} />
                    </motion.span>
                    <span>PARTAGER CE LIVE</span>
                  </div>
                </motion.button>
              </div>

              <div className="pt-4 text-center text-xs text-gray-600">
                Propulsé par <span className="font-bold text-gray-400">Boutiko</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ─── Animated bottom glow bar ─── */}
      <div
        className="relative z-50 h-1.5 w-full"
        style={{ backgroundColor: glowColor, transition: 'background-color 1s ease' }}
      />

      {/* ─── 3. MODALE DES DÉTAILS ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white text-gray-900 sm:rounded-3xl"
            >
              {/* Header Modale */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-4">
                <h2 className="text-lg font-bold">Détails du produit</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenu Modale */}
              <div className="space-y-6 p-6">
                {/* Image dans la modale */}
                {productImage && (
                  <div className="aspect-video overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={productImage}
                      alt={product.name}
                      width={800}
                      height={450}
                      unoptimized
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}

                {/* Nom complet */}
                <div>
                  <h3 className="mb-1 text-lg font-bold text-gray-900">{product.name}</h3>
                  {product.shortDescription && (
                    <p className="text-sm font-medium text-gray-500">{product.shortDescription}</p>
                  )}
                </div>

                {/* Description */}
                {fullDescription && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 font-bold text-gray-900">
                      <span className="text-xl">📋</span> Description
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {fullDescription}
                    </p>
                  </div>
                )}

                {/* Prix dans la modale */}
                <div className="flex items-baseline gap-3 rounded-xl bg-gray-50 p-4">
                  <span
                    className="text-2xl font-black"
                    style={{ color: accent }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-base text-gray-500 line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>

                {/* Livraison & Paiement */}
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-bold text-gray-900">
                    <span className="text-xl">🚚</span> Livraison &amp; Paiement
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 text-green-500" />
                      Livraison rapide selon votre zone
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 text-green-500" />
                      Paiement à la livraison disponible
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 text-green-500" />
                      Commande via WhatsApp
                    </li>
                  </ul>
                </div>

                {/* Bouton Commander dans la modale */}
                <Button
                  className="sticky bottom-0 flex w-full items-center justify-center gap-3 rounded-xl bg-green-500 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-green-600 active:scale-95"
                  onClick={handleOrder}
                >
                  <MessageCircle size={20} fill="white" />
                  COMMANDER MAINTENANT
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}