'use client'

/**
 * TikTokLiveShopPage — Template xstore-tiktok-live
 * Ultra-high-energy Gen Z dark theme with LIVE feel, urgency triggers,
 * social proof, and massive WhatsApp CTA. All text in French.
 *
 * Color palette: Dark TikTok Energy
 *   RED: #FF0050, RED_ORANGE: #FE2C55, CYAN: #25F4EE
 *   DARK_BG: #0a0a0a, CARD_BG: #1a1a1a, CARD_HOVER: #222222
 *   TEXT: #ffffff, TEXT_MUTED: #aaaaaa
 *   GREEN (WhatsApp): #25D366, GREEN_DARK: #128C7E
 *   YELLOW: #FFD700
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingBag,
  MessageCircle,
  ShoppingCart,
  ArrowLeft,
  Phone,
  MapPin,
  ChevronUp,
  ChevronDown,
  Zap,
  Eye,
} from 'lucide-react'
import { useAppStore, type Product, type Category } from '@/lib/store'
import { formatPrice, openWhatsApp } from '@/lib/shared'
import { LiveShopFeatures } from '../live-shop-features'
import { ShippingZoneSelector } from '../shipping-zone-selector'

// ─── Couleurs du template TIKTOK LIVE ───
const TT = {
  red: '#FF0050',
  redOrange: '#FE2C55',
  cyan: '#25F4EE',
  darkBg: '#0a0a0a',
  cardBg: '#1a1a1a',
  cardHover: '#222222',
  text: '#ffffff',
  textMuted: '#aaaaaa',
  whatsapp: '#25D366',
  whatsappDark: '#128C7E',
  yellow: '#FFD700',
  border: '#2a2a2a',
} as const

type SortOption = 'recent' | 'price-asc' | 'price-desc'

// ─── Stable random values (generated once per session) ───
function useStableRandom(min: number, max: number) {
  const [val] = useState(() => Math.floor(Math.random() * (max - min + 1)) + min)
  return val
}

// ═══════════════════════════════════════════════════════════════
// SECTION 2 : HEADER / MENU
// ═══════════════════════════════════════════════════════════════

function TikTokHeader({
  shopName,
  logo,
  whatsapp,
  cartCount,
  onNavAccueil,
  onNavProduits,
  onCartClick,
}: {
  shopName: string
  logo?: string
  whatsapp?: string
  cartCount: number
  onNavAccueil: () => void
  onNavProduits: () => void
  onCartClick: () => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: TT.border,
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <button onClick={onNavAccueil} className="flex items-center gap-2 shrink-0">
            {logo && logo.length > 0 ? (
              <img src={logo} alt={shopName} className="h-[50px] w-auto max-w-[200px] object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{ background: TT.redOrange }}
                >
                  <Zap className="size-5 text-white" />
                </div>
                <span className="text-base font-bold text-white truncate max-w-[160px]">{shopName}</span>
              </div>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={onNavAccueil}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-white/5"
              style={{ color: TT.text }}
            >
              Accueil
            </button>
            <button
              onClick={onNavProduits}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-white/5"
              style={{ color: TT.text }}
            >
              Produits
            </button>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-white/5 flex items-center gap-1.5"
                style={{ color: TT.whatsapp }}
              >
                Contact
              </a>
            )}
          </nav>

          {/* Cart + Mobile menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-lg hover:bg-white/5"
              onClick={onCartClick}
            >
              <ShoppingCart className="size-5" style={{ color: TT.text }} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center text-white"
                  style={{ background: TT.redOrange }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1 p-2"
              aria-label="Menu"
            >
              <span
                className="block w-5 h-0.5 rounded transition-all"
                style={{ background: mobileOpen ? 'transparent' : TT.text }}
              />
              <span
                className="block w-5 h-0.5 rounded transition-all"
                style={{
                  background: TT.text,
                  transform: mobileOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none',
                }}
              />
              <span
                className="block w-5 h-0.5 rounded transition-all"
                style={{
                  background: TT.text,
                  transform: mobileOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t"
            style={{ borderColor: TT.border, background: TT.darkBg }}
          >
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => {
                  onNavAccueil()
                  setMobileOpen(false)
                }}
                className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: TT.text }}
              >
                Accueil
              </button>
              <button
                onClick={() => {
                  onNavProduits()
                  setMobileOpen(false)
                }}
                className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: TT.text }}
              >
                Produits
              </button>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: TT.whatsapp }}
                >
                  Contact WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 3 : CATEGORIES (horizontal pills, red active)
// ═══════════════════════════════════════════════════════════════

function TikTokCategories({
  categories,
  products,
  activeCategory,
  onCategoryClick,
}: {
  categories: Category[]
  products: Product[]
  activeCategory: string | null
  onCategoryClick: (id: string | null) => void
}) {
  const getCategoryCount = (catId?: string) =>
    products.filter((p) => p.categoryId === catId && p.isAvailable).length

  const totalAvailable = products.filter((p) => p.isAvailable).length

  if (categories.length === 0) return null

  return (
    <section className="w-full" style={{ background: TT.darkBg }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {/* Tous */}
          <button
            onClick={() => onCategoryClick(null)}
            className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
            style={
              activeCategory === null
                ? {
                    background: TT.redOrange,
                    color: TT.text,
                    boxShadow: `0 0 16px ${TT.redOrange}66`,
                  }
                : {
                    background: TT.cardBg,
                    color: TT.textMuted,
                    border: `1px solid ${TT.border}`,
                  }
            }
          >
            Tous
            <span className="text-xs opacity-70">({totalAvailable})</span>
          </button>

          {categories.map((cat) => {
            const count = getCategoryCount(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryClick(activeCategory === cat.id ? null : cat.id)}
                className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                style={
                  activeCategory === cat.id
                    ? {
                        background: TT.redOrange,
                        color: TT.text,
                        boxShadow: `0 0 16px ${TT.redOrange}66`,
                      }
                    : {
                        background: TT.cardBg,
                        color: TT.textMuted,
                        border: `1px solid ${TT.border}`,
                      }
                }
              >
                {cat.name}
                <span className="text-xs opacity-70">({count})</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 4 : SOCIAL PROOF BANNER
// ═══════════════════════════════════════════════════════════════

function TikTokSocialProof() {
  const buyerCount = useStableRandom(20, 50)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full"
      style={{ background: TT.darkBg }}
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-3">
        <div
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-center"
          style={{
            background: 'linear-gradient(90deg, rgba(255,0,80,0.08), rgba(255,215,0,0.08), rgba(255,0,80,0.08))',
            border: `1px solid ${TT.border}`,
          }}
        >
          <span
            className="text-base sm:text-lg font-bold"
            style={{
              color: TT.yellow,
              animation: 'ttFirePulse 1.5s ease-in-out infinite',
            }}
          >
            🔥
          </span>
          <span className="text-sm sm:text-base font-semibold" style={{ color: TT.textMuted }}>
            <span style={{ color: TT.text, fontWeight: 800 }}>{buyerCount} personnes</span> ont
            acheté aujourd&apos;hui
          </span>
          <span
            className="text-base sm:text-lg font-bold"
            style={{
              color: TT.yellow,
              animation: 'ttFirePulse 1.5s ease-in-out infinite 0.3s',
            }}
          >
            🔥
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 5 : PRODUCT CARD (dark, flash sale ribbon, stock warning)
// ═══════════════════════════════════════════════════════════════

function TikTokProductCard({
  product,
  index,
  onProductClick,
  onAddToCart,
  getCartQuantity,
  updateCartQuantity,
  whatsapp,
}: {
  product: Product
  index: number
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product) => void
  getCartQuantity: (id: string) => number
  updateCartQuantity: (id: string, qty: number) => void
  whatsapp?: string
}) {
  const cartQty = getCartQuantity(product.id)
  const inStock = (product.stock ?? 0) > 0
  const lowStock = inStock && (product.stock ?? 999) <= 5 && (product.stock ?? 999) > 0
  const selectedShippingZone = useAppStore((s) => s.selectedShippingZone)

  return (
    <motion.div
      className="group flex flex-col overflow-hidden rounded-xl transition-all duration-300 cursor-pointer"
      style={{
        background: TT.cardBg,
        border: `1px solid ${TT.border}`,
      }}
      onClick={() => onProductClick(product)}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px ${TT.redOrange}44, 0 4px 16px rgba(0,0,0,0.4)`
        e.currentTarget.style.borderColor = TT.redOrange
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = TT.border
      }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-gray-800" style={{ aspectRatio: '1 / 1' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1' }}
            style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: '#111' }}
          >
            <Package className="size-16" style={{ color: '#333' }} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: TT.redOrange, boxShadow: `0 0 20px ${TT.redOrange}66` }}
            >
              <Eye className="size-5 text-white" />
            </div>
          </div>
        </div>

        {/* FLASH SALE ribbon */}
        <div
          className="absolute top-3 right-[-8px] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white z-10 overflow-hidden"
          style={{
            background: TT.red,
            boxShadow: `0 2px 8px ${TT.red}66`,
            transform: 'rotate(-12deg)',
          }}
        >
          {/* Shimmer overlay on ribbon */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'ttShimmer 2s ease-in-out infinite',
            }}
          />
          <span className="relative z-10">⚡ FLASH SALE</span>
        </div>

        {/* Rupture badge */}
        {!inStock && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-red-600 text-white border-none text-[10px] font-bold">Rupture</Badge>
          </div>
        )}

        {/* Low stock warning */}
        {lowStock && (
          <div
            className="absolute bottom-2 left-2 right-2 z-10 text-center py-1 rounded-lg text-[11px] font-bold"
            style={{
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
              color: TT.yellow,
              animation: 'ttTextPulse 2s ease-in-out infinite',
            }}
          >
            ⚡ Plus que {product.stock} en stock !
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-1.5 p-3">
        <h3
          className="font-semibold text-sm line-clamp-2 leading-snug"
          style={{ color: TT.text }}
        >
          {product.name}
        </h3>

        {/* Stock */}
        <div className="flex items-center gap-1">
          {inStock ? (
            !lowStock ? (
              <span className="text-[11px] font-medium" style={{ color: TT.whatsapp }}>
                ✓ En stock
              </span>
            ) : null
          ) : (
            <span className="text-[11px] font-medium" style={{ color: TT.red }}>
              Rupture de stock
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-1">
          <span
            className="inline-block px-2.5 py-1 rounded-lg text-sm font-bold"
            style={{
              color: TT.redOrange,
              background: 'rgba(254,44,85,0.1)',
              border: `1px solid ${TT.redOrange}33`,
            }}
          >
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="mt-1">
          {cartQty === 0 ? (
            <div className="flex gap-1.5">
              <Button
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation()
                  onAddToCart(product)
                  toast.success(`${product.name} ajouté au panier !`)
                }}
                className="flex-1 gap-1.5 text-white font-semibold rounded-lg text-sm h-9"
                style={{ background: TT.redOrange }}
                disabled={!product.isAvailable || !inStock}
              >
                <Plus className="size-3.5" />
                Ajouter
              </Button>
              {whatsapp && (
                <Button
                  onClick={(e) => {
                    e.nativeEvent.stopImmediatePropagation()
                    openWhatsApp(product, whatsapp, 1, selectedShippingZone)
                  }}
                  className="gap-1.5 font-semibold rounded-lg text-sm h-9 px-3 text-white"
                  style={{ background: TT.whatsapp }}
                  disabled={!product.isAvailable || !inStock}
                >
                  <MessageCircle className="size-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-between rounded-lg p-1"
              style={{
                background: 'rgba(254,44,85,0.1)',
                border: `1px solid ${TT.redOrange}33`,
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                style={{ color: TT.redOrange }}
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation()
                  updateCartQuantity(product.id, cartQty - 1)
                }}
              >
                {cartQty === 1 ? (
                  <Trash2 className="size-3.5 text-red-500" />
                ) : (
                  <Minus className="size-3.5" />
                )}
              </Button>
              <span className="min-w-[2rem] text-center font-bold text-sm" style={{ color: TT.text }}>
                {cartQty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                style={{ color: TT.redOrange }}
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation()
                  updateCartQuantity(product.id, cartQty + 1)
                }}
              >
                <Plus className="size-3.5" />
              </Button>
              {whatsapp && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  style={{ color: TT.whatsapp }}
                  onClick={(e) => {
                    e.nativeEvent.stopImmediatePropagation()
                    openWhatsApp(product, whatsapp, cartQty, selectedShippingZone)
                  }}
                >
                  <MessageCircle className="size-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 6 : TRUST BADGES ROW
// ═══════════════════════════════════════════════════════════════

function TikTokTrustBadges() {
  const badges = [
    '✅ Paiement à la livraison',
    '✅ Retour gratuit',
    '✅ Garantie qualité',
  ]

  return (
    <section className="w-full" style={{ background: TT.darkBg }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {badges.map((text) => (
            <span
              key={text}
              className="text-xs sm:text-sm font-medium"
              style={{ color: TT.textMuted }}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 7 : MASSIVE WHATSAPP CTA
// ═══════════════════════════════════════════════════════════════

function TikTokWhatsAppCTA({ whatsapp, shopName }: { whatsapp?: string; shopName: string }) {
  if (!whatsapp) return null

  return (
    <section className="w-full" style={{ background: TT.darkBg }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
        <motion.a
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
            `Bonjour ${shopName} ! 👋\nJe suis intéressé(e) par vos produits en LIVE.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 sm:py-5 rounded-2xl text-white font-black text-base sm:text-xl uppercase tracking-wide"
          style={{
            background: `linear-gradient(135deg, ${TT.whatsapp}, ${TT.whatsappDark})`,
            boxShadow: `0 4px 24px ${TT.whatsapp}44, 0 2px 8px rgba(0,0,0,0.3)`,
            animation: 'ttBounce 2s ease-in-out infinite',
          }}
          whileTap={{ scale: 0.97 }}
        >
          <ShoppingCart className="size-5 sm:size-6" />
          <span>Commander maintenant</span>
        </motion.a>
        <p className="text-center mt-2 text-xs sm:text-sm" style={{ color: TT.textMuted }}>
          🚀 Livraison 24h
        </p>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 8 : PRODUCT DETAIL VIEW (dark overlay style)
// ═══════════════════════════════════════════════════════════════

function TikTokProductDetail({
  product,
  whatsapp,
  onClose,
  onAddToCart,
  cartQty,
  updateCartQuantity,
}: {
  product: Product
  whatsapp?: string
  onClose: () => void
  onAddToCart: (product: Product, qty: number) => void
  cartQty: number
  updateCartQuantity: (id: string, qty: number) => void
}) {
  const [qty, setQty] = useState(1)
  const [imgIndex, setImgIndex] = useState(0)
  const selectedShippingZone = useAppStore((s) => s.selectedShippingZone)

  const productImages = product.images?.length ? product.images : product.image ? [product.image] : []
  const inStock = (product.stock ?? 0) > 0
  const lowStock = inStock && (product.stock ?? 999) <= 5 && (product.stock ?? 999) > 0

  function handleAdd(addQty: number) {
    for (let i = 0; i < addQty; i++) {
      onAddToCart(product, 1)
    }
    toast.success(`${product.name} (x${addQty}) ajouté au panier !`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
      className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6"
    >
      {/* Back button */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-semibold mb-6 transition-colors hover:opacity-70"
        style={{ color: TT.redOrange }}
      >
        <ArrowLeft className="size-4" />
        Retour à la boutique
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden" style={{ background: '#111' }}>
            {productImages[imgIndex] ? (
              <img
                src={productImages[imgIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="size-20" style={{ color: '#333' }} />
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIndex(idx)}
                  className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: idx === imgIndex ? TT.redOrange : TT.border,
                    opacity: idx === imgIndex ? 1 : 0.5,
                  }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {/* Flash sale badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
              style={{
                background: TT.red,
                boxShadow: `0 0 12px ${TT.red}55`,
              }}
            >
              ⚡ Flash Sale
            </span>
            {product.categoryName && (
              <Badge className="text-xs text-white" style={{ background: TT.cardBg, border: `1px solid ${TT.border}` }}>
                {product.categoryName}
              </Badge>
            )}
            {!inStock && (
              <Badge className="text-xs text-white border-none" style={{ background: '#991b1b' }}>
                Rupture de stock
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold" style={{ color: TT.text }}>
            {product.name}
          </h1>

          <p className="text-2xl font-extrabold" style={{ color: TT.redOrange }}>
            {formatPrice(product.price)}
          </p>

          {/* Stock warning in detail */}
          {lowStock && (
            <p
              className="text-sm font-bold"
              style={{
                color: TT.yellow,
                animation: 'ttTextPulse 2s ease-in-out infinite',
              }}
            >
              ⚡ Plus que {product.stock} en stock — commandez vite !
            </p>
          )}

          {inStock && !lowStock && (
            <p className="text-sm" style={{ color: TT.textMuted }}>
              ✓ En stock ({product.stock} disponibles)
            </p>
          )}

          {product.description && (
            <p className="text-sm leading-relaxed" style={{ color: TT.textMuted }}>
              {product.description}
            </p>
          )}

          {/* Quantity stepper */}
          <div
            className="p-4 rounded-xl"
            style={{ background: TT.cardBg, border: `1px solid ${TT.border}` }}
          >
            <p className="text-sm font-semibold mb-3" style={{ color: TT.text }}>Quantité</p>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="flex items-center rounded-lg"
                style={{ border: `1px solid ${TT.border}` }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  style={{ color: TT.redOrange }}
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="min-w-[36px] text-center font-bold text-base" style={{ color: TT.text }}>
                  {qty}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  style={{ color: TT.redOrange }}
                  onClick={() => setQty(qty + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <span className="text-lg font-bold" style={{ color: TT.redOrange }}>
                {formatPrice(product.price * qty)}
              </span>
            </div>

            <Button
              className="w-full h-12 gap-2 text-sm font-bold text-white rounded-xl"
              style={{ background: TT.redOrange }}
              disabled={!inStock}
              onClick={() => handleAdd(qty)}
            >
              <ShoppingCart className="size-5" />
              Ajouter au panier
            </Button>
          </div>

          {/* Shipping zone selector */}
          <ShippingZoneSelector />

          {/* WhatsApp massive button */}
          {whatsapp && (
            <Button
              className="w-full h-14 gap-2 text-base font-black rounded-xl text-white"
              style={{
                background: `linear-gradient(135deg, ${TT.whatsapp}, ${TT.whatsappDark})`,
                boxShadow: `0 4px 16px ${TT.whatsapp}44`,
              }}
              disabled={!inStock}
              onClick={() => openWhatsApp(product, whatsapp, qty, selectedShippingZone)}
            >
              <MessageCircle className="size-6" />
              Commander sur WhatsApp
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 9 : CART DRAWER (dark slide-up)
// ═══════════════════════════════════════════════════════════════

function TikTokCartDrawer({
  expanded,
  onToggle,
  onClear,
  onCheckout,
  total,
  itemCount,
  cart,
  updateCartQuantity,
}: {
  expanded: boolean
  onToggle: () => void
  onClear: () => void
  onCheckout: () => void
  total: number
  itemCount: number
  cart: { id: string; productId: string; name: string; price: number; image?: string; quantity: number }[]
  updateCartQuantity: (id: string, qty: number) => void
}) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Expanded cart */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t"
            style={{ background: TT.cardBg, borderColor: TT.border }}
          >
            <ScrollArea className="max-h-64">
              <div className="max-w-[1400px] mx-auto p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm" style={{ color: TT.text }}>
                    Votre panier ({itemCount} article{itemCount !== 1 ? 's' : ''})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 h-7 text-xs"
                    onClick={onClear}
                  >
                    <Trash2 className="size-3 mr-1" />
                    Tout supprimer
                  </Button>
                </div>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg shrink-0 overflow-hidden"
                      style={{ background: '#111' }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="size-5" style={{ color: '#333' }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1" style={{ color: TT.text }}>
                        {item.name}
                      </p>
                      <p className="text-xs font-bold" style={{ color: TT.redOrange }}>
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div
                      className="flex items-center rounded-lg"
                      style={{ background: TT.darkBg }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        style={{ color: TT.textMuted }}
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="size-3 text-red-400" />
                        ) : (
                          <Minus className="size-3" />
                        )}
                      </Button>
                      <span className="text-sm font-semibold min-w-[24px] text-center" style={{ color: TT.text }}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        style={{ color: TT.textMuted }}
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <span className="text-sm font-bold w-24 text-right" style={{ color: TT.redOrange }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between font-bold" style={{ color: TT.text }}>
                  <span>Total</span>
                  <span style={{ color: TT.redOrange }}>{formatPrice(total)}</span>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart bar */}
      <div
        className="border-t px-4 py-3"
        style={{ background: TT.cardBg, borderColor: TT.border }}
      >
        <div className="max-w-[1400px] mx-auto flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-1.5 shrink-0 rounded-lg"
            style={{ borderColor: TT.border, color: TT.text, background: TT.darkBg }}
            onClick={onToggle}
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            <Badge
              className="px-1.5 h-5 text-xs text-white rounded-md"
              style={{ background: TT.redOrange }}
            >
              {itemCount}
            </Badge>
            <span className="hidden sm:inline text-sm">panier</span>
          </Button>

          <div className="flex-1">
            <p className="text-xs" style={{ color: TT.textMuted }}>Total</p>
            <p className="font-bold text-sm" style={{ color: TT.redOrange }}>{formatPrice(total)}</p>
          </div>

          <Button
            className="h-10 gap-2 font-semibold text-sm rounded-lg px-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${TT.whatsapp}, ${TT.whatsappDark})`,
            }}
            onClick={onCheckout}
          >
            <MessageCircle className="size-4" />
            <span className="hidden sm:inline">Commander via WhatsApp</span>
            <span className="sm:hidden">Commander</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 10 : SEARCH BAR (dark input, red accent)
// ═══════════════════════════════════════════════════════════════

function TikTokSearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
  isSearching,
}: {
  searchQuery: string
  onSearchChange: (q: string) => void
  sortBy: SortOption
  onSortChange: (s: SortOption) => void
  resultCount: number
  isSearching: boolean
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  const handleChange = useCallback(
    (value: string) => {
      setLocalSearch(value)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onSearchChange(value), 300)
    },
    [onSearchChange]
  )

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: TT.textMuted }} />
        <Input
          type="text"
          placeholder="Rechercher un produit..."
          value={localSearch}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-10 pr-10 h-11 rounded-xl text-sm"
          style={{
            background: TT.cardBg,
            borderColor: TT.border,
            color: TT.text,
          }}
        />
        {localSearch && (
          <button
            onClick={() => handleChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: TT.textMuted }}
            aria-label="Effacer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="appearance-none h-11 px-4 pr-10 rounded-xl text-sm font-medium cursor-pointer"
          style={{
            background: TT.cardBg,
            color: TT.text,
            border: `1px solid ${TT.border}`,
          }}
        >
          <option value="recent">Plus récents</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4" style={{ color: TT.textMuted }} />
      </div>

      {/* Results count */}
      {isSearching && (
        <div className="flex items-center gap-1.5 text-sm" style={{ color: TT.textMuted }}>
          <ShoppingBag className="size-4" />
          {resultCount} résultat{resultCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 11 : FOOTER (dark with TikTok gradient)
// ═══════════════════════════════════════════════════════════════

function TikTokFooter({
  shopName,
  whatsapp,
  phone,
  address,
}: {
  shopName: string
  whatsapp?: string
  phone?: string
  address?: string
}) {
  return (
    <footer className="w-full mt-8" style={{ background: TT.darkBg }}>
      {/* TikTok-style gradient line at top */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${TT.redOrange}, ${TT.cyan}, ${TT.redOrange})`,
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
        {/* Trust badges */}
        <TikTokTrustBadges />

        <Separator className="bg-white/10 my-6" />

        {/* Contact info + copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="font-bold" style={{ color: TT.text }}>{shopName}</p>
            <div className="flex items-center gap-4 text-xs" style={{ color: TT.textMuted }}>
              {whatsapp && (
                <span className="flex items-center gap-1">
                  <Phone className="size-3" />
                  {whatsapp}
                </span>
              )}
              {address && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {address}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs" style={{ color: '#555' }}>
            © {new Date().getFullYear()} {shopName}. Tous droits réservés. Propulsé par{' '}
            <span className="font-medium" style={{ color: TT.textMuted }}>Boutiko</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════

function TikTokLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Boutiko</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CSS ANIMATIONS (injected once via style tag)
// ═══════════════════════════════════════════════════════════════

function TikTokAnimations() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @keyframes ttPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.8; }
          }
          @keyframes ttShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes ttBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes ttTextPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          @keyframes ttFirePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          /* Custom scrollbar for dark theme */
          * {
            scrollbar-color: #333 #111;
          }
        `,
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN: TikTokLiveShopPage — Full standalone shop page
// ═══════════════════════════════════════════════════════════════

export function TikTokLiveShopPage() {
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
    clearCart,
    getCartTotal,
  } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [cartExpanded, setCartExpanded] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to top when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
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
    if (slug) {
      window.history.pushState(null, '', `/${slug}`)
    }
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname
      const match = pathname.match(/^\/([a-z0-9][a-z0-9-]*)\/p\/([a-z0-9][a-z0-9-]*)$/i)
      if (match) {
        const productSlug = match[2]
        const found = publicProducts.find((p: Product) => (p.slug || p.id) === productSlug)
        if (found) setSelectedProduct(found)
        else setSelectedProduct(null)
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
      // Error loading
    } finally {
      setLoading(false)
    }
  }, [shopSlug, setPublicShop, setPublicProducts, setPublicCategories])

  useEffect(() => {
    fetchShop()
  }, [fetchShop])

  // ── Filter & sort products ──
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
  const totalProductCount = publicProducts.filter((p) => p.isAvailable).length
  const isSearching = searchQuery.trim().length > 0

  // ── Handlers ──
  function handleAddToCart(product: Product, qty: number = 1) {
    const cartImage = (product.images && product.images[0]) || product.image || undefined
    addToCart({ productId: product.id, name: product.name, price: product.price, image: cartImage, quantity: qty })
  }

  function getCartQuantity(productId: string): number {
    return cart.find((c) => c.productId === productId)?.quantity || 0
  }

  function handleNavAccueil() {
    handleBackFromProduct()
    setActiveCategory(null)
    setSearchQuery('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleNavProduits() {
    handleBackFromProduct()
    setActiveCategory(null)
    setSearchQuery('')
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    const msg = `🔴 COMMANDE LIVE - ${publicShop.name}\n\n${itemsText}\n\n━━━━━━━━━━━━━━\n💰 Total : ${total.toLocaleString('fr-FR')} FCFA\n\n📝 Mes informations :\nNom :\nAdresse :\nTéléphone :\n\n⚡ Livraison 24h ! 🙏`
    const encoded = encodeURIComponent(msg)
    const phone = publicShop.whatsapp?.replace(/\D/g, '') || ''
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  // ── Loading ──
  if (loading) return <TikTokLoadingSkeleton />

  // ── Shop not found ──
  if (!publicShop) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: TT.darkBg }}
      >
        <div className="text-center">
          <div
            className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-4"
            style={{ background: 'rgba(254,44,85,0.15)' }}
          >
            <Package className="size-10" style={{ color: TT.redOrange }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: TT.text }}>
            Boutique introuvable
          </h2>
          <p className="text-sm mb-4" style={{ color: TT.textMuted }}>
            Cette boutique n&apos;existe pas ou a été désactivée.
          </p>
          <Button
            onClick={() => setView('landing')}
            className="text-white font-semibold rounded-xl"
            style={{ background: TT.redOrange }}
          >
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      style={{
        background: TT.darkBg,
        color: TT.text,
      }}
    >
      {/* CSS Animations */}
      <TikTokAnimations />

      {/* ═══ HEADER ═══ */}
      <TikTokHeader
        shopName={publicShop.name}
        logo={publicShop.logo}
        whatsapp={publicShop.whatsapp}
        cartCount={itemCount}
        onNavAccueil={handleNavAccueil}
        onNavProduits={handleNavProduits}
        onCartClick={() => cart.length > 0 && setCartExpanded(!cartExpanded)}
      />

      <main className="flex-1">
        <LiveShopFeatures />
        <AnimatePresence mode="wait" initial={false}>
          {selectedProduct ? (
            /* ═══ PRODUCT DETAIL ═══ */
            <TikTokProductDetail
              key={selectedProduct.id}
              product={selectedProduct}
              whatsapp={publicShop.whatsapp}
              onClose={handleBackFromProduct}
              onAddToCart={(product, qty) => {
                for (let i = 0; i < qty; i++) handleAddToCart(product, 1)
              }}
              cartQty={getCartQuantity(selectedProduct.id)}
              updateCartQuantity={updateCartQuantity}
            />
          ) : (
            /* ═══ MAIN LAYOUT ═══ */
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* ═══ CATEGORIES ═══ */}
              <TikTokCategories
                categories={publicCategories}
                products={publicProducts}
                activeCategory={activeCategory}
                onCategoryClick={(id) => {
                  setActiveCategory(id)
                  handleBackFromProduct()
                  scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
              />

              {/* ═══ SOCIAL PROOF ═══ */}
              <TikTokSocialProof />

              {/* ═══ PRODUCTS SECTION ═══ */}
              <section className="w-full" style={{ background: TT.darkBg }}>
                <div
                  className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 space-y-6"
                  ref={scrollRef}
                >
                  {/* Section title */}
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full" style={{ background: TT.redOrange }} />
                    <h2 className="text-lg font-bold" style={{ color: TT.text }}>
                      Nos Produits
                    </h2>
                    <span className="text-sm" style={{ color: TT.textMuted }}>
                      ({totalProductCount} produit{totalProductCount !== 1 ? 's' : ''})
                    </span>
                  </div>

                  {/* Search + Sort */}
                  <TikTokSearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    resultCount={filteredProducts.length}
                    isSearching={isSearching}
                  />

                  {/* Loading skeletons for search */}
                  {isSearching && filteredProducts.length === 0 && publicProducts.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-2 rounded-xl overflow-hidden"
                          style={{ background: TT.cardBg, border: `1px solid ${TT.border}` }}
                        >
                          <Skeleton className="w-full" style={{ aspectRatio: '1 / 1' }} />
                          <div className="p-3 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-9 w-full rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {!isSearching && publicProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div
                        className="flex items-center justify-center w-20 h-20 rounded-full mb-4"
                        style={{ background: 'rgba(254,44,85,0.15)' }}
                      >
                        <Package className="size-10" style={{ color: TT.redOrange }} />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: TT.text }}>
                        Aucun produit disponible
                      </h3>
                      <p className="mt-1 text-sm max-w-md" style={{ color: TT.textMuted }}>
                        Cette boutique n&apos;a pas encore de produits. Revenez bientôt !
                      </p>
                    </div>
                  )}

                  {/* Empty search */}
                  {filteredProducts.length === 0 && publicProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div
                        className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
                        style={{ background: 'rgba(255,215,0,0.15)' }}
                      >
                        <Search className="size-7" style={{ color: TT.yellow }} />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: TT.text }}>
                        Aucun résultat trouvé
                      </h3>
                      <p className="mt-1 text-sm max-w-md" style={{ color: TT.textMuted }}>
                        {searchQuery
                          ? `Aucun produit ne correspond à "${searchQuery}".`
                          : 'Aucun produit dans cette catégorie.'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-xl"
                        style={{ borderColor: TT.redOrange, color: TT.redOrange }}
                        onClick={() => {
                          setSearchQuery('')
                          setActiveCategory(null)
                        }}
                      >
                        Réinitialiser les filtres
                      </Button>
                    </motion.div>
                  )}

                  {/* Product Grid */}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeCategory + searchQuery + sortBy}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                      {filteredProducts.map((product, index) => (
                        <TikTokProductCard
                          key={product.id}
                          product={product}
                          index={index}
                          onProductClick={handleProductClick}
                          onAddToCart={(p) => handleAddToCart(p, 1)}
                          getCartQuantity={getCartQuantity}
                          updateCartQuantity={updateCartQuantity}
                          whatsapp={publicShop.whatsapp}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>

              {/* ═══ MASSIVE WHATSAPP CTA ═══ */}
              <TikTokWhatsAppCTA whatsapp={publicShop.whatsapp} shopName={publicShop.name} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ FOOTER ═══ */}
      <TikTokFooter
        shopName={publicShop.name}
        whatsapp={publicShop.whatsapp}
        phone={publicShop.phone}
        address={publicShop.address}
      />

      {/* ═══ CART DRAWER ═══ */}
      <AnimatePresence>
        {cart.length > 0 && (
          <TikTokCartDrawer
            expanded={cartExpanded}
            onToggle={() => setCartExpanded(!cartExpanded)}
            onClear={clearCart}
            onCheckout={handleWhatsAppCheckout}
            total={total}
            itemCount={itemCount}
            cart={cart}
            updateCartQuantity={updateCartQuantity}
          />
        )}
      </AnimatePresence>

      {/* ═══ FLOATING WHATSAPP BUTTON ═══ */}
      {publicShop.whatsapp && (
        <a
          href={`https://wa.me/${publicShop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
            `Bonjour ${publicShop.name} ! 👋\nJe suis intéressé(e) par vos produits en LIVE.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[80px] right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
          style={{
            background: TT.whatsapp,
            boxShadow: `0 4px 16px ${TT.whatsapp}44`,
          }}
          title={`Contacter ${publicShop.name} sur WhatsApp`}
        >
          <MessageCircle className="size-7 text-white" />
          {/* Tooltip */}
          <span
            className="absolute right-full mr-3 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ background: '#1a1a1a', color: 'white' }}
          >
            Contacter sur WhatsApp
          </span>
        </a>
      )}
    </motion.div>
  )
}