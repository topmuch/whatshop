'use client'

import { useAppStore, type Product } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import { useTemplate } from './template-provider'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ShoppingCart,
  MessageCircle,
  Minus,
  Plus,
  Trash2,
  Package,
  Search,
  X,
  Flame,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Phone,
  MapPin,
  Store,
  AlertTriangle,
  ShoppingBag,
  Crown,
  Zap,
  Heart,
  Gem,
  Palette,
  Waves,
  Sun,
  Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { ShopHeroCarousel } from './shop-hero-carousel'
import { TemplateProvider } from './template-provider'
import { LiveShopFeatures } from './live-shop-features'
import { JameelaGrid } from './themes/jameela-grid'
import { FashionGrid } from './themes/fashion-grid'
import { ElectroShopPage } from './themes/electro-grid'
import { GroceryGrid } from './themes/grocery-grid'
import { ElectroDepotGrid } from './themes/electrodepot-grid'
import { LuxeFashionShopPage } from './themes/luxe-fashion-grid'
import { TikTokLiveShopPage } from './themes/tiktok-live-grid'
import { BeautyPremiumShopPage } from './themes/beauty-premium-grid'

type SortOption = 'recent' | 'price-asc' | 'price-desc'

function isProductNew(createdAt?: string): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt)
  const now = new Date()
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}

function isProductPromo(price: number): boolean {
  return price < 5000
}

function getCategoryCount(products: Product[], categoryId?: string): number {
  return products.filter((p) => p.categoryId === categoryId && p.isAvailable).length
}

/* ─── Template-specific decorative patterns ─── */
function DecorativeBackground({ pattern, gradientBg }: { pattern: string; gradientBg: string | null }) {
  if (pattern === 'dots') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--tpl-primary) 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
          opacity: 0.04,
        }}
      />
    )
  }
  if (pattern === 'kente') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, var(--tpl-primary), var(--tpl-primary) 1px, transparent 1px, transparent 12px),
            repeating-linear-gradient(-45deg, var(--tpl-accent), var(--tpl-accent) 1px, transparent 1px, transparent 12px)
          `,
          opacity: 0.03,
        }}
      />
    )
  }
  if (pattern === 'waves') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%230891B2' fill-opacity='0.03' d='M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom',
          backgroundSize: '100% auto',
        }}
      />
    )
  }
  if (pattern === 'gradient' && gradientBg) {
    return <div className="absolute inset-0 pointer-events-none z-0" style={{ background: gradientBg }} />
  }
  if (pattern === 'lines') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, var(--tpl-border) 0px, var(--tpl-border) 1px, transparent 1px, transparent 40px)`,
          opacity: 0.3,
        }}
      />
    )
  }
  return null
}

/* ─── Template-specific decorative divider ─── */
function DecorativeDivider({ style }: { style: string }) {
  if (style === 'dots') {
    return (
      <div className="flex items-center justify-center gap-1.5 py-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--tpl-border)' }} />
        ))}
      </div>
    )
  }
  if (style === 'gradient') {
    return (
      <div className="h-px mx-4" style={{ background: 'linear-gradient(90deg, transparent, var(--tpl-primary), transparent)' }} />
    )
  }
  return <div className="border-b" style={{ borderColor: 'var(--tpl-border)' }} />
}

/* ─── Template Badge component ─── */
function TemplateBadge({ children, type, style }: { children: React.ReactNode; type: 'new' | 'promo'; style: string }) {
  if (style === 'tag') {
    return (
      <span
        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5"
        style={{
          background: type === 'new' ? 'var(--tpl-badge-new)' : 'var(--tpl-badge-promo)',
          color: '#ffffff',
        }}
      >
        {children}
      </span>
    )
  }
  return (
    <Badge
      className="text-white text-[10px] px-1.5 py-0 h-5 font-medium gap-0.5"
      style={{ background: type === 'new' ? 'var(--tpl-badge-new)' : 'var(--tpl-badge-promo)' }}
    >
      {children}
    </Badge>
  )
}

/* ─── Template Category Button ─── */
function TemplateCategoryButton({
  label,
  count,
  active,
  onClick,
  style,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
  style: string
}) {
  if (style === 'underline') {
    return (
      <button
        onClick={onClick}
        className="shrink-0 text-sm font-medium transition-all duration-200 pb-1"
        style={{
          color: active ? 'var(--tpl-text)' : 'var(--tpl-text-muted)',
          borderBottom: active ? '2px solid var(--tpl-primary)' : '2px solid transparent',
        }}
      >
        {label}
        {count !== undefined && <span className="ml-1 text-xs opacity-60">({count})</span>}
      </button>
    )
  }
  if (style === 'button') {
    return (
      <button
        onClick={onClick}
        className="shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
        style={
          active
            ? { background: 'var(--tpl-filter-active)', color: 'var(--tpl-filter-active-fg)' }
            : { background: 'var(--tpl-card)', color: 'var(--tpl-text-muted)', border: '1px solid var(--tpl-border)' }
        }
      >
        {label}
        {count !== undefined && (
          <span className="ml-1.5 text-xs" style={{ opacity: 0.7 }}>
            {count}
          </span>
        )}
      </button>
    )
  }
  // pill (default)
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
      style={
        active
          ? { background: 'var(--tpl-filter-active)', color: 'var(--tpl-filter-active-fg)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
          : { background: 'var(--tpl-card)', color: 'var(--tpl-text-muted)', border: '1px solid var(--tpl-border)' }
      }
    >
      {label}
      {count !== undefined && (
        <span className="text-xs" style={{ opacity: 0.7 }}>
          {count}
        </span>
      )}
    </button>
  )
}

