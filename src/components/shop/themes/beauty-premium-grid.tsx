'use client'

/**
 * BeautyPremiumShopPage — Template xstore-beauty
 * Editorial Sephora-style beauty shop with rose gold palette.
 *
 * Sections:
 *   1. Header (centered, serif, rose gold accent)
 *   2. Hero (editorial split layout)
 *   3. Trust Indicators
 *   4. Categories (underline style)
 *   5. Products (rose gold cards, 3/4 aspect, heart button)
 *   6. Testimonials (horizontal scroll carousel)
 *   7. Why Us (3 feature cards)
 *   8. Footer (rose gold accents)
 *
 * Color palette: Rose Gold #B76E79, Cream #FFFFF0
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
  Heart,
  Star,
  ArrowRight,
  Truck,
  Shield,
  Sparkles,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Gem,
  Quote,
} from 'lucide-react'
import { useAppStore, type Product, type Category } from '@/lib/store'
import { formatPrice, openWhatsApp } from '@/lib/shared'

// ─── Rose Gold Beauty Palette ───
const ROSE = {
  primary: '#B76E79',
  primaryDark: '#9C5A64',
  primaryLight: '#FDE8EC',
  dustyPink: '#DCAE96',
  cream: '#FFFFF0',
  white: '#ffffff',
  text: '#36454F',
  muted: '#8B7E74',
  border: '#F0E6E0',
  cardHover: '#FFF8F5',
  price: '#B76E79',
  whatsapp: '#25D366',
  whatsappFg: '#FFFFFF',
  shadow: '0 2px 12px rgba(183,110,121,0.1)',
  shadowHover: '0 8px 24px rgba(183,110,121,0.18)',
} as const

type SortOption = 'recent' | 'price-asc' | 'price-desc'

// ═══════════════════════════════════════════════════════════════
// 1. BEAUTY HEADER — Centered, elegant, serif
// ═══════════════════════════════════════════════════════════════

function BeautyHeader({
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
        background: `${ROSE.cream}`,
        borderColor: ROSE.border,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-[64px]">
          {/* Logo — centered brand */}
          <button onClick={onNavAccueil} className="flex items-center gap-2 shrink-0">
            {logo && logo.length > 0 ? (
              <img
                src={logo}
                alt={shopName}
                className="h-[50px] w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ background: ROSE.primary, color: ROSE.white }}
                >
                  <Gem className="size-5" />
                </div>
                <span
                  className="text-lg font-bold tracking-wide"
                  style={{
                    color: ROSE.text,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {shopName}
                </span>
              </div>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={onNavAccueil}
              className="text-sm font-medium transition-all duration-300 hover:opacity-70"
              style={{
                color: ROSE.text,
                fontFamily: 'Georgia, serif',
              }}
            >
              Accueil
            </button>
            <button
              onClick={onNavProduits}
              className="text-sm font-medium transition-all duration-300 hover:opacity-70"
              style={{
                color: ROSE.text,
                fontFamily: 'Georgia, serif',
              }}
            >
              Nos Produits
            </button>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium transition-all duration-300 hover:opacity-70 flex items-center gap-1.5"
                style={{
                  color: ROSE.text,
                  fontFamily: 'Georgia, serif',
                }}
              >
                Contact
              </a>
            )}
          </nav>

          {/* Cart + Mobile menu */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full"
              onClick={onCartClick}
              style={{ color: ROSE.text }}
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-[10px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center text-white"
                  style={{ background: ROSE.primary }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1 p-2"
              aria-label="Menu"
            >
              <span
                className="block w-5 h-0.5 rounded transition-all duration-300"
                style={{
                  background: mobileOpen ? 'transparent' : ROSE.text,
                }}
              />
              <span
                className="block w-5 h-0.5 rounded transition-all duration-300"
                style={{
                  background: ROSE.text,
                  transform: mobileOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none',
                }}
              />
              <span
                className="block w-5 h-0.5 rounded transition-all duration-300"
                style={{
                  background: ROSE.text,
                  transform: mobileOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Rose gold underline accent */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${ROSE.primary}40, ${ROSE.primary}, ${ROSE.primary}40, transparent)` }} />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t"
            style={{ borderColor: ROSE.border, background: ROSE.cream }}
          >
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => { onNavAccueil(); setMobileOpen(false) }}
                className="block w-full text-left px-4 py-3 text-sm font-medium rounded-2xl transition-colors"
                style={{ color: ROSE.text, fontFamily: 'Georgia, serif' }}
              >
                Accueil
              </button>
              <button
                onClick={() => { onNavProduits(); setMobileOpen(false) }}
                className="block w-full text-left px-4 py-3 text-sm font-medium rounded-2xl transition-colors"
                style={{ color: ROSE.text, fontFamily: 'Georgia, serif' }}
              >
                Nos Produits
              </button>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm font-medium rounded-2xl transition-colors"
                  style={{ color: ROSE.text, fontFamily: 'Georgia, serif' }}
                >
                  Contact
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
// 2. BEAUTY HERO — Editorial split layout
// ═══════════════════════════════════════════════════════════════

function BeautyHero({
  shopName,
  description,
  heroImages,
  whatsapp,
  onShopNow,
}: {
  shopName: string
  description?: string
  heroImages?: string
  whatsapp?: string
  onShopNow: () => void
}) {
  const images: string[] = useMemo(() => {
    if (!heroImages) return []
    try {
      const parsed = JSON.parse(heroImages)
      return Array.isArray(parsed) ? parsed.filter((img: string) => img && img.length > 0) : []
    } catch {
      return heroImages ? [heroImages] : []
    }
  }, [heroImages])

  return (
    <section className="w-full" style={{ background: ROSE.cream }}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Left — Hero image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl"
            style={{
              aspectRatio: '4/5',
              maxHeight: '500px',
              boxShadow: ROSE.shadow,
            }}
          >
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={shopName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(160deg, ${ROSE.dustyPink}40 0%, ${ROSE.primaryLight} 50%, ${ROSE.dustyPink}20 100%)`,
                }}
              >
                <Gem className="size-20" style={{ color: `${ROSE.primary}30` }} />
              </div>
            )}
            {/* Soft gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, transparent 50%, rgba(255,255,240,0.4) 100%)',
              }}
            />
          </motion.div>

          {/* Right — Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-5 text-center md:text-left"
          >
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="h-[1px] w-8" style={{ background: ROSE.primary }} />
              <span
                className="text-xs font-medium uppercase tracking-[0.2em]"
                style={{ color: ROSE.muted }}
              >
                Beauté & Bien-être
              </span>
              <div className="h-[1px] w-8" style={{ background: ROSE.primary }} />
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
              style={{
                color: ROSE.text,
                fontFamily: 'Georgia, serif',
                textShadow: '0 1px 2px rgba(183,110,121,0.08)',
              }}
            >
              {shopName}
            </h1>

            <p
              className="text-base leading-relaxed max-w-md mx-auto md:mx-0"
              style={{
                color: ROSE.muted,
                fontFamily: 'Georgia, serif',
              }}
            >
              {description || 'Découvrez notre sélection de produits de beauté authentiques. Soins, maquillage et parfums pour sublimer votre beauté naturelle.'}
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onShopNow}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${ROSE.primary} 0%, ${ROSE.dustyPink} 100%)`,
                  boxShadow: `0 4px 15px ${ROSE.primary}40`,
                }}
              >
                Découvrir la collection
                <ArrowRight className="size-4" />
              </motion.button>

              {whatsapp && (
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300"
                  style={{
                    background: ROSE.white,
                    color: ROSE.text,
                    border: `1px solid ${ROSE.border}`,
                    boxShadow: ROSE.shadow,
                  }}
                >
                  <MessageCircle className="size-4" style={{ color: ROSE.whatsapp }} />
                  WhatsApp
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// 3. TRUST INDICATORS ROW
// ═══════════════════════════════════════════════════════════════

function BeautyTrustIndicators() {
  const badges = [
    { icon: '🚚', label: 'Livraison 24h' },
    { icon: '💳', label: 'Paiement Mobile Money' },
    { icon: '✨', label: 'Produits authentiques' },
    { icon: '↩️', label: 'Satisfait ou remboursé' },
  ]

  return (
    <section className="w-full" style={{ background: ROSE.white, borderBottom: `1px solid ${ROSE.border}` }}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all duration-300"
              style={{
                background: `${ROSE.primaryLight}60`,
              }}
            >
              <span className="text-lg">{badge.icon}</span>
              <span
                className="text-xs font-medium"
                style={{ color: ROSE.text }}
              >
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// 4. CATEGORIES — Elegant underline style
// ═══════════════════════════════════════════════════════════════

function BeautyCategories({
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
    <section className="w-full" style={{ background: ROSE.cream }}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6">
        <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {/* Tous */}
          <button
            onClick={() => onCategoryClick(null)}
            className="shrink-0 px-5 py-2.5 text-sm font-medium transition-all duration-300"
            style={{
              color: activeCategory === null ? ROSE.primary : ROSE.muted,
              borderBottom: activeCategory === null ? `2px solid ${ROSE.primary}` : '2px solid transparent',
              fontFamily: 'Georgia, serif',
            }}
          >
            Tout
            <span className="ml-1.5 text-xs opacity-60">({totalAvailable})</span>
          </button>

          {categories.map((cat) => {
            const count = getCategoryCount(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryClick(activeCategory === cat.id ? null : cat.id)}
                className="shrink-0 px-5 py-2.5 text-sm font-medium transition-all duration-300"
                style={{
                  color: activeCategory === cat.id ? ROSE.primary : ROSE.muted,
                  borderBottom: activeCategory === cat.id ? `2px solid ${ROSE.primary}` : '2px solid transparent',
                  fontFamily: 'Georgia, serif',
                }}
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-60">({count})</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// 5. PRODUCT CARD — Clean white, rose gold, heart, badges
// ═══════════════════════════════════════════════════════════════

function BeautyProductCard({
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
  const [hearted, setHearted] = useState(false)

  const isBestseller = index === 0 || index === 3
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000

  return (
    <motion.div
      className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer"
      style={{
        background: ROSE.white,
        boxShadow: ROSE.shadow,
      }}
      onClick={() => onProductClick(product)}
      whileHover={{ y: -5, boxShadow: ROSE.shadowHover }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image — aspect 3/4 */}
      <div className="relative w-full overflow-hidden rounded-t-2xl" style={{ aspectRatio: '3/4', background: `${ROSE.primaryLight}40` }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1' }}
            style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="size-12" style={{ color: `${ROSE.border}` }} />
          </div>
        )}

        {/* Heart button — top right */}
        <motion.button
          whileTap={{ scale: 1.3 }}
          onClick={(e) => {
            e.nativeEvent.stopImmediatePropagation()
            setHearted(!hearted)
          }}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300"
          style={{
            background: `${ROSE.white}E6`,
            backdropFilter: 'blur(4px)',
          }}
          aria-label="Favori"
        >
          <Heart
            className="size-4 transition-all duration-300"
            style={{
              color: hearted ? '#E74C3C' : ROSE.muted,
              fill: hearted ? '#E74C3C' : 'none',
            }}
          />
        </motion.button>

        {/* Bestseller badge */}
        {isBestseller && (
          <div className="absolute top-3 left-3">
            <span
              className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ background: ROSE.primary }}
            >
              Bestseller
            </span>
          </div>
        )}

        {/* Nouveau badge */}
        {isNew && !isBestseller && (
          <div className="absolute top-3 left-3">
            <span
              className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ background: '#D4A574' }}
            >
              Nouveau
            </span>
          </div>
        )}

        {/* Rupture badge */}
        {!inStock && (
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-red-500">
              Rupture
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-2 p-4">
        <h3
          className="text-sm font-semibold line-clamp-2 leading-snug"
          style={{
            color: ROSE.text,
            fontFamily: 'Georgia, serif',
          }}
        >
          {product.name}
        </h3>

        {/* Price */}
        <p
          className="text-base font-bold"
          style={{ color: ROSE.price }}
        >
          {formatPrice(product.price)}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div>
          {cartQty === 0 ? (
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation()
                  onAddToCart(product)
                  toast.success(`${product.name} ajouté !`)
                }}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${ROSE.primary} 0%, ${ROSE.dustyPink} 100%)`,
                }}
                disabled={!product.isAvailable || !inStock}
              >
                <Plus className="size-3.5 inline mr-1" />
                Ajouter
              </motion.button>
              {whatsapp && (
                <button
                  onClick={(e) => {
                    e.nativeEvent.stopImmediatePropagation()
                    openWhatsApp(product, whatsapp)
                  }}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                  style={{
                    background: `${ROSE.primaryLight}60`,
                    color: ROSE.text,
                  }}
                  disabled={!product.isAvailable || !inStock}
                >
                  <MessageCircle className="size-4" />
                </button>
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-between rounded-xl p-1"
              style={{ background: `${ROSE.primaryLight}40` }}
            >
              <button
                className="size-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: ROSE.primary }}
                onClick={(e) => { e.nativeEvent.stopImmediatePropagation(); updateCartQuantity(product.id, cartQty - 1) }}
              >
                {cartQty === 1 ? (
                  <Trash2 className="size-3.5 text-red-400" />
                ) : (
                  <Minus className="size-3.5" />
                )}
              </button>
              <span
                className="min-w-[2rem] text-center font-bold text-sm"
                style={{ color: ROSE.text }}
              >
                {cartQty}
              </span>
              <button
                className="size-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: ROSE.primary }}
                onClick={(e) => { e.nativeEvent.stopImmediatePropagation(); updateCartQuantity(product.id, cartQty + 1) }}
              >
                <Plus className="size-3.5" />
              </button>
              {whatsapp && (
                <button
                  className="size-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: ROSE.whatsapp }}
                  onClick={(e) => { e.nativeEvent.stopImmediatePropagation(); openWhatsApp(product, whatsapp, cartQty) }}
                >
                  <MessageCircle className="size-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 6. TESTIMONIALS — Horizontal scroll carousel
// ═══════════════════════════════════════════════════════════════

const TESTIMONIALS = [
  {
    initial: 'S',
    name: 'Sophie, Abidjan ✓',
    stars: 5,
    text: 'Ma peau n\'a jamais été aussi éclatante ! Les produits sont de qualité et la livraison ultra rapide. Je recommande à 100%.',
  },
  {
    initial: 'A',
    name: 'Aminata, Dakar ✓',
    stars: 5,
    text: 'J\'ai commandé le sérum vitaminé et les résultats sont incroyables en seulement 2 semaines. Avant / après impressionnant !',
  },
  {
    initial: 'M',
    name: 'Marie, Abidjan ✓',
    stars: 5,
    text: 'Service client au top, produits authentiques et emballage soigné. Ma boutique beauté préférée !',
  },
  {
    initial: 'F',
    name: 'Fatou, Lomé ✓',
    stars: 4,
    text: 'Très satisfaite de ma commande. Les crèmes sont parfaites pour ma peau métissée. Je reviendrai !',
  },
]

function BeautyTestimonials() {
  return (
    <section className="w-full py-10" style={{ background: `${ROSE.primaryLight}30` }}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        <div className="text-center mb-8">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{
              color: ROSE.text,
              fontFamily: 'Georgia, serif',
              textShadow: '0 1px 2px rgba(183,110,121,0.08)',
            }}
          >
            Ce que nos clientes disent
          </h2>
          <p className="text-sm" style={{ color: ROSE.muted }}>
            Plus de 1 000 clientes satisfaites
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="shrink-0 w-[300px] sm:w-[340px] p-6 rounded-2xl transition-all duration-300"
              style={{
                background: ROSE.white,
                boxShadow: ROSE.shadow,
              }}
            >
              {/* Quote icon */}
              <Quote className="size-5 mb-3" style={{ color: `${ROSE.primary}30` }} />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className="size-3.5"
                    style={{
                      color: s < t.stars ? '#E2B93B' : ROSE.border,
                      fill: s < t.stars ? '#E2B93B' : 'none',
                    }}
                  />
                ))}
              </div>

              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: ROSE.text }}
              >
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Customer info */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${ROSE.primary}, ${ROSE.dustyPink})`,
                  }}
                >
                  {t.initial}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: ROSE.muted }}
                >
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
// 7. WHY US — "Pourquoi nous choisir?"
// ═══════════════════════════════════════════════════════════════

