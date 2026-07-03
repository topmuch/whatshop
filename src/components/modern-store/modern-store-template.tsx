'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  Star,
  Store,
  ArrowLeft,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Facebook,
  MessageCircle,
  Flame,
  Phone,
  MapPin,
} from 'lucide-react'
import { useAppStore, type Shop as ShopType } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import {
  parseModernStoreConfig,
  DEFAULT_MODERN_STORE_CONFIG,
  type ModernStoreConfig,
  type ModernStoreProduct,
  type ModernStoreVariant,
} from '@/lib/modern-store-types'
import { buildWhatsAppBuyNowLink } from '@/lib/whatsapp-utils'
import type { VariantSelection } from '@/lib/variant-utils'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { ProductCard } from './product-card'
import { CountdownTimer } from './countdown-timer'
import { VariantSelector } from './variant-selector'
import { QuantitySelector } from './quantity-selector'
import { CartDrawer } from './cart-drawer'
import { CheckoutForm } from './checkout-form'
import { TrustBadges } from './trust-badges'
import { StickyCTA } from './sticky-cta'
import { ImageGallery } from './image-gallery'
import { getAppearance } from '@/lib/appearance'

type View = 'home' | 'product' | 'checkout'

/** Extract YouTube video ID from various URL formats */
function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const match = url.match(p)
    if (match) return match[1]
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  return null
}

interface DetailedProduct extends ModernStoreProduct {
  variants: ModernStoreVariant[]
}

interface Testimonial {
  id: string
  clientName: string
  clientAvatar?: string | null
  clientRole?: string | null
  comment: string
  rating: number
  createdAt: string
}

interface PublicShopData extends ShopType {
  templateType?: string
}

