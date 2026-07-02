'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Star, Store, ArrowLeft, Truck, RotateCcw, ShieldCheck,
  ChevronRight, Facebook, MessageCircle, Flame, Phone, MapPin, Menu, X,
  Headphones, Eye, Heart, Clock, ChevronDown,
} from 'lucide-react'
import { useAppStore, type Shop as ShopType } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import {
  parseModernStoreConfig, DEFAULT_MODERN_STORE_CONFIG,
  type ModernStoreConfig, type ModernStoreProduct, type ModernStoreVariant,
} from '@/lib/modern-store-types'
import { buildWhatsAppBuyNowLink } from '@/lib/whatsapp-utils'
import type { VariantSelection } from '@/lib/variant-utils'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { CountdownTimer } from '@/components/modern-store/countdown-timer'
import { VariantSelector } from '@/components/modern-store/variant-selector'
import { QuantitySelector } from '@/components/modern-store/quantity-selector'
import { CartDrawer } from '@/components/modern-store/cart-drawer'
import { CheckoutForm } from '@/components/modern-store/checkout-form'
import { ImageGallery } from '@/components/modern-store/image-gallery'
import { StickyCTA } from '@/components/modern-store/sticky-cta'

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & TYPES
// ═══════════════════════════════════════════════════════════════════════════

const ACCENT = '#2563eb'
const ACCENT_HOVER = '#1d4ed8'
const BG_MAIN = '#ffffff'
const BG_SECONDARY = '#f9fafb'
const BG_CARD = '#ffffff'
const CONTAINER_WIDE = 'max-w-[1440px]'
const CONTAINER_NARROW = 'max-w-7xl'
const BORDER_SUBTLE = '#e5e5e5'
const BORDER_HOVER = '#d4d4d4'
const TEXT_PRIMARY = '#111827'
const TEXT_MUTED = '#4b5563'
const TEXT_SUBTLE = '#9ca3af'

type View = 'home' | 'product' | 'checkout'

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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