function BeautyWhyUs() {
  const features = [
    {
      icon: <Sparkles className="size-6" />,
      title: 'Qualité Premium',
      description: 'Tous nos produits sont sélectionnés pour leur qualité et leur authenticité. Aucun compromis.',
    },
    {
      icon: <Truck className="size-6" />,
      title: 'Livraison Express',
      description: 'Recevez vos produits en 24h. Livraison disponible partout en Côte d\'Ivoire et au Sénégal.',
    },
    {
      icon: <Shield className="size-6" />,
      title: 'Satisfait ou Remboursé',
      description: 'Pas satisfait ? Nous vous remboursons intégralement sous 7 jours. Sans condition.',
    },
  ]

  return (
    <section className="w-full py-10" style={{ background: ROSE.cream }}>
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        <div className="text-center mb-8">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{
              color: ROSE.text,
              fontFamily: 'Georgia, serif',
              textShadow: '0 1px 2px rgba(183,110,121,0.08)',
            }}
          >
            Pourquoi nous choisir ?
          </h2>
          <p className="text-sm" style={{ color: ROSE.muted }}>
            L&apos;excellence au service de votre beauté
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="text-center p-6 rounded-2xl transition-all duration-300"
              style={{
                background: ROSE.white,
                boxShadow: ROSE.shadow,
              }}
            >
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4"
                style={{
                  background: `${ROSE.primaryLight}60`,
                  color: ROSE.primary,
                }}
              >
                {f.icon}
              </div>
              <h3
                className="text-base font-bold mb-2"
                style={{
                  color: ROSE.text,
                  fontFamily: 'Georgia, serif',
                }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: ROSE.muted }}
              >
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// 8. PRODUCT DETAIL — Clean overlay, elegant
// ═══════════════════════════════════════════════════════════════