export function ModernStoreTemplate({ videoHero: forceVideoHero }: { videoHero?: boolean } = {}) {
  const { publicShop } = useAppStore()
  const shop = publicShop as PublicShopData | null

  const { buttonColor, logoSize } = getAppearance(shop?.customColors)
  const accent = buttonColor || shop?.accentColor || shop?.primaryColor || '#EC4899'
  const shopId = shop?.id || ''
  const whatsapp = shop?.whatsapp || ''
  const shopName = shop?.name || ''
  const shopSlug = shop?.slug || ''
  const logoH = logoSize ? parseInt(logoSize) : null

  // Cart store subscriptions
  const openCart = useCartStore((s) => s.openCart)
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  )
  const addItem = useCartStore((s) => s.addItem)

  // ─── Template state ───
  const [view, setView] = useState<View>('home')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [products, setProducts] = useState<ModernStoreProduct[]>([])
  const [config, setConfig] = useState<ModernStoreConfig>(
    DEFAULT_MODERN_STORE_CONFIG,
  )
  const [loading, setLoading] = useState(true)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  // searchQuery removed — search bar removed from header

  // Product view state
  const [detailedProduct, setDetailedProduct] = useState<DetailedProduct | null>(
    null,
  )
  const [relatedProducts, setRelatedProducts] = useState<ModernStoreProduct[]>(
    [],
  )
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [finalPrice, setFinalPrice] = useState<number | null>(null)
  const [availableStock, setAvailableStock] = useState<number | null>(null)
  const [selection, setSelection] = useState<VariantSelection>({
    colorVariantId: null,
    sizeVariantId: null,
  })

  // ─── Initial data fetch ───
  useEffect(() => {
    if (!shop?.slug) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [configRes, productsRes, testimonialsRes] = await Promise.all([
          fetch(`/api/shops/${shop!.slug}/modern-store-config`),
          fetch(`/api/shops/${shop!.slug}/products`),
          fetch(`/api/shops/${shop!.slug}/testimonials`),
        ])
        const configData = await configRes.json()
        const productsData = await productsRes.json()
        const testimonialsData = await testimonialsRes.json()
        if (!cancelled) {
          setConfig(
            configData.config
              ? parseModernStoreConfig(JSON.stringify(configData.config))
              : DEFAULT_MODERN_STORE_CONFIG,
          )
          setProducts(Array.isArray(productsData) ? productsData : [])
          setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : [])
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
    setRelatedProducts([])
    setQuantity(1)
    setSelection({ colorVariantId: null, sizeVariantId: null })
    async function loadProduct() {
      try {
        const [prodRes, relatedRes] = await Promise.all([
          fetch(`/api/products/${selectedProductId}`),
          fetch(`/api/products/${selectedProductId}/related`),
        ])
        const prod = await prodRes.json()
        const related = await relatedRes.json()
        if (!cancelled) {
          setDetailedProduct(prod)
          setFinalPrice(prod.price ?? 0)
          setAvailableStock(prod.stock ?? null)
          setRelatedProducts(Array.isArray(related) ? related : [])
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

  // Scroll to top on view change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [view, selectedProductId])

  const handleProductClick = useCallback((p: ModernStoreProduct) => {
    setSelectedProductId(p.id)
    setView('product')
  }, [])

  const handleSelectionChange = useCallback(
    (sel: VariantSelection, price: number, stock: number | null) => {
      setSelection(sel)
      setFinalPrice(price)
      setAvailableStock(stock)
    },
    [],
  )

  // ─── Derived data ───
  const heroProduct = useMemo(() => {
    if (!config.hero.productId) return null
    return products.find((p) => p.id === config.hero.productId) || null
  }, [config.hero.productId, products])

  const promoProducts = useMemo(() => {
    const now = Date.now()
    return products.filter(
      (p) => p.promoEndDate && new Date(p.promoEndDate).getTime() > now,
    )
  }, [products])

  const bestSellers = useMemo(
    () => products.filter((p) => p.isBestSeller).slice(0, 8),
    [products],
  )

  // Derive unique categories from products
  const categories = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of products) {
      if (p.categoryName && !map.has(p.categoryName)) {
        map.set(p.categoryName, p.categoryId || '')
      }
    }
    return Array.from(map.entries()).map(([name, id]) => ({ name, id }))
  }, [products])

  // All products shown (no search filtering — search bar removed)
  const filteredProducts = products

  // ─── Cart actions ───
  const handleAddDetailedToCart = useCallback(() => {
    if (!detailedProduct) return
    const colorVariant = detailedProduct.variants.find(
      (v) => v.id === selection.colorVariantId,
    )
    const sizeVariant = detailedProduct.variants.find(
      (v) => v.id === selection.sizeVariantId,
    )
    const variantName =
      [colorVariant?.name, sizeVariant?.name].filter(Boolean).join(' / ') ||
      null
    const variantId = selection.colorVariantId || selection.sizeVariantId || null
    const img = detailedProduct.images?.[0] || detailedProduct.image || null
    addItem(
      {
        productId: detailedProduct.id,
        name: detailedProduct.name,
        price: finalPrice ?? detailedProduct.price,
        image: img,
        quantity,
        variantId,
        variantName,
        slug: detailedProduct.slug ?? null,
      },
      shopId,
    )
    toast.success(`${detailedProduct.name} ajouté au panier`)
  }, [detailedProduct, selection, quantity, finalPrice, shopId, addItem])

  const handleBuyNow = useCallback(() => {
    if (!detailedProduct) return
    const colorVariant = detailedProduct.variants.find(
      (v) => v.id === selection.colorVariantId,
    )
    const sizeVariant = detailedProduct.variants.find(
      (v) => v.id === selection.sizeVariantId,
    )
    const variantName =
      [colorVariant?.name, sizeVariant?.name].filter(Boolean).join(' / ') ||
      null
    const link = buildWhatsAppBuyNowLink({
      whatsapp,
      shopName,
      productName: detailedProduct.name,
      price: finalPrice ?? detailedProduct.price,
      quantity,
      variantName,
    })
    window.open(link, '_blank', 'noopener,noreferrer')
  }, [detailedProduct, selection, quantity, finalPrice, whatsapp, shopName])

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      </div>
    )
  }

  if (!shop) return null

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0">
      {/* ─── HEADER ─── */}
      <Header
        shop={shop}
        accent={accent}
        itemCount={itemCount}
        onCartClick={openCart}
        onHomeClick={() => setView('home')}
        logoH={logoH}
      />

      {/* ─── MAIN VIEW ─── */}
      {view === 'home' && (
        <HomeView
          shop={shop}
          config={config}
          accent={accent}
          whatsapp={whatsapp}
          shopId={shopId}
          shopName={shopName}
          products={filteredProducts}
          heroProduct={heroProduct}
          promoProducts={promoProducts}
          bestSellers={bestSellers}
          testimonials={testimonials}
          onProductClick={handleProductClick}
          onSeeProducts={() => {
            document
              .getElementById('best-sellers')
              ?.scrollIntoView({ behavior: 'smooth' })
          }}
          forceVideoHero={forceVideoHero}
        />
      )}

      {view === 'product' && (
        <ProductView
          shop={shop}
          accent={accent}
          whatsapp={whatsapp}
          shopId={shopId}
          shopName={shopName}
          loading={loadingProduct}
          product={detailedProduct}
          relatedProducts={relatedProducts}
          allProducts={products}
          quantity={quantity}
          onQuantityChange={setQuantity}
          finalPrice={finalPrice}
          availableStock={availableStock}
          onSelectionChange={handleSelectionChange}
          onAddToCart={handleAddDetailedToCart}
          onBuyNow={handleBuyNow}
          onBack={() => setView('home')}
          onProductClick={handleProductClick}
        />
      )}

      {view === 'checkout' && (
        <CheckoutForm
          whatsapp={whatsapp}
          shopName={shopName}
          shopId={shopId}
          accent={accent}
          onBack={() => setView('home')}
          onSuccess={() => {
            setView('home')
          }}
        />
      )}

      {/* ─── FOOTER ─── */}
      <ModernStoreFooter
        shop={shop}
        shopName={shopName}
        accent={accent}
        categories={categories}
        products={products}
        onProductClick={handleProductClick}
        whatsapp={whatsapp}
        phone={shop?.phone || ''}
        address={shop?.address || ''}
        contactEmail={shop?.contactEmail || ''}
        config={config}
      />

      {/* ─── CART DRAWER (always rendered) ─── */}
      <CartDrawer
        whatsapp={whatsapp}
        shopName={shopName}
        shopId={shopId}
        accent={accent}
        onCheckout={() => setView('checkout')}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════════════════

