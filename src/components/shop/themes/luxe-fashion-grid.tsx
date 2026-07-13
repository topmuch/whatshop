'use client'

/**
 * LuxeFashionShopPage — Template luxe-fashion
 * Glassmorphism luxury theme with champagne gold & blush pink palette.
 *
 * Layout:
 *   1. Header (glassmorphism nav)
 *   2. Instagram Stories bar
 *   3. Hero Section (gradient overlay, "Nouvelle Collection" badge)
 *   4. Categories (horizontal scrollable gold pills)
 *   5. Products (glassmorphism cards)
 *   6. Testimonials
 *   7. Footer (dark + gold)
 *   8. Cart Drawer (slide-up glassmorphism)
 *   9. WhatsApp FAB (pulse animation)
 *
 * Color palette: Champagne Gold #D4AF37, Blush Pink #FFE5E5
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingBag,
  ChevronRight,
  MessageCircle,
  ShoppingCart,
  ArrowLeft,
  Star,
  Eye,
  Sparkles,
  Heart,
  Quote,
  Gem,
} from 'lucide-react'
import { useAppStore, type Product, type Category } from '@/lib/store'
import { formatPrice, openWhatsApp } from '@/lib/shared'
import { LiveShopFeatures } from '../live-shop-features'
import { ShippingZoneSelector } from '../shipping-zone-selector'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { ThemedCartDrawer } from '@/components/shop/themed-cart-drawer'

// ─── Color Palette: CHAMPAGNE GOLD LUXE ───
const GOLD = {
  primary: '#D4AF37',
  dark: '#B8860B',
  light: '#FFFDD0',
} as const

const THEME = {
  gold: '#D4AF37',
  goldDark: '#B8860B',
  goldLight: '#FFFDD0',
  pink: '#FFE5E5',
  pinkDeep: '#FFD6D6',
  cream: '#FFFDD0',
  white: '#FFFFFF',
  text: '#1a1a1a',
  textMuted: '#8B7355',
  whatsapp: '#25D366',
  whatsappFg: '#FFFFFF',
  glassBg: 'rgba(255, 255, 255, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.30)',
} as const

type SortOption = 'recent' | 'price-asc' | 'price-desc'

// ─── Instagram Stories Data ───
const STORIES = [
  { label: 'Nouvelle Collection', emoji: '✨' },
  { label: 'Bestsellers', emoji: '🔥' },
  { label: 'Promos', emoji: '🎁' },
  { label: 'Tendances', emoji: '💎' },
  { label: 'Exclusivités', emoji: '👑' },
  { label: 'Coup de Cœur', emoji: '❤️' },
]

// ─── Testimonials Data ───
const TESTIMONIALS = [
  { name: 'Aminata D.', text: 'Qualité exceptionnelle ! Les tissus sont magnifiques et la livraison est rapide.', stars: 5 },
  { name: 'Fatou S.', text: 'J\'adore cette boutique. Des pièces uniques et un service client au top !', stars: 5 },
  { name: 'Mariama B.', text: 'Mes commandes sont toujours parfaites. Je recommande vivement à toutes mes amies.', stars: 5 },
]

// ═══════════════════════════════════════════════════════════════
// HEADER — Glassmorphism navigation
// ═══════════════════════════════════════════════════════════════

function LuxeHeader({
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
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/30">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <button onClick={onNavAccueil} className="flex items-center gap-2 shrink-0">
            {logo && logo.length > 0 ? (
              <ImageWithFallback
                src={logo}
                alt={shopName}
                width={200}
                height={53}
                className="h-[53px] w-[200px] object-contain"
                fallbackIcon="image"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})`, color: THEME.white }}
                >
                  <Gem className="size-5" />
                </div>
                <div className="text-left">
                  <span className="font-serif text-lg font-bold tracking-wide" style={{ color: THEME.text }}>
                    {shopName}
                  </span>
                  <span className="block text-[10px] uppercase tracking-widest" style={{ color: THEME.textMuted }}>
                    Maison de Mode
                  </span>
                </div>
              </div>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={onNavAccueil}
              className="px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-white/40"
              style={{ color: THEME.text }}
            >
              Accueil
            </button>
            <button
              onClick={onNavProduits}
              className="px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-white/40"
              style={{ color: THEME.text }}
            >
              Collections
            </button>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-white/40 flex items-center gap-1.5"
                style={{ color: THEME.text }}
              >
                Contactez Nous
              </a>
            )}
          </nav>

          {/* Cart + Mobile menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full hover:bg-white/40"
              onClick={onCartClick}
            >
              <ShoppingCart className="size-5" style={{ color: THEME.text }} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center text-white"
                  style={{ background: THEME.gold }}
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
                style={{ background: mobileOpen ? 'transparent' : THEME.text }}
              />
              <span
                className="block w-5 h-0.5 rounded transition-all"
                style={{
                  background: THEME.text,
                  transform: mobileOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none',
                }}
              />
              <span
                className="block w-5 h-0.5 rounded transition-all"
                style={{
                  background: THEME.text,
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
            className="md:hidden overflow-hidden border-t border-white/30 backdrop-blur-xl bg-white/80"
          >
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => { onNavAccueil(); setMobileOpen(false) }}
                className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-xl hover:bg-white/40 transition-colors"
                style={{ color: THEME.text }}
              >
                Accueil
              </button>
              <button
                onClick={() => { onNavProduits(); setMobileOpen(false) }}
                className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-xl hover:bg-white/40 transition-colors"
                style={{ color: THEME.text }}
              >
                Collections
              </button>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-xl hover:bg-white/40 transition-colors"
                  style={{ color: THEME.text }}
                >
                  Contactez Nous
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
// INSTAGRAM STORIES BAR
// ═══════════════════════════════════════════════════════════════

function LuxeStories({
  onStoryClick,
  activeStory,
}: {
  onStoryClick: (label: string) => void
  activeStory: string | null
}) {
  return (
    <section className="w-full py-4">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {STORIES.map((story) => {
            const isActive = activeStory === story.label
            return (
              <button
                key={story.label}
                onClick={() => onStoryClick(isActive ? '' : story.label)}
                className="shrink-0 flex flex-col items-center gap-2 group"
              >
                <div
                  className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[3px] transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: isActive
                      ? `conic-gradient(from 0deg, ${THEME.gold}, ${THEME.goldDark}, ${THEME.gold}, ${THEME.goldDark})`
                      : `linear-gradient(135deg, ${THEME.gold}66, ${THEME.goldDark}66)`,
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm text-2xl sm:text-3xl"
                  >
                    {story.emoji}
                  </div>
                  {/* Active ring glow */}
                  {isActive && (
                    <motion.div
                      layoutId="story-glow"
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: `0 0 20px ${THEME.gold}80` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </div>
                <span
                  className="text-[10px] sm:text-xs font-medium text-center max-w-[72px] leading-tight"
                  style={{ color: isActive ? THEME.goldDark : THEME.textMuted }}
                >
                  {story.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════

function LuxeHero({
  shopName,
  heroImages,
  whatsapp,
  onShopNow,
}: {
  shopName: string
  heroImages?: string
  whatsapp?: string
  onShopNow: () => void
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const images: string[] = useMemo(() => {
    if (!heroImages) return []
    try {
      const parsed = JSON.parse(heroImages)
      return Array.isArray(parsed) ? parsed.filter((img: string) => img && img.length > 0) : []
    } catch {
      return heroImages ? [heroImages] : []
    }
  }, [heroImages])

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section className="w-full">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '1180 / 600', maxHeight: '600px' }}
      >
        {images.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <ImageWithFallback
                src={images[currentSlide]}
                alt={`${shopName} - Bannière ${currentSlide + 1}`}
                fill
                className="w-full h-full object-cover"
                fallbackIcon="image"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div
            className="absolute inset-0 flex items-center"
            style={{
              background: `linear-gradient(135deg, ${THEME.goldDark} 0%, ${THEME.gold} 30%, ${THEME.pinkDeep} 70%, ${THEME.pink} 100%)`,
            }}
          >
            {/* Decorative elements */}
            <div className="absolute top-10 right-20 w-72 h-72 rounded-full opacity-10 bg-white" />
            <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full opacity-5 bg-white" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-5 bg-white" />

            <div className="relative z-10 px-8 sm:px-16 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-6"
                  style={{ background: `${THEME.gold}CC` }}
                >
                  <Sparkles className="size-3.5" />
                  Nouvelle Collection
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 tracking-wide">
                  L&apos;Élégance <br />
                  <span style={{ color: THEME.goldLight }}>à l&apos;état pur</span>
                </h1>
                <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg font-sans">
                  Découvrez notre sélection exclusive de pièces de mode, conçues pour sublimer votre style.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={onShopNow}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ background: THEME.gold, color: THEME.text }}
                  >
                    Découvrir
                    <ChevronRight className="size-4" />
                  </button>
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-sm border-2 border-white/30 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
                    >
                      <MessageCircle className="size-4" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Slide indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: idx === currentSlide ? '24px' : '8px',
                  background: idx === currentSlide ? THEME.gold : 'rgba(255,255,255,0.5)',
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// CATEGORIES — Horizontal scrollable gold pills
// ═══════════════════════════════════════════════════════════════

function LuxeCategories({
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
    <section className="w-full py-5">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-[2px] rounded-full" style={{ background: THEME.gold }} />
          <h2 className="font-serif text-lg font-bold tracking-wide" style={{ color: THEME.text }}>
            Nos Catégories
          </h2>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {/* Tous */}
          <button
            onClick={() => onCategoryClick(null)}
            className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
            style={
              activeCategory === null
                ? { background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})`, color: THEME.white, boxShadow: `0 4px 16px ${THEME.gold}44` }
                : { background: THEME.glassBg, color: THEME.text, border: `1px solid ${THEME.glassBorder}`, backdropFilter: 'blur(12px)' }
            }
          >
            Tous
            <span className="text-xs opacity-70">({totalAvailable})</span>
          </button>

          {categories.map((cat) => {
            const count = getCategoryCount(cat.id)
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryClick(isActive ? null : cat.id)}
                className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                style={
                  isActive
                    ? { background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})`, color: THEME.white, boxShadow: `0 4px 16px ${THEME.gold}44` }
                    : { background: THEME.glassBg, color: THEME.text, border: `1px solid ${THEME.glassBorder}`, backdropFilter: 'blur(12px)' }
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
// PRODUCT CARD — Glassmorphism
// ═══════════════════════════════════════════════════════════════

function LuxeProductCard({
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
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
  const selectedShippingZone = useAppStore((s) => s.selectedShippingZone)

  return (
    <motion.div
      className="group flex flex-col overflow-hidden rounded-2xl backdrop-blur-xl cursor-pointer transition-all duration-500 hover:-translate-y-[5px] hover:scale-[1.03] hover:shadow-2xl"
      style={{
        background: THEME.glassBg,
        border: `1px solid ${THEME.glassBorder}`,
      }}
      onClick={() => onProductClick(product)}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '336 / 320' }}>
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          fill
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          fallbackIcon="package"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
            <div className="flex items-center justify-center w-11 h-11 rounded-full backdrop-blur-md bg-white/70 shadow-lg">
              <Eye className="size-5" style={{ color: THEME.goldDark }} />
            </div>
            <div className="flex items-center justify-center w-11 h-11 rounded-full backdrop-blur-md bg-white/70 shadow-lg">
              <Heart className="size-5" style={{ color: THEME.goldDark }} />
            </div>
          </div>
        </div>

        {/* Badges */}
        {!inStock && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 text-white border-none text-[10px] font-bold rounded-full px-2.5">
              Rupture
            </Badge>
          </div>
        )}
        {isNew && inStock && (
          <div className="absolute top-3 left-3">
            <Badge
              className="text-white border-none text-[10px] font-bold rounded-full px-2.5"
              style={{ background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})` }}
            >
              Nouvelle Collection
            </Badge>
          </div>
        )}
        {product.categoryName && (
          <div className="absolute top-3 right-3">
            <Badge
              className="text-white border-none text-[10px] font-bold rounded-full px-2.5 backdrop-blur-md"
              style={{ background: `${THEME.text}88` }}
            >
              {product.categoryName}
            </Badge>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-serif font-bold text-sm line-clamp-2 leading-snug tracking-wide" style={{ color: THEME.text }}>
          {product.name}
        </h3>

        {/* Stock */}
        <div className="flex items-center gap-1">
          {inStock ? (
            <span className="text-[11px] font-medium" style={{ color: '#22c55e' }}>
              ✓ En stock
            </span>
          ) : (
            <span className="text-[11px] font-medium text-red-500">
              Rupture de stock
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-1">
          <span
            className="inline-block px-3 py-1.5 rounded-full text-sm font-bold font-serif"
            style={{ background: `${THEME.gold}18`, color: THEME.goldDark, border: `1px solid ${THEME.gold}33` }}
          >
            {formatPrice(product.price)}
          </span>
        </div>

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
                className="flex-1 gap-1.5 text-white font-semibold rounded-full text-sm h-9 transition-all duration-200 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})` }}
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
                  className="gap-1.5 font-semibold rounded-full text-sm h-9 px-3 transition-all duration-200 hover:shadow-lg"
                  style={{ background: THEME.whatsapp, color: THEME.whatsappFg }}
                  disabled={!product.isAvailable || !inStock}
                >
                  <MessageCircle className="size-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-between rounded-full p-1 backdrop-blur-md"
              style={{ background: `${THEME.gold}15`, border: `1px solid ${THEME.gold}33` }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                style={{ color: THEME.goldDark }}
                onClick={(e) => { e.nativeEvent.stopImmediatePropagation(); updateCartQuantity(product.id, cartQty - 1) }}
              >
                {cartQty === 1 ? (
                  <Trash2 className="size-3.5 text-red-500" />
                ) : (
                  <Minus className="size-3.5" />
                )}
              </Button>
              <span className="min-w-[2rem] text-center font-bold text-sm" style={{ color: THEME.text }}>
                {cartQty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                style={{ color: THEME.goldDark }}
                onClick={(e) => { e.nativeEvent.stopImmediatePropagation(); updateCartQuantity(product.id, cartQty + 1) }}
              >
                <Plus className="size-3.5" />
              </Button>
              {whatsapp && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full"
                  style={{ color: THEME.whatsapp }}
                  onClick={(e) => { e.nativeEvent.stopImmediatePropagation(); openWhatsApp(product, whatsapp, cartQty, selectedShippingZone) }}
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
// PRODUCT DETAIL — Full-screen glassmorphism overlay
// ═══════════════════════════════════════════════════════════════

function LuxeProductDetail({
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

  function handleAdd(qty: number) {
    for (let i = 0; i < qty; i++) {
      onAddToCart(product, 1)
    }
    toast.success(`${product.name} (x${qty}) ajouté au panier !`)
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
        className="flex items-center gap-2 text-sm font-semibold mb-6 transition-all duration-200 hover:opacity-70 group"
        style={{ color: THEME.goldDark }}
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        Retour à la boutique
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden backdrop-blur-xl" style={{ background: `${THEME.goldLight}40`, border: `1px solid ${THEME.glassBorder}` }}>
            <ImageWithFallback
              src={productImages[imgIndex]}
              alt={product.name}
              fill
              className="w-full h-full object-cover"
              fallbackIcon="package"
            />
          </div>
          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIndex(idx)}
                  className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200"
                  style={{
                    borderColor: idx === imgIndex ? THEME.gold : THEME.glassBorder,
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
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.categoryName && (
              <Badge className="text-xs text-white rounded-full px-3" style={{ background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})` }}>
                {product.categoryName}
              </Badge>
            )}
            {!inStock && (
              <Badge className="bg-red-500 text-white text-xs border-none rounded-full px-3">
                Rupture de stock
              </Badge>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide" style={{ color: THEME.text }}>
            {product.name}
          </h1>

          <p className="font-serif text-2xl font-bold" style={{ color: THEME.goldDark }}>
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <p className="text-sm leading-relaxed" style={{ color: THEME.textMuted }}>
              {product.description}
            </p>
          )}

          {inStock && product.stock !== undefined && (
            <p className="text-sm" style={{ color: THEME.textMuted }}>
              En stock ({product.stock} disponibles)
            </p>
          )}

          {/* Quantity stepper */}
          <div className="p-5 rounded-2xl backdrop-blur-xl" style={{ background: THEME.glassBg, border: `1px solid ${THEME.glassBorder}` }}>
            <p className="text-sm font-semibold mb-3 font-serif" style={{ color: THEME.text }}>Quantité</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center rounded-full" style={{ border: `1px solid ${THEME.glassBorder}` }}>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="size-4" />
                </Button>
                <span className="min-w-[36px] text-center font-bold text-base" style={{ color: THEME.text }}>{qty}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setQty(qty + 1)}>
                  <Plus className="size-4" />
                </Button>
              </div>
              <span className="text-lg font-bold font-serif" style={{ color: THEME.goldDark }}>
                {formatPrice(product.price * qty)}
              </span>
            </div>

            <Button
              className="w-full h-12 gap-2 text-sm font-bold text-white rounded-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})` }}
              disabled={!inStock}
              onClick={() => handleAdd(qty)}
            >
              <ShoppingCart className="size-5" />
              Ajouter au panier
            </Button>
          </div>

          {/* Shipping zone selector */}
          <ShippingZoneSelector />

          {/* WhatsApp */}
          {whatsapp && (
            <Button
              className="w-full h-12 gap-2 text-sm font-bold rounded-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{ background: THEME.whatsapp, color: THEME.whatsappFg }}
              disabled={!inStock}
              onClick={() => openWhatsApp(product, whatsapp, qty, selectedShippingZone)}
            >
              <MessageCircle className="size-5" />
              Commander sur WhatsApp
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TESTIMONIALS — 3 cards with gold stars
// ═══════════════════════════════════════════════════════════════

function LuxeTestimonials() {
  return (
    <section className="w-full py-12">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-8 h-[2px] rounded-full" style={{ background: THEME.gold }} />
          <h2 className="font-serif text-2xl font-bold tracking-wide text-center" style={{ color: THEME.text }}>
            Ce que disent nos clientes
          </h2>
          <div className="w-8 h-[2px] rounded-full" style={{ background: THEME.gold }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ background: THEME.glassBg, border: `1px solid ${THEME.glassBorder}` }}
            >
              {/* Quote icon */}
              <Quote className="size-6 mb-3" style={{ color: THEME.gold }} />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" style={{ color: THEME.gold }} />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm leading-relaxed mb-4" style={{ color: THEME.text }}>
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})` }}
                >
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-sm font-semibold" style={{ color: THEME.textMuted }}>
                  {t.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// CART DRAWER — (delegated to shared ThemedCartDrawer)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// FOOTER — Minimal dark with gold accents
// ═══════════════════════════════════════════════════════════════

function LuxeFooter({
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
    <footer className="w-full mt-12" style={{ background: '#1a1a1a' }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <Gem className="size-5" style={{ color: THEME.gold }} />
              <span className="font-serif text-lg font-bold text-white tracking-wide">{shopName}</span>
            </div>
            <p className="text-xs" style={{ color: THEME.textMuted }}>
              L&apos;élégance à portée de clic
            </p>
            {whatsapp && (
              <span className="text-xs" style={{ color: `${THEME.textMuted}CC` }}>
                {whatsapp}
              </span>
            )}
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-6 text-xs" style={{ color: `${THEME.textMuted}CC` }}>
            {phone && <span>{phone}</span>}
            {address && <span>{address}</span>}
          </div>
        </div>

        <Separator className="my-6" style={{ background: `${THEME.gold}22` }} />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: `${THEME.textMuted}88` }}>
            © {new Date().getFullYear()} {shopName}. Tous droits réservés.
          </p>
          <p className="text-xs" style={{ color: `${THEME.textMuted}88` }}>
            Propulsé par <span className="font-semibold" style={{ color: THEME.gold }}>Boutiko</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════
// SEARCH BAR
// ═══════════════════════════════════════════════════════════════

function LuxeSearchBar({
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
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: THEME.textMuted }} />
        <Input
          type="text"
          placeholder="Rechercher un produit..."
          value={localSearch}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-10 pr-10 h-11 rounded-full text-sm backdrop-blur-md"
          style={{
            background: THEME.glassBg,
            borderColor: THEME.glassBorder,
            color: THEME.text,
          }}
        />
        {localSearch && (
          <button
            onClick={() => handleChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: THEME.textMuted }}
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
          className="appearance-none h-11 px-4 pr-10 rounded-full text-sm font-medium cursor-pointer backdrop-blur-md"
          style={{
            background: THEME.glassBg,
            color: THEME.text,
            border: `1px solid ${THEME.glassBorder}`,
          }}
        >
          <option value="recent">Plus récents</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 size-4 rotate-90" style={{ color: THEME.textMuted }} />
      </div>

      {/* Results count */}
      {isSearching && (
        <div className="flex items-center gap-1.5 text-sm" style={{ color: THEME.textMuted }}>
          <ShoppingBag className="size-4" />
          {resultCount} résultat{resultCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════

function LuxeLoadingSkeleton() {
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
// MAIN: LuxeFashionShopPage — Page complète du template luxe-fashion
// ═══════════════════════════════════════════════════════════════

export function LuxeFashionShopPage() {
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
  const [activeStory, setActiveStory] = useState<string | null>(null)
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

    // Story filter: "Bestsellers" shows first 10, "Promos" shows cheapest, etc.
    if (activeStory === 'Bestsellers') {
      products = products.slice(0, 10)
    } else if (activeStory === 'Promos') {
      products = [...products].sort((a, b) => a.price - b.price).slice(0, 10)
    } else if (activeStory === 'Nouvelle Collection') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const newProducts = products.filter(p => p.createdAt && new Date(p.createdAt).getTime() > weekAgo)
      if (newProducts.length > 0) products = newProducts
    }

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
  }, [publicProducts, activeCategory, searchQuery, sortBy, activeStory])

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
    setActiveStory(null)
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
    const msg = `Bonjour ${publicShop.name} ! 👋\n\nJe souhaite commander :\n\n${itemsText}\n\n━━━━━━━━━━━━━━\n💰 Total : ${total.toLocaleString('fr-FR')} FCFA\n\n📝 Mes informations :\nNom :\nAdresse :\nTéléphone :\n\nMerci ! 🙏`
    const encoded = encodeURIComponent(msg)
    const phone = publicShop.whatsapp?.replace(/\D/g, '') || ''
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  // ── Loading ──
  if (loading) return <LuxeLoadingSkeleton />

  // ── Shop not found ──
  if (!publicShop) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #FFE5E5 0%, #FFFDD0 50%, #FFE5E5 100%)' }}
      >
        <div className="text-center backdrop-blur-xl rounded-2xl p-8" style={{ background: THEME.glassBg, border: `1px solid ${THEME.glassBorder}` }}>
          <div className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-4" style={{ background: `${THEME.gold}20` }}>
            <Package className="size-10" style={{ color: THEME.goldDark }} />
          </div>
          <h2 className="font-serif text-xl font-bold mb-2 tracking-wide" style={{ color: THEME.text }}>Boutique introuvable</h2>
          <p className="text-sm mb-4" style={{ color: THEME.textMuted }}>Cette boutique n&apos;existe pas ou a été désactivée.</p>
          <Button
            onClick={() => { window.history.pushState(null, '', '/'); setView('landing') }}
            className="text-white font-semibold rounded-full"
            style={{ background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDark})` }}
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
        background: 'linear-gradient(135deg, #FFE5E5 0%, #FFFDD0 50%, #FFE5E5 100%)',
        color: THEME.text,
      }}
    >
      {/* ═══ HEADER ═══ */}
      <LuxeHeader
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
            <LuxeProductDetail
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
              {/* ═══ INSTAGRAM STORIES ═══ */}
              <LuxeStories
                onStoryClick={(label) => {
                  setActiveStory(label)
                  handleBackFromProduct()
                  setActiveCategory(null)
                  scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
                activeStory={activeStory}
              />

              {/* ═══ HERO ═══ */}
              <LuxeHero
                shopName={publicShop.name}
                heroImages={publicShop.heroImages}
                whatsapp={publicShop.whatsapp}
                onShopNow={handleNavProduits}
              />

              {/* ═══ CATEGORIES ═══ */}
              <LuxeCategories
                categories={publicCategories}
                products={publicProducts}
                activeCategory={activeCategory}
                onCategoryClick={(id) => {
                  setActiveCategory(id)
                  handleBackFromProduct()
                  setActiveStory(null)
                  scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
              />

              {/* ═══ PRODUCTS ═══ */}
              <section className="w-full">
                <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 space-y-6" ref={scrollRef}>
                  {/* Section title */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-[2px] rounded-full" style={{ background: THEME.gold }} />
                    <h2 className="font-serif text-lg font-bold tracking-wide" style={{ color: THEME.text }}>
                      {activeStory ? activeStory : 'Nos Collections'}
                    </h2>
                    <span className="text-sm" style={{ color: THEME.textMuted }}>
                      ({filteredProducts.length} article{filteredProducts.length !== 1 ? 's' : ''})
                    </span>
                  </div>

                  {/* Search + Sort */}
                  <LuxeSearchBar
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
                        <div key={i} className="flex flex-col gap-2 rounded-2xl overflow-hidden backdrop-blur-xl" style={{ background: THEME.glassBg, border: `1px solid ${THEME.glassBorder}` }}>
                          <Skeleton className="w-full" style={{ aspectRatio: '336 / 320' }} />
                          <div className="p-4 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-9 w-full rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {!isSearching && publicProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: `${THEME.gold}20` }}>
                        <Package className="size-10" style={{ color: THEME.goldDark }} />
                      </div>
                      <h3 className="font-serif text-lg font-bold" style={{ color: THEME.text }}>Aucun produit disponible</h3>
                      <p className="mt-1 text-sm max-w-md" style={{ color: THEME.textMuted }}>
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
                      <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: `${THEME.gold}20` }}>
                        <Search className="size-7" style={{ color: THEME.goldDark }} />
                      </div>
                      <h3 className="font-serif text-lg font-bold" style={{ color: THEME.text }}>Aucun résultat trouvé</h3>
                      <p className="mt-1 text-sm max-w-md" style={{ color: THEME.textMuted }}>
                        {searchQuery
                          ? `Aucun produit ne correspond à "${searchQuery}".`
                          : 'Aucun produit dans cette catégorie.'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                        style={{ borderColor: THEME.gold, color: THEME.goldDark }}
                        onClick={() => { setSearchQuery(''); setActiveCategory(null); setActiveStory(null) }}
                      >
                        Réinitialiser les filtres
                      </Button>
                    </motion.div>
                  )}

                  {/* Product Grid */}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeCategory + searchQuery + sortBy + activeStory}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                      {filteredProducts.map((product, index) => (
                        <LuxeProductCard
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

              {/* ═══ TESTIMONIALS ═══ */}
              <LuxeTestimonials />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ FOOTER ═══ */}
      <LuxeFooter
        shopName={publicShop.name}
        whatsapp={publicShop.whatsapp}
        phone={publicShop.phone}
        address={publicShop.address}
      />

      {/* ═══ CART DRAWER ═══ */}
      <AnimatePresence>
        {cart.length > 0 && (
          <ThemedCartDrawer
            expanded={cartExpanded}
            onToggle={() => setCartExpanded(!cartExpanded)}
            onClear={clearCart}
            onCheckout={handleWhatsAppCheckout}
            total={total}
            itemCount={itemCount}
            cart={cart}
            updateCartQuantity={updateCartQuantity}
            theme={{
              text: THEME.text,
              textMuted: THEME.textMuted,
              price: THEME.goldDark,
              bg: 'rgba(255,255,255,0.90)',
              bgExpanded: 'rgba(255,255,255,0.85)',
              border: THEME.glassBorder,
              primary: THEME.gold,
              primaryLight: THEME.goldLight,
              whatsapp: THEME.whatsapp,
              whatsappFg: THEME.whatsappFg,
              toggleBorder: THEME.glassBorder,
              shadow: '0 -4px 30px rgba(0,0,0,0.1)',
              imageBg: `${THEME.goldLight}60`,
              qtyBg: `${THEME.gold}15`,
              countBg: THEME.gold,
              fontFamily: 'serif',
              backdropBlur: true,
              roundedItem: 'rounded-xl',
              roundedBtn: 'rounded-full',
              maxWidth: 'max-w-[1400px]',
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══ PULSE WHATSAPP FAB ═══ */}
      {publicShop.whatsapp && (
        <a
          href={`https://wa.me/${publicShop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${publicShop.name} ! 👋\nJe suis intéressé(e) par vos produits.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[80px] right-5 z-50 flex items-center gap-2 justify-center px-5 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group"
          style={{ background: THEME.whatsapp, color: THEME.whatsappFg }}
          title={`Contacter ${publicShop.name} sur WhatsApp`}
        >
          {/* Pulse animation ring */}
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ background: THEME.whatsapp }}
          />
          <span
            className="absolute inset-0 rounded-full animate-pulse opacity-15"
            style={{ background: THEME.whatsapp, animationDelay: '0.5s' }}
          />
          <MessageCircle className="size-5 relative z-10" />
          <span className="text-sm font-bold relative z-10">Commander</span>

          {/* Tooltip */}
          <span
            className="absolute right-full mr-3 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ background: '#1a1a1a', color: 'white' }}
          >
            {publicShop.whatsapp}
          </span>
        </a>
      )}

      {/* Bottom padding when cart is visible */}
      {cart.length > 0 && <div className="h-[60px]" />}
    </motion.div>
  )
}