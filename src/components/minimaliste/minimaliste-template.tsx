'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Search, Heart, LogIn, ArrowLeft, Menu, X,
  Facebook, Instagram, MessageCircle, Truck, RotateCcw, ShieldCheck,
  Headphones, ChevronRight, ChevronLeft, Send, Mail, Phone, MapPin,
  Star, Store,
} from 'lucide-react'
import { useAppStore, type Shop as ShopType } from '@/lib/store'
import { formatPrice } from '@/lib/shared'
import {
  parseModernStoreConfig, DEFAULT_MODERN_STORE_CONFIG,
  type ModernStoreConfig, type ModernStoreProduct, type ModernStoreVariant,
  type Testimonial,
} from '@/lib/modern-store-types'
import { buildWhatsAppBuyNowLink } from '@/lib/whatsapp-utils'
import type { VariantSelection } from '@/lib/variant-utils'
import { useCartStore } from '@/store/cart-store'
import { CheckoutForm } from '@/components/modern-store/checkout-form'
import { CartDrawer } from '@/components/modern-store/cart-drawer'
import { ImageGallery } from '@/components/modern-store/image-gallery'
import { VariantSelector } from '@/components/modern-store/variant-selector'
import { QuantitySelector } from '@/components/modern-store/quantity-selector'
import { getAppearance } from '@/lib/appearance'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & TYPES
// ═══════════════════════════════════════════════════════════════════════════

const DARK_BG = '#1a1a1a'
const WHITE = '#ffffff'
const TEXT_BLACK = '#111111'
const TEXT_GRAY = '#666666'
const TEXT_MUTED = '#999999'
const ACCENT_ORANGE = '#f59e0b'
const BORDER_LIGHT = '#e5e5e5'
const WHATSAPP_GREEN = '#25D366'

// Parse customColors from shop for theme customization
function parseCustomColors(raw: string | undefined): Record<string, string> {
  try { return raw ? JSON.parse(raw) : {} } catch { return {} }
}

type View = 'home' | 'boutique' | 'contact' | 'product' | 'checkout' | 'about' | 'privacy'

interface DetailedProduct extends ModernStoreProduct {
  variants: ModernStoreVariant[]
}