function Header({
  shop,
  accent,
  itemCount,
  onCartClick,
  onHomeClick,
  logoH,
}: {
  shop: PublicShopData
  accent: string
  itemCount: number
  onCartClick: () => void
  onHomeClick: () => void
  logoH: number | null
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo — well-dimensioned uploaded logo */}
        <button
          type="button"
          onClick={onHomeClick}
          className="flex items-center gap-2 min-h-[44px]"
          aria-label="Retour à l'accueil"
        >
          {shop.logo ? (
            <Image
              src={shop.logo}
              alt={shop.name}
              width={200}
              height={53}
              unoptimized
              className='h-14 md:h-16 w-auto max-w-[200px] md:max-w-[240px] object-contain'
              style={logoH ? { height: logoH } : undefined}
              priority
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: accent }}
              >
                <Store className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-gray-900">
                {shop.name}
              </span>
            </div>
          )}
        </button>

        {/* Cart icon */}
        <button
          type="button"
          onClick={onCartClick}
          aria-label={`Voir le panier (${itemCount} article${itemCount > 1 ? 's' : ''})`}
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface HomeViewProps {
  shop: PublicShopData
  config: ModernStoreConfig
  accent: string
  whatsapp: string
  shopId: string
  shopName: string
  products: ModernStoreProduct[]
  heroProduct: ModernStoreProduct | null
  promoProducts: ModernStoreProduct[]
  bestSellers: ModernStoreProduct[]
  testimonials: Testimonial[]
  onProductClick: (p: ModernStoreProduct) => void
  onSeeProducts: () => void
  forceVideoHero?: boolean
}