export function CosmikaDarkTemplate() {
  const { publicShop } = useAppStore()
  const shop = publicShop as PublicShopData | null

  const shopId = shop?.id || ''
  const whatsapp = shop?.whatsapp || ''
  const shopName = shop?.name || ''
  const shopSlug = shop?.slug || ''

  // Dynamic appearance settings from template-settings
  const btnColor = shop?.buttonColor || ACCENT
  const logoH = shop?.logoSize ? parseInt(shop.logoSize) : null

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<{ name: string; id: string }[]>([])

  // ─── Promo banners ───
  const promoBanners = useMemo(() => {
    if (!shop?.promoBanners) return []
    try {
      const parsed = JSON.parse(shop.promoBanners)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [shop?.promoBanners])

  // ─── Brands ───
  const brands = useMemo(() => {
    if (!shop?.brands) return []
    try {
      const parsed = JSON.parse(shop.brands)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [shop?.brands])

  // Product view state
  const [detailedProduct, setDetailedProduct] = useState<DetailedProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<ModernStoreProduct[]>([])
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
        const [configRes, productsRes, testimonialsRes, categoriesRes] = await Promise.all([
          fetch(`/api/shops/${shop!.slug}/modern-store-config`),
          fetch(`/api/shops/${shop!.slug}/products`),
          fetch(`/api/shops/${shop!.slug}/testimonials`),
          fetch(`/api/shops/${shop!.slug}/categories`),
        ])
        const configData = await configRes.json()
        const productsData = await productsRes.json()
        const testimonialsData = await testimonialsRes.json()
        const categoriesData = await categoriesRes.json()
        if (!cancelled) {
          setConfig(
            configData.config
              ? parseModernStoreConfig(JSON.stringify(configData.config))
              : DEFAULT_MODERN_STORE_CONFIG,
          )
          setProducts(Array.isArray(productsData) ? productsData : [])
          setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : [])
          setCategories(Array.isArray(categoriesData) ? categoriesData.map((c: { id: string; name: string }) => ({ name: c.name, id: c.id })) : [])
        }
      } catch {
        if (!cancelled) toast.error('Erreur de chargement de la boutique')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
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
    return () => { cancelled = true }
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
    () => products.filter((p) => p.isBestSeller).slice(0, 20),
    [products],
  )

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
      [colorVariant?.name, sizeVariant?.name].filter(Boolean).join(' / ') || null
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
      [colorVariant?.name, sizeVariant?.name].filter(Boolean).join(' / ') || null
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
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: BG_MAIN }}>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#f97316]" />
      </div>
    )
  }

  if (!shop) return null

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: BG_MAIN }}>
      {/* ─── HEADER ─── */}
      <Header
        shop={shop}
        itemCount={itemCount}
        onCartClick={openCart}
        onHomeClick={() => { setView('home'); setMobileMenuOpen(false) }}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
        onNavClick={() => setMobileMenuOpen(false)}
        categories={categories}
        shopSlug={shopSlug}
        logoH={logoH}
      />

      {/* ─── MAIN VIEW ─── */}
      <main className="flex-1">
        {view === 'home' && (
          <HomeView
            shop={shop}
            config={config}
            whatsapp={whatsapp}
            shopId={shopId}
            shopName={shopName}
            btnColor={btnColor}
            products={products}
            heroProduct={heroProduct}
            promoProducts={promoProducts}
            bestSellers={bestSellers}
            testimonials={testimonials}
            categories={categories}
            promoBanners={promoBanners}
            brands={brands}
            onProductClick={handleProductClick}
            onSeeProducts={() => {
              document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        )}

        {view === 'product' && (
          <ProductView
            shop={shop}
            whatsapp={whatsapp}
            shopId={shopId}
            shopName={shopName}
            btnColor={btnColor}
            logoH={logoH}
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
            accent={ACCENT}
            onBack={() => setView('home')}
            onSuccess={() => { setView('home') }}
          />
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <CosmikaDarkFooter
        shop={shop}
        shopName={shopName}
        categories={categories}
        products={products}
        onProductClick={handleProductClick}
        whatsapp={whatsapp}
        phone={shop?.phone || ''}
        address={shop?.address || ''}
        contactEmail={shop?.contactEmail || ''}
        config={config}
        btnColor={btnColor}
      />

      {/* ─── CART DRAWER ─── */}
      <CartDrawer
        whatsapp={whatsapp}
        shopName={shopName}
        shopId={shopId}
        accent={ACCENT}
        onCheckout={() => setView('checkout')}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MARQUEE TOP BAR
// ═══════════════════════════════════════════════════════════════════════════

function MarqueeBar({ config }: { config: ModernStoreConfig['marquee'] }) {
  if (!config.enabled) return null

  const fontSizeClass: Record<string, string> = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${config.padding}`}
      style={{ backgroundColor: config.backgroundColor }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes cosmika-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="flex whitespace-nowrap"
        style={{ animation: `cosmika-marquee ${config.speed}s linear infinite` }}
      >
        <span
          className={`mx-6 uppercase font-medium ${fontSizeClass[config.fontSize] ?? 'text-sm'}`}
          style={{ color: config.textColor, letterSpacing: config.letterSpacing }}
        >
          {config.text}
        </span>
        <span
          className={`mx-6 uppercase font-medium ${fontSizeClass[config.fontSize] ?? 'text-sm'}`}
          style={{ color: config.textColor, letterSpacing: config.letterSpacing }}
        >
          {config.text}
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════════════════

function Header({
  shop,
  itemCount,
  onCartClick,
  onHomeClick,
  onMobileMenuToggle,
  mobileMenuOpen,
  onNavClick,
  categories,
  shopSlug,
  logoH,
}: {
  shop: PublicShopData
  itemCount: number
  onCartClick: () => void
  onHomeClick: () => void
  onMobileMenuToggle: () => void
  mobileMenuOpen: boolean
  onNavClick: () => void
  categories: { name: string; id: string }[]
  shopSlug: string
  logoH: number | null
}) {
  const navLinks = [
    { label: 'Accueil', action: () => { onHomeClick() } },
    { label: 'Produits', action: () => { onHomeClick(); setTimeout(() => document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' }), 100) } },
    ...categories.length > 0
      ? [{ label: 'Cat\u00e9gories', action: () => { onHomeClick(); setTimeout(() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }), 100) } }]
      : [],
    { label: 'Contact', action: () => { document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }) } },
  ]

  return (
    <>
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          backgroundColor: `${BG_MAIN}F2`,
          borderBottom: `1px solid ${BORDER_SUBTLE}`,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Left: Mobile hamburger + Desktop nav links */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors md:hidden"
              style={{ color: TEXT_PRIMARY }}
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop nav links */}
            <nav className="hidden md:flex md:items-center md:gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => { link.action(); onNavClick() }}
                  className="text-sm font-medium transition-colors hover:text-[#f97316]"
                  style={{ color: TEXT_MUTED }}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Center: Logo */}
          <button
            type="button"
            onClick={onHomeClick}
            className="flex items-center gap-2 min-h-[44px]"
            aria-label="Retour \u00e0 l'accueil"
          >
            {shop.logo ? (
              <Image
                src={shop.logo}
                alt={shop.name}
                width={200}
                height={53}
                unoptimized
                className={logoH ? 'w-auto max-w-[180px] md:max-w-[200px] object-contain' : 'h-10 md:h-12 w-auto max-w-[180px] md:max-w-[200px] object-contain'}
                style={logoH ? { height: logoH } : undefined}
                priority
              />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Store className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold" style={{ color: TEXT_PRIMARY }}>
                  {shop.name}
                </span>
              </div>
            )}
          </button>

          {/* Right: Cart icon */}
          <button
            type="button"
            onClick={onCartClick}
            aria-label={`Voir le panier (${itemCount} article${itemCount > 1 ? 's' : ''})`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            style={{ color: TEXT_PRIMARY }}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ─── MOBILE MENU OVERLAY ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={onMobileMenuToggle}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-y-0 right-0 w-72 flex flex-col"
              style={{ backgroundColor: BG_SECONDARY }}
            >
              {/* Close button */}
              <div className="flex items-center justify-end p-4">
                <button
                  type="button"
                  onClick={onMobileMenuToggle}
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: TEXT_PRIMARY }}
                  aria-label="Fermer le menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => { link.action(); onNavClick() }}
                    className="rounded-lg px-4 py-3 text-left text-lg font-medium transition-colors hover:text-[#f97316] hover:bg-gray-100"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface HomeViewProps {
  shop: PublicShopData
  config: ModernStoreConfig
  whatsapp: string
  shopId: string
  shopName: string
  btnColor: string
  products: ModernStoreProduct[]
  heroProduct: ModernStoreProduct | null
  promoProducts: ModernStoreProduct[]
  bestSellers: ModernStoreProduct[]
  testimonials: Testimonial[]
  categories: { name: string; id: string }[]
  promoBanners: { id?: string; image: string; title?: string; link?: string }[]
  brands: { id?: string; name: string; image: string; link?: string }[]
  onProductClick: (p: ModernStoreProduct) => void
  onSeeProducts: () => void
}

function HomeView(props: HomeViewProps) {
  const {
    shop, config, whatsapp, shopId, shopName, btnColor,
    products, heroProduct, promoProducts, bestSellers,
    testimonials, categories, promoBanners, brands, onProductClick, onSeeProducts,
  } = props

  const [activeCategory, setActiveCategory] = useState('all')
  const categoryTabs = useMemo(() => [
    { label: 'Tous', id: 'all' },
    ...categories.map((c) => ({ label: c.name, id: c.id || c.name })),
  ], [categories])

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products
    return products.filter((p) => p.categoryId === activeCategory || p.categoryName === activeCategory)
  }, [products, activeCategory])

  return (
    <>
      {/* ─── SECTION 1: HERO ─── */}
      {(heroProduct?.images?.[0] || heroProduct?.image || shop.heroImageUrl || shop.coverImageUrl || shop.banner) && (
        <section className="w-full overflow-hidden">
          <div className="relative w-full group" style={{ maxHeight: '600px' }}>
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
              className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-[1.02]"
              style={{ maxHeight: '600px' }}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-700 group-hover:bg-black/10" />
          </div>
        </section>
      )}

      {/* ─── MARQUEE BAR ─── */}
      <MarqueeBar config={config.marquee} />

      {/* ─── PROMO BANNERS ─── */}
      {promoBanners.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {promoBanners.slice(0, 2).map((banner: { id?: string; image: string; title?: string; link?: string }, idx: number) => (
              <a
                key={banner.id || idx}
                href={banner.link || '#'}
                target={banner.link ? '_blank' : undefined}
                rel={banner.link ? 'noopener noreferrer' : undefined}
                className="block relative rounded-xl overflow-hidden group cursor-pointer"
                style={{ aspectRatio: '698 / 423', border: `1px solid ${BORDER_SUBTLE}` }}
                onClick={(e) => { if (!banner.link) e.preventDefault() }}
              >
                <Image
                  src={banner.image}
                  alt={banner.title || `Promo ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                {banner.title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                    <div className="px-5 pb-4">
                      <span
                        className="inline-block px-4 py-1.5 rounded-lg text-white text-sm font-bold uppercase tracking-wider"
                        style={{ backgroundColor: ACCENT }}
                      >
                        {banner.title}
                      </span>
                    </div>
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ─── SECTION 2: CATEGORY TABS ─── */}
      {categories.length > 0 && (
        <section id="categories" className="mx-auto max-w-[1440px] px-5 py-16">
          <h2 className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
            Cat\u00e9gories
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categoryTabs.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="flex-shrink-0 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: activeCategory === cat.id ? ACCENT : BG_CARD,
                  color: activeCategory === cat.id ? '#ffffff' : TEXT_MUTED,
                  border: `1px solid ${activeCategory === cat.id ? ACCENT : BORDER_SUBTLE}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── SECTION 3: SPECIAL OFFERS ─── */}
      {promoProducts.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 py-16">
          <div className="mb-8 flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-bold md:text-3xl" style={{ color: TEXT_PRIMARY }}>
              Offres sp\u00e9ciales
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {promoProducts.map((p) => (
              <PromoDealCard
                key={p.id}
                product={p}
                shopId={shopId}
                shopName={shopName}
                whatsapp={whatsapp}
                btnColor={btnColor}
                onClick={() => onProductClick(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── SECTION 4: BEST SELLERS ─── */}
      <section id="best-sellers" className="mx-auto max-w-[1440px] px-5 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold md:text-3xl" style={{ color: TEXT_PRIMARY }}>
            Meilleures ventes
          </h2>
          <div className="mt-3 h-0.5 w-16 rounded-full" style={{ backgroundColor: ACCENT }} />
        </div>
        {(bestSellers.length > 0 ? bestSellers : filteredProducts.slice(0, 20)).length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {(bestSellers.length > 0 ? bestSellers : filteredProducts.slice(0, 20)).map((p) => (
              <DarkProductCard
                key={p.id}
                product={p}
                shopId={shopId}
                shopName={shopName}
                whatsapp={whatsapp}
                btnColor={btnColor}
                onQuickView={onProductClick}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center" style={{ color: TEXT_SUBTLE }}>
            Aucun produit disponible pour le moment.
          </p>
        )}
      </section>

      {/* ─── SECTION 5: BENEFITS / TRUST ─── */}
      {config.benefits.length > 0 && (
        <section className="py-20" style={{ backgroundColor: BG_SECONDARY }}>
          <div className="mx-auto max-w-7xl px-5">
            <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
              {config.benefits.map((b, i) => {
                const icons = [Truck, ShieldCheck, RotateCcw, Headphones]
                const Icon = icons[i % icons.length]
                return (
                  <div key={i} className="flex flex-col items-center text-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${ACCENT}15` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>{b.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: TEXT_SUBTLE }}>{b.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTION 6: TESTIMONIALS ─── */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold md:text-3xl" style={{ color: TEXT_PRIMARY }}>
              Avis clients
            </h2>
            <div className="mt-3 h-0.5 w-16 rounded-full" style={{ backgroundColor: ACCENT }} />
          </div>
          <TestimonialsCarousel testimonials={testimonials} />
        </section>
      )}

      {/* ─── SECTION 6.5: BRAND CAROUSEL ─── */}
      <BrandCarousel brands={brands} />

      {/* ─── SECTION 7: NEWSLETTER ─── */}
      {config.newsletter.enabled && (
        <section
          className="px-5 py-20"
          style={{
            backgroundColor: BG_SECONDARY,
            borderTop: `1px solid ${ACCENT}30`,
          }}
        >
          <div className="mx-auto max-w-lg text-center">
            <h3 className="text-xl font-bold md:text-2xl" style={{ color: TEXT_PRIMARY }}>
              {config.newsletter.title || 'Restez inform\u00e9'}
            </h3>
            <p className="mt-2 text-sm" style={{ color: TEXT_SUBTLE }}>
              {config.newsletter.placeholder || 'Inscrivez-vous pour recevoir nos offres.'}
            </p>
            <form
              className="mt-5 flex gap-2"
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
                className="flex-1 rounded-xl border-[#e5e5e5] bg-white text-gray-900 placeholder:text-[#9ca3af] focus-visible:ring-[#f97316] focus-visible:border-[#f97316]"
              />
              <Button
                type="submit"
                className="rounded-xl px-6 font-bold text-white transition-colors hover:bg-[#ea580c]"
                style={{ backgroundColor: btnColor }}
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
// DARK PRODUCT CARD
// ═══════════════════════════════════════════════════════════════════════════

function DarkProductCard({
  product,
  shopId,
  shopName,
  whatsapp,
  btnColor,
  onQuickView,
}: {
  product: ModernStoreProduct
  shopId: string
  shopName: string
  whatsapp: string
  btnColor: string
  onQuickView: (p: ModernStoreProduct) => void
}) {
  const addItem = useCartStore((s) => s.addItem)
  const image = product.images?.[0] || product.image
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0

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
    toast.success(`${product.name} ajout\u00e9 au panier`)
  }

  return (
    <article
      onClick={() => onQuickView(product)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        backgroundColor: BG_CARD,
        border: `1px solid ${BORDER_SUBTLE}`,
      }}
    >
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ backgroundColor: '#f3f4f6' }}
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-8 w-8" style={{ color: BORDER_SUBTLE }} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isBestSeller && (
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: ACCENT }}
            >
              Best seller
            </span>
          )}
          {(product as any).isNew && (
            <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Nouveau
            </span>
          )}
        </div>
        {discount > 0 && (
          <span className="absolute top-2 right-2 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            &minus;{discount}%
          </span>
        )}

        {/* Hover overlay with eye icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/15">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onQuickView(product) }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:bg-white/90"
            aria-label="Voir le produit"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.categoryName && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: TEXT_SUBTLE }}>
            {product.categoryName}
          </p>
        )}
        <h3 className="line-clamp-1 text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-bold" style={{ color: ACCENT }}>
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs line-through" style={{ color: TEXT_SUBTLE }}>
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Rating stars */}
        <div className="mt-2 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-3 w-3"
              style={{ color: ACCENT, fill: ACCENT }}
            />
          ))}
        </div>

        {/* Add to cart button */}
        <button
          type="button"
          onClick={handleAdd}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wide text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          style={{ backgroundColor: btnColor }}
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
// PROMO DEAL CARD (Dark Theme)
// ═══════════════════════════════════════════════════════════════════════════