function BeautyProductDetail({
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
      className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6"
    >
      {/* Back button */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:opacity-70"
        style={{ color: ROSE.primary, fontFamily: 'Georgia, serif' }}
      >
        <ArrowLeft className="size-4" />
        Retour à la boutique
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div
            className="aspect-[3/4] rounded-2xl overflow-hidden"
            style={{ background: `${ROSE.primaryLight}40`, boxShadow: ROSE.shadow }}
          >
            {productImages[imgIndex] ? (
              <img
                src={productImages[imgIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="size-20" style={{ color: ROSE.border }} />
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
                  className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300"
                  style={{
                    borderColor: idx === imgIndex ? ROSE.primary : ROSE.border,
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
          {/* Category */}
          {product.categoryName && (
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: ROSE.muted }}
            >
              {product.categoryName}
            </span>
          )}

          <h1
            className="text-2xl sm:text-3xl font-bold leading-tight"
            style={{
              color: ROSE.text,
              fontFamily: 'Georgia, serif',
              textShadow: '0 1px 2px rgba(183,110,121,0.08)',
            }}
          >
            {product.name}
          </h1>

          <p
            className="text-2xl font-bold"
            style={{ color: ROSE.price }}
          >
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: ROSE.muted, fontFamily: 'Georgia, serif' }}
            >
              {product.description}
            </p>
          )}

          {inStock && product.stock !== undefined && (
            <p className="text-sm" style={{ color: '#22c55e' }}>
              ✓ En stock ({product.stock} disponibles)
            </p>
          )}

          {!inStock && (
            <p className="text-sm text-red-500 font-medium">
              Rupture de stock
            </p>
          )}

          {/* Quantity */}
          <div className="p-5 rounded-2xl" style={{ background: `${ROSE.primaryLight}30`, border: `1px solid ${ROSE.border}` }}>
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: ROSE.text, fontFamily: 'Georgia, serif' }}
            >
              Quantité
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="flex items-center rounded-xl overflow-hidden"
                style={{ border: `1px solid ${ROSE.border}` }}
              >
                <button className="h-10 w-10 flex items-center justify-center transition-colors hover:bg-white" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="size-4" style={{ color: ROSE.primary }} />
                </button>
                <span
                  className="min-w-[40px] text-center font-bold text-base"
                  style={{ color: ROSE.text }}
                >
                  {qty}
                </span>
                <button className="h-10 w-10 flex items-center justify-center transition-colors hover:bg-white" onClick={() => setQty(qty + 1)}>
                  <Plus className="size-4" style={{ color: ROSE.primary }} />
                </button>
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: ROSE.price }}
              >
                {formatPrice(product.price * qty)}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full h-12 gap-2 text-sm font-semibold text-white rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${ROSE.primary} 0%, ${ROSE.dustyPink} 100%)`,
                boxShadow: `0 4px 15px ${ROSE.primary}40`,
              }}
              disabled={!inStock}
              onClick={() => handleAdd(qty)}
            >
              <ShoppingCart className="size-5" />
              Ajouter au panier
            </motion.button>
          </div>

          {/* WhatsApp */}
          {whatsapp && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full h-12 gap-2 text-sm font-semibold rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: ROSE.whatsapp,
                color: ROSE.whatsappFg,
                boxShadow: `0 4px 15px ${ROSE.whatsapp}40`,
              }}
              disabled={!inStock}
              onClick={() => openWhatsApp(product, whatsapp, qty)}
            >
              <MessageCircle className="size-5" />
              Commander sur WhatsApp
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 9. CART DRAWER — Clean white slide-up
// ═══════════════════════════════════════════════════════════════

function BeautyCartDrawer({
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
        boxShadow: '0 -4px 20px rgba(183,110,121,0.12)',
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
            style={{ borderColor: ROSE.border, background: ROSE.white }}
          >
            <ScrollArea className="max-h-64">
              <div className="max-w-[1200px] mx-auto p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: ROSE.text, fontFamily: 'Georgia, serif' }}
                  >
                    Votre panier ({itemCount} article{itemCount !== 1 ? 's' : ''})
                  </h3>
                  <Button variant="ghost" size="sm" className="text-red-400 h-7 text-xs" onClick={onClear}>
                    <Trash2 className="size-3 mr-1" />
                    Tout supprimer
                  </Button>
                </div>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 overflow-hidden"
                      style={{ background: `${ROSE.primaryLight}40` }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="size-5" style={{ color: ROSE.border }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1" style={{ color: ROSE.text }}>{item.name}</p>
                      <p className="text-xs font-bold" style={{ color: ROSE.price }}>{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center rounded-lg" style={{ background: `${ROSE.primaryLight}30` }}>
                      <button className="h-7 w-7 flex items-center justify-center" onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}>
                        {item.quantity === 1 ? <Trash2 className="size-3 text-red-400" /> : <Minus className="size-3" style={{ color: ROSE.primary }} />}
                      </button>
                      <span className="text-sm font-semibold min-w-[24px] text-center" style={{ color: ROSE.text }}>{item.quantity}</span>
                      <button className="h-7 w-7 flex items-center justify-center" onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}>
                        <Plus className="size-3" style={{ color: ROSE.primary }} />
                      </button>
                    </div>
                    <span className="text-sm font-bold w-24 text-right" style={{ color: ROSE.price }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator style={{ background: ROSE.border }} />
                <div className="flex items-center justify-between font-bold" style={{ color: ROSE.text }}>
                  <span>Total</span>
                  <span style={{ color: ROSE.price, fontFamily: 'Georgia, serif' }}>{formatPrice(total)}</span>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart bar */}
      <div className="px-4 py-3 border-t" style={{ borderColor: ROSE.border, background: ROSE.white }}>
        <div className="max-w-[1200px] mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 gap-1.5 shrink-0 rounded-xl"
            style={{ color: ROSE.text }}
            onClick={onToggle}
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            <span
              className="px-1.5 h-5 text-xs text-white rounded-md flex items-center font-bold"
              style={{ background: ROSE.primary }}
            >
              {itemCount}
            </span>
            <span className="hidden sm:inline text-sm font-medium">panier</span>
          </Button>

          <div className="flex-1">
            <p className="text-xs" style={{ color: ROSE.muted }}>Total</p>
            <p
              className="font-bold text-sm"
              style={{ color: ROSE.price, fontFamily: 'Georgia, serif' }}
            >
              {formatPrice(total)}
            </p>
          </div>

          <Button
            className="h-10 gap-2 font-semibold text-sm rounded-xl px-6"
            style={{
              background: ROSE.whatsapp,
              color: ROSE.whatsappFg,
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
// 10. FOOTER — Rose gold accents
// ═══════════════════════════════════════════════════════════════

function BeautyFooter({
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
    <footer
      className="w-full mt-12"
      style={{ background: ROSE.text }}
    >
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-10">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3
              className="text-lg font-bold text-white mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {shopName}
            </h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Votre destination beauté de confiance. Produits authentiques, livraison rapide, service personnalisé.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-sm font-semibold text-white mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Liens utiles
            </h4>
            <div className="flex flex-col gap-2">
              <span className="text-white/50 text-sm cursor-pointer hover:text-white/70 transition-colors">Accueil</span>
              <span className="text-white/50 text-sm cursor-pointer hover:text-white/70 transition-colors">Nos Produits</span>
              <span className="text-white/50 text-sm cursor-pointer hover:text-white/70 transition-colors">Politique de retour</span>
              <span className="text-white/50 text-sm cursor-pointer hover:text-white/70 transition-colors">CGV</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-sm font-semibold text-white mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Contact
            </h4>
            <div className="flex flex-col gap-2">
              {whatsapp && (
                <span className="flex items-center gap-2 text-white/50 text-sm">
                  <Phone className="size-3.5" />
                  {whatsapp}
                </span>
              )}
              {address && (
                <span className="flex items-center gap-2 text-white/50 text-sm">
                  <MapPin className="size-3.5" />
                  {address}
                </span>
              )}
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-4">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  <Icon className="size-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-white/10 mb-6" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} {shopName}. Tous droits réservés.
          </p>
          <p className="text-white/30 text-xs">
            Propulsé par{' '}
            <span className="font-medium" style={{ color: ROSE.primary }}>
              Boutiko
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════
// SEARCH BAR
// ═══════════════════════════════════════════════════════════════

function BeautySearchBar({
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
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4" style={{ color: ROSE.muted }} />
        <Input
          type="text"
          placeholder="Rechercher un produit..."
          value={localSearch}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-10 pr-10 h-11 rounded-xl text-sm border-none"
          style={{ background: ROSE.white, borderColor: ROSE.border, boxShadow: ROSE.shadow }}
        />
        {localSearch && (
          <button
            onClick={() => handleChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: ROSE.muted }}
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
          className="appearance-none h-11 px-4 pr-10 rounded-xl text-sm font-medium cursor-pointer border-none"
          style={{
            background: ROSE.white,
            color: ROSE.text,
            borderColor: ROSE.border,
            boxShadow: ROSE.shadow,
          }}
        >
          <option value="recent">Plus récents</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 size-4 rotate-90" style={{ color: ROSE.muted }} />
      </div>

      {/* Results count */}
      {isSearching && (
        <div className="flex items-center gap-1.5 text-sm" style={{ color: ROSE.muted }}>
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

function BeautyLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DOT PATTERN BACKGROUND (subtle)
// ═══════════════════════════════════════════════════════════════

function DotPattern() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `radial-gradient(circle, ${ROSE.primary}08 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN: BeautyPremiumShopPage
// ═══════════════════════════════════════════════════════════════

export function BeautyPremiumShopPage() {
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
    setSelectedProduct(null)
    setActiveCategory(null)
    setSearchQuery('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleNavProduits() {
    setSelectedProduct(null)
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
        return `💝 ${c.name} x${c.quantity} — ${(c.price * c.quantity).toLocaleString('fr-FR')} FCFA${linkLine}`
      })
      .join('\n')
    const msg = `Bonjour ${publicShop.name} ! 💖\n\nJe souhaite commander :\n\n${itemsText}\n\n━━━━━━━━━━━━━━\n💰 Total : ${total.toLocaleString('fr-FR')} FCFA\n\n📝 Mes informations :\nNom :\nAdresse :\nTéléphone :\n\nMerci beaucoup ! 🙏✨`
    const encoded = encodeURIComponent(msg)
    const phone = publicShop.whatsapp?.replace(/\D/g, '') || ''
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  // ── Loading ──
  if (loading) return <BeautyLoadingSkeleton />

  // ── Shop not found ──
  if (!publicShop) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: ROSE.cream }}>
        <div className="text-center">
          <div
            className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-4"
            style={{ background: `${ROSE.primaryLight}60` }}
          >
            <Package className="size-10" style={{ color: ROSE.primary }} />
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: ROSE.text, fontFamily: 'Georgia, serif' }}
          >
            Boutique introuvable
          </h2>
          <p className="text-sm mb-4" style={{ color: ROSE.muted }}>
            Cette boutique n&apos;existe pas ou a été désactivée.
          </p>
          <Button
            onClick={() => setView('landing')}
            className="text-white font-semibold rounded-full px-6"
            style={{ background: `linear-gradient(135deg, ${ROSE.primary} 0%, ${ROSE.dustyPink} 100%)` }}
          >
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="min-h-screen flex flex-col relative" style={{ background: ROSE.cream, color: ROSE.text }}>
      {/* Dot pattern background */}
      <DotPattern />

      {/* ═══ 1. HEADER ═══ */}
      <BeautyHeader
        shopName={publicShop.name}
        logo={publicShop.logo}
        whatsapp={publicShop.whatsapp}
        cartCount={itemCount}
        onNavAccueil={handleNavAccueil}
        onNavProduits={handleNavProduits}
        onCartClick={() => cart.length > 0 && setCartExpanded(!cartExpanded)}
      />

      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          {selectedProduct ? (
            /* ═══ PRODUCT DETAIL ═══ */
            <BeautyProductDetail
              key={selectedProduct.id}
              product={selectedProduct}
              whatsapp={publicShop.whatsapp}
              onClose={() => setSelectedProduct(null)}
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
              transition={{ duration: 0.2 }}
            >
              {/* ═══ 2. HERO ═══ */}
              <BeautyHero
                shopName={publicShop.name}
                description={publicShop.description}
                heroImages={publicShop.heroImages}
                whatsapp={publicShop.whatsapp}
                onShopNow={handleNavProduits}
              />

              {/* ═══ 3. TRUST INDICATORS ═══ */}
              <BeautyTrustIndicators />

              {/* ═══ 4. CATEGORIES ═══ */}
              <BeautyCategories
                categories={publicCategories}
                products={publicProducts}
                activeCategory={activeCategory}
                onCategoryClick={(id) => {
                  setActiveCategory(id)
                  setSelectedProduct(null)
                  scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
              />

              {/* ═══ 5. PRODUCTS ═══ */}
              <section className="w-full" style={{ background: ROSE.white }}>
                <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8 space-y-6" ref={scrollRef}>
                  {/* Section title */}
                  <div className="text-center">
                    <h2
                      className="text-2xl sm:text-3xl font-bold mb-1"
                      style={{
                        color: ROSE.text,
                        fontFamily: 'Georgia, serif',
                        textShadow: '0 1px 2px rgba(183,110,121,0.08)',
                      }}
                    >
                      Nos Produits
                    </h2>
                    <p className="text-sm" style={{ color: ROSE.muted }}>
                      {totalProductCount} produit{totalProductCount !== 1 ? 's' : ''} disponible{totalProductCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Search + Sort */}
                  <BeautySearchBar
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
                        <div key={i} className="flex flex-col gap-3 rounded-2xl overflow-hidden" style={{ boxShadow: ROSE.shadow }}>
                          <Skeleton className="w-full" style={{ aspectRatio: '3/4' }} />
                          <div className="p-4 space-y-2">
                            <Skeleton className="h-4 w-full rounded-lg" />
                            <Skeleton className="h-5 w-24 rounded-lg" />
                            <Skeleton className="h-10 w-full rounded-xl" />
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
                        style={{ background: `${ROSE.primaryLight}60` }}
                      >
                        <Package className="size-10" style={{ color: ROSE.primary }} />
                      </div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: ROSE.text, fontFamily: 'Georgia, serif' }}
                      >
                        Aucun produit disponible
                      </h3>
                      <p className="mt-1 text-sm max-w-md" style={{ color: ROSE.muted }}>
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
                        style={{ background: `${ROSE.primaryLight}60` }}
                      >
                        <Search className="size-7" style={{ color: ROSE.primary }} />
                      </div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: ROSE.text, fontFamily: 'Georgia, serif' }}
                      >
                        Aucun résultat trouvé
                      </h3>
                      <p className="mt-1 text-sm max-w-md" style={{ color: ROSE.muted }}>
                        {searchQuery
                          ? `Aucun produit ne correspond à "${searchQuery}".`
                          : 'Aucun produit dans cette catégorie.'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                        style={{ borderColor: ROSE.primary, color: ROSE.primary }}
                        onClick={() => { setSearchQuery(''); setActiveCategory(null) }}
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
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                      {filteredProducts.map((product, index) => (
                        <BeautyProductCard
                          key={product.id}
                          product={product}
                          index={index}
                          onProductClick={setSelectedProduct}
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

              {/* ═══ 6. TESTIMONIALS ═══ */}
              <BeautyTestimonials />

              {/* ═══ 7. WHY US ═══ */}
              <BeautyWhyUs />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ 10. FOOTER ═══ */}
      <BeautyFooter
        shopName={publicShop.name}
        whatsapp={publicShop.whatsapp}
        phone={publicShop.phone}
        address={publicShop.address}
      />

      {/* ═══ 9. CART DRAWER ═══ */}
      <AnimatePresence>
        {cart.length > 0 && (
          <BeautyCartDrawer
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
          href={`https://wa.me/${publicShop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${publicShop.name} ! 💖\nJe suis intéressée par vos produits beauté.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[80px] right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
          style={{
            background: ROSE.whatsapp,
            boxShadow: `0 4px 15px ${ROSE.whatsapp}40`,
          }}
          title={`Contacter ${publicShop.name} sur WhatsApp`}
        >
          <MessageCircle className="size-7" style={{ color: ROSE.whatsappFg }} />
          {/* Tooltip */}
          <span
            className="absolute right-full mr-3 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ background: ROSE.text, color: 'white' }}
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