/* ─── Template Price Display ─── */
function TemplatePrice({ price, style }: { price: number; style: string }) {
  if (style === 'elegant') {
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--tpl-text-muted)' }}>
          Prix
        </span>
        <span className="text-sm font-bold" style={{ color: 'var(--tpl-price)' }}>
          {formatPrice(price)}
        </span>
      </div>
    )
  }
  if (style === 'minimal') {
    return (
      <span className="text-sm font-semibold" style={{ color: 'var(--tpl-text)' }}>
        {formatPrice(price)}
      </span>
    )
  }
  if (style === 'beauty-elegant') {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="text-[9px] uppercase tracking-[0.15em] font-medium" style={{ color: 'var(--tpl-text-muted)' }}>
          à partir de
        </span>
        <span className="text-sm font-bold" style={{ color: 'var(--tpl-price)' }}>
          {formatPrice(price)}
        </span>
      </div>
    )
  }
  if (style === 'tag') {
    return (
      <span
        className="inline-block text-xs font-bold px-2 py-0.5 rounded"
        style={{ background: 'var(--tpl-price)', color: 'var(--tpl-primary-fg)' }}
      >
        {formatPrice(price)}
      </span>
    )
  }
  // bold (default)
  return (
    <p className="font-bold text-sm" style={{ color: 'var(--tpl-price)' }}>
      {formatPrice(price)}
    </p>
  )
}

