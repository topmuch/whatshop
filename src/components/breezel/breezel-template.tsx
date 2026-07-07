'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, ArrowLeft, ChevronLeft, ChevronRight, Star,
  Truck, RotateCcw, ShieldCheck, Minus, Plus, MessageCircle,
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
const GRAY_BG = '#F5F5F5'
const TEXT_DARK = '#1a1a1a'
const TEXT_MUTED = '#6b7280'
const WHATSAPP_GREEN = '#25D366'

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

  // ─── Navigate to product ───
  const goToProduct = useCallback((productId: string) => {
    setSelectedProductId(productId)
    setView('product')
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
      // Reset auto-play timer
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

  // ─── Promo Bar ───
  function PromoBar() {
    return (
      <div
        className="w-full py-2.5 text-center text-sm font-medium tracking-wide"
        style={{ backgroundColor: themePrimary, color: WHITE }}
      >
        Livraison gratuite · Retour sous 30 jours
      </div>
    )
  }

  // ─── Header ───
  function Header() {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {view === 'product' && (
              <button
                onClick={goHome}
                className="mr-1 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
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
                className="text-xl font-bold tracking-tight sm:text-2xl"
                style={{ color: themePrimary }}
              >
                {shopName}
              </span>
            )}
          </div>

          {/* Right actions */}
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
          </div>
        </div>
      </header>
    )
  }

  // ─── Hero Slider ───
  function HeroSlider() {
    const heroTitle = config.hero.title || shopName
    const heroSubtitle = config.hero.subtitle || ''

    return (
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
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

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Text content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-3 max-w-3xl text-3xl font-bold uppercase leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                {heroTitle}
              </motion.h1>
              {heroSubtitle && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-6 max-w-xl text-base text-white/90 sm:text-lg lg:text-xl"
                >
                  {heroSubtitle}
                </motion.p>
              )}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button
                  onClick={handleSliderCta}
                  size="lg"
                  className="rounded-full px-8 py-3 text-base font-semibold text-white transition-all hover:opacity-90 sm:px-10 sm:py-3.5 sm:text-lg"
                  style={{ backgroundColor: themePrimary }}
                >
                  Acheter maintenant
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
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
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
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
    )
  }

  // ─── Product Image Gallery ───
  function ProductGallery() {
    const [activeIdx, setActiveIdx] = useState(0)

    return (
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
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
          {detailedProduct?.oldPrice && (
            <Badge className="absolute left-3 top-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1">
              PROMO
            </Badge>
          )}
        </div>

        {/* Thumbnails */}
        {productImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {productImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all sm:h-20 sm:w-20 ${
                  idx === activeIdx
                    ? 'border-[var(--thumb-active)]'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                style={{ '--thumb-active': themePrimary } as React.CSSProperties}
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
                star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">
          {rating.toFixed(1)} ({count} {count > 1 ? 'avis' : 'avis'})
        </span>
      </div>
    )
  }

  // ─── Quantity Selector ───
  function QuantityControl() {
    return (
      <div className="flex items-center gap-0 rounded-lg border border-gray-200">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50"
          aria-label="Diminuer"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex h-11 w-12 items-center justify-center border-x border-gray-200 text-sm font-semibold">
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
          <div key={b.label} className="flex items-center gap-2 text-sm text-gray-600">
            <b.icon className="h-4 w-4" style={{ color: themePrimary }} />
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    )
  }

  // ─── Product Detail View ───
  function ProductView() {
    if (loadingProduct) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      )
    }

    if (!detailedProduct) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-gray-500">Produit introuvable</p>
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

          {/* Right: Product Info */}
          <div className="flex flex-col gap-4">
            {/* Product Name */}
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl" style={{ color: TEXT_DARK }}>
              {detailedProduct.name}
            </h1>

            {/* Rating */}
            <StarRating rating={avgRating} count={reviews.length} />

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold" style={{ color: themePrimary }}>
                {formatPrice(detailedProduct.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(detailedProduct.oldPrice!)}
                  </span>
                  <Badge className="bg-red-50 text-red-600 text-xs font-semibold border-red-200">
                    -{discountPercent}%
                  </Badge>
                </>
              )}
            </div>

            {/* Short Description */}
            {detailedProduct.shortDescription && (
              <p className="text-base leading-relaxed text-gray-600">
                {detailedProduct.shortDescription}
              </p>
            )}

            <Separator className="my-1" />

            {/* Quantity */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">Quantité</span>
              <QuantityControl />
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="h-12 w-full rounded-full text-base font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: themePrimary }}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Ajouter au panier
            </Button>

            {/* WhatsApp */}
            {whatsapp && (
              <Button
                onClick={handleWhatsApp}
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full text-base font-semibold transition-all hover:opacity-90"
                style={{
                  borderColor: WHATSAPP_GREEN,
                  color: WHATSAPP_GREEN,
                }}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Commander via WhatsApp
              </Button>
            )}

            <Separator className="my-1" />

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
            <Separator className="mb-8" />
            <h2 className="mb-4 text-xl font-bold uppercase tracking-wide" style={{ color: themePrimary }}>
              Description
            </h2>
            <div
              className="prose prose-gray max-w-none text-base leading-relaxed text-gray-700"
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
            <Separator className="mb-8" />
            <h2 className="mb-6 text-xl font-bold uppercase tracking-wide" style={{ color: themePrimary }}>
              Questions fréquentes
            </h2>
            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left text-base font-medium text-gray-800 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.section>
        )}
      </motion.div>
    )
  }

  // ─── Footer ───
  function Footer() {
    const currentYear = new Date().getFullYear()
    return (
      <footer style={{ backgroundColor: themePrimary }} className="mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

            {/* Quick info */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">Informations</h3>
              <p className="text-sm text-white/70">Livraison gratuite sur toutes les commandes</p>
              <p className="text-sm text-white/70">Retour sous 30 jours</p>
              <p className="text-sm text-white/70">Paiement sécurisé</p>
            </div>
          </div>

          <Separator className="my-8 bg-white/20" />

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
    <div className="flex min-h-screen flex-col bg-white" style={{ color: TEXT_DARK }}>
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