function PromoDealCard({
  product,
  shopId,
  shopName,
  whatsapp,
  btnColor,
  onClick,
}: {
  product: ModernStoreProduct
  shopId: string
  shopName: string
  whatsapp: string
  btnColor: string
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
    toast.success(`${product.name} ajout\u00e9 au panier`)
  }

  return (
    <article
      onClick={onClick}
      className="group relative flex cursor-pointer gap-4 overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:border-[#f97316]/30"
      style={{
        backgroundColor: BG_CARD,
        border: `1px solid ${BORDER_SUBTLE}`,
      }}
    >
      <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl" style={{ backgroundColor: '#f3f4f6' }}>
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
            <ShoppingBag className="h-8 w-8" style={{ color: BORDER_SUBTLE }} />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            &minus;{discount}%
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="line-clamp-2 text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold" style={{ color: ACCENT }}>
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs line-through" style={{ color: TEXT_SUBTLE }}>
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <CountdownTimer endDate={product.promoEndDate} accent="#EF4444" />

        <button
          type="button"
          onClick={handleAdd}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold uppercase tracking-wide text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          style={{ backgroundColor: btnColor }}
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
// TESTIMONIALS CAROUSEL (Dark Theme)
// ═══════════════════════════════════════════════════════════════════════════

function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[]
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
            className="mx-auto max-w-2xl rounded-2xl p-6 md:p-8"
            style={{
              backgroundColor: BG_CARD,
              border: `1px solid ${BORDER_SUBTLE}`,
            }}
          >
            <div className="mb-3 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4"
                  style={{
                    color: i < current.rating ? ACCENT : BORDER_SUBTLE,
                    fill: i < current.rating ? ACCENT : 'transparent',
                  }}
                />
              ))}
            </div>
            <p className="mb-4 text-base italic" style={{ color: TEXT_MUTED }}>
              &ldquo;{current.comment}&rdquo;
            </p>
            <div
              className="flex items-center gap-3 pt-4"
              style={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}
            >
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
                  style={{ backgroundColor: ACCENT }}
                >
                  {current.clientName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>
                  {current.clientName}
                </p>
                <p className="text-xs" style={{ color: TEXT_SUBTLE }}>
                  {current.clientRole || 'Client v\u00e9rifi\u00e9'}
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
            aria-label="T\u00e9moignage pr\u00e9c\u00e9dent"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            style={{ border: `1px solid ${BORDER_SUBTLE}`, color: TEXT_MUTED }}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <div className="flex gap-1.5">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Aller au t\u00e9moignage ${i + 1}`}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === index ? 24 : 8,
                  backgroundColor: i === index ? ACCENT : BORDER_SUBTLE,
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="T\u00e9moignage suivant"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            style={{ border: `1px solid ${BORDER_SUBTLE}`, color: TEXT_MUTED }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function BrandCarousel({
  brands,
}: {
  brands: { id?: string; name: string; image: string; link?: string }[]
}) {
  const carouselRef = useRef<HTMLDivElement>(null)

  // Auto-scroll (infinite loop)
  const scrollOffsetRef = useRef(0)

  useEffect(() => {
    if (brands.length === 0) return
    const itemWidth = 160
    const totalWidth = brands.length * itemWidth
    if (totalWidth === 0) return

    const interval = setInterval(() => {
      scrollOffsetRef.current += 1
      if (scrollOffsetRef.current >= totalWidth) {
        scrollOffsetRef.current = 0
        carouselRef.current?.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior })
      } else if (carouselRef.current) {
        carouselRef.current.scrollLeft = scrollOffsetRef.current
      }
    }, 30)
    return () => clearInterval(interval)
  }, [brands.length])

  if (brands.length === 0) return null

  const displayBrands = [...brands, ...brands]

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: BG_SECONDARY,
        borderTop: `1px solid ${BORDER_SUBTLE}`,
        borderBottom: `1px solid ${BORDER_SUBTLE}`,
      }}
    >
      <div className={`mx-auto ${CONTAINER_WIDE} px-5 py-8 md:py-10`}>
        <div className="mb-5">
          <h2 className="text-lg font-bold md:text-xl" style={{ color: TEXT_PRIMARY }}>
            Nos marques
          </h2>
          <div className="mt-2 h-0.5 w-12 rounded-full" style={{ backgroundColor: ACCENT }} />
        </div>

        <div
          ref={carouselRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {displayBrands.map((brand, idx) => {
            const realIdx = idx % brands.length
            return (
              <a
                key={(brand.id || realIdx) + '-' + idx}
                href={brand.link || '#'}
                target={brand.link ? '_blank' : undefined}
                rel={brand.link ? 'noopener noreferrer' : undefined}
                className="shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
                onClick={(e) => {
                  if (!brand.link) e.preventDefault()
                }}
              >
                <div
                  className="flex items-center justify-center w-[120px] h-[60px] md:w-[140px] md:h-[70px] rounded-xl bg-white p-3 transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
                  style={{ border: `1px solid ${BORDER_SUBTLE}` }}
                >
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-medium truncate max-w-[140px]" style={{ color: TEXT_SUBTLE }}>
                  {brand.name}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT VIEW (Dark Theme)
// ═══════════════════════════════════════════════════════════════════════════

interface ProductViewProps {
  shop: PublicShopData
  whatsapp: string
  shopId: string
  shopName: string
  btnColor: string
  logoH: number | null
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
    shop, whatsapp, shopId, shopName, btnColor, logoH,
    loading, product, relatedProducts, allProducts,
    quantity, onQuantityChange, finalPrice, availableStock,
    onSelectionChange, onAddToCart, onBuyNow, onBack, onProductClick,
  } = props

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#f97316]" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <Store className="h-12 w-12" style={{ color: BORDER_SUBTLE }} />
        <p style={{ color: TEXT_SUBTLE }}>Ce produit est introuvable.</p>
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 border-[#e5e5e5] text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour \u00e0 la boutique
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
      <section className="mx-auto max-w-7xl px-5 py-8 md:py-14">
        {/* Breadcrumb + back */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#f97316]"
            style={{ color: TEXT_SUBTLE }}
          >
            <ArrowLeft className="h-4 w-4" />
            Accueil
          </button>
          <nav className="flex items-center gap-1 text-xs" style={{ color: TEXT_SUBTLE }}>
            <span>Accueil</span>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: TEXT_PRIMARY }}>{product.categoryName || 'Produit'}</span>
          </nav>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
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
              <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                {product.categoryName || 'Produit'}
              </p>
              <h1 className="text-2xl font-bold leading-tight md:text-4xl" style={{ color: TEXT_PRIMARY }}>
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="mt-2 text-base" style={{ color: TEXT_MUTED }}>
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
                    className="h-4 w-4"
                    style={{ color: ACCENT, fill: ACCENT }}
                  />
                ))}
              </div>
              <span style={{ color: TEXT_SUBTLE }}>(0 avis)</span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black md:text-4xl" style={{ color: ACCENT }}>
                {formatPrice(currentPrice)}
              </span>
              {product.oldPrice && product.oldPrice > currentPrice && (
                <span className="text-lg line-through" style={{ color: TEXT_SUBTLE }}>
                  {formatPrice(product.oldPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-lg bg-red-500 px-2 py-0.5 text-sm font-bold text-white">
                  &minus;{discount}%
                </span>
              )}
            </div>

            {/* Stock info */}
            {stock !== null && (
              <div
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: stock > 5 ? '#22C55E' : '#EF4444' }}
              >
                {lowStock && <Flame className="h-4 w-4 animate-pulse" />}
                {stock > 5
                  ? `\u2713 ${stock} en stock, pr\u00eat \u00e0 exp\u00e9dier`
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
                accent={ACCENT}
                onSelectionChange={onSelectionChange}
              />
            )}

            {/* Quantity + SKU */}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="mb-1.5 text-xs font-semibold" style={{ color: TEXT_MUTED }}>
                  Quantit\u00e9
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
                  <p className="text-xs" style={{ color: TEXT_SUBTLE }}>SKU</p>
                  <p className="text-sm font-mono" style={{ color: TEXT_MUTED }}>
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
                className="gap-2 rounded-xl py-6 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:brightness-110 disabled:opacity-50"
                style={{ backgroundColor: btnColor }}
              >
                <ShoppingBag className="h-5 w-5" />
                Ajouter au panier
              </Button>
              <Button
                onClick={onBuyNow}
                disabled={!inStock}
                size="lg"
                className="gap-2 rounded-xl bg-green-600 py-6 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                <MessageCircle className="h-5 w-5" fill="white" />
                Acheter maintenant
              </Button>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  border: `1px solid ${BORDER_SUBTLE}`,
                  backgroundColor: BG_CARD,
                  color: TEXT_MUTED,
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Paiement \u00e0 la livraison
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  border: `1px solid ${BORDER_SUBTLE}`,
                  backgroundColor: BG_CARD,
                  color: TEXT_MUTED,
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" style={{ color: ACCENT }} /> Retour sous 7 jours
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  border: `1px solid ${BORDER_SUBTLE}`,
                  backgroundColor: BG_CARD,
                  color: TEXT_MUTED,
                }}
              >
                <Truck className="h-3.5 w-3.5 text-amber-500" /> Livraison 24-48h
              </span>
            </div>

            {/* Share buttons */}
            <div
              className="flex items-center gap-2 pt-3 text-sm"
              style={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}
            >
              <span style={{ color: TEXT_SUBTLE }}>Partager :</span>
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
                href={`https://wa.me/?text=${encodeURIComponent(`${product.name} \u2014 ${formatPrice(currentPrice)}\n${productUrl}`)}`}
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
            <h2 className="mb-4 text-xl font-bold md:text-2xl" style={{ color: TEXT_PRIMARY }}>
              Description
            </h2>
            <p className="whitespace-pre-line leading-relaxed" style={{ color: TEXT_MUTED }}>
              {product.description}
            </p>
          </section>
        )}

        {/* ─── Produits similaires ─── */}
        <section className="mt-12 pt-8" style={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}>
          <div className="mb-8">
            <h2 className="text-xl font-bold md:text-2xl" style={{ color: TEXT_PRIMARY }}>
              Produits similaires
            </h2>
            <div className="mt-3 h-0.5 w-16 rounded-full" style={{ backgroundColor: ACCENT }} />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {(relatedProducts.length > 0
              ? relatedProducts
              : allProducts
                  .filter((p) => p.id !== product?.id)
                  .slice(0, 4)
            ).map((p) => (
              <DarkProductCard
                key={p.id}
                product={p}
                shopId={shopId}
                shopName={shopName}
                whatsapp={whatsapp}
                btnColor={btnColor}
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
// FOOTER (Dark Multi-Column)
// ═══════════════════════════════════════════════════════════════════════════

function CosmikaDarkFooter({
  shop,
  shopName,
  categories,
  products,
  onProductClick,
  whatsapp,
  phone,
  address,
  contactEmail,
  config,
  btnColor,
}: {
  shop: PublicShopData | null
  shopName: string
  categories: { name: string; id: string }[]
  products: ModernStoreProduct[]
  onProductClick: (p: ModernStoreProduct) => void
  whatsapp: string
  phone: string
  address: string
  contactEmail: string
  config: ModernStoreConfig
  btnColor: string
}) {
  const year = new Date().getFullYear()

  return (
    <footer id="footer" className="mt-auto" style={{ backgroundColor: BG_SECONDARY }}>
      {/* ── Top: 4 columns ── */}
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Column 1: Logo + Description + Social */}
          <div className="col-span-2 md:col-span-1">
            {shop?.logo ? (
              <Image
                src={shop.logo}
                alt={shop?.name || 'Logo'}
                width={160}
                height={42}
                unoptimized
                className="mb-4 h-8 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Store className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>
                  {shopName}
                </span>
              </div>
            )}
            {shop?.description && (
              <p className="mb-4 text-sm leading-relaxed line-clamp-3" style={{ color: TEXT_SUBTLE }}>
                {shop.description}
              </p>
            )}
            <div className="flex items-center gap-3">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: BG_CARD, border: `1px solid ${BORDER_SUBTLE}`, color: ACCENT }}
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              {(shop as any)?.facebookUrl && (
                <a
                  href={(shop as any).facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: BG_CARD, border: `1px solid ${BORDER_SUBTLE}`, color: ACCENT }}
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: MENU */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
              Menu
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="transition-colors hover:text-[#f97316]"
                  style={{ color: TEXT_SUBTLE }}
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="transition-colors hover:text-[#f97316]"
                  style={{ color: TEXT_SUBTLE }}
                >
                  Produits
                </button>
              </li>
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="transition-colors hover:text-[#f97316]"
                    style={{ color: TEXT_SUBTLE }}
                  >
                    Contact
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: CONTACT */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm">
              {phone && (
                <li>
                  <a
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-2 transition-colors hover:text-[#f97316]"
                    style={{ color: TEXT_SUBTLE }}
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
                    className="flex items-center gap-2 transition-colors hover:text-[#f97316]"
                    style={{ color: TEXT_SUBTLE }}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2" style={{ color: TEXT_SUBTLE }}>
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2">{address}</span>
                </li>
              )}
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="transition-colors hover:text-[#f97316]"
                    style={{ color: TEXT_SUBTLE }}
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: NEWSLETTER */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
              Newsletter
            </h4>
            {config.newsletter.enabled && (
              <p className="mb-3 text-sm" style={{ color: TEXT_SUBTLE }}>
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
                className="h-10 flex-1 rounded-l-lg rounded-r-none border-[#e5e5e5] bg-white text-sm text-gray-900 placeholder:text-[#9ca3af] focus:ring-0 focus:border-[#f97316]"
              />
              <button
                type="submit"
                className="flex h-10 items-center justify-center rounded-r-lg px-3 text-white transition-colors hover:brightness-110"
                style={{ backgroundColor: btnColor }}
                aria-label="S'inscrire"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom: Copyright ── */}
      <div style={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-5 py-6 text-center text-xs sm:flex-row sm:justify-between" style={{ color: TEXT_SUBTLE }}>
          <p>
            \u00a9 {year} {shopName}. Tous droits r\u00e9serv\u00e9s.
          </p>
          <p>
            Propuls\u00e9 par{' '}
            <span className="font-bold" style={{ color: ACCENT }}>
              Boutiko
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}