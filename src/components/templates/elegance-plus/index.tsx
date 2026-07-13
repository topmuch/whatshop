'use client'

/**
 * ElegancePlusTemplate — Premium enriched template for the Elegance Plus engine.
 *
 * Based on Cosmika's data/config layer but with significantly enhanced visuals:
 *   - Rotating announcement bar
 *   - Two-tier header with utility bar
 *   - Dual-CTA hero with decorative shapes
 *   - Rectangular category cards (not circles)
 *   - Best Sellers section
 *   - New Arrivals section
 *   - Promotional banner (mid-page)
 *   - Product cards with wishlist, ratings, quick-view overlay
 *   - Newsletter section
 *   - Scroll-to-top floating button
 *   - Enhanced multi-column footer
 *
 * Adapts automatically to the same 9 Cosmika sectors:
 *   ECOMMERCE: beaute, mode, alimentation, autre
 *   SERVICE:   beaute-service, restaurant, consulting, sante, formation
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import {
  X,
  Plus,
  Minus,
  Package,
  ShoppingCart,
  MessageCircle,
  ArrowLeft,
  Search,
} from 'lucide-react'
import { useAppStore, type Product, type Category, type Shop } from '@/lib/store'
import { formatPrice, openWhatsApp } from '@/lib/shared'
import {
  getThemeWithCustomColors,
  type ThemeConfig,
} from '@/lib/theme-config'
import { getCtaButton, getCtaWhatsAppMessage, getSectorLabels } from '@/lib/sector-config'
import { LiveShopFeatures } from '@/components/shop/live-shop-features'
import { ThemedCartDrawer } from '@/components/shop/themed-cart-drawer'

// ─── Elegance Plus Components ─────────────────────────────────────────────
import { EleganceAnnouncementBar } from './announcement-bar'
import { EleganceHeader } from './header'
import { EleganceHero } from './hero'
import { EleganceCategories } from './categories'
import { EleganceProductCard } from './product-card'
import { EleganceTrustBadges } from './trust-badges'
import { EleganceFooter } from './footer'
import { EleganceTestimonials, type TestimonialItem } from './testimonials'
import { EleganceExpertises } from './expertises'
import { EleganceWhyChooseUs } from './why-choose-us'
import { EleganceApproach } from './approach'
import { EleganceServicesGrid } from './services-grid'
import { EleganceAbout } from './about'
import { EleganceContact } from './contact'
import { ElegancePromotionalBanner } from './promotional-banner'
import { EleganceNewsletter } from './newsletter'
import { EleganceScrollToTop } from './scroll-to-top'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortOption = 'recent' | 'price-asc' | 'price-desc'

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function EleganceLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-purple-600 animate-spin" />
    </div>
  )
}

// ─── Product Detail Modal ────────────────────────────────────────────────────

interface ProductDetailProps {
  product: Product
  shop: Shop | null
  config: ThemeConfig
  categoryName?: string
  onClose: () => void
  onAddToCart: (product: Product, qty: number) => void
  cartQty: number
  updateCartQuantity: (productId: string, qty: number) => void
}

function ProductDetail({
  product,
  shop,
  config,
  categoryName,
  onClose,
  onAddToCart,
  cartQty,
  updateCartQuantity,
}: ProductDetailProps) {
  const colors = config.colors
  const isService = config.businessType === 'SERVICE'
  const sector = shop?.sector
  const ctaText = getCtaButton(sector)
  const whatsappMsg = getCtaWhatsAppMessage(sector)
  const imageUrl = product.images?.[0] || product.image

  const handleWhatsApp = () => {
    if (!shop?.whatsapp) return
    openWhatsApp(product, shop.whatsapp)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.background }}>
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold min-h-[44px] px-2"
            style={{ color: colors.text }}
            aria-label="Retour"
          >
            <ArrowLeft className="size-5" />
            <span className="hidden sm:inline">Retour</span>
          </button>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm text-gray-500 truncate">{product.name}</span>
        </div>
      </div>

      <div className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
              {imageUrl ? (
                <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package className="size-20" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              {categoryName && (
                <Badge className="w-fit text-xs mb-3" style={{ background: colors.primaryBg, color: colors.primary }}>
                  {categoryName}
                </Badge>
              )}
              <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: colors.text }}>
                {product.name}
              </h1>
              {product.description && (
                <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">{product.description}</p>
              )}

              {isService ? (
                product.price > 0 ? (
                  <p className="text-base text-gray-600 mb-6">
                    À partir de{' '}
                    <span className="text-2xl font-bold" style={{ color: colors.primary }}>{formatPrice(product.price)}</span>
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-gray-500 mb-6 italic">Sur devis</p>
                )
              ) : (
                <p className="text-2xl font-bold mb-6" style={{ color: colors.text }}>{formatPrice(product.price)}</p>
              )}

              {!isService && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-gray-600">Quantité</span>
                  <div className="flex items-center border rounded-xl overflow-hidden">
                    <button className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition" onClick={() => cartQty > 1 && updateCartQuantity(product.id, cartQty - 1)} disabled={cartQty < 1} aria-label="Diminuer">
                      <Minus className="size-4" />
                    </button>
                    <span className="h-10 w-12 flex items-center justify-center text-sm font-semibold border-x">{cartQty}</span>
                    <button className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition" onClick={() => updateCartQuantity(product.id, cartQty + 1)} aria-label="Augmenter">
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleWhatsApp}
                className="w-full py-4 rounded-xl font-semibold text-base text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[50px]"
                style={{ backgroundColor: colors.ctaBg }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.primaryDark }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.ctaBg }}
              >
                {ctaText}
              </button>

              {!isService && (
                <button
                  onClick={() => onAddToCart(product, 1)}
                  className="mt-3 w-full py-3 rounded-xl font-semibold text-sm border-2 transition-all duration-200 hover:scale-[1.01] min-h-[48px] flex items-center justify-center gap-2"
                  style={{ borderColor: colors.primary, color: colors.primary, background: 'transparent' }}
                >
                  <ShoppingCart className="size-4" />
                  Ajouter au panier
                </button>
              )}

              {shop?.whatsapp && (
                <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
                  <MessageCircle className="size-4" style={{ color: '#25D366' }} />
                  <span>
                    Ou contactez-nous directement sur{' '}
                    <a
                      href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                      style={{ color: colors.primary }}
                    >
                      WhatsApp
                    </a>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════

export function ElegancePlusTemplate() {
  const {
    shopSlug,
    setView,
    publicShop,
    setPublicShop,
    publicProducts,
    setPublicProducts,
    publicCategories,
    setPublicCategories,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [cartExpanded, setCartExpanded] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const productsRef = useRef<HTMLDivElement>(null)

  // ── Resolve theme config (uses cosmika engine since elegance-plus shares the same data layer) ──
  const sector = publicShop?.sector
  const config = useMemo(
    () => getThemeWithCustomColors(sector, 'cosmika', publicShop?.customColors),
    [sector, publicShop?.customColors]
  )
  const { colors, hero: heroConfig } = config
  const ctaButtonText = getCtaButton(sector)
  const whatsappMsg = getCtaWhatsAppMessage(sector)
  const sectorLabels = getSectorLabels(sector)
  const isServiceMode = config.businessType === 'SERVICE'
  const isConsulting = !!config.hero.showConsultantPhoto

  // ── Scroll tracking for header ──
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Scroll to top on product select ──
  useEffect(() => {
    if (selectedProduct) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedProduct])

  // ── URL-based product navigation ──
  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product)
    const slug = useAppStore.getState().shopSlug
    if (product?.slug && slug) {
      window.history.pushState(null, '', `/${slug}/p/${product.slug || product.id}`)
    }
  }, [])

  const handleBackFromProduct = useCallback(() => {
    setSelectedProduct(null)
    const slug = useAppStore.getState().shopSlug
    if (slug) window.history.pushState(null, '', `/${slug}`)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname
      const match = pathname.match(/^\/([a-z0-9][a-z0-9-]*)\/p\/([a-z0-9][a-z0-9-]*)$/i)
      if (match) {
        const found = publicProducts.find((p: Product) => (p.slug || p.id) === match[2])
        setSelectedProduct(found ?? null)
      } else {
        setSelectedProduct(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [publicProducts])

  // ── Fetch shop data ──
  const fetchShop = useCallback(async () => {
    if (!shopSlug) return
    setLoading(true)
    try {
      const shopRes = await fetch(`/api/shops/${shopSlug}`)
      if (!shopRes.ok) return
      const shopData = await shopRes.json()
      setPublicShop(shopData)
      fetch(`/api/shops/${shopSlug}/visit`, { method: 'POST' }).catch(() => {})
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/shops/${shopSlug}/products`),
        fetch(`/api/shops/${shopSlug}/categories`),
      ])
      if (prodRes.ok) setPublicProducts(await prodRes.json())
      if (catRes.ok) setPublicCategories(await catRes.json())
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [shopSlug, setPublicShop, setPublicProducts, setPublicCategories])

  useEffect(() => { fetchShop() }, [fetchShop])

  // ── Filter & sort ──
  const filteredProducts = useMemo(() => {
    let products = publicProducts.filter((p) => p.isAvailable)
    if (activeCategory) {
      products = products.filter((p) => p.categoryId === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
      )
    }
    switch (sortBy) {
      case 'price-asc': products = [...products].sort((a, b) => a.price - b.price); break
      case 'price-desc': products = [...products].sort((a, b) => b.price - a.price); break
    }
    return products
  }, [publicProducts, activeCategory, searchQuery, sortBy])

  // ── Separate Best Sellers and New Arrivals (e-commerce only) ──
  const { bestSellers, newArrivals, regularProducts } = useMemo(() => {
    if (isServiceMode || isConsulting) {
      return { bestSellers: [] as Product[], newArrivals: [] as Product[], regularProducts: filteredProducts }
    }
    const now = Date.now()
    const sevenDays = 7 * 24 * 60 * 60 * 1000

    const newOnes = filteredProducts.filter(
      (p) => p.createdAt && (now - new Date(p.createdAt).getTime()) < sevenDays
    )
    // Best sellers = products with highest price (placeholder logic — real would use order data)
    const allSorted = [...filteredProducts].sort((a, b) => b.price - a.price)
    const top4 = allSorted.slice(0, 4)

    // Regular = everything except those in best sellers (by id)
    const bestIds = new Set(top4.map((p) => p.id))
    const regular = filteredProducts.filter((p) => !bestIds.has(p.id))

    return { bestSellers: top4, newArrivals: newOnes, regularProducts: regular }
  }, [filteredProducts, isServiceMode, isConsulting])

  const total = getCartTotal()
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalProductCount = publicProducts.filter((p) => p.isAvailable).length
  const isSearching = searchQuery.trim().length > 0

  // ── Handlers ──
  function handleAddToCart(product: Product, _qty: number = 1) {
    const cartImage = (product.images && product.images[0]) || product.image || undefined
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: cartImage,
      quantity: 1,
    })
    toast.success(`${product.name} ajouté au panier`)
  }

  function getCartQuantity(productId: string): number {
    return cart.find((c) => c.productId === productId)?.quantity || 0
  }

  function handleCategoryClick(categoryId: string | null) {
    setActiveCategory(categoryId)
    if (categoryId) {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  function handleWhatsAppCheckout() {
    if (!publicShop) return
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const itemsText = cart
      .map((c) => {
        const productUrl = shopSlug ? `${baseUrl}/${shopSlug}?product=${c.productId}` : ''
        const linkLine = productUrl ? `\n   🔗 ${productUrl}` : ''
        return `🛍 ${c.name} x${c.quantity} — ${(c.price * c.quantity).toLocaleString('fr-FR')} FCFA${linkLine}`
      })
      .join('\n')
    const msg = `Bonjour ${publicShop.name} ! 👋\n\nJe souhaite commander :\n\n${itemsText}\n\n━━━━━━━━━━━━━━\n💰 Total : ${total.toLocaleString('fr-FR')} FCFA\n\n📝 Mes informations :\nNom :\nAdresse :\nTéléphone :\n\nMerci ! 🙏`
    const encoded = encodeURIComponent(msg)
    const phone = publicShop.whatsapp?.replace(/\D/g, '') || ''
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  // ── Loading state ──
  if (loading) return <EleganceLoadingSkeleton />

  // ── Shop not found ──
  if (!publicShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-4" style={{ background: colors.primaryBg }}>
            <Package className="size-10" style={{ color: colors.primary }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Boutique introuvable</h2>
          <p className="text-sm mb-4 text-gray-500">Cette boutique n&apos;existe pas ou a été désactivée.</p>
          <Button onClick={() => { window.history.pushState(null, '', '/'); setView('landing') }} className="font-semibold rounded-xl" style={{ background: colors.primary, color: colors.ctaText }}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    )
  }

  // ── Main render ──
  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.background, color: colors.text }}>
      {/* ═══ ANNOUNCEMENT BAR ═══ */}
      <EleganceAnnouncementBar shop={publicShop} primaryColor={colors.primary} />

      {/* ═══ HEADER ═══ */}
      <EleganceHeader
        config={config}
        shop={publicShop}
        cartCount={itemCount}
        onCartClick={() => setCartExpanded(!cartExpanded)}
        onSearchClick={() => setSearchOpen(!searchOpen)}
        isScrolled={isScrolled}
      />

      <main className="flex-1">
        <LiveShopFeatures />

        <AnimatePresence mode="wait" initial={false}>
          {selectedProduct ? (
            <ProductDetail
              key={selectedProduct.id}
              product={selectedProduct}
              shop={publicShop}
              config={config}
              categoryName={publicCategories.find((c) => c.id === selectedProduct.categoryId)?.name}
              onClose={handleBackFromProduct}
              onAddToCart={(product, qty) => { for (let i = 0; i < qty; i++) handleAddToCart(product, 1) }}
              cartQty={getCartQuantity(selectedProduct.id)}
              updateCartQuantity={updateCartQuantity}
            />
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* ═══ HERO ═══ */}
              <EleganceHero config={config} shop={publicShop} />

              {/* ═══ CATEGORIES / EXPERTISES ═══ */}
              {isConsulting ? (
                <EleganceExpertises
                  categories={publicCategories}
                  config={config}
                  activeCategoryId={activeCategory}
                  onCategoryClick={handleCategoryClick}
                />
              ) : (
                <EleganceCategories
                  categories={publicCategories}
                  config={config}
                  activeCategoryId={activeCategory}
                  onCategoryClick={handleCategoryClick}
                />
              )}

              {/* ═══ APPROACH (consulting only) ═══ */}
              {isConsulting && <EleganceApproach config={config} />}

              {/* ═══ TRUST BADGES ═══ */}
              <EleganceTrustBadges config={config} />

              {/* ═══ BEST SELLERS (e-commerce, non-consulting, when enough products) ═══ */}
              {!isServiceMode && !isConsulting && bestSellers.length >= 4 && (
                <section id="best-sellers" className="py-16 md:py-20 px-4" style={{ backgroundColor: colors.primaryBg }}>
                  <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block font-semibold text-sm tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4"
                        style={{ color: colors.primary, backgroundColor: 'white' }}
                      >
                        POPULAIRES
                      </motion.span>
                      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                        Meilleures Ventes
                      </h2>
                      <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: colors.primary }} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      {bestSellers.map((product) => (
                        <EleganceProductCard
                          key={`bs-${product.id}`}
                          product={product}
                          config={config}
                          shop={publicShop}
                          onProductClick={handleProductClick}
                          onAddToCart={(p, q) => handleAddToCart(p, q)}
                          variant="best-seller"
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ═══ PROMOTIONAL BANNER ═══ */}
              {!isConsulting && (
                <ElegancePromotionalBanner config={config} shop={publicShop} />
              )}

              {/* ═══ NEW ARRIVALS (e-commerce, when available) ═══ */}
              {!isServiceMode && !isConsulting && newArrivals.length > 0 && (
                <section id="new-arrivals" className="py-16 md:py-20 px-4 bg-white">
                  <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block font-semibold text-sm tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4"
                        style={{ color: colors.primary, backgroundColor: colors.primaryBg }}
                      >
                        NOUVEAUTÉS
                      </motion.span>
                      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                        Derniers arrivages
                      </h2>
                      <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: colors.primary }} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      {newArrivals.slice(0, 8).map((product) => (
                        <EleganceProductCard
                          key={`new-${product.id}`}
                          product={product}
                          config={config}
                          shop={publicShop}
                          onProductClick={handleProductClick}
                          onAddToCart={(p, q) => handleAddToCart(p, q)}
                          variant="new-arrival"
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ═══ PRODUCTS SECTION ═══ */}
              <section id="products" className="py-16 md:py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                  {/* Section heading */}
                  <div className="text-center mb-12">
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="inline-block font-semibold text-sm tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4"
                      style={{ color: colors.primary, backgroundColor: colors.primaryBg }}
                    >
                      {heroConfig.defaultTagline}
                    </motion.span>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                      {config.productsSectionTitle}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      {filteredProducts.length} article{filteredProducts.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Search bar */}
                  {totalProductCount > 4 && (
                    <div className="max-w-md mx-auto mb-8 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                      <input
                        type="search"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-10 h-12 rounded-xl border text-sm focus:outline-none focus:ring-2 transition shadow-sm"
                        style={{ borderColor: colors.primaryLight, '--tw-ring-color': colors.primary } as React.CSSProperties}
                        aria-label="Rechercher"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Effacer">
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Sort bar */}
                  {totalProductCount > 6 && (
                    <div className="flex justify-center gap-2 mb-8">
                      {([
                        { key: 'recent', label: 'Plus récents' },
                        { key: 'price-asc', label: 'Prix ↑' },
                        { key: 'price-desc', label: 'Prix ↓' },
                      ] as const).map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setSortBy(opt.key)}
                          className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 border"
                          style={{
                            background: sortBy === opt.key ? colors.primary : 'transparent',
                            color: sortBy === opt.key ? colors.ctaText : colors.text,
                            borderColor: sortBy === opt.key ? colors.primary : colors.primaryLight,
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Search loading skeletons */}
                  {isSearching && filteredProducts.length === 0 && publicProducts.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2 rounded-2xl overflow-hidden">
                          <Skeleton className="w-full aspect-square rounded-2xl" />
                          <Skeleton className="h-5 w-3/4 mx-4" />
                          <Skeleton className="h-4 w-1/2 mx-4 mb-4" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {!isSearching && publicProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: colors.primaryBg }}>
                        <Package className="size-10" style={{ color: colors.primary }} />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                        {isServiceMode ? 'Aucun service disponible' : 'Aucun produit disponible'}
                      </h3>
                      <p className="mt-1 text-sm max-w-md text-gray-500">
                        Cette boutique n&apos;a pas encore de {isServiceMode ? 'services' : 'produits'}. Revenez bientôt !
                      </p>
                    </div>
                  )}

                  {/* Empty search results */}
                  {filteredProducts.length === 0 && publicProducts.length > 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-amber-50">
                        <Search className="size-7 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: colors.text }}>Aucun résultat trouvé</h3>
                      <p className="mt-1 text-sm max-w-md text-gray-500">
                        {searchQuery
                          ? `Aucun ${isServiceMode ? 'service' : 'produit'} ne correspond à "${searchQuery}".`
                          : 'Aucun résultat dans cette catégorie.'}
                      </p>
                      <Button variant="outline" size="sm" className="mt-4 rounded-xl" style={{ borderColor: colors.primary, color: colors.primary }} onClick={() => { setSearchQuery(''); setActiveCategory(null) }}>
                        Réinitialiser les filtres
                      </Button>
                    </motion.div>
                  )}

                  {/* Product grid */}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeCategory + searchQuery + sortBy}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                      ref={productsRef}
                    >
                      {filteredProducts.map((product) => (
                        <EleganceProductCard
                          key={product.id}
                          product={product}
                          config={config}
                          shop={publicShop}
                          onProductClick={handleProductClick}
                          onAddToCart={(p, q) => handleAddToCart(p, q)}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>

              {/* ═══ NEWSLETTER ═══ */}
              <EleganceNewsletter config={config} shop={publicShop} />

              {/* ═══ CONSULTING-ONLY SECTIONS ═══ */}
              {isConsulting && (
                <>
                  <EleganceWhyChooseUs config={config} />
                  <EleganceAbout config={config} shop={publicShop} />
                  <EleganceContact config={config} shop={publicShop} />
                </>
              )}

              {/* ═══ TESTIMONIALS ═══ */}
              {/* NOTE: When testimonials API is added, fetch here and pass to EleganceTestimonials */}

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ FOOTER ═══ */}
      <EleganceFooter config={config} shop={publicShop} />

      {/* ═══ SCROLL TO TOP ═══ */}
      <EleganceScrollToTop config={config} />

      {/* ═══ CART BAR (e-commerce only) ═══ */}
      {!isServiceMode && (
        <AnimatePresence>
          {cart.length > 0 && (
            <ThemedCartDrawer
              cart={cart}
              expanded={cartExpanded}
              onToggle={() => setCartExpanded(!cartExpanded)}
              onClear={clearCart}
              onCheckout={handleWhatsAppCheckout}
              total={total}
              itemCount={itemCount}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
              theme={{
                text: colors.text,
                textMuted: colors.text,
                price: colors.primary,
                bg: colors.ctaBg,
                bgExpanded: '#ffffff',
                border: colors.primaryLight,
                primary: colors.primary,
                primaryLight: colors.primaryLight,
                whatsapp: colors.primary,
                whatsappFg: '#ffffff',
                shadow: '0 -4px 20px rgba(0,0,0,0.12)',
                roundedItem: 'rounded-xl',
                roundedBtn: 'rounded-xl',
              }}
            />
          )}
        </AnimatePresence>
      )}

      {/* ═══ FLOATING WHATSAPP ═══ */}
      {publicShop.whatsapp && (
        <a
          href={`https://wa.me/${publicShop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
            `Bonjour ${publicShop.name} ! 👋\nJe suis intéressé(e) par vos ${isServiceMode ? 'services' : 'produits'}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group ${!isServiceMode && cart.length > 0 ? 'bottom-[90px]' : ''}`}
          style={{ background: '#25D366' }}
          title={`Contacter ${publicShop.name} sur WhatsApp`}
        >
          <MessageCircle className="size-7 text-white" />
          <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gray-800 text-white">
            {isServiceMode ? 'Demander un devis' : 'Commander'}
          </span>
        </a>
      )}

      {/* Bottom padding when cart is visible */}
      {!isServiceMode && cart.length > 0 && <div className="h-[60px]" />}
    </div>
  )
}

export default ElegancePlusTemplate