'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, ArrowLeft, ChevronLeft, ChevronRight, Star,
  Truck, RotateCcw, ShieldCheck, Minus, Plus, MessageCircle,
  Check, Zap, Clock, Package,
} from 'lucide-react'
import { useAppStore, type Shop as ShopType } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import {
  parseModernStoreConfig, DEFAULT_MODERN_STORE_CONFIG,
  type ModernStoreConfig, type ModernStoreProduct,
} from '@/lib/modern-store-types'
import { useCartStore } from '@/store/cart-store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & TYPES
// ═══════════════════════════════════════════════════════════════════════════

const NAVY = '#1A365D'
const WHITE = '#FFFFFF'
const TEXT_DARK = '#1a1a1a'
const TEXT_MUTED = '#6b7280'
const WHATSAPP_GREEN = '#25D366'
const ICE_BLUE = '#EAF4FB'
const LINE_COLOR = '#E7EDF3'

function parseCustomColors(raw: string | undefined): Record<string, string> {
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

type View = 'home' | 'product'

interface DetailedProduct extends ModernStoreProduct {
  variants: { id: string; type: string; name: string; value?: string | null; priceOffset: number; stock: number }[]
}

interface FAQItem {
  id: string
  question: string
  answer: string
  order: number
}

interface ReviewData {
  id: string
  customerName: string
  rating: number
  comment: string | null
  source: string
  verified: boolean
  createdAt: string
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TEMPLATE — ZERO PROPS
// ═══════════════════════════════════════════════════════════════════════════

export function BreezelTemplate() {
  const { publicShop } = useAppStore()
  const shop = publicShop as ShopType | null

  const shopId = shop?.id || ''
  const whatsapp = shop?.whatsapp || ''
  const shopName = shop?.name || ''
  const shopSlug = shop?.slug || ''

  // Custom colors — fallback to navy
  const customC = parseCustomColors(shop?.customColors)
  const themePrimary = customC.primary || NAVY
  const themeSecondary = customC.secondary || NAVY
  const themeAccent = customC.accent || NAVY

  // Cart store
  const openCart = useCartStore((s) => s.openCart)
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const addItem = useCartStore((s) => s.addItem)

  // ─── Template state ───
  const [view, setView] = useState<View>('home')
  const [products, setProducts] = useState<ModernStoreProduct[]>([])
  const [config, setConfig] = useState<ModernStoreConfig>(DEFAULT_MODERN_STORE_CONFIG)
  const [loading, setLoading] = useState(true)
  const [faqs, setFaqs] = useState<FAQItem[]>([])

  // Product detail state
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [detailedProduct, setDetailedProduct] = useState<DetailedProduct | null>(null)
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0)
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ─── Hero images ───
  const heroImages = useMemo(() => {
    if (shop?.heroImages) {
      try {
        const parsed = JSON.parse(shop.heroImages)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {
        /* ignore */
      }
    }
    const fallback = shop?.heroImageUrl || shop?.coverImageUrl || shop?.banner || shop?.logo
    return fallback ? [fallback] : []
  }, [shop?.heroImages, shop?.heroImageUrl, shop?.coverImageUrl, shop?.banner, shop?.logo])

  // ─── Derived: product images for gallery ───
  const productImages = useMemo(() => {
    if (!detailedProduct) return []
    const imgs = detailedProduct.images?.length ? detailedProduct.images : []
    if (detailedProduct.image && !imgs.includes(detailedProduct.image)) {
      return [detailedProduct.image, ...imgs]
    }
    return imgs
  }, [detailedProduct])

  // ─── Derived: average rating ───
  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return sum / reviews.length
  }, [reviews])

  // ─── Derived: product features from description ───
  const productFeatures = useMemo(() => {
    if (!detailedProduct?.shortDescription) return []
    const sentences = detailedProduct.shortDescription
      .split(/[.\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    return sentences.slice(0, 5)
  }, [detailedProduct])

  // ─── Navigate to product ───
  const goToProduct = useCallback((productId: string) => {
    setSelectedProductId(productId)
    setView('product')
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ─── Go back home ───
  const goHome = useCallback(() => {
    setView('home')
    setSelectedProductId(null)
    setDetailedProduct(null)
    setReviews([])
    setQuantity(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ─── Add to cart handler ───
  const handleAddToCart = useCallback(() => {
    if (!detailedProduct || !shopId) return
    addItem(
      {
        productId: detailedProduct.id,
        name: detailedProduct.name,
        price: detailedProduct.price,
        image: detailedProduct.image,
        quantity,
      },
      shopId,
    )
    toast.success(`${detailedProduct.name} ajouté au panier`)
  }, [detailedProduct, shopId, quantity, addItem])

  // ─── WhatsApp handler ───
  const handleWhatsApp = useCallback(() => {
    if (!detailedProduct || !whatsapp) return
    const msg = `Bonjour ! 👋\n\nJe souhaite commander :\n\n🛍️ ${detailedProduct.name} x${quantity} — ${formatPrice(detailedProduct.price * quantity)}\n\nMerci ! 🙏`
    const phone = whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }, [detailedProduct, whatsapp, quantity])

  // ─── Initial data fetch ───
  useEffect(() => {
    if (!shop?.slug) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [configRes, productsRes, faqsRes] = await Promise.all([
          fetch(`/api/shops/${shop!.slug}/modern-store-config`)
            .then((r) => r.json())
            .catch(() => ({ config: DEFAULT_MODERN_STORE_CONFIG })),
          fetch(`/api/shops/${shop!.slug}/products`)
            .then((r) => r.json())
            .catch(() => []),
          fetch(`/api/shops/${shop!.slug}/faqs`)
            .then((r) => r.json())
            .catch(() => []),
        ])
        if (!cancelled) {
          setConfig(
            configRes?.config
              ? parseModernStoreConfig(JSON.stringify(configRes.config))
              : DEFAULT_MODERN_STORE_CONFIG,
          )
          setProducts(Array.isArray(productsRes) ? productsRes : [])
          setFaqs(Array.isArray(faqsRes) ? faqsRes : [])
        }
      } catch {
        if (!cancelled) toast.error('Erreur de chargement de la boutique')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [shop?.slug])

  // ─── Fetch detailed product when selected ───
  useEffect(() => {
    if (!selectedProductId) return
    let cancelled = false
    setLoadingProduct(true)
    setDetailedProduct(null)
    setReviews([])
    setQuantity(1)
    async function loadProduct() {
      try {
        const [prodRes, reviewsRes] = await Promise.all([
          fetch(`/api/products/${selectedProductId}`).then((r) => r.json()),
          fetch(`/api/products/${selectedProductId}/reviews`)
            .then((r) => r.json())
            .catch(() => []),
        ])
        if (!cancelled) {
          setDetailedProduct(prodRes)
          setReviews(Array.isArray(reviewsRes) ? reviewsRes : [])
        }
      } catch {
        if (!cancelled) toast.error('Erreur de chargement du produit')
      } finally {
        if (!cancelled) setLoadingProduct(false)
      }
    }
    loadProduct()
    return () => {
      cancelled = true
    }
  }, [selectedProductId])

  // ─── Auto-play slider ───
  useEffect(() => {
    if (view !== 'home' || heroImages.length <= 1) return
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current)
    }
  }, [view, heroImages.length])

  // ─── Slide navigation ───
  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index)
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current)
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length)
      }, 5000)
    },
    [heroImages.length],
  )

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroImages.length) % heroImages.length)
  }, [currentSlide, heroImages.length, goToSlide])

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroImages.length)
  }, [currentSlide, heroImages.length, goToSlide])

  // ─── CTA click on slider → go to first product ───
  const handleSliderCta = useCallback(() => {
    if (products.length > 0) {
      goToProduct(products[0].id)
    }
  }, [products, goToProduct])

  // ═══════════════════════════════════════════════════════════════════════════
  // SUB-COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Promo Bar (top announcement bar) ───
  function PromoBar() {
    return (
      <div
        className="w-full py-2.5 text-center text-xs sm:text-sm font-medium tracking-wide"
        style={{ backgroundColor: themePrimary, color: WHITE }}
      >
        ✨ Livraison gratuite · Retour sous 30 jours · Paiement sécurisé
      </div>
    )
  }

  // ─── Header ───
  function Header() {
    return (
      <>
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm" style={{ borderColor: LINE_COLOR }}>
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Back + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {view === 'product' && (
                <button
                  onClick={goHome}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                  aria-label="Retour"
                >
                  <ArrowLeft className="h-5 w-5" style={{ color: themePrimary }} />
                </button>
              )}
              {shop?.logo ? (
                <Image
                  src={shop.logo}
                  alt={shopName}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain sm:h-10"
                />
              ) : (
                <span
                  className="text-lg font-bold tracking-tight sm:text-xl"
                  style={{ color: themePrimary }}
                >
                  {shopName}
                </span>
              )}
            </div>

            {/* Center nav (desktop) */}
            <nav className="hidden md:flex items-center gap-6">
              {products.length > 0 && (
                <button
                  onClick={goHome}
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: view === 'home' ? themePrimary : TEXT_MUTED }}
                >
                  Accueil
                </button>
              )}
              {products.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => goToProduct(p.id)}
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: view === 'product' && selectedProductId === p.id ? themePrimary : TEXT_MUTED }}
                >
                  {p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name}
                </button>
              ))}
            </nav>

            {/* Right: Cart + Mobile menu */}
            <div className="flex items-center gap-2">
              <button
                onClick={openCart}
                className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                aria-label="Panier"
              >
                <ShoppingBag className="h-5 w-5" style={{ color: themePrimary }} />
                {itemCount > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: themePrimary }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 md:hidden"
                aria-label="Menu"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-5 rounded-full" style={{ backgroundColor: themePrimary }} />
                  <span className="block h-0.5 w-5 rounded-full" style={{ backgroundColor: themePrimary }} />
                  <span className="block h-0.5 w-3.5 rounded-full" style={{ backgroundColor: themePrimary }} />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b md:hidden"
              style={{ borderColor: LINE_COLOR, backgroundColor: WHITE }}
            >
              <nav className="flex flex-col p-4 gap-1">
                {products.length > 0 && (
                  <button
                    onClick={goHome}
                    className="text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                    style={{ color: view === 'home' ? themePrimary : TEXT_DARK }}
                  >
                    Accueil
                  </button>
                )}
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => goToProduct(p.id)}
                    className="text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                    style={{ color: view === 'product' && selectedProductId === p.id ? themePrimary : TEXT_DARK }}
                  >
                    {p.name}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // ─── Hero Slider (BreezeL style: full-width, minimal overlay, CTA button) ───
  function HeroSlider() {
    const heroTitle = config.hero.title || shopName
    const heroSubtitle = config.hero.subtitle || ''

    return (
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: '16/9', minHeight: '400px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              {heroImages.length > 0 ? (
                <Image
                  src={heroImages[currentSlide]}
                  alt={`${shopName} - slide ${currentSlide + 1}`}
                  fill
                  className="object-cover"
                  priority={currentSlide === 0}
                  sizes="100vw"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${themePrimary} 0%, ${themeSecondary || '#2d4a7a'} 100%)`,
                  }}
                >
                  <span className="text-4xl font-bold uppercase tracking-widest text-white sm:text-6xl">
                    {shopName}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Subtle overlay for text readability (like BreezeL: opacity 0.0 — very light) */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Centered CTA (BreezeL style: transparent white box, single button) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            {heroTitle && (
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mb-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl"
              >
                {heroTitle}
              </motion.h1>
            )}
            {heroSubtitle && (
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8 max-w-xl text-base text-white/90 drop-shadow sm:text-lg"
              >
                {heroSubtitle}
              </motion.p>
            )}
            {products.length > 0 && (
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <button
                  onClick={handleSliderCta}
                  className="rounded-xl bg-white px-8 py-3.5 text-base font-bold text-black transition-all hover:bg-gray-100 sm:px-10 sm:py-4 sm:text-lg"
                  style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
                >
                  Découvrir nos produits
                </button>
              </motion.div>
            )}
          </div>

          {/* Navigation arrows (only if multiple slides) */}
          {heroImages.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 sm:h-12 sm:w-12"
                aria-label="Slide précédent"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 sm:h-12 sm:w-12"
                aria-label="Slide suivant"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </>
          )}

          {/* Dots */}
          {heroImages.length > 1 && (
            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Aller au slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  // ─── Product Grid (shown below slider for multi-product shops) ───
  function ProductGrid() {
    if (products.length === 0) return null

    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-8 text-center text-2xl font-bold uppercase tracking-wide sm:text-3xl" style={{ color: themePrimary }}>
            Nos produits
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, idx) => (
              <motion.button
                key={product.id}
                onClick={() => goToProduct(product.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group flex flex-col overflow-hidden rounded-2xl border text-left transition-all hover:shadow-lg"
                style={{ borderColor: LINE_COLOR, backgroundColor: WHITE }}
              >
                {/* Product image */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <Image
                    src={product.image || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {product.oldPrice && product.oldPrice > product.price && (
                    <Badge className="absolute left-3 top-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5">
                      PROMO
                    </Badge>
                  )}
                </div>

                {/* Product info */}
                <div className="flex flex-col gap-2 p-3 sm:p-4">
                  <h3 className="text-sm font-semibold leading-tight line-clamp-2 sm:text-base" style={{ color: TEXT_DARK }}>
                    {product.name}
                  </h3>
                  {product.shortDescription && (
                    <p className="text-xs text-gray-500 line-clamp-1">{product.shortDescription}</p>
                  )}
                  <div className="flex items-center gap-2 mt-auto pt-1">
                    <span className="text-base font-bold sm:text-lg" style={{ color: themePrimary }}>
                      {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>
    )
  }

  // ─── Product Image Gallery ───
  function ProductGallery() {
    const [activeIdx, setActiveIdx] = useState(0)

    return (
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50" style={{ boxShadow: 'none' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <Image
                src={productImages[activeIdx] || '/placeholder.jpg'}
                alt={detailedProduct?.name || 'Produit'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
          {detailedProduct?.oldPrice && detailedProduct.oldPrice > detailedProduct.price && (
            <Badge className="absolute left-3 top-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              PROMO
            </Badge>
          )}
          {/* Nav arrows on gallery */}
          {productImages.length > 1 && (
            <>
              <button
                onClick={() => setActiveIdx((prev) => (prev - 1 + productImages.length) % productImages.length)}
                className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-sm transition-all hover:bg-white sm:h-10 sm:w-10"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setActiveIdx((prev) => (prev + 1) % productImages.length)}
                className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-sm transition-all hover:bg-white sm:h-10 sm:w-10"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {productImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {productImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20 ${
                  idx === activeIdx
                    ? 'ring-2 ring-offset-1'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                style={idx === activeIdx ? { borderColor: themePrimary, '--tw-ring-color': themePrimary } as React.CSSProperties : undefined}
              >
                <Image
                  src={img}
                  alt={`Miniature ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Star Rating Display ───
  function StarRating({ rating, count }: { rating: number; count: number }) {
    if (count === 0) return null
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= Math.floor(rating)
                  ? 'fill-amber-400 text-amber-400'
                  : star <= rating
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium" style={{ color: TEXT_MUTED }}>
          {rating.toFixed(1)} ({count} {count > 1 ? 'avis' : 'avis'})
        </span>
      </div>
    )
  }

  // ─── Quantity Selector ───
  function QuantityControl() {
    return (
      <div className="flex items-center gap-0 rounded-xl border overflow-hidden" style={{ borderColor: LINE_COLOR }}>
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50"
          aria-label="Diminuer"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex h-11 w-12 items-center justify-center text-sm font-semibold" style={{ borderLeft: `1px solid ${LINE_COLOR}`, borderRight: `1px solid ${LINE_COLOR}` }}>
          {quantity}
        </span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="flex h-11 w-11 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50"
          aria-label="Augmenter"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // ─── Feature Checklist (BreezeL style: checkmark list) ───
  function FeatureChecklist() {
    if (productFeatures.length === 0) return null
    return (
      <div className="flex flex-col gap-0">
        {productFeatures.map((feature, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 py-2.5"
            style={{ borderTop: idx > 0 ? `1px solid ${LINE_COLOR}` : 'none' }}
          >
            <span
              className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: ICE_BLUE }}
            >
              <Check className="h-3 w-3" style={{ color: themePrimary }} />
            </span>
            <span className="text-sm font-medium leading-snug" style={{ color: TEXT_DARK }}>
              {feature}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // ─── Feature Badges (BreezeL style: icons below add-to-cart) ───
  function FeatureBadges() {
    const badges = [
      { icon: Zap, label: 'Livraison rapide' },
      { icon: Package, label: 'Qualité garantie' },
      { icon: Clock, label: 'Service client 24/7' },
    ]
    return (
      <div className="flex flex-wrap justify-center gap-6 pt-4 sm:gap-8">
        {badges.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${themePrimary}15` }}
            >
              <b.icon className="h-4.5 w-4.5" style={{ color: themePrimary }} />
            </div>
            <span className="text-xs font-medium" style={{ color: TEXT_MUTED }}>{b.label}</span>
          </div>
        ))}
      </div>
    )
  }

  // ─── Benefits Icons ───
  function BenefitsRow() {
    const benefits = [
      { icon: Truck, label: 'Livraison gratuite' },
      { icon: RotateCcw, label: 'Retour 30 jours' },
      { icon: ShieldCheck, label: 'Paiement sécurisé' },
    ]
    return (
      <div className="flex flex-wrap gap-4 pt-2">
        {benefits.map((b) => (
          <div key={b.label} className="flex items-center gap-2 text-sm" style={{ color: TEXT_MUTED }}>
            <b.icon className="h-4 w-4" style={{ color: themePrimary }} />
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    )
  }

  // ─── Reviews Section ───
  function ReviewsSection() {
    if (reviews.length === 0) return null
    const displayReviews = reviews.slice(0, 3)
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-12"
      >
        <Separator className="mb-8" style={{ backgroundColor: LINE_COLOR }} />
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-center">
            <StarRating rating={avgRating} count={reviews.length} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border p-4 sm:p-5"
                style={{ borderColor: LINE_COLOR }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {review.verified && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
                      Vérifié
                    </Badge>
                  )}
                </div>
                <p className="mb-2 text-sm font-semibold" style={{ color: TEXT_DARK }}>
                  {review.customerName}
                </p>
                {review.comment && (
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    )
  }

  // ─── Product Detail View ───
  function ProductView() {
    if (loadingProduct) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/4 rounded-lg" />
              <Skeleton className="h-10 w-1/3 rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      )
    }

    if (!detailedProduct) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p style={{ color: TEXT_MUTED }}>Produit introuvable</p>
        </div>
      )
    }

    const hasDiscount = detailedProduct.oldPrice && detailedProduct.oldPrice > detailedProduct.price
    const discountPercent = hasDiscount
      ? Math.round(((detailedProduct.oldPrice! - detailedProduct.price) / detailedProduct.oldPrice!) * 100)
      : 0

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Left: Image Gallery */}
          <ProductGallery />

          {/* Right: Product Info (BreezeL style layout) */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Product Name */}
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl" style={{ color: TEXT_DARK }}>
              {detailedProduct.name}
            </h1>

            {/* Rating */}
            <StarRating rating={avgRating} count={reviews.length} />

            {/* Feature Checklist */}
            <FeatureChecklist />

            {/* Price Block */}
            <div className="flex items-end gap-3 py-1">
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(detailedProduct.oldPrice!)}
                </span>
              )}
              <span className="text-2xl font-bold sm:text-3xl" style={{ color: themePrimary }}>
                {formatPrice(detailedProduct.price)}
              </span>
              {hasDiscount && (
                <Badge className="text-xs font-bold px-2 py-0.5 bg-white text-red-600 border border-red-200">
                  -{discountPercent}%
                </Badge>
              )}
            </div>

            {/* Short Description */}
            {detailedProduct.shortDescription && productFeatures.length === 0 && (
              <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>
                {detailedProduct.shortDescription}
              </p>
            )}

            <div className="my-1" style={{ borderTop: `1px solid ${LINE_COLOR}` }} />

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: TEXT_DARK }}>Quantité</span>
              <QuantityControl />
            </div>

            {/* Add to Cart (BreezeL style: navy gradient, full-width, rounded-xl) */}
            <button
              onClick={handleAddToCart}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 sm:text-lg"
              style={{ background: `linear-gradient(135deg, ${themePrimary}dd, ${themePrimary})` }}
            >
              <ShoppingBag className="h-5 w-5" />
              Ajouter au panier
            </button>

            {/* WhatsApp */}
            {whatsapp && (
              <button
                onClick={handleWhatsApp}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition-all hover:opacity-90"
                style={{ border: `2px solid ${WHATSAPP_GREEN}`, color: WHATSAPP_GREEN }}
              >
                <MessageCircle className="h-5 w-5" />
                Commander via WhatsApp
              </button>
            )}

            {/* Stock status */}
            <p className="text-center text-sm font-medium" style={{ color: '#16a34a' }}>
              ✓ En stock, prêt à expédier
            </p>

            {/* Feature Badges */}
            <FeatureBadges />

            <div className="my-1" style={{ borderTop: `1px solid ${LINE_COLOR}` }} />

            {/* Benefits */}
            <BenefitsRow />
          </div>
        </div>

        {/* Full Description Section */}
        {detailedProduct.description && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-12"
          >
            <div className="mb-8" style={{ borderTop: `1px solid ${LINE_COLOR}` }} />
            <h2 className="mb-4 text-xl font-bold uppercase tracking-wide" style={{ color: themePrimary }}>
              Description
            </h2>
            <div
              className="prose prose-gray max-w-none text-base leading-relaxed"
              style={{ color: TEXT_MUTED }}
              dangerouslySetInnerHTML={{ __html: detailedProduct.description }}
            />
          </motion.section>
        )}

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-12"
          >
            <div className="mb-8" style={{ borderTop: `1px solid ${LINE_COLOR}` }} />
            <h2 className="mb-6 text-xl font-bold uppercase tracking-wide" style={{ color: themePrimary }}>
              Questions fréquentes
            </h2>
            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline" style={{ color: TEXT_DARK }}>
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed" style={{ color: TEXT_MUTED }}>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.section>
        )}

        {/* Reviews Section */}
        <ReviewsSection />
      </motion.div>
    )
  }

  // ─── Footer (BreezeL style: navy background, 2-column layout) ───
  function Footer() {
    const currentYear = new Date().getFullYear()
    return (
      <footer style={{ backgroundColor: themePrimary }} className="mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              {shop?.logo ? (
                <Image
                  src={shop.logo}
                  alt={shopName}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <span className="text-lg font-bold text-white">{shopName}</span>
              )}
              <p className="max-w-xs text-sm leading-relaxed text-white/70">
                {shop?.description || `Découvrez les meilleurs produits chez ${shopName}.`}
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">Liens rapides</h3>
              {products.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => goToProduct(p.id)}
                  className="text-left text-sm text-white/70 transition-colors hover:text-white"
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">Contact</h3>
              {shop?.phone && (
                <p className="text-sm text-white/70">{shop.phone}</p>
              )}
              {shop?.address && (
                <p className="text-sm text-white/70">{shop.address}</p>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className="my-8 bg-white/20" style={{ height: '1px' }} />

          <p className="text-center text-sm text-white/50">
            © {currentYear} {shopName}. Tous droits réservés.
          </p>
        </div>
      </footer>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-10" style={{ backgroundColor: NAVY }} />
        <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </header>
        <div className="flex-1">
          <Skeleton className="aspect-video w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white" style={{ color: TEXT_DARK, fontFamily: "'Poppins', 'Inter', system-ui, sans-serif" }}>
      <PromoBar />
      <Header />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HeroSlider />
              <ProductGrid />
            </motion.div>
          )}

          {view === 'product' && (
            <motion.div
              key="product"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProductView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}