function HomeView(props: HomeViewProps) {
  const {
    shop,
    config,
    accent,
    whatsapp,
    shopId,
    shopName,
    products,
    heroProduct,
    promoProducts,
    bestSellers,
    testimonials,
    onProductClick,
    onSeeProducts,
    forceVideoHero,
  } = props

  // YouTube video hero: either forced (Modern Store 2) or configured via dashboard
  const isVideoMode = forceVideoHero || config.heroVideo?.enabled
  const videoId = isVideoMode && config.heroVideo?.youtubeUrl
    ? extractYouTubeId(config.heroVideo.youtubeUrl)
    : null
  const videoIframeRef = useRef<HTMLIFrameElement>(null)

  // Force YouTube video to loop by listening for the 'ended' state via postMessage
  // and sending a seekTo(0) + playVideo command back to the iframe
  useEffect(() => {
    if (!videoId) return
    const handler = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        // playerState 0 = YT.PlayerState.ENDED
        if (data.event === 'infoDelivery' && data.info?.playerState === 0) {
          const win = videoIframeRef.current?.contentWindow
          if (!win) return
          win.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }), '*')
          win.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*')
        }
      } catch {
        // ignore non-JSON messages
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [videoId])

  return (
    <>
      {/* ─── SECTION A: HERO — YouTube Video, placeholder, or fallback to image ─── */}
      {videoId ? (
        <section className="w-full overflow-hidden">
          <div className="relative w-full aspect-video bg-black">
            <iframe
              ref={videoIframeRef}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=${videoId}&modestbranding=1&playsinline=1&enablejsapi=1`}
              title={config.heroVideo?.title || 'Hero Video'}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center left-0 top-0 bottom-0 px-6 md:px-12 lg:px-20"
            >
              <div className="max-w-lg flex flex-col gap-4">
                {config.heroVideo?.title && (
                  <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                    {config.heroVideo.title}
                  </h1>
                )}
                {config.heroVideo?.subtitle && (
                  <p className="text-base md:text-xl text-white/80">
                    {config.heroVideo.subtitle}
                  </p>
                )}
                {config.heroVideo?.ctaText && (
                  <button
                    type="button"
                    onClick={onSeeProducts}
                    className="mt-2 inline-flex items-center justify-center rounded-xl py-3 px-8 font-semibold text-white shadow-lg transition-all hover:brightness-110"
                    style={{ backgroundColor: accent }}
                  >
                    {config.heroVideo.ctaText}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      ) : isVideoMode ? (
        /* Placeholder when video mode is on but no YouTube URL configured yet */
        <section className="w-full overflow-hidden">
          <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center left-0 top-0 bottom-0 px-6 md:px-12 lg:px-20"
            >
              <div className="max-w-lg flex flex-col gap-4">
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  {config.heroVideo?.title || shop.name || 'Bienvenue'}
                </h1>
                <p className="text-base md:text-xl text-white/80">
                  {config.heroVideo?.subtitle || 'Découvrez notre collection exclusive'}
                </p>
                <button
                  type="button"
                  onClick={onSeeProducts}
                  className="mt-2 inline-flex items-center justify-center rounded-xl py-3 px-8 font-semibold text-white shadow-lg transition-all hover:brightness-110"
                  style={{ backgroundColor: accent }}
                >
                  {config.heroVideo?.ctaText || 'Découvrir'}
                </button>
                <p className="mt-4 text-xs text-white/40 flex items-center gap-1.5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  Configurez votre vidéo YouTube dans le dashboard
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      ) : (
        (heroProduct?.images?.[0] || heroProduct?.image || shop.heroImageUrl || shop.coverImageUrl || shop.banner) && (
          <section className="w-full bg-gray-50 overflow-hidden">
            <div className="relative w-full" style={{ maxHeight: '600px' }}>
              <Image
                src={
                  heroProduct?.images?.[0] ||
                  heroProduct?.image ||
                  shop.heroImageUrl ||
                  shop.coverImageUrl ||
                  shop.banner!
                }
                alt="Produit vedette"
                width={1400}
                height={600}
                unoptimized
                priority
                className="w-full h-auto object-cover"
                style={{ maxHeight: '600px' }}
                sizes="100vw"
              />
            </div>
          </section>
        )
      )}

      {/* ─── SECTION B: EXCLUSIVE DEALS ─── */}
      {promoProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Offres exclusives
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {promoProducts.map((p) => (
              <PromoDealCard
                key={p.id}
                product={p}
                accent={accent}
                shopId={shopId}
                shopName={shopName}
                whatsapp={whatsapp}
                onClick={() => onProductClick(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── SECTION C: BEST SELLERS ─── */}
      <section id="best-sellers" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p
              className="mb-1 text-xs font-bold uppercase tracking-widest"
              style={{ color: accent }}
            >
              Les plus populaires
            </p>
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Meilleures ventes
            </h2>
          </div>
        </div>
        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                accent={accent}
                whatsapp={whatsapp}
                shopId={shopId}
                shopName={shopName}
                rating={0}
                onQuickView={onProductClick}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.slice(0, 8).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                accent={accent}
                whatsapp={whatsapp}
                shopId={shopId}
                shopName={shopName}
                rating={0}
                onQuickView={onProductClick}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-gray-500">
            Aucun produit disponible pour le moment.
          </p>
        )}
      </section>

      {/* ─── SECTION D: BENEFITS ─── */}
      {config.benefits.length > 0 && (
        <section className="border-y border-gray-100 bg-gray-50 py-12">
          <div className="mx-auto max-w-6xl px-4">
            <TrustBadges badges={config.benefits} accent={accent} />
          </div>
        </section>
      )}

      {/* ─── SECTION E: TESTIMONIALS ─── */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <p
            className="mb-1 text-xs font-bold uppercase tracking-widest"
            style={{ color: accent }}
          >
            Avis clients
          </p>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
            Ce que nos clients disent
          </h2>
          <TestimonialsCarousel testimonials={testimonials} accent={accent} />
        </section>
      )}

      {/* ─── SECTION F: NEWSLETTER ─── */}
      {config.newsletter.enabled && (
        <section
          className="px-4 py-12"
          style={{ backgroundColor: `${accent}0A` }}
        >
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-xl font-bold text-gray-900 md:text-2xl">
              {config.newsletter.title}
            </h3>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                toast.success('Merci pour votre inscription !')
                ;(e.currentTarget as HTMLFormElement).reset()
              }}
            >
              <Input
                type="email"
                placeholder={config.newsletter.placeholder}
                required
                className="flex-1"
              />
              <Button
                type="submit"
                style={{ backgroundColor: accent, color: '#fff' }}
              >
                S&apos;abonner
              </Button>
            </form>
          </div>
        </section>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMO DEAL CARD (for Exclusive Deals section)
// ═══════════════════════════════════════════════════════════════════════════

function PromoDealCard({
  product,
  accent,
  shopId,
  shopName,
  whatsapp,
  onClick,
}: {
  product: ModernStoreProduct
  accent: string
  shopId: string
  shopName: string
  whatsapp: string
  onClick: () => void
}) {
  const addItem = useCartStore((s) => s.addItem)
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0
  const image = product.images?.[0] || product.image

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image,
        quantity: 1,
        slug: product.slug ?? null,
      },
      shopId,
    )
    toast.success(`${product.name} ajouté au panier`)
  }

  return (
    <article
      onClick={onClick}
      className="group relative flex cursor-pointer gap-4 overflow-hidden rounded-2xl border border-gray-150 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-lg"
    >
      <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="112px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-gray-300" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold" style={{ color: accent }}>
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
              −{discount}%
            </span>
          )}
        </div>

        <CountdownTimer endDate={product.promoEndDate} accent="#EF4444" />

        <button
          type="button"
          onClick={handleAdd}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold uppercase tracking-wide text-white transition-transform active:scale-[0.98]"
          style={{ backgroundColor: accent }}
          aria-label={`Ajouter ${product.name} au panier`}
        >
          <ShoppingBag className="h-4 w-4" />
          Ajouter au panier
        </button>
      </div>
    </article>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTIMONIALS CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════

function TestimonialsCarousel({
  testimonials,
  accent,
}: {
  testimonials: Testimonial[]
  accent: string
}) {
  const [index, setIndex] = useState(0)
  const total = testimonials.length

  const next = useCallback(
    () => setIndex((i) => (i + 1) % Math.max(1, total)),
    [total],
  )
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + Math.max(1, total)) % Math.max(1, total)),
    [total],
  )

  useEffect(() => {
    if (total <= 1) return
    const i = setInterval(next, 5000)
    return () => clearInterval(i)
  }, [next, total])

  if (total === 0) return null
  const current = testimonials[index]

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="mb-3 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < current.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="mb-4 text-base italic text-gray-700">
              &ldquo;{current.comment}&rdquo;
            </p>
            <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
              {current.clientAvatar ? (
                <Image
                  src={current.clientAvatar}
                  alt={current.clientName}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {current.clientName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {current.clientName}
                </p>
                <p className="text-xs text-gray-500">
                  {current.clientRole || 'Client vérifié'}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Témoignage précédent"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <div className="flex gap-1.5">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Aller au témoignage ${i + 1}`}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === index ? 24 : 8,
                  backgroundColor: i === index ? accent : '#E5E7EB',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Témoignage suivant"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface ProductViewProps {
  shop: PublicShopData
  accent: string
  whatsapp: string
  shopId: string
  shopName: string
  loading: boolean
  product: DetailedProduct | null
  relatedProducts: ModernStoreProduct[]
  allProducts: ModernStoreProduct[]
  quantity: number
  onQuantityChange: (n: number) => void
  finalPrice: number | null
  availableStock: number | null
  onSelectionChange: (
    sel: VariantSelection,
    price: number,
    stock: number | null,
  ) => void
  onAddToCart: () => void
  onBuyNow: () => void
  onBack: () => void
  onProductClick: (p: ModernStoreProduct) => void
}

function ProductView(props: ProductViewProps) {
  const {
    shop,
    accent,
    whatsapp,
    shopId,
    shopName,
    loading,
    product,
    relatedProducts,
    allProducts,
    quantity,
    onQuantityChange,
    finalPrice,
    availableStock,
    onSelectionChange,
    onAddToCart,
    onBuyNow,
    onBack,
    onProductClick,
  } = props

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <Store className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Ce produit est introuvable.</p>
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour à la boutique
        </Button>
      </div>
    )
  }

  const currentPrice = finalPrice ?? product.price
  const discount =
    product.oldPrice && product.oldPrice > currentPrice
      ? Math.round(((product.oldPrice - currentPrice) / product.oldPrice) * 100)
      : 0
  const stock = availableStock ?? product.stock ?? null
  const lowStock = stock !== null && stock <= 5 && stock > 0
  const inStock = stock === null || stock > 0
  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${shop.slug}?product=${product.id}`
      : ''

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        {/* Breadcrumb + back */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Accueil
          </button>
          <nav className="flex items-center gap-1 text-xs text-gray-500">
            <span>Accueil</span>
            <ChevronRight className="h-3 w-3" />
            <span>{product.categoryName || 'Produit'}</span>
          </nav>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* ─── LEFT: Image gallery ─── */}
          <div>
            <ImageGallery
              images={product.images || []}
              fallbackUrl={product.image}
              alt={product.name}
              discountPercent={discount}
            />
          </div>

          {/* ─── RIGHT: Product info ─── */}
          <div className="flex flex-col gap-5">
            <div>
              <p
                className="mb-2 text-xs font-bold uppercase tracking-widest"
                style={{ color: accent }}
              >
                {product.categoryName || 'Produit'}
              </p>
              <h1 className="text-2xl font-bold leading-tight text-gray-900 md:text-4xl">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="mt-2 text-base text-gray-500">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-gray-200 text-gray-200"
                  />
                ))}
              </div>
              <span className="text-gray-500">(0 avis)</span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900 md:text-4xl">
                {formatPrice(currentPrice)}
              </span>
              {product.oldPrice && product.oldPrice > currentPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-lg bg-red-100 px-2 py-0.5 text-sm font-bold text-red-600">
                  −{discount}%
                </span>
              )}
            </div>

            {/* Stock info */}
            {stock !== null && (
              <div
                className={`flex items-center gap-2 text-sm font-medium ${
                  stock > 5 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {lowStock && <Flame className="h-4 w-4 animate-pulse" />}
                {stock > 5
                  ? `✓ ${stock} en stock, prêt à expédier`
                  : stock > 0
                    ? `Plus que ${stock} en stock !`
                    : 'Rupture de stock'}
              </div>
            )}

            {/* Countdown for promos */}
            {product.promoEndDate && (
              <CountdownTimer
                endDate={product.promoEndDate}
                accent="#EF4444"
                compact
              />
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                basePrice={product.price}
                accent={accent}
                onSelectionChange={onSelectionChange}
              />
            )}

            {/* Quantity + SKU */}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-gray-700">
                  Quantité
                </p>
                <QuantitySelector
                  value={quantity}
                  min={1}
                  max={stock ?? undefined}
                  onChange={onQuantityChange}
                />
              </div>
              {product.sku && (
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-400">SKU</p>
                  <p className="text-sm font-mono text-gray-600">
                    {product.sku}
                  </p>
                </div>
              )}
            </div>

            {/* CTA buttons */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={onAddToCart}
                disabled={!inStock}
                size="lg"
                className="gap-2 rounded-xl py-6 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
                style={{ backgroundColor: accent, color: '#fff' }}
              >
                <ShoppingBag className="h-5 w-5" />
                Ajouter au panier
              </Button>
              <Button
                onClick={onBuyNow}
                disabled={!inStock}
                size="lg"
                className="gap-2 rounded-xl bg-green-500 py-6 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              >
                <MessageCircle className="h-5 w-5" fill="white" />
                Acheter maintenant
              </Button>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Paiement à
                la livraison
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                <RotateCcw className="h-3.5 w-3.5 text-blue-600" /> Retour sous 7
                jours
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                <Truck className="h-3.5 w-3.5 text-orange-600" /> Livraison
                24-48h
              </span>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-3 text-sm">
              <span className="text-gray-500">Partager :</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Partager sur Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition-transform hover:scale-105"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${product.name} — ${formatPrice(currentPrice)}\n${productUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Partager sur WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white transition-transform hover:scale-105"
              >
                <MessageCircle className="h-4 w-4" fill="white" />
              </a>
            </div>
          </div>
        </div>

        {/* ─── Description ─── */}
        {product.description && (
          <section className="mx-auto mt-12 max-w-3xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">
              Description
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-gray-700">
              {product.description}
            </p>
          </section>
        )}

        {/* ─── Produits similaires ─── */}
        <section className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="mb-5 text-xl font-bold text-gray-900 md:text-2xl">
            Produits similaires
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {(relatedProducts.length > 0
              ? relatedProducts
              : allProducts
                  .filter((p) => p.id !== product?.id)
                  .slice(0, 4)
            ).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                accent={accent}
                whatsapp={whatsapp}
                shopId={shopId}
                shopName={shopName}
                rating={0}
                onQuickView={onProductClick}
              />
            ))}
          </div>
        </section>
      </section>

      {/* ─── Sticky CTA mobile ─── */}
      <StickyCTA
        price={currentPrice}
        oldPrice={product.oldPrice}
        productName={product.name}
        whatsapp={whatsapp}
        shopName={shopName}
        onAddToCart={onAddToCart}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER — Multi-column dark footer (inspired by ShoeVibe)