/* ─── Template CTA Button ─── */
function TemplateCtaButton({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode
  onClick: () => void
  style: string
}) {
  const baseClass = 'w-full text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1'
  if (style === 'pill') {
    return (
      <button
        className={`${baseClass} rounded-full py-2`}
        style={{ background: 'var(--tpl-cta-bg)', color: 'var(--tpl-cta-fg)' }}
        onClick={onClick}
      >
        {children}
      </button>
    )
  }
  if (style === 'rounded') {
    return (
      <button
        className={`${baseClass} rounded-lg py-2`}
        style={{ background: 'var(--tpl-cta-bg)', color: 'var(--tpl-cta-fg)' }}
        onClick={onClick}
      >
        {children}
      </button>
    )
  }
  if (style === 'ghost') {
    return (
      <button
        className={`${baseClass} py-2 border`}
        style={{ borderColor: 'var(--tpl-border)', color: 'var(--tpl-text)' }}
        onClick={onClick}
      >
        {children}
      </button>
    )
  }
  // filled (default)
  return (
    <Button
      size="sm"
      className={`w-full h-8 gap-1 ${baseClass}`}
      style={{ background: 'var(--tpl-cta-bg)', color: 'var(--tpl-cta-fg)' }}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

/* ─── Inner Shop Content (has access to template context) ─── */
function ShopContent({ initialProductSlug }: { initialProductSlug?: string }) {
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
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    clearCart,
  } = useAppStore()

  const template = useTemplate()
  const { layout, cardStyle, decorative, colors } = template

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [cartExpanded, setCartExpanded] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [detailQty, setDetailQty] = useState(1)
  const [detailImageIndex, setDetailImageIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ─── URL-based product navigation ───
  const selectProductWithUrl = useCallback((product: Product | null) => {
    setSelectedProduct(product)
    if (product && shopSlug) {
      const slug = product.slug || product.id
      window.history.pushState(null, '', `/${shopSlug}/p/${slug}`)
    }
  }, [shopSlug])

  const deselectProductWithUrl = useCallback(() => {
    setSelectedProduct(null)
    if (shopSlug) {
      window.history.pushState(null, '', `/${shopSlug}`)
    }
  }, [shopSlug])

  // Open product from URL (deep link / shared link)
  useEffect(() => {
    if (!initialProductSlug || !publicProducts.length) return
    const product = publicProducts.find((p) => (p.slug || p.id) === initialProductSlug)
    if (product) {
      setSelectedProduct(product)
    }
  }, [initialProductSlug, publicProducts.length])

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname
      const match = pathname.match(/^\/([a-z0-9][a-z0-9-]*)\/p\/([a-z0-9][a-z0-9-]*)$/i)
      if (match) {
        const productSlug = match[2]
        const product = publicProducts.find((p) => (p.slug || p.id) === productSlug)
        if (product) {
          setSelectedProduct(product)
        } else {
          setSelectedProduct(null)
        }
      } else {
        setSelectedProduct(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [publicProducts])

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
      // Error loading
    } finally {
      setLoading(false)
    }
  }, [shopSlug, setPublicShop, setPublicProducts, setPublicCategories])

  useEffect(() => {
    fetchShop()
  }, [fetchShop])

  const filteredProducts = useMemo(() => {
    let products = publicProducts.filter((p) => p.isAvailable)
    if (activeCategory) products = products.filter((p) => p.categoryId === activeCategory)
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
      case 'price-asc':
        products = [...products].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        products = [...products].sort((a, b) => b.price - a.price)
        break
    }
    return products
  }, [publicProducts, activeCategory, searchQuery, sortBy])

  const total = getCartTotal()
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  function handleAddToCart(product: Product) {
    const cartImage = (product.images && product.images[0]) || product.image || undefined
    addToCart({ productId: product.id, name: product.name, price: product.price, image: cartImage, quantity: 1 })
    toast.success(`${product.name} ajouté au panier`)
  }

  function getCartQuantity(productId: string): number {
    return cart.find((c) => c.productId === productId)?.quantity || 0
  }

  function handleWhatsAppCheckout() {
    if (!publicShop) return
    const itemsText = cart.map((c) => `🛍 ${c.name} x${c.quantity} — ${(c.price * c.quantity).toLocaleString('fr-FR')} FCFA`).join('\n')
    const msg = `Bonjour ${publicShop.name} ! 👋\n\nJe souhaite commander :\n\n${itemsText}\n\n━━━━━━━━━━━━━━\n💰 Total : ${total.toLocaleString('fr-FR')} FCFA\n\n📝 Mes informations :\nNom :\nAdresse :\nTéléphone :\n\nMerci ! 🙏`
    const encoded = encodeURIComponent(msg)
    const phone = publicShop.whatsapp?.replace(/\D/g, '') || ''
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  function handleCategoryClick(categoryId: string | null) {
    setActiveCategory(categoryId)
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Scroll to top & reset qty when selecting a product
  useEffect(() => {
    if (selectedProduct) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setDetailQty(1)
      setDetailImageIndex(0)
    }
  }, [selectedProduct])

  // Derive all product images: images array first, fallback to single image
  function getProductImages(product: Product): string[] {
    if (product.images && product.images.length > 0) {
      return product.images
    }
    if (product.image) {
      return [product.image]
    }
    return []
  }

  function handleSingleProductWhatsApp(product: Product, qty: number) {
    if (!publicShop) return
    const itemText = `\ud83d\uded2 ${product.name} x${qty} \u2014 ${(product.price * qty).toLocaleString('fr-FR')} FCFA`
    const msg = `Bonjour ${publicShop.name} ! \ud83d\udc4b\n\nJe souhaite commander :\n\n${itemText}\n\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\ud83d\udcb0 Total : ${(product.price * qty).toLocaleString('fr-FR')} FCFA\n\n\ud83d\udcdd Mes informations :\nNom :\nAdresse :\nT\u00e9l\u00e9phone :\n\nMerci ! \ud83d\ude4f`
    const encoded = encodeURIComponent(msg)
    const phone = publicShop.whatsapp?.replace(/\D/g, '') || ''
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  // Template-specific icon for header
  const templateIcon = useMemo(() => {
    const icons: Record<string, React.ReactNode> = {
      classic: <Store className="h-5 w-5" />,
      africa: <Globe className="h-5 w-5" />,
      minimal: <Zap className="h-5 w-5" />,
      elegant: <Crown className="h-5 w-5" />,
      neon: <Zap className="h-5 w-5" />,
      rose: <Heart className="h-5 w-5" />,
      ocean: <Waves className="h-5 w-5" />,
      sunset: <Sun className="h-5 w-5" />,
      jameela: <Gem className="h-5 w-5" />,
      'xstore-fashion': <Heart className="h-5 w-5" />,
      'xstore-electro': <Zap className="h-5 w-5" />,
      'xstore-grocery': <Globe className="h-5 w-5" />, electrodepot: <Zap className="h-5 w-5" />,
    }
    return icons[template.id] || <Store className="h-5 w-5" />
  }, [template.id])

  // ── Full-page custom templates render their own complete layout ──
  // Early returns after ALL hooks to satisfy React rules-of-hooks.
  if (template.id === 'xstore-electro') {
    return <ElectroShopPage />
  }
  if (template.id === 'luxe-fashion') {
    return <LuxeFashionShopPage />
  }
  if (template.id === 'tiktok-live') {
    return <TikTokLiveShopPage />
  }
  if (template.id === 'beauty-premium') {
    return <BeautyPremiumShopPage />
  }

  // ── Loading state: minimal spinner instead of visible skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative size-10">
            <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Boutiko</p>
        </motion.div>
      </div>
    )
  }

  // ── Shop not found ──
  if (!publicShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Boutique introuvable</h2>
          <p className="text-muted-foreground mb-4">Cette boutique n&apos;existe pas ou a été désactivée.</p>
          <Button onClick={() => setView('landing')}>Retour à l&apos;accueil</Button>
        </Card>
      </div>
    )
  }

  const totalProductCount = publicProducts.filter((p) => p.isAvailable).length
  const isSearching = searchQuery.trim().length > 0

  return (
    <motion.div
      className="min-h-screen pb-20 relative"
      style={{ background: 'var(--tpl-bg)', color: 'var(--tpl-text)' }}
    >
      {/* Decorative background pattern */}
      <DecorativeBackground pattern={decorative.pattern} gradientBg={decorative.gradientBg} />

      {/* ─── TikTok Live Features (Banner, Flash Pin, Lead Capture) ─── */}
      <LiveShopFeatures />

      {/* ─── Sticky Header ─── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-sm border-b"
        style={{
          background: 'var(--tpl-header-bg)',
          borderColor: 'var(--tpl-border)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => selectedProduct ? deselectProductWithUrl() : setView('landing')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-9 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 relative"
            onClick={() => cart.length > 0 && setCartExpanded(!cartExpanded)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center"
                style={{ background: 'var(--tpl-primary)', color: 'var(--tpl-primary-fg)' }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* ─── Hero Carousel ─── */}
      <ShopHeroCarousel
        shopName={publicShop.name}
        whatsapp={publicShop.whatsapp}
        heroImages={publicShop.heroImages}
      />

      {/* ─── Promo Banners ─── */}
      {(() => {
        try {
          const banners = publicShop.promoBanners ? JSON.parse(publicShop.promoBanners) : []
          if (!Array.isArray(banners) || banners.length === 0) return null
          return (
            <div className="max-w-5xl mx-auto px-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {banners.map((b: { id: string; image: string; title: string; link: string }, idx: number) => (
                  <a
                    key={b.id || idx}
                    href={b.link || '#'}
                    target={b.link ? '_blank' : undefined}
                    rel={b.link ? 'noopener noreferrer' : undefined}
                    className={`block rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow ${banners.length === 1 ? 'sm:col-span-2' : ''}`}
                    style={{ borderColor: 'var(--tpl-border)' }}
                  >
                    <div className="relative aspect-[16/5]">
                      <img
                        src={b.image}
                        alt={b.title || `Promo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {b.title && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-2">
                          <span className="text-white text-sm font-medium">{b.title}</span>
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )
        } catch {
          return null
        }
      })()}

      {/* ─── Shop Info Bar (template-specific styles) ─── */}
      {layout.headerStyle === 'centered' ? (
        <div className="text-center px-4 py-5" style={{ borderBottom: '1px solid var(--tpl-border)' }}>
          <div className="max-w-5xl mx-auto">
            {publicShop.logo ? (
              <img
                src={publicShop.logo}
                alt={publicShop.name}
                className="w-14 h-14 rounded-2xl object-cover shadow-sm mx-auto mb-3"
              />
            ) : (
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-sm mx-auto mb-3"
                style={{ background: 'var(--tpl-primary)', color: 'var(--tpl-primary-fg)' }}
              >
                {templateIcon}
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-bold">{publicShop.name}</h1>
            {publicShop.description && (
              <p className="text-sm mt-1 max-w-lg mx-auto" style={{ color: 'var(--tpl-text-muted)' }}>
                {publicShop.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: 'var(--tpl-text-muted)' }}>
              {publicShop.whatsapp && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" style={{ color: 'var(--tpl-primary)' }} />
                  WhatsApp
                </span>
              )}
              {publicShop.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {publicShop.phone}
                </span>
              )}
              {publicShop.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {publicShop.address}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : layout.headerStyle === 'minimal' ? (
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--tpl-border)' }}>
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--tpl-text-muted)' }}>
              Boutique
            </span>
            <span className="text-xs" style={{ color: 'var(--tpl-border)' }}>/</span>
            <h1 className="text-sm font-semibold">{publicShop.name}</h1>
          </div>
        </div>
      ) : layout.headerStyle === 'dark' ? (
        <div
          className="px-4 py-4"
          style={{ background: 'var(--tpl-card)', borderBottom: '1px solid var(--tpl-border)' }}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {publicShop.logo ? (
                <img
                  src={publicShop.logo}
                  alt={publicShop.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ background: 'var(--tpl-primary)', color: 'var(--tpl-primary-fg)' }}
                >
                  {templateIcon}
                </div>
              )}
              <div>
                <h1 className="text-base font-bold">{publicShop.name}</h1>
                {publicShop.description && (
                  <p className="text-xs" style={{ color: 'var(--tpl-text-muted)' }}>
                    {publicShop.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--tpl-text-muted)' }}>
              {publicShop.whatsapp && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" style={{ color: 'var(--tpl-primary)' }} />
                </span>
              )}
              {publicShop.address && (
                <span className="hidden md:flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {publicShop.address}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : layout.headerStyle === 'luxury-dark' ? (
        <div className="px-4 py-6" style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}>
          <div className="max-w-5xl mx-auto text-center">
            {publicShop.logo ? (
              <img
                src={publicShop.logo}
                alt={publicShop.name}
                className="w-14 h-14 rounded-2xl object-cover shadow-sm mx-auto mb-3"
              />
            ) : (
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-sm mx-auto mb-3"
                style={{ background: '#C8A882', color: '#1a1a1a' }}
              >
                {templateIcon}
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">{publicShop.name}</h1>
            {publicShop.description && (
              <p className="text-sm mt-1.5 max-w-lg mx-auto" style={{ color: '#999' }}>
                {publicShop.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-5 mt-3 text-xs" style={{ color: '#999' }}>
              {publicShop.whatsapp && (
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" style={{ color: '#C8A882' }} />
                  <span>WhatsApp</span>
                </span>
              )}
              {publicShop.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {publicShop.phone}
                </span>
              )}
              {publicShop.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {publicShop.address}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : layout.headerStyle === 'fashion-clean' ? (
        <div className="px-4 py-5" style={{ background: '#ffffff', borderBottom: '1px solid #e8e8e8' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {publicShop.logo ? (
                <img
                  src={publicShop.logo}
                  alt={publicShop.name}
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div
                  className="flex items-center justify-center w-10 h-10 rounded"
                  style={{ background: '#C8102E', color: '#ffffff' }}
                >
                  {templateIcon}
                </div>
              )}
              <div>
                <h1 className="text-base font-bold" style={{ color: '#222222' }}>{publicShop.name}</h1>
                {publicShop.description && (
                  <p className="text-xs" style={{ color: '#777' }}>
                    {publicShop.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#777' }}>
              {publicShop.whatsapp && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" style={{ color: '#C8102E' }} />
                  <span className="hidden sm:inline">WhatsApp</span>
                </span>
              )}
              {publicShop.address && (
                <span className="hidden md:flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {publicShop.address}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : layout.headerStyle === 'electro-tech' ? (
        <div className="px-4 py-4" style={{ background: '#ffffff', borderBottom: '2px solid #10B981' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {publicShop.logo ? (
                <img
                  src={publicShop.logo}
                  alt={publicShop.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ background: '#10B981', color: '#ffffff' }}
                >
                  {templateIcon}
                </div>
              )}
              <div>
                <h1 className="text-base font-bold" style={{ color: '#1e293b' }}>{publicShop.name}</h1>
                {publicShop.description && (
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    {publicShop.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#64748b' }}>
              {publicShop.whatsapp && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" style={{ color: '#10B981' }} />
                  <span className="hidden sm:inline">WhatsApp</span>
                </span>
              )}
              {publicShop.address && (
                <span className="hidden md:flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {publicShop.address}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : layout.headerStyle === 'grocery-fresh' ? (
        <div className="px-4 py-4" style={{ background: '#00A651', borderBottom: '2px solid #008c44' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {publicShop.logo ? (
                <img
                  src={publicShop.logo}
                  alt={publicShop.name}
                  className="w-10 h-10 rounded-lg object-cover border-2 border-white/30"
                />
              ) : (
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
                >
                  {templateIcon}
                </div>
              )}
              <div>
                <h1 className="text-base font-bold text-white">{publicShop.name}</h1>
                {publicShop.description && (
                  <p className="text-xs text-white/80">
                    {publicShop.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              {publicShop.whatsapp && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </span>
              )}
              {publicShop.address && (
                <span className="hidden md:flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {publicShop.address}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : layout.headerStyle === 'gradient' ? (
        <div className="px-4 py-5" style={{ background: 'var(--tpl-primary)', borderBottom: '2px solid var(--tpl-accent)' }}>
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            {publicShop.logo ? (
              <img
                src={publicShop.logo}
                alt={publicShop.name}
                className="w-12 h-12 rounded-xl object-cover shadow-md border-2"
                style={{ borderColor: 'var(--tpl-accent)' }}
              />
            ) : (
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl shadow-md"
                style={{ background: 'var(--tpl-primary-fg)', color: 'var(--tpl-primary)' }}
              >
                {templateIcon}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--tpl-primary-fg)' }}>
                {publicShop.name}
              </h1>
              {publicShop.description && (
                <p className="text-xs opacity-80" style={{ color: 'var(--tpl-primary-fg)' }}>
                  {publicShop.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // standard header
        <div className="border-b" style={{ background: 'var(--tpl-primary)', opacity: 0.06, borderColor: 'var(--tpl-border)' }}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {publicShop.logo ? (
                <img src={publicShop.logo} alt={publicShop.name} className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0" />
              ) : (
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg shadow-sm shrink-0"
                  style={{ background: 'var(--tpl-primary)', color: 'var(--tpl-primary-fg)' }}
                >
                  {templateIcon}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold truncate">{publicShop.name}</h1>
                {publicShop.description && (
                  <p className="text-xs text-muted-foreground truncate hidden sm:block">{publicShop.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs shrink-0" style={{ color: 'var(--tpl-text-muted)' }}>
              {publicShop.whatsapp && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" style={{ color: 'var(--tpl-primary)' }} />
                  <span className="hidden sm:inline">WhatsApp</span>
                </div>
              )}
              {publicShop.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{publicShop.phone}</span>
                </div>
              )}
              {publicShop.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="hidden md:inline line-clamp-1 max-w-[180px]">{publicShop.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decorative divider */}
      <DecorativeDivider style={decorative.divider} />

      {/* ─── Main Content ─── */}
      <AnimatePresence mode="wait">
        {selectedProduct ? (
          <motion.div
            key="product-detail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="max-w-3xl mx-auto px-4 pt-4 pb-24 relative z-10"
          >
            {/* Back button */}
            <button
              onClick={() => deselectProductWithUrl()}
              className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors hover:opacity-80"
              style={{ color: 'var(--tpl-primary)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la boutique
            </button>

            {/* Product image gallery */}
            {(() => {
              const productImages = getProductImages(selectedProduct)
              const currentImage = productImages[detailImageIndex] || null
              return (
                <>
                  <div
                    className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-3"
                    style={{ borderRadius: 'var(--tpl-card-rounded)' }}
                  >
                    {currentImage ? (
                      <img
                        src={currentImage}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover transition-opacity duration-200"
                        key={currentImage}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Package className="h-16 w-16 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  {/* Thumbnail strip */}
                  {productImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                      {productImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setDetailImageIndex(idx)}
                          className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200"
                          style={{
                            borderColor: idx === detailImageIndex ? 'var(--tpl-primary)' : 'var(--tpl-border)',
                            opacity: idx === detailImageIndex ? 1 : 0.6,
                          }}
                        >
                          <img
                            src={img}
                            alt={`${selectedProduct.name} - Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}

            {/* Badges + Name + Price */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {selectedProduct.categoryName && (
                  <Badge className="text-xs" style={{ background: 'var(--tpl-primary)', color: 'var(--tpl-primary-fg)' }}>
                    {selectedProduct.categoryName}
                  </Badge>
                )}
                {isProductNew(selectedProduct.createdAt) && (
                  <Badge className="text-xs" style={{ background: 'var(--tpl-badge-new)', color: '#fff' }}>
                    Nouveau
                  </Badge>
                )}
                {isProductPromo(selectedProduct.price) && !isProductNew(selectedProduct.createdAt) && (
                  <Badge className="text-xs" style={{ background: 'var(--tpl-badge-promo)', color: '#fff' }}>
                    Promo
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--tpl-text)' }}>
                {selectedProduct.name}
              </h1>
              <p className="text-2xl font-bold" style={{ color: 'var(--tpl-price)' }}>
                {formatPrice(selectedProduct.price)}
              </p>
            </div>

            {/* Description */}
            {selectedProduct.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--tpl-text)' }}>Description</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--tpl-text-muted)' }}>
                  {selectedProduct.description}
                </p>
              </div>
            )}

            {/* Stock info */}
            {selectedProduct.stock !== undefined && selectedProduct.stock !== null && (
              <div className="mb-6 flex items-center gap-2 text-sm" style={{ color: 'var(--tpl-text-muted)' }}>
                {selectedProduct.stock > 0 ? (
                  selectedProduct.stock <= 3 ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-600 font-medium">Plus que {selectedProduct.stock} en stock</span>
                    </>
                  ) : (
                    <span>En stock ({selectedProduct.stock} disponibles)</span>
                  )
                ) : (
                  <span className="text-red-500 font-medium">Rupture de stock</span>
                )}
              </div>
            )}

            {/* Add to cart section */}
            <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--tpl-card)', border: '1px solid var(--tpl-border)' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--tpl-text)' }}>Quantité</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 rounded-lg p-1" style={{ border: '1px solid var(--tpl-border)' }}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailQty(Math.max(1, detailQty - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-base font-semibold min-w-[32px] text-center">{detailQty}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailQty(detailQty + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-lg font-bold" style={{ color: 'var(--tpl-price)' }}>
                  {formatPrice(selectedProduct.price * detailQty)}
                </span>
              </div>
              <Button
                className="w-full h-12 gap-2 text-sm font-semibold"
                style={{ background: 'var(--tpl-cta-bg)', color: 'var(--tpl-cta-fg)' }}
                disabled={selectedProduct.stock !== undefined && selectedProduct.stock !== null && selectedProduct.stock === 0}
                onClick={() => {
                  const cartImg = (selectedProduct.images && selectedProduct.images[0]) || selectedProduct.image || undefined
                  addToCart({ productId: selectedProduct.id, name: selectedProduct.name, price: selectedProduct.price, image: cartImg, quantity: detailQty })
                  toast.success(`${selectedProduct.name} (x${detailQty}) ajouté au panier`)
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                Ajouter au panier
              </Button>
            </div>

            {/* WhatsApp order button */}
            <Button
              className="w-full h-12 gap-2 text-sm font-semibold"
              style={{ background: '#25D366', color: '#ffffff' }}
              onClick={() => handleSingleProductWhatsApp(selectedProduct, detailQty)}
            >
              <MessageCircle className="h-5 w-5" />
              Commander sur WhatsApp
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="product-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="max-w-5xl mx-auto px-4 pt-4 relative z-10"
            ref={scrollRef}
          >
        {/* ─── Theme-specific or Generic Product Grid ─── */}
        {(template.id === 'jameela' || template.id === 'xstore-fashion' || template.id === 'xstore-electro' || template.id === 'xstore-grocery' || template.id === 'electrodepot') ? (
          <div className="relative z-10" ref={scrollRef}>
            {template.id === 'jameela' && (
              <JameelaGrid
                filteredProducts={filteredProducts}
                publicCategories={publicCategories}
                publicProducts={publicProducts}
                activeCategory={activeCategory}
                searchQuery={searchQuery}
                sortBy={sortBy}
                isSearching={isSearching}
                totalProductCount={totalProductCount}
                onCategoryClick={handleCategoryClick}
                onProductClick={selectProductWithUrl}
                onAddToCart={handleAddToCart}
                getCartQuantity={getCartQuantity}
                updateCartQuantity={updateCartQuantity}
                onSortChange={setSortBy}
                onSearchChange={setSearchQuery}
                shopName={publicShop.name}
                whatsapp={publicShop.whatsapp}
              />
            )}
            {template.id === 'xstore-fashion' && (
              <FashionGrid
                filteredProducts={filteredProducts}
                publicCategories={publicCategories}
                publicProducts={publicProducts}
                activeCategory={activeCategory}
                searchQuery={searchQuery}
                sortBy={sortBy}
                isSearching={isSearching}
                totalProductCount={totalProductCount}
                onCategoryClick={handleCategoryClick}
                onProductClick={selectProductWithUrl}
                onAddToCart={handleAddToCart}
                getCartQuantity={getCartQuantity}
                updateCartQuantity={updateCartQuantity}
                onSortChange={setSortBy}
                onSearchChange={setSearchQuery}
                shopName={publicShop.name}
                whatsapp={publicShop.whatsapp}
              />
            )}
            {template.id === 'xstore-grocery' && (
              <GroceryGrid
                filteredProducts={filteredProducts}
                publicCategories={publicCategories}
                publicProducts={publicProducts}
                activeCategory={activeCategory}
                searchQuery={searchQuery}
                sortBy={sortBy}
                isSearching={isSearching}
                totalProductCount={totalProductCount}
                onCategoryClick={handleCategoryClick}
                onProductClick={selectProductWithUrl}
                onAddToCart={handleAddToCart}
                getCartQuantity={getCartQuantity}
                updateCartQuantity={updateCartQuantity}
                onSortChange={setSortBy}
                onSearchChange={setSearchQuery}
                shopName={publicShop.name}
                whatsapp={publicShop.whatsapp}
              />
            )}
            {template.id === 'electrodepot' && (
              <ElectroDepotGrid
                filteredProducts={filteredProducts}
                publicCategories={publicCategories}
                publicProducts={publicProducts}
                activeCategory={activeCategory}
                searchQuery={searchQuery}
                sortBy={sortBy}
                isSearching={isSearching}
                totalProductCount={totalProductCount}
                onCategoryClick={handleCategoryClick}
                onProductClick={selectProductWithUrl}
                onAddToCart={handleAddToCart}
                getCartQuantity={getCartQuantity}
                updateCartQuantity={updateCartQuantity}
                onSortChange={setSortBy}
                onSearchChange={setSearchQuery}
                shopName={publicShop.name}
                whatsapp={publicShop.whatsapp}
              />
            )}
          </div>
        ) : (
        <>
        {/* Category Filter */}
        {publicCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
            <TemplateCategoryButton
              label={`Tous (${totalProductCount})`}
              active={!activeCategory}
              onClick={() => handleCategoryClick(null)}
              style={layout.categoryStyle}
            />
            {publicCategories.map((cat) => {
              const count = getCategoryCount(publicProducts, cat.id)
              if (count === 0) return null
              return (
                <TemplateCategoryButton
                  key={cat.id}
                  label={cat.name}
                  count={count}
                  active={activeCategory === cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  style={layout.categoryStyle}
                />
              )
            })}
          </div>
        )}

        {/* Search results & Sort */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="text-sm" style={{ color: 'var(--tpl-text-muted)' }}>
            {isSearching ? (
              <span>
                {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''} pour &quot;{searchQuery}&quot;
              </span>
            ) : (
              <span>
                {totalProductCount} produit{totalProductCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm bg-secondary rounded-lg px-3 py-1.5 border-0 focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="recent">Plus récents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>

        {/* ─── Product Grid ─── */}
        {filteredProducts.length > 0 ? (
          <div className={`grid ${layout.gridCols} gap-4`}>
            {filteredProducts.map((product) => {
              const qty = getCartQuantity(product.id)
              const isNew = isProductNew(product.createdAt)
              const isPromo = isProductPromo(product.price)
              const lowStock = product.stock !== undefined && product.stock !== null && product.stock <= 3 && product.stock > 0

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ scale: cardStyle.hoverScale, y: cardStyle.hoverY || 0, transition: { duration: 0.2 } }}
                >
                  <Card
                    className="group h-full flex flex-col transition-all duration-300 cursor-pointer"
                    onClick={() => selectProductWithUrl(product)}
                    style={{
                      background: 'var(--tpl-card)',
                      borderRadius: cardStyle.rounded,
                      boxShadow: cardStyle.shadow,
                      overflow: cardStyle.overflow,
                      border: layout.showCardBorder ? cardStyle.border : 'none',
                    }}
                  >
                    {/* Image */}
                    <div className={`${layout.imageSize} bg-muted relative overflow-hidden`} style={{ borderRadius: cardStyle.imageRounded }}>
                      {(product.images && product.images.length > 0) || product.image ? (
                        <img
                          src={(product.images && product.images[0]) || product.image || ''}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <Package className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Badges */}
                      <div
                        className={`absolute flex flex-col gap-1 ${
                          layout.badgePosition === 'top-left' ? 'top-2 left-2' : layout.badgePosition === 'top-right' ? 'top-2 right-2' : 'top-2 left-2'
                        }`}
                      >
                        {isNew && (
                          <TemplateBadge type="new" style={layout.badgeStyle}>
                            <Sparkles className="h-3 w-3" />
                            {layout.badgeStyle === 'tag' ? 'NOUVEAU' : 'Nouveau'}
                          </TemplateBadge>
                        )}
                        {isPromo && !isNew && (
                          <TemplateBadge type="promo" style={layout.badgeStyle}>
                            <Flame className="h-3 w-3" />
                            {layout.badgeStyle === 'tag' ? 'PROMO' : 'Promo'}
                          </TemplateBadge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className={`${layout.cardPadding} flex flex-col flex-1`}>
                      <h3 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--tpl-text)' }}>
                        {product.name}
                      </h3>
                      {product.categoryName && (
                        <span className="text-[11px] mt-0.5" style={{ color: 'var(--tpl-text-muted)' }}>
                          {product.categoryName}
                        </span>
                      )}

                      <div className="mt-auto pt-3">
                        <TemplatePrice price={product.price} style={layout.priceStyle} />

                        {lowStock && (
                          <div className="flex items-center gap-1 mt-1.5 text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-[11px] font-medium">Plus que {product.stock} en stock</span>
                          </div>
                        )}

                        <div className="mt-2">
                          {qty === 0 ? (
                            <TemplateCtaButton onClick={(e) => { e.stopPropagation(); handleAddToCart(product) }} style={layout.buttonStyle}>
                              <Plus className="h-3 w-3" />
                              Ajouter
                            </TemplateCtaButton>
                          ) : (
                            <div
                              className="flex items-center justify-between gap-1 rounded-lg p-0.5"
                              style={{ background: 'var(--tpl-card)', border: '1px solid var(--tpl-border)' }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={(e) => { e.stopPropagation(); updateCartQuantity(product.id, qty - 1) }}
                              >
                                {qty === 1 ? <Trash2 className="h-3 w-3 text-destructive" /> : <Minus className="h-3 w-3" />}
                              </Button>
                              <span className="text-sm font-semibold min-w-[24px] text-center">{qty}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={(e) => { e.stopPropagation(); updateCartQuantity(product.id, qty + 1) }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              {isSearching ? <Search className="h-7 w-7 text-muted-foreground/40" /> : <ShoppingBag className="h-7 w-7 text-muted-foreground/40" />}
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {isSearching ? 'Aucun résultat' : 'Aucun produit disponible'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isSearching
                ? `Aucun produit ne correspond à "${searchQuery}". Essayez d'autres mots-clés.`
                : 'Cette boutique n\'a pas encore ajouté de produits. Revenez bientôt !'}
            </p>
            {isSearching && (
              <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4 mr-2" />
                Effacer la recherche
              </Button>
            )}
          </div>
        )}
        </>
        )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Cart Bar ─── */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            {/* Expanded Cart */}
            <AnimatePresence>
              {cartExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-b"
                  style={{ background: 'var(--tpl-cart-bg)' }}
                >
                  <ScrollArea className="max-h-64">
                    <div className="max-w-5xl mx-auto p-4 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">
                          Votre panier ({itemCount} article{itemCount !== 1 ? 's' : ''})
                        </h3>
                        <Button variant="ghost" size="sm" className="text-destructive h-7 text-xs" onClick={clearCart}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Tout supprimer
                        </Button>
                      </div>
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted shrink-0 overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs font-semibold" style={{ color: 'var(--tpl-price)' }}>
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-secondary rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            >
                              {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-destructive" /> : <Minus className="h-3 w-3" />}
                            </Button>
                            <span className="text-sm font-semibold min-w-[24px] text-center">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-semibold w-24 text-right" style={{ color: 'var(--tpl-price)' }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex items-center justify-between font-bold">
                        <span>Total</span>
                        <span style={{ color: 'var(--tpl-price)' }}>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cart bar buttons */}
            <div className="border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ background: 'var(--tpl-cart-bg)' }}>
              <div className="max-w-5xl mx-auto px-4 py-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-1.5 shrink-0"
                    onClick={() => setCartExpanded(!cartExpanded)}
                  >
                    {cartExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    <Badge
                      variant="secondary"
                      className="px-1.5 h-5 text-xs"
                      style={{ background: 'var(--tpl-primary)', color: 'var(--tpl-primary-fg)' }}
                    >
                      {itemCount}
                    </Badge>
                    <span className="hidden sm:inline">panier</span>
                  </Button>

                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'var(--tpl-text-muted)' }}>Total</p>
                    <p className="font-bold text-sm" style={{ color: 'var(--tpl-price)' }}>{formatPrice(total)}</p>
                  </div>

                  <Button
                    className="h-10 gap-2 shrink-0"
                    style={{ background: 'var(--tpl-cta-bg)', color: 'var(--tpl-cta-fg)' }}
                    onClick={handleWhatsAppCheckout}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Commander sur WhatsApp</span>
                    <span className="sm:hidden">Commander</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Exported PublicShop (wraps with TemplateProvider) ─── */
export function PublicShop({ initialProductSlug }: { initialProductSlug?: string }) {
  const { publicShop, shopSlug } = useAppStore()

  // We need shop data to know the template - use default 'classic' until loaded
  const templateId = publicShop?.template || 'classic'

  return (
    <TemplateProvider templateId={templateId}>
      <ShopContent initialProductSlug={initialProductSlug} />
    </TemplateProvider>
  )
}