interface PublicShopData extends ShopType {
  templateType?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TEMPLATE — ZERO PROPS
// ═══════════════════════════════════════════════════════════════════════════

export function MinimalisteTemplate() {
  const { publicShop } = useAppStore()
  const shop = publicShop as PublicShopData | null

  const shopId = shop?.id || ''
  const whatsapp = shop?.whatsapp || ''
  const shopName = shop?.name || ''
  const shopSlug = shop?.slug || ''

  // Dynamic appearance from customColors
  const { buttonColor, logoSize } = getAppearance(shop?.customColors)
  const customC = parseCustomColors(shop?.customColors)
  const themePrimary = customC.primary || ''
  const themeSecondary = customC.secondary || ''
  const themeAccent = customC.accent || ''
  const btnColor = themeAccent || buttonColor || shop?.primaryColor || DARK_BG
  const logoH = logoSize ? parseInt(logoSize) : null

  // Cart store
  const openCart = useCartStore((s) => s.openCart)
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const addItem = useCartStore((s) => s.addItem)

  // ─── Template state ───
  const [view, setView] = useState<View>('home')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [products, setProducts] = useState<ModernStoreProduct[]>([])
  const [config, setConfig] = useState<ModernStoreConfig>(DEFAULT_MODERN_STORE_CONFIG)
  const [loading, setLoading] = useState(true)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<{ name: string; id: string; image?: string }[]>([])

  // Product detail state
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

  // ─── Hero images ───
  const heroImages = useMemo(() => {
    if (shop?.heroImages) {
      try {
        const parsed = JSON.parse(shop.heroImages)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch { /* ignore */ }
    }
    const fallback = shop?.heroImageUrl || shop?.coverImageUrl || shop?.banner || shop?.logo
    return fallback ? [fallback] : []
  }, [shop?.heroImages, shop?.heroImageUrl, shop?.coverImageUrl, shop?.banner, shop?.logo])

  // ─── Initial data fetch ───
  useEffect(() => {
    if (!shop?.slug) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [configRes, productsRes, testimonialsRes, categoriesRes] = await Promise.all([
          fetch(`/api/shops/${shop!.slug}/modern-store-config`).then(r => r.json()).catch(() => DEFAULT_MODERN_STORE_CONFIG),
          fetch(`/api/shops/${shop!.slug}/products`).then(r => r.json()).catch(() => []),
          fetch(`/api/shops/${shop!.slug}/testimonials`).then(r => r.json()).catch(() => []),
          fetch(`/api/shops/${shop!.slug}/categories`).then(r => r.json()).catch(() => []),
        ])
        if (!cancelled) {
          setConfig(
            configRes?.config
              ? parseModernStoreConfig(JSON.stringify(configRes.config))
              : DEFAULT_MODERN_STORE_CONFIG,
          )
          setProducts(Array.isArray(productsRes) ? productsRes : [])
          setTestimonials(Array.isArray(testimonialsRes) ? testimonialsRes : [])
          setCategories(
            Array.isArray(categoriesRes)
              ? categoriesRes.map((c: { id: string; name: string; image?: string }) => ({
                  name: c.name,
                  id: c.id,
                  image: c.image,
                }))
              : [],
          )
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
          fetch(`/api/products/${selectedProductId}`).then(r => r.json()),
          fetch(`/api/products/${selectedProductId}/related`).then(r => r.json()).catch(() => []),
        ])
        if (!cancelled) {
          setDetailedProduct(prodRes)
          setFinalPrice(prodRes.price ?? 0)
          setAvailableStock(prodRes.stock ?? null)
          setRelatedProducts(Array.isArray(relatedRes) ? relatedRes : [])
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

  // ─── Cart actions ───
  const handleAddDetailedToCart = useCallback(() => {
    if (!detailedProduct) return
    const colorVariant = detailedProduct.variants?.find((v) => v.id === selection.colorVariantId)
    const sizeVariant = detailedProduct.variants?.find((v) => v.id === selection.sizeVariantId)
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
    const colorVariant = detailedProduct.variants?.find((v) => v.id === selection.colorVariantId)
    const sizeVariant = detailedProduct.variants?.find((v) => v.id === selection.sizeVariantId)
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[#1a1a1a]" />
          <p className="text-sm text-[#999]">Chargement…</p>
        </div>
      </div>
    )
  }

  if (!shop) return null

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ─── HEADER ─── */}
      <MinimalisteHeader
        shop={shop}
        itemCount={itemCount}
        onCartClick={openCart}
        onHomeClick={() => { setView('home'); setMobileMenuOpen(false) }}
        onBoutiqueClick={() => { setView('boutique'); setMobileMenuOpen(false) }}
        onContactClick={() => { setView('contact'); setMobileMenuOpen(false) }}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
        onNavClick={() => setMobileMenuOpen(false)}
        categories={categories}
        onSearchToggle={() => setSearchOpen(!searchOpen)}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        products={products}
        onProductClick={handleProductClick}
        logoH={logoH}
        themeAccent={themeAccent}
      />

      {/* ─── SEARCH OVERLAY ─── */}
      <AnimatePresence>
        {searchOpen && (
          <MinimalisteSearchOverlay
            query={searchQuery}
            onChange={setSearchQuery}
            onClose={() => { setSearchOpen(false); setSearchQuery('') }}
            products={products}
            onProductClick={(p) => { handleProductClick(p); setSearchOpen(false); setSearchQuery('') }}
          />
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <HomeView
                shop={shop}
                config={config}
                heroImages={heroImages}
                products={products}
                categories={categories}
                whatsapp={whatsapp}
                shopId={shopId}
                shopName={shopName}
                btnColor={btnColor}
                themePrimary={themePrimary}
                themeAccent={themeAccent}
                onProductClick={handleProductClick}
                onSeeAllProducts={() => setView('boutique')}
              />
            </motion.div>
          )}

          {view === 'boutique' && (
            <motion.div
              key="boutique"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <BoutiqueView
                shop={shop}
                products={products}
                categories={categories}
                shopId={shopId}
                shopName={shopName}
                btnColor={btnColor}
                themePrimary={themePrimary}
                themeAccent={themeAccent}
                onBack={() => setView('home')}
                onProductClick={handleProductClick}
              />
            </motion.div>
          )}

          {view === 'product' && (
            <motion.div
              key={`product-${selectedProductId}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <ProductView
                shop={shop}
                whatsapp={whatsapp}
                shopId={shopId}
                shopName={shopName}
                btnColor={btnColor}
                loading={loadingProduct}
                product={detailedProduct}
                relatedProducts={relatedProducts}
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
            </motion.div>
          )}

          {view === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <CheckoutForm
                whatsapp={whatsapp}
                shopName={shopName}
                shopId={shopId}
                accent={DARK_BG}
                onBack={() => setView('home')}
                onSuccess={() => setView('home')}
              />
            </motion.div>
          )}

          {view === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <ContactView shop={shop} btnColor={btnColor} onBack={() => setView('home')} />
            </motion.div>
          )}

          {view === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <AboutView shop={shop} shopName={shopName} onBack={() => setView('home')} />
            </motion.div>
          )}

          {view === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <PrivacyView shop={shop} shopName={shopName} onBack={() => setView('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── FOOTER ─── */}
      <MinimalisteFooter
        shop={shop}
        shopName={shopName}
        categories={categories}
        products={products}
        onProductClick={handleProductClick}
        whatsapp={whatsapp}
        phone={shop?.phone || ''}
        address={shop?.address || ''}
        contactEmail={shop?.contactEmail || ''}
        btnColor={btnColor}
        onAboutClick={() => { setView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        onPrivacyClick={() => { setView('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        onContactClick={() => { setView('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        onHomeClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        onBoutiqueClick={() => { setView('boutique'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
      />

      {/* ─── CART DRAWER ─── */}
      <CartDrawer
        whatsapp={whatsapp}
        shopName={shopName}
        shopId={shopId}
        accent={DARK_BG}
        onCheckout={() => setView('checkout')}
      />

      {/* ─── FLOATING WHATSAPP BUTTON ─── */}
      {whatsapp && (
        <motion.a
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="WhatsApp"
        >
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            className="relative"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
              style={{ backgroundColor: WHATSAPP_GREEN }}
            >
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ backgroundColor: WHATSAPP_GREEN }}
            />
            <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block">
              <div className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium shadow-lg bg-[#1f2937] text-white">
                Commander via WhatsApp
                <div className="absolute top-full right-6 h-0 w-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1f2937]" />
              </div>
            </div>
          </motion.div>
        </motion.a>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADER — Dark, sticky, Savoy-style
// ═══════════════════════════════════════════════════════════════════════════

function MinimalisteHeader({
  shop,
  itemCount,
  onCartClick,
  onHomeClick,
  onBoutiqueClick,
  onContactClick,
  onMobileMenuToggle,
  mobileMenuOpen,
  onNavClick,
  categories,
  onSearchToggle,
  searchOpen,
  searchQuery,
  onSearchChange,
  products,
  onProductClick,
  logoH,
  themeAccent,
}: {
  shop: PublicShopData
  itemCount: number
  onCartClick: () => void
  onHomeClick: () => void
  onBoutiqueClick: () => void
  onContactClick: () => void
  onMobileMenuToggle: () => void
  mobileMenuOpen: boolean
  onNavClick: () => void
  categories: { name: string; id: string; image?: string }[]
  onSearchToggle: () => void
  searchOpen: boolean
  searchQuery: string
  onSearchChange: (q: string) => void
  products: ModernStoreProduct[]
  onProductClick: (p: ModernStoreProduct) => void
  logoH: number | null
  themeAccent: string
}) {
  const navLinks = [
    { label: 'Accueil', action: onHomeClick },
    { label: 'Boutique', action: onBoutiqueClick },
    { label: 'Contact', action: onContactClick },
  ]

  return (
    <>
      {/* ─── TOP BAR ─── */}
      <div className="w-full text-center py-2 px-4" style={{ backgroundColor: DARK_BG }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="w-24 hidden md:flex items-center gap-3">
            {shop?.whatsapp ? (
              <a
                href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            ) : null}
            {shop?.contactEmail ? (
              <a href={`mailto:${shop.contactEmail}`} className="text-white/60 hover:text-white transition-colors" aria-label="Email">
                <Mail className="h-4 w-4" />
              </a>
            ) : null}
          </div>
          <p className="text-[11px] sm:text-xs tracking-widest uppercase text-white/80 font-light flex-1 text-center">
            Livraison gratuite pour toute commande
          </p>
          <div className="w-24 flex items-center justify-end gap-3">
            <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ─── MAIN HEADER (white, Savoy-style) ─── */}
      <header className="sticky top-0 z-30 w-full bg-white shadow-sm" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 md:py-4">
          {/* Left: Hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:text-black transition-colors md:hidden"
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Center: Logo */}
          <button
            type="button"
            onClick={onHomeClick}
            className="flex items-center min-h-[44px]"
            aria-label="Retour à l'accueil"
          >
            {shop.logo ? (
              <Image
                src={shop.logo}
                alt={shop.name}
                width={200}
                height={56}
                unoptimized
                className="h-12 md:h-14 w-auto max-w-[180px] md:max-w-[280px] object-contain"
                style={logoH ? { height: Math.min(logoH, 56) } : undefined}
                priority
              />
            ) : (
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-black" />
                <span className="text-base font-bold text-black tracking-wide">{shop.name}</span>
              </div>
            )}
          </button>

          {/* Right: Search, Connexion, Heart, Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={onSearchToggle}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 hover:text-black transition-colors"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => { window.location.href = '/login' }}
              className="hidden sm:flex h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-light tracking-wide text-gray-600 hover:text-black transition-colors"
              aria-label="Connexion"
            >
              <LogIn className="h-4 w-4" />
              <span>Connexion</span>
            </button>

            <button
              type="button"
              className="hidden sm:flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 hover:text-black transition-colors"
              aria-label="Favoris"
            >
              <Heart className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onCartClick}
              aria-label={`Voir le panier (${itemCount} article${itemCount > 1 ? 's' : ''})`}
              className="relative flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 hover:text-black transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ backgroundColor: themeAccent || ACCENT_ORANGE }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:block border-t border-gray-100">
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-8 px-4 py-3">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => { link.action(); onNavClick() }}
                className="text-xs font-light tracking-[0.15em] uppercase text-gray-500 hover:text-black transition-colors"
              >
                {link.label}
              </button>
            ))}
            {categories.length > 0 && (
              <div className="relative group">
                <button
                  type="button"
                  className="text-xs font-light tracking-[0.15em] uppercase text-white/60 hover:text-white transition-colors flex items-center gap-1"
                >
                  Catégories
                  <ChevronRight className="h-3 w-3 rotate-90" />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:block z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-2 min-w-[180px]">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { onNavClick(); onBoutiqueClick() }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
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
            <div className="absolute inset-0 bg-black/50" onClick={onMobileMenuToggle} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-y-0 left-0 w-72 flex flex-col bg-white"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="text-sm font-semibold text-black tracking-wide uppercase">Menu</span>
                <button
                  type="button"
                  onClick={onMobileMenuToggle}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-0 px-2 py-4">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => { link.action(); onNavClick() }}
                    className="rounded-lg px-4 py-3.5 text-left text-base font-light text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                {categories.length > 0 && (
                  <>
                    <div className="mx-4 my-2 border-t border-gray-100" />
                    <p className="px-4 text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-1">Catégories</p>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { onNavClick(); onBoutiqueClick() }}
                        className="rounded-lg px-6 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </>
                )}
              </nav>

              <div className="mt-auto p-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { window.location.href = '/login' }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Connexion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH OVERLAY
// ═══════════════════════════════════════════════════════════════════════════

function MinimalisteSearchOverlay({
  query,
  onChange,
  onClose,
  products,
  onProductClick,
}: {
  query: string
  onChange: (q: string) => void
  onClose: () => void
  products: ModernStoreProduct[]
  onProductClick: (p: ModernStoreProduct) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q),
    ).slice(0, 8)
  }, [query, products])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-auto max-w-2xl px-4 pt-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Rechercher un produit…"
              className="flex-1 bg-transparent text-base text-black placeholder-gray-400 outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {query.trim() && (
            <div className="max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">Aucun résultat trouvé</p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onProductClick(p)}
                    className="flex items-center gap-4 w-full px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} width={48} height={48} unoptimized className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">{p.name}</p>
                      <p className="text-sm text-gray-500">{formatPrice(p.price)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO SLIDER
// ═══════════════════════════════════════════════════════════════════════════

function HeroSlider({
  images,
  shop,
  onSeeAll,
}: {
  images: string[]
  shop: PublicShopData
  onSeeAll: () => void
}) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Auto-advance
  useEffect(() => {
    if (images.length <= 1) return
    timerRef.current = setInterval(nextSlide, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [images.length, nextSlide])

  if (images.length === 0) return null

  const title = shop.heroTitle || shop.name || ''
  const subtitle = shop.heroSubtitle || shop.description || ''

  return (
    <section className="mx-auto max-w-7xl">
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1598/665' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={images[current]}
              alt={title || 'Bannière'}
              fill
              unoptimized
              priority={current === 0}
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center px-4 max-w-2xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-white/80 font-light mb-8 max-w-lg mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
            <button
              type="button"
              onClick={onSeeAll}
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 text-sm font-medium tracking-wide hover:bg-gray-100 transition-colors rounded-none"
            >
              Voir la boutique
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Aller à l'image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT CARD — Minimaliste style
// ═══════════════════════════════════════════════════════════════════════════

function MinimalisteProductCard({
  product,
  onClick,
  index,
}: {
  product: ModernStoreProduct
  onClick: () => void
  index: number
}) {
  const img = product.images?.[0] || product.image
  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const isNew = product.isFeatured || (product.createdAt && Date.now() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000)
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="group text-left w-full bg-white rounded-none transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-gray-50" style={{ aspectRatio: '305/349' }}>
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <ShoppingBag className="h-10 w-10 text-gray-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="inline-block bg-black text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
              Nouveau
            </span>
          )}
          {hasDiscount && (
            <span
              className="inline-block text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1"
              style={{ backgroundColor: ACCENT_ORANGE }}
            >
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1 px-1">
        <p className="text-sm text-[#666] truncate mb-1.5 leading-snug">{product.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-black">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-[#999] line-through">{formatPrice(product.oldPrice!)}</span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT CARD SKELETON
// ═══════════════════════════════════════════════════════════════════════════

function ProductCardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="w-full" style={{ aspectRatio: '305/349' }} />
      <div className="pt-3 px-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME VIEW
// ═══════════════════════════════════════════════════════════════════════════

function HomeView({
  shop,
  config,
  heroImages,
  products,
  categories,
  whatsapp,
  shopId,
  shopName,
  btnColor,
  themePrimary,
  themeAccent,
  onProductClick,
  onSeeAllProducts,
}: {
  shop: PublicShopData
  config: ModernStoreConfig
  heroImages: string[]
  products: ModernStoreProduct[]
  categories: { name: string; id: string; image?: string }[]
  whatsapp: string
  shopId: string
  shopName: string
  btnColor: string
  themePrimary: string
  themeAccent: string
  onProductClick: (p: ModernStoreProduct) => void
  onSeeAllProducts: () => void
}) {
  const [activeCategory, setActiveCategory] = useState('all')

  const categoryTabs = useMemo(
    () => [
      { label: 'Tous', id: 'all' },
      ...categories.map((c) => ({ label: c.name, id: c.id || c.name })),
    ],
    [categories],
  )

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products
    return products.filter(
      (p) => p.categoryId === activeCategory || p.categoryName === activeCategory,
    )
  }, [products, activeCategory])

  const addItem = useCartStore((s) => s.addItem)

  return (
    <>
      {/* ─── HERO SLIDER ─── */}
      {heroImages.length > 0 && (
        <HeroSlider images={heroImages} shop={shop} onSeeAll={onSeeAllProducts} />
      )}

      {/* ─── NOS PRODUITS ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Section title */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight inline-block">
            Nos Produits
          </h2>
          <div className="mt-3 mx-auto h-[2px] w-12" style={{ backgroundColor: themePrimary || '#111111' }} />
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="mb-10 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max mx-auto justify-center">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-5 py-2 text-xs font-medium tracking-wider uppercase transition-all duration-200 rounded-none ${
                    activeCategory === tab.id
                      ? 'text-white'
                      : 'bg-transparent text-gray-500 hover:text-black border border-gray-200 hover:border-black'
                  }`}
                  style={activeCategory === tab.id ? { backgroundColor: themePrimary || '#111111' } : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((p, idx) => (
                <MinimalisteProductCard
                  key={p.id}
                  product={p}
                  onClick={() => onProductClick(p)}
                  index={idx}
                />
              ))}
            </div>

            {/* See all button */}
            {filteredProducts.length >= 8 && (
              <div className="text-center mt-12">
                <button
                  type="button"
                  onClick={onSeeAllProducts}
                  className="inline-flex items-center gap-2 text-white px-10 py-3.5 text-sm font-medium tracking-wider uppercase transition-colors"
                  style={{ backgroundColor: themePrimary || '#111111' }}
                >
                  Voir tous les produits
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ─── TRUST BADGES ─── */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, label: 'Livraison rapide', desc: 'Partout en Côte d\'Ivoire' },
              { icon: ShieldCheck, label: 'Paiement sécurisé', desc: 'Paiement à la livraison' },
              { icon: RotateCcw, label: 'Retour gratuit', desc: 'Sous 7 jours' },
              { icon: Headphones, label: 'Support 7j/7', desc: 'Une équipe à votre écoute' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-3">
                  <item.icon className="h-5 w-5 text-black" />
                </div>
                <p className="text-sm font-semibold text-black mb-1">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// BOUTIQUE VIEW (All Products)
// ═══════════════════════════════════════════════════════════════════════════

function BoutiqueView({
  shop,
  products,
  categories,
  shopId,
  shopName,
  btnColor,
  themePrimary,
  themeAccent,
  onBack,
  onProductClick,
}: {
  shop: PublicShopData
  products: ModernStoreProduct[]
  categories: { name: string; id: string; image?: string }[]
  shopId: string
  shopName: string
  btnColor: string
  themePrimary: string
  themeAccent: string
  onBack: () => void
  onProductClick: (p: ModernStoreProduct) => void
}) {
  const [activeCategory, setActiveCategory] = useState('all')

  const categoryTabs = useMemo(
    () => [
      { label: 'Tous les produits', id: 'all' },
      ...categories.map((c) => ({ label: c.name, id: c.id || c.name })),
    ],
    [categories],
  )

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products
    return products.filter(
      (p) => p.categoryId === activeCategory || p.categoryName === activeCategory,
    )
  }, [products, activeCategory])

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </button>

      {/* Title + Count */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">Boutique</h1>
          <p className="text-sm text-gray-400 mt-1">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-5 py-2 text-xs font-medium tracking-wider uppercase transition-all duration-200 rounded-none ${
                  activeCategory === tab.id
                    ? 'text-white'
                    : 'bg-transparent text-gray-500 hover:text-black border border-gray-200 hover:border-black'
                }`}
                style={activeCategory === tab.id ? { backgroundColor: themePrimary || '#111111' } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">Aucun produit trouvé dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((p, idx) => (
            <MinimalisteProductCard
              key={p.id}
              product={p}
              onClick={() => onProductClick(p)}
              index={idx}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════

function ProductView({
  shop,
  whatsapp,
  shopId,
  shopName,
  btnColor,
  loading,
  product,
  relatedProducts,
  quantity,
  onQuantityChange,
  finalPrice,
  availableStock,
  onSelectionChange,
  onAddToCart,
  onBuyNow,
  onBack,
  onProductClick,
}: {
  shop: PublicShopData
  whatsapp: string
  shopId: string
  shopName: string
  btnColor: string
  loading: boolean
  product: DetailedProduct | null
  relatedProducts: ModernStoreProduct[]
  quantity: number
  onQuantityChange: (n: number) => void
  finalPrice: number | null
  availableStock: number | null
  onSelectionChange: (sel: VariantSelection, price: number, stock: number | null) => void
  onAddToCart: () => void
  onBuyNow: () => void
  onBack: () => void
  onProductClick: (p: ModernStoreProduct) => void
}) {
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <Skeleton className="w-full aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-gray-400">Produit introuvable.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm text-black underline hover:no-underline"
        >
          Retour
        </button>
      </div>
    )
  }

  const hasDiscount = product.oldPrice && product.oldPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0
  const stock = availableStock ?? product.stock ?? 0
  const isOutOfStock = stock === 0
  const allImages = product.images?.length ? product.images : product.image ? [product.image] : []

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      {/* Product layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
        {/* Left: Image gallery */}
        <div>
          <ImageGallery
            images={allImages}
            fallbackUrl={product.image}
            alt={product.name}
            discountPercent={discountPercent}
          />
        </div>

        {/* Right: Product info */}
        <div className="flex flex-col">
          {/* Breadcrumb / Category */}
          {product.categoryName && (
            <p className="text-xs font-medium tracking-[0.15em] uppercase text-gray-400 mb-3">
              {product.categoryName}
            </p>
          )}

          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-black leading-tight mb-3">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl md:text-2xl font-bold text-black">
              {formatPrice(finalPrice ?? product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-gray-400 line-through">
                  {formatPrice(product.oldPrice!)}
                </span>
                <Badge
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none"
                  style={{ backgroundColor: ACCENT_ORANGE, color: 'white' }}
                >
                  -{discountPercent}%
                </Badge>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
              {product.description}
            </p>
          )}

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-6" />

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <VariantSelector
                variants={product.variants}
                basePrice={product.price}
                accent={btnColor}
                onSelectionChange={onSelectionChange}
              />
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-xs font-medium tracking-[0.1em] uppercase text-gray-500 mb-3">
              Quantité
            </p>
            <QuantitySelector
              value={quantity}
              onChange={onQuantityChange}
              max={availableStock ?? product.stock ?? undefined}
            />
            {stock > 0 && stock <= 5 && (
              <p className="text-xs text-[#f59e0b] mt-2">Plus que {stock} en stock</p>
            )}
          </div>

          {/* Add to cart button */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 text-sm font-medium tracking-wider uppercase hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-none mb-3"
          >
            <ShoppingBag className="h-4 w-4" />
            {isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
          </button>

          {/* WhatsApp button */}
          <button
            type="button"
            onClick={onBuyNow}
            className="w-full flex items-center justify-center gap-2 py-4 text-sm font-medium tracking-wider uppercase transition-colors rounded-none"
            style={{ backgroundColor: WHATSAPP_GREEN, color: 'white' }}
          >
            <MessageCircle className="h-4 w-4" />
            Commander via WhatsApp
          </button>

          {/* Trust indicators */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { icon: Truck, label: 'Livraison rapide' },
              { icon: ShieldCheck, label: 'Paiement sécurisé' },
              { icon: RotateCcw, label: 'Retour sous 7 jours' },
              { icon: Headphones, label: 'Support client' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-gray-500">
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 md:mt-24">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-black tracking-tight inline-block">
              Vous aimerez aussi
            </h2>
            <div className="mt-3 mx-auto h-[2px] w-12 bg-black" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.slice(0, 4).map((p, idx) => (
              <MinimalisteProductCard
                key={p.id}
                product={p}
                onClick={() => onProductClick(p)}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT VIEW
// ═══════════════════════════════════════════════════════════════════════════

function ContactView({
  shop,
  btnColor,
  onBack,
}: {
  shop: PublicShopData
  btnColor: string
  onBack: () => void
}) {
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, shopId: shop.id, shopSlug: shop.slug }),
      })
      if (!res.ok) throw new Error()
      toast.success('Message envoyé avec succès !')
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch {
      toast.error("Erreur lors de l'envoi du message")
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight mb-2">Contactez-nous</h1>
      <p className="text-sm text-gray-500 mb-10">Nous sommes à votre écoute. Remplissez le formulaire ci-dessous.</p>

      {/* Contact info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {shop.whatsapp && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-none">
            <MessageCircle className="h-5 w-5 text-black flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">WhatsApp</p>
              <p className="text-sm font-medium text-black">{shop.whatsapp}</p>
            </div>
          </div>
        )}
        {shop.phone && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-none">
            <Phone className="h-5 w-5 text-black flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Téléphone</p>
              <p className="text-sm font-medium text-black">{shop.phone}</p>
            </div>
          </div>
        )}
        {shop.contactEmail && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-none">
            <Mail className="h-5 w-5 text-black flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-black">{shop.contactEmail}</p>
            </div>
          </div>
        )}
      </div>

      {/* Contact form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium tracking-[0.1em] uppercase text-gray-500 mb-2">
            Nom complet *
          </label>
          <Input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Votre nom"
            className="h-12 rounded-none border-gray-200 focus:border-black focus:ring-0"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium tracking-[0.1em] uppercase text-gray-500 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="votre@email.com"
              className="h-12 rounded-none border-gray-200 focus:border-black focus:ring-0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium tracking-[0.1em] uppercase text-gray-500 mb-2">
              Téléphone
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+225 XX XX XX XX"
              className="h-12 rounded-none border-gray-200 focus:border-black focus:ring-0"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium tracking-[0.1em] uppercase text-gray-500 mb-2">
            Message *
          </label>
          <textarea
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Votre message…"
            className="w-full h-auto rounded-none border border-gray-200 bg-transparent px-4 py-3 text-sm text-black placeholder-gray-400 outline-none focus:border-black focus:ring-0 resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 text-sm font-medium tracking-wider uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 rounded-none"
        >
          {sending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              Envoyer le message
            </>
          )}
        </button>
      </form>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ABOUT VIEW
// ═══════════════════════════════════════════════════════════════════════════

function AboutView({
  shop,
  shopName,
  onBack,
}: {
  shop: PublicShopData
  shopName: string
  onBack: () => void
}) {
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight mb-2">À propos</h1>
      <div className="mt-3 h-[2px] w-12 bg-black mb-8" />

      {shop.aboutText && (
        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed mb-12">
          {shop.aboutText.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-4">{paragraph}</p>
          ))}
        </div>
      )}

      {!shop.aboutText && (
        <p className="text-gray-400 text-sm mb-12">
          Bienvenue chez {shopName}. Nous sommes passionnés par ce que nous faisons et nous nous efforçons
          d&apos;offrir les meilleurs produits et services à nos clients.
        </p>
      )}

      {/* Value cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: ShieldCheck, title: 'Qualité garantie', desc: 'Nous sélectionnons soigneusement chaque produit pour vous garantir la meilleure qualité.' },
          { icon: Truck, title: 'Livraison fiable', desc: 'Livraison rapide et fiable partout en Côte d\'Ivoire avec suivi de commande.' },
          { icon: Headphones, title: 'Service client', desc: 'Notre équipe est disponible 7j/7 pour répondre à toutes vos questions.' },
        ].map((item) => (
          <div key={item.title} className="p-6 bg-gray-50 rounded-none">
            <item.icon className="h-6 w-6 text-black mb-4" />
            <h3 className="text-sm font-semibold text-black mb-2">{item.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIVACY VIEW
// ═══════════════════════════════════════════════════════════════════════════

function PrivacyView({
  shop,
  shopName,
  onBack,
}: {
  shop: PublicShopData
  shopName: string
  onBack: () => void
}) {
  const sections = [
    {
      title: 'Collecte des données',
      content: `Nous collectons les données personnelles que vous nous fournissez volontairement lors de la commande (nom, numéro de téléphone, adresse de livraison). Ces données sont nécessaires au traitement et à la livraison de vos commandes.`,
    },
    {
      title: 'Utilisation des données',
      content: `Vos données sont utilisées exclusivement pour : le traitement de vos commandes, la livraison des produits, la communication relative à votre commande, et l'amélioration de nos services.`,
    },
    {
      title: 'Protection des données',
      content: `Nous prenons les mesures nécessaires pour protéger vos données personnelles contre tout accès non autorisé, toute modification, divulgation ou destruction.`,
    },
    {
      title: 'Partage des données',
      content: `Nous ne partageons pas vos données personnelles avec des tiers, sauf dans le cadre de la livraison de vos commandes (transporteurs) ou si la loi l'exige.`,
    },
    {
      title: 'Vos droits',
      content: `Vous avez le droit d'accéder, de modifier ou de supprimer vos données personnelles. Pour exercer ces droits, contactez-nous via notre page de contact.`,
    },
    {
      title: 'Contact',
      content: `Pour toute question concernant notre politique de confidentialité, veuillez nous contacter à l'adresse ${shop?.contactEmail || 'via notre formulaire de contact'}.`,
    },
  ]

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight mb-2">
        Politique de confidentialité
      </h1>
      <div className="mt-3 h-[2px] w-12 bg-black mb-8" />

      <p className="text-sm text-gray-500 mb-10">
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
      </p>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-base font-semibold text-black mb-3">{section.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER — Dark, Savoy-style 4-column
// ═══════════════════════════════════════════════════════════════════════════

function MinimalisteFooter({
  shop,
  shopName,
  categories,
  products,
  onProductClick,
  whatsapp,
  phone,
  address,
  contactEmail,
  btnColor,
  onAboutClick,
  onPrivacyClick,
  onContactClick,
  onHomeClick,
  onBoutiqueClick,
}: {
  shop: PublicShopData
  shopName: string
  categories: { name: string; id: string; image?: string }[]
  products: ModernStoreProduct[]
  onProductClick: (p: ModernStoreProduct) => void
  whatsapp: string
  phone: string
  address: string
  contactEmail: string
  btnColor: string
  onAboutClick: () => void
  onPrivacyClick: () => void
  onContactClick: () => void
  onHomeClick: () => void
  onBoutiqueClick: () => void
}) {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setSubscribing(true)
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, shopId: shop.id }),
      })
      toast.success('Merci pour votre inscription !')
      setNewsletterEmail('')
    } catch {
      toast.error("Erreur lors de l'inscription")
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer style={{ backgroundColor: DARK_BG }} className="mt-auto">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Description + Social */}
          <div>
            {shop.logo ? (
              <Image
                src={shop.logo}
                alt={shop.name}
                width={140}
                height={40}
                unoptimized
                className="h-10 w-auto max-w-[140px] object-contain mb-4 brightness-0 invert"
              />
            ) : (
              <p className="text-base font-bold text-white tracking-wide mb-4">{shop.name}</p>
            )}
            <p className="text-xs text-white/50 leading-relaxed mb-6 max-w-xs">
              {shop.description || `Découvrez notre collection de produits sélectionnés avec soin chez ${shopName}.`}
            </p>
            <div className="flex items-center gap-3">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Menu links */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-white mb-5">Menu</h4>
            <nav className="flex flex-col gap-3">
              <button type="button" onClick={onHomeClick} className="text-left text-xs text-white/50 hover:text-white transition-colors">
                Accueil
              </button>
              <button type="button" onClick={onBoutiqueClick} className="text-left text-xs text-white/50 hover:text-white transition-colors">
                Boutique
              </button>
              <button type="button" onClick={onAboutClick} className="text-left text-xs text-white/50 hover:text-white transition-colors">
                À propos
              </button>
              <button type="button" onClick={onContactClick} className="text-left text-xs text-white/50 hover:text-white transition-colors">
                Contact
              </button>
              <button type="button" onClick={onPrivacyClick} className="text-left text-xs text-white/50 hover:text-white transition-colors">
                Politique de confidentialité
              </button>
            </nav>
          </div>

          {/* Column 3: Informations */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-white mb-5">Informations</h4>
            <nav className="flex flex-col gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={onBoutiqueClick}
                  className="text-left text-xs text-white/50 hover:text-white transition-colors"
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Column 4: Contact + Newsletter */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-white mb-5">Contact</h4>
            <div className="space-y-3 mb-6">
              {whatsapp && (
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
                  <span className="text-xs text-white/50">{whatsapp}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
                  <span className="text-xs text-white/50">{phone}</span>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
                  <span className="text-xs text-white/50">{contactEmail}</span>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-3.5 w-3.5 text-white/40 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-white/50 leading-relaxed">{address}</span>
                </div>
              )}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold tracking-[0.1em] uppercase text-white/70 mb-3">Newsletter</p>
              <form onSubmit={handleNewsletter} className="flex">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Votre email"
                  className="flex-1 min-w-0 bg-white/10 border border-white/10 px-3 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 rounded-none"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="flex items-center justify-center px-3 bg-white text-black hover:bg-gray-200 transition-colors rounded-none"
                  aria-label="S'inscrire"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/30">
            &copy; {new Date().getFullYear()} {shopName}. Tous droits réservés.
          </p>
          <p className="text-[11px] text-white/30">
            Propulsé par{' '}
            <span className="text-white/50 font-medium">Boutiko</span>
          </p>
        </div>
      </div>
    </footer>
  )
}