// ═══════════════════════════════════════════════════════════════════════════

function ModernStoreFooter({
  shop,
  shopName,
  accent,
  categories,
  products,
  onProductClick,
  whatsapp,
  phone,
  address,
  contactEmail,
  config,
}: {
  shop: PublicShopData | null
  shopName: string
  accent: string
  categories: { name: string; id: string }[]
  products: ModernStoreProduct[]
  onProductClick: (p: ModernStoreProduct) => void
  whatsapp: string
  phone: string
  address: string
  contactEmail: string
  config: ModernStoreConfig
}) {
  const year = new Date().getFullYear()
  // Show up to 6 best sellers in footer
  const footerProducts = products
    .filter((p) => p.isBestSeller)
    .slice(0, 6)

  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      {/* ── Top: 4 columns ── */}
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Column 1: Menu */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              Menu
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="transition-colors hover:text-white"
                >
                  Accueil
                </button>
              </li>
              {shop?.description && (
                <li>
                  <span className="line-clamp-1 text-gray-500">{shop.description}</span>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="transition-colors hover:text-white"
                >
                  Produits
                </button>
              </li>
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="transition-colors hover:text-white"
                  >
                    Contact
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 2: Collections (categories) */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm">
              {categories.length > 0 ? (
                categories.slice(0, 5).map((cat) => (
                  <li key={cat.id || cat.name}>
                    <span className="transition-colors hover:text-white cursor-default">
                      {cat.name}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">Aucune catégorie</li>
              )}
            </ul>
          </div>

          {/* Column 3: Contact / Mon compte */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm">
              {phone && (
                <li>
                  <a
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-2 transition-colors hover:text-white"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {phone}
                  </a>
                </li>
              )}
              {whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition-colors hover:text-white"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2">{address}</span>
                </li>
              )}
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="transition-colors hover:text-white"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              Newsletter
            </h4>
            {config.newsletter.enabled && (
              <p className="mb-3 text-sm text-gray-400">
                {config.newsletter.placeholder || 'Inscrivez-vous pour recevoir nos offres.'}
              </p>
            )}
            <form
              className="flex"
              onSubmit={(e) => {
                e.preventDefault()
                toast.success('Merci pour votre inscription !')
                ;(e.currentTarget as HTMLFormElement).reset()
              }}
            >
              <Input
                type="email"
                placeholder="Votre email"
                required
                className="h-10 flex-1 rounded-l-lg rounded-r-none border-gray-600 bg-gray-800 text-sm text-white placeholder:text-gray-500 focus:ring-0 focus:border-gray-500"
              />
              <button
                type="submit"
                className="flex h-10 items-center justify-center rounded-r-lg px-3 text-white transition-colors"
                style={{ backgroundColor: accent }}
                aria-label="S'inscrire"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>

            {/* Social links */}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Rejoignez-nous sur WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom: Copyright ── */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center text-xs text-gray-500 sm:flex-row sm:justify-between">
          <p>
            © {year} {shopName}. Tous droits réservés.
          </p>
          <p>
            Propulsé par{' '}
            <span className="font-bold" style={{ color: accent }}>
              Boutiko
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
