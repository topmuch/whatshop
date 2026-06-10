'use client'

/**
 * ElectroShopPage — Template xstore-electro
 * Reconstruit de zéro avec l'ordre exact demandé :
 *   1. Menu (Logo 255×82 + Accueil / Nos Produits / Contactez Nous)
 *   2. Slide Hero (1180×600)
 *   3. Catégories
 *   4. Produits (grille 400×400)
 *   5. Footer
 *
 * Couleur principale : Bleu #0066FF
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
  ChevronRight,
  MessageCircle,
  ShoppingCart,
  ArrowLeft,
  Truck,
  Shield,
  Phone,
  MapPin,
  ChevronUp,
  ChevronDown,
  Zap,
  Star,
  ArrowRight,
  Eye,
} from 'lucide-react'
import { useAppStore, type Product, type Category } from '@/lib/store'
import { formatPrice, openWhatsApp } from '@/lib/shared'

// ─── Couleurs du template ELECTRO BLEU ───
const BLUE = {
  primary: '#0066FF',
  primaryDark: '#0052CC',
  primaryLight: '#E6F0FF',
  primaryHover: '#0052CC',
  primaryFg: '#FFFFFF',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  bg: '#FFFFFF',
  bgGray: '#f8fafc',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  whatsapp: '#000000',
  whatsappFg: '#FFFFFF',
  price: '#0066FF',
} as const

type SortOption = 'recent' | 'price-asc' | 'price-desc'

// ═══════════════════════════════════════════════════════════════
// SECTION 1 : MENU (Logo + Navigation)
// ═══════════════════════════════════════════════════════════════

function ElectroMenu({
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
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b" style={{ borderColor: BLUE.border }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo — 255×82 */}
          <button onClick={onNavAccueil} className="flex items-center gap-2 shrink-0">
            {logo && logo.length > 0 ? (
              <img
                src={logo}
                alt={shopName}
                className="h-[82px] w-[255px] object-contain"
              />
            ) : (
              <div
                className="flex items-center gap-2 h-[82px] w-[255px] rounded-lg"
              >
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl"
                  style={{ background: BLUE.primary, color: BLUE.primaryFg }}
                >
                  <Zap className="size-6" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-bold" style={{ color: BLUE.text }}>
                    {shopName}
                  </span>
                  <span className="block text-[10px] uppercase tracking-widest" style={{ color: BLUE.textMuted }}>
                    Boutique en ligne
                  </span>
                </div>
              </div>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={onNavAccueil}
              className="px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-blue-50"
              style={{ color: BLUE.text }}
            >
              Accueil
            </button>
            <button
              onClick={onNavProduits}
              className="px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-blue-50"
              style={{ color: BLUE.text }}
            >
              Nos Produits
            </button>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-blue-50 flex items-center gap-1.5"
                style={{ color: BLUE.text }}
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
              className="relative h-10 w-10 rounded-lg hover:bg-blue-50"
              onClick={onCartClick}
            >
              <ShoppingCart className="size-5" style={{ color: BLUE.text }} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center text-white"
                  style={{ background: BLUE.primary }}
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
                style={{ background: mobileOpen ? 'transparent' : BLUE.text }}
              />
              <span
                className="block w-5 h-0.5 rounded transition-all"
                style={{
                  background: BLUE.text,
                  transform: mobileOpen ? 'rotate(45deg) translate(3px, 3px)' : 'none',
                }}
              />
              <span
                className="block w-5 h-0.5 rounded transition-all"
                style={{
                  background: BLUE.text,
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
            style={{ borderColor: BLUE.border, background: BLUE.bg }}
          >
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => { onNavAccueil(); setMobileOpen(false) }}
                className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                style={{ color: BLUE.text }}
              >
                Accueil
              </button>
              <button
                onClick={() => { onNavProduits(); setMobileOpen(false) }}
                className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                style={{ color: BLUE.text }}
              >
                Nos Produits
              </button>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                  style={{ color: BLUE.text }}
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
// SECTION 2 : SLIDE HERO (1180×600)
// ═══════════════════════════════════════════════════════════════

function ElectroHeroSlide({
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

  // Auto-slide
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length])

  return (
    <section className="w-full" style={{ background: '#0f172a' }}>
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: '1180 / 600', maxHeight: '600px' }}
        >
          {images.length > 0 ? (
            <AnimatePresence initial={false}>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <img
                  src={images[currentSlide]}
                  alt={`${shopName} - Bannière ${currentSlide + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
              </motion.div>
            </AnimatePresence>
          ) : (
            /* Default blue gradient hero when no images */
            <div
              className="absolute inset-0 flex items-center"
              style={{
                background: `linear-gradient(135deg, ${BLUE.primary} 0%, ${BLUE.primaryDark} 50%, #003d99 100%)`,
              }}
            >
              {/* Decorative circles */}
              <div className="absolute top-10 right-20 w-64 h-64 rounded-full opacity-10 bg-white" />
              <div className="absolute bottom-20 right-40 w-40 h-40 rounded-full opacity-5 bg-white" />
              <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full opacity-5 bg-white" />

              <div className="relative z-10 px-8 sm:px-16 max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="size-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white/90 text-sm font-medium uppercase tracking-wider">
                      Bienvenue chez {shopName}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                    Découvrez nos <br />
                    <span className="text-yellow-300">meilleures offres</span>
                  </h2>
                  <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg">
                    Des produits de qualité à des prix imbattables. Livraison rapide et service client exceptionnel.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={onShopNow}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      style={{ background: '#FFC107', color: '#1e293b' }}
                    >
                      Acheter Maintenant
                      <ArrowRight className="size-4" />
                    </button>
                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm border-2 border-white/30 transition-all duration-200 hover:bg-white/10"
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
                    background: idx === currentSlide ? BLUE.primaryFg : 'rgba(255,255,255,0.5)',
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
// SECTION 3 : CATÉGORIES
// ═══════════════════════════════════════════════════════════════

function ElectroCategories({
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
    <section className="w-full bg-white">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 rounded-full" style={{ background: BLUE.primary }} />
          <h2 className="text-lg font-bold" style={{ color: BLUE.text }}>
            Nos Catégories
          </h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {/* Tous */}
          <button
            onClick={() => onCategoryClick(null)}
            className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={
              activeCategory === null
                ? { background: BLUE.primary, color: BLUE.primaryFg, boxShadow: `0 4px 12px ${BLUE.primary}33` }
                : { background: BLUE.bgGray, color: BLUE.text, border: `1px solid ${BLUE.border}` }
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
                className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={
                  activeCategory === cat.id
                    ? { background: BLUE.primary, color: BLUE.primaryFg, boxShadow: `0 4px 12px ${BLUE.primary}33` }
                    : { background: BLUE.bgGray, color: BLUE.text, border: `1px solid ${BLUE.border}` }
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
// SECTION 4 : CARTE PRODUIT (400×400)
// ═══════════════════════════════════════════════════════════════

function ElectroProductCard({
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      className="group flex flex-col overflow-hidden rounded-xl bg-white transition-all duration-300 cursor-pointer hover:shadow-xl"
      style={{ border: `1px solid ${BLUE.border}` }}
      onClick={() => onProductClick(product)}
      whileTap={{ scale: 0.98 }}
    >
      {/* Image 336×280 */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '336 / 280' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: BLUE.bgGray }}>
            <Package className="size-16" style={{ color: BLUE.border }} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg">
              <Eye className="size-5" style={{ color: BLUE.primary }} />
            </div>
          </div>
        </div>

        {/* Rupture badge */}
        {!inStock && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white border-none text-[10px] font-bold">
              Rupture
            </Badge>
          </div>
        )}

        {/* Category badge */}
        {product.categoryName && (
          <div className="absolute top-2 right-2">
            <Badge className="text-white border-none text-[10px] font-bold" style={{ background: BLUE.primary }}>
              {product.categoryName}
            </Badge>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-1.5 p-3">
        <h3
          className="font-semibold text-sm line-clamp-2 leading-snug"
          style={{ color: BLUE.text }}
        >
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
            className="inline-block px-2.5 py-1 rounded-lg text-sm font-bold"
            style={{ background: BLUE.primaryLight, color: BLUE.primary, border: `1px solid ${BLUE.primary}22` }}
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
                style={{ background: BLUE.primary }}
                disabled={!product.isAvailable || !inStock}
              >
                <Plus className="size-3.5" />
                Ajouter
              </Button>
              {whatsapp && (
                <Button
                  onClick={(e) => {
                    e.nativeEvent.stopImmediatePropagation()
                    openWhatsApp(product, whatsapp)
                  }}
                  className="gap-1.5 font-semibold rounded-lg text-sm h-9 px-3"
                  style={{ background: BLUE.whatsapp, color: BLUE.whatsappFg }}
                  disabled={!product.isAvailable || !inStock}
                >
                  <MessageCircle className="size-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-between rounded-lg p-1"
              style={{ background: BLUE.primaryLight, border: `1px solid ${BLUE.primary}33` }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                style={{ color: BLUE.primary }}
                onClick={(e) => { e.nativeEvent.stopImmediatePropagation(); updateCartQuantity(product.id, cartQty - 1) }}
              >
                {cartQty === 1 ? (
                  <Trash2 className="size-3.5 text-red-500" />
                ) : (
                  <Minus className="size-3.5" />
                )}
              </Button>
              <span className="min-w-[2rem] text-center font-bold text-sm" style={{ color: BLUE.text }}>
                {cartQty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                style={{ color: BLUE.primary }}
                onClick={(e) => { e.nativeEvent.stopImmediatePropagation(); updateCartQuantity(product.id, cartQty + 1) }}
              >
                <Plus className="size-3.5" />
              </Button>
              {whatsapp && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  style={{ color: BLUE.whatsapp }}
                  onClick={(e) => { e.nativeEvent.stopImmediatePropagation(); openWhatsApp(product, whatsapp, cartQty) }}
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
// SECTION 5 : PROMO BANNERS (2 advertising spaces)
// ═══════════════════════════════════════════════════════════════

function ElectroPromoBanners({
  promoBannersRaw,
}: {
  promoBannersRaw?: string
}) {
  const banners = useMemo(() => {
    if (!promoBannersRaw) return []
    try {
      const parsed = JSON.parse(promoBannersRaw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [promoBannersRaw])

  if (banners.length === 0) return null

  // Display up to 2 banners in a grid, or 1 full width
  const displayBanners = banners.slice(0, 2)

  return (
    <section className="w-full py-4" style={{ background: BLUE.bgGray }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className={'grid gap-4 ' + (displayBanners.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1}')}>
          {displayBanners.map((banner: { id?: string; image: string; title?: string; link?: string }, idx: number) => (
            <a
              key={banner.id || idx}
              href={banner.link || '#'}
              target={banner.link ? '_blank' : undefined}
              rel={banner.link ? 'noopener noreferrer' : undefined}
              className="block relative rounded-xl overflow-hidden group cursor-pointer"
              style={{
                aspectRatio: displayBanners.length === 2 ? '16 / 7' : '16 / 5',
                border: '1px solid ' + BLUE.border,
              }}
              onClick={(e) => {
                if (!banner.link) e.preventDefault()
              }}
            >
              <img
                src={banner.image}
                alt={banner.title || 'Promo ' + (idx + 1)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Title overlay */}
              {banner.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                  <div className="px-4 pb-3">
                    <span className="inline-block px-3 py-1 rounded-lg text-white text-xs font-bold uppercase tracking-wider" style={{ background: BLUE.primary }}>
                      {banner.title}
                    </span>
                  </div>
                </div>
              )}
              {/* Hover link indicator */}
              {banner.link && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-md">
                    <ArrowRight className="size-4" style={{ color: BLUE.primary }} />
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 6 : BRAND CAROUSEL
// ═══════════════════════════════════════════════════════════════

function ElectroBrandCarousel({
  brandsRaw,
}: {
  brandsRaw?: string
}) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const brands = useMemo(() => {
    if (!brandsRaw) return []
    try {
      const parsed = JSON.parse(brandsRaw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [brandsRaw])

  // Auto-scroll (infinite loop)
  const scrollOffsetRef = useRef(0)

  useEffect(() => {
    if (brands.length === 0) return
    const itemWidth = 160 // px per item
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
    }, 30) // Speed of auto-scroll
    return () => clearInterval(interval)
  }, [brands.length])

  function handleScrollCheck() {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }

  if (brands.length === 0) return null

  // Duplicate brands for infinite scroll effect
  const displayBrands = [...brands, ...brands]

  return (
    <section className="w-full bg-white border-y" style={{ borderColor: BLUE.border }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 rounded-full" style={{ background: BLUE.primary }} />
          <h2 className="text-lg font-bold" style={{ color: BLUE.text }}>
            Nos Marques
          </h2>
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => carouselRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border hover:bg-gray-50 transition-colors"
            style={{ borderColor: BLUE.border }}
          >
            <ChevronRight className="size-4 rotate-180" style={{ color: BLUE.text }} />
          </button>
        )}

        {/* Scrollable brand logos */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}
          onScroll={handleScrollCheck}
        >
          {displayBrands.map((brand: { id?: string; name: string; image: string; link?: string }, idx: number) => {
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
                  className="flex items-center justify-center w-[140px] h-[70px] rounded-xl bg-white transition-all duration-200 group-hover:shadow-md group-hover:scale-105 p-3"
                  style={{ border: '1px solid ' + BLUE.border }}
                >
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-medium truncate max-w-[140px]" style={{ color: BLUE.textMuted }}>
                  {brand.name}
                </span>
              </a>
            )
          })}
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => carouselRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border hover:bg-gray-50 transition-colors"
            style={{ borderColor: BLUE.border }}
          >
            <ChevronRight className="size-4" style={{ color: BLUE.text }} />
          </button>
        )}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 7 : FOOTER
// ═══════════════════════════════════════════════════════════════

function ElectroFooter({
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
    <footer className="w-full mt-12" style={{ background: '#1e293b' }}>
      {/* Trust badges */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: BLUE.primary }}>
              <Truck className="size-6 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Livraison Rapide</p>
              <p className="text-white/50 text-xs">Partout au Sénégal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: BLUE.primary }}>
              <Shield className="size-6 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Paiement Sécurisé</p>
              <p className="text-white/50 text-xs">100% sécurisé</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: BLUE.primary }}>
              <Package className="size-6 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Produits Authentiques</p>
              <p className="text-white/50 text-xs">Qualité garantie</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: BLUE.whatsapp }}>
              <MessageCircle className="size-6" style={{ color: BLUE.whatsappFg }} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Support WhatsApp</p>
              <p className="text-white/50 text-xs">Réponse rapide</p>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10 mb-6" />

        {/* Contact info + copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-white font-bold">{shopName}</p>
            <div className="flex items-center gap-4 text-white/50 text-xs">
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
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} {shopName}. Tous droits réservés. Propulsé par{' '}
            <span className="text-white/50 font-medium">Boutiko</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT DETAIL VIEW
// ═══════════════════════════════════════════════════════════════

function ElectroProductDetail({
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
      className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6"
    >
      {/* Back button */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-sm font-semibold mb-6 transition-colors hover:opacity-70"
        style={{ color: BLUE.primary }}
      >
        <ArrowLeft className="size-4" />
        Retour à la boutique
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden" style={{ background: BLUE.bgGray }}>
            {productImages[imgIndex] ? (
              <img
                src={productImages[imgIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="size-20" style={{ color: BLUE.border }} />
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
                    borderColor: idx === imgIndex ? BLUE.primary : BLUE.border,
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
              <Badge className="text-xs text-white" style={{ background: BLUE.primary }}>
                {product.categoryName}
              </Badge>
            )}
            {!inStock && (
              <Badge className="bg-red-500 text-white text-xs border-none">
                Rupture de stock
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold" style={{ color: BLUE.text }}>
            {product.name}
          </h1>

          <p className="text-2xl font-extrabold" style={{ color: BLUE.primary }}>
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <p className="text-sm leading-relaxed" style={{ color: BLUE.textMuted }}>
              {product.description}
            </p>
          )}

          {inStock && product.stock !== undefined && (
            <p className="text-sm" style={{ color: BLUE.textMuted }}>
              En stock ({product.stock} disponibles)
            </p>
          )}

          {/* Quantity */}
          <div className="p-4 rounded-xl" style={{ background: BLUE.bgGray, border: `1px solid ${BLUE.border}` }}>
            <p className="text-sm font-semibold mb-3" style={{ color: BLUE.text }}>Quantité</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center rounded-lg" style={{ border: `1px solid ${BLUE.border}` }}>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="size-4" />
                </Button>
                <span className="min-w-[36px] text-center font-bold text-base" style={{ color: BLUE.text }}>{qty}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(qty + 1)}>
                  <Plus className="size-4" />
                </Button>
              </div>
              <span className="text-lg font-bold" style={{ color: BLUE.primary }}>
                {formatPrice(product.price * qty)}
              </span>
            </div>

            <Button
              className="w-full h-12 gap-2 text-sm font-bold text-white rounded-xl"
              style={{ background: BLUE.primary }}
              disabled={!inStock}
              onClick={() => handleAdd(qty)}
            >
              <ShoppingCart className="size-5" />
              Ajouter au panier
            </Button>
          </div>

          {/* WhatsApp */}
          {whatsapp && (
            <Button
              className="w-full h-12 gap-2 text-sm font-bold rounded-xl"
              style={{ background: BLUE.whatsapp, color: BLUE.whatsappFg }}
              disabled={!inStock}
              onClick={() => openWhatsApp(product, whatsapp, qty)}
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
// CART BAR (bottom fixed)
// ═══════════════════════════════════════════════════════════════

function ElectroCartBar({
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
      className="fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
    >
      {/* Expanded cart */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-white border-t"
            style={{ borderColor: BLUE.border }}
          >
            <ScrollArea className="max-h-64">
              <div className="max-w-[1400px] mx-auto p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm" style={{ color: BLUE.text }}>
                    Votre panier ({itemCount} article{itemCount !== 1 ? 's' : ''})
                  </h3>
                  <Button variant="ghost" size="sm" className="text-red-500 h-7 text-xs" onClick={onClear}>
                    <Trash2 className="size-3 mr-1" />
                    Tout supprimer
                  </Button>
                </div>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden" style={{ background: BLUE.bgGray }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="size-5" style={{ color: BLUE.border }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1" style={{ color: BLUE.text }}>{item.name}</p>
                      <p className="text-xs font-bold" style={{ color: BLUE.primary }}>{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center rounded-lg" style={{ background: BLUE.bgGray }}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}>
                        {item.quantity === 1 ? <Trash2 className="size-3 text-red-500" /> : <Minus className="size-3" />}
                      </Button>
                      <span className="text-sm font-semibold min-w-[24px] text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}>
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <span className="text-sm font-bold w-24 text-right" style={{ color: BLUE.primary }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-bold" style={{ color: BLUE.text }}>
                  <span>Total</span>
                  <span style={{ color: BLUE.primary }}>{formatPrice(total)}</span>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart bar */}
      <div className="bg-white border-t px-4 py-3" style={{ borderColor: BLUE.border }}>
        <div className="max-w-[1400px] mx-auto flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-1.5 shrink-0 rounded-lg"
            style={{ borderColor: BLUE.border, color: BLUE.text }}
            onClick={onToggle}
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            <Badge className="px-1.5 h-5 text-xs text-white rounded-md" style={{ background: BLUE.primary }}>
              {itemCount}
            </Badge>
            <span className="hidden sm:inline text-sm">panier</span>
          </Button>

          <div className="flex-1">
            <p className="text-xs" style={{ color: BLUE.textMuted }}>Total</p>
            <p className="font-bold text-sm" style={{ color: BLUE.primary }}>{formatPrice(total)}</p>
          </div>

          <Button
            className="h-10 gap-2 font-semibold text-sm rounded-lg px-6"
            style={{ background: BLUE.whatsapp, color: BLUE.whatsappFg }}
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
// SEARCH BAR
// ═══════════════════════════════════════════════════════════════

function ElectroSearchBar({
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: BLUE.textMuted }} />
        <Input
          type="text"
          placeholder="Rechercher un produit..."
          value={localSearch}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-10 pr-10 h-11 rounded-xl text-sm"
          style={{ borderColor: BLUE.border }}
        />
        {localSearch && (
          <button
            onClick={() => handleChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: BLUE.textMuted }}
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
            background: BLUE.bg,
            color: BLUE.text,
            border: `1px solid ${BLUE.border}`,
          }}
        >
          <option value="recent">Plus récents</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 size-4 rotate-90" style={{ color: BLUE.textMuted }} />
      </div>

      {/* Results count */}
      {isSearching && (
        <div className="flex items-center gap-1.5 text-sm" style={{ color: BLUE.textMuted }}>
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

function ElectroLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Menu skeleton */}
      <div className="h-[70px] border-b flex items-center px-4">
        <Skeleton className="h-[82px] w-[255px] rounded-lg" />
        <div className="flex-1 flex justify-center gap-6">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>
      {/* Slide skeleton */}
      <div className="px-4 py-4">
        <Skeleton className="w-full rounded-2xl mx-auto" style={{ aspectRatio: '1180 / 600', maxHeight: '600px' }} />
      </div>
      {/* Products skeleton */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl overflow-hidden" style={{ border: `1px solid ${BLUE.border}` }}>
              <Skeleton className="w-full" style={{ aspectRatio: '336 / 280' }} />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN: ElectroShopPage — Page complète du template electro
// ═══════════════════════════════════════════════════════════════

export function ElectroShopPage() {
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
        return `🛍 ${c.name} x${c.quantity} — ${(c.price * c.quantity).toLocaleString('fr-FR')} FCFA${linkLine}`
      })
      .join('\n')
    const msg = `Bonjour ${publicShop.name} ! 👋\n\nJe souhaite commander :\n\n${itemsText}\n\n━━━━━━━━━━━━━━\n💰 Total : ${total.toLocaleString('fr-FR')} FCFA\n\n📝 Mes informations :\nNom :\nAdresse :\nTéléphone :\n\nMerci ! 🙏`
    const encoded = encodeURIComponent(msg)
    const phone = publicShop.whatsapp?.replace(/\D/g, '') || ''
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  // ── Loading ──
  if (loading) return <ElectroLoadingSkeleton />

  // ── Shop not found ──
  if (!publicShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-4" style={{ background: BLUE.primaryLight }}>
            <Package className="size-10" style={{ color: BLUE.primary }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: BLUE.text }}>Boutique introuvable</h2>
          <p className="text-sm mb-4" style={{ color: BLUE.textMuted }}>Cette boutique n&apos;existe pas ou a été désactivée.</p>
          <Button onClick={() => setView('landing')} style={{ background: BLUE.primary }} className="text-white font-semibold rounded-xl">
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BLUE.bg, color: BLUE.text }}>
      {/* ═══ SECTION 1 : MENU ═══ */}
      <ElectroMenu
        shopName={publicShop.name}
        logo={publicShop.logo}
        whatsapp={publicShop.whatsapp}
        cartCount={itemCount}
        onNavAccueil={handleNavAccueil}
        onNavProduits={handleNavProduits}
        onCartClick={() => cart.length > 0 && setCartExpanded(!cartExpanded)}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {selectedProduct ? (
            /* ═══ PRODUCT DETAIL ═══ */
            <ElectroProductDetail
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
            /* ═══ MAIN LAYOUT: Slide → Categories → Products ═══ */
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* ═══ SECTION 2 : SLIDE HERO ═══ */}
              <ElectroHeroSlide
                shopName={publicShop.name}
                heroImages={publicShop.heroImages}
                whatsapp={publicShop.whatsapp}
                onShopNow={handleNavProduits}
              />

              {/* ═══ SECTION 3 : CATÉGORIES ═══ */}
              <ElectroCategories
                categories={publicCategories}
                products={publicProducts}
                activeCategory={activeCategory}
                onCategoryClick={(id) => {
                  setActiveCategory(id)
                  setSelectedProduct(null)
                  scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
              />

              {/* ═══ BRAND CAROUSEL ═══ */}
              <ElectroBrandCarousel brandsRaw={publicShop.brands} />

              {/* ═══ SECTION 4 : PRODUITS ═══ */}
              <section className="w-full bg-white">
                <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 space-y-6" ref={scrollRef}>
                  {/* Section title */}
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full" style={{ background: BLUE.primary }} />
                    <h2 className="text-lg font-bold" style={{ color: BLUE.text }}>
                      Nos Produits
                    </h2>
                    <span className="text-sm" style={{ color: BLUE.textMuted }}>
                      ({totalProductCount} produit{totalProductCount !== 1 ? 's' : ''})
                    </span>
                  </div>

                  {/* Search + Sort */}
                  <ElectroSearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    resultCount={filteredProducts.length}
                    isSearching={isSearching}
                  />

                  {/* Loading skeletons for search */}
                  {isSearching && filteredProducts.length === 0 && publicProducts.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2 rounded-xl overflow-hidden" style={{ border: `1px solid ${BLUE.border}` }}>
                          <Skeleton className="w-full" style={{ aspectRatio: '336 / 280' }} />
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
                      <div className="flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: BLUE.primaryLight }}>
                        <Package className="size-10" style={{ color: BLUE.primary }} />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: BLUE.text }}>Aucun produit disponible</h3>
                      <p className="mt-1 text-sm max-w-md" style={{ color: BLUE.textMuted }}>
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
                      <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: '#fef3c7' }}>
                        <Search className="size-7 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: BLUE.text }}>Aucun résultat trouvé</h3>
                      <p className="mt-1 text-sm max-w-md" style={{ color: BLUE.textMuted }}>
                        {searchQuery
                          ? `Aucun produit ne correspond à "${searchQuery}".`
                          : 'Aucun produit dans cette catégorie.'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-xl"
                        style={{ borderColor: BLUE.primary, color: BLUE.primary }}
                        onClick={() => { setSearchQuery(''); setActiveCategory(null) }}
                      >
                        Réinitialiser les filtres
                      </Button>
                    </motion.div>
                  )}

                  {/* Product Grid — 400×400 */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory + searchQuery + sortBy}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                      {filteredProducts.map((product, index) => (
                        <ElectroProductCard
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

              {/* ═══ PROMO BANNERS ═══ */}
              <ElectroPromoBanners promoBannersRaw={publicShop.promoBanners} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ SECTION 5 : FOOTER ═══ */}
      <ElectroFooter
        shopName={publicShop.name}
        whatsapp={publicShop.whatsapp}
        phone={publicShop.phone}
        address={publicShop.address}
      />

      {/* ═══ CART BAR ═══ */}
      <AnimatePresence>
        {cart.length > 0 && (
          <ElectroCartBar
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
          href={`https://wa.me/${publicShop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${publicShop.name} ! 👋\nJe suis intéressé(e) par vos produits.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[80px] right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
          style={{ background: BLUE.whatsapp }}
          title={`Contacter ${publicShop.name} sur WhatsApp`}
        >
          <MessageCircle className="size-7" style={{ color: BLUE.whatsappFg }} />
          {/* Tooltip */}
          <span
            className="absolute right-full mr-3 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ background: '#1e293b', color: 'white' }}
          >
            {publicShop.whatsapp}
          </span>
        </a>
      )}

      {/* Bottom padding when cart is visible */}
      {cart.length > 0 && <div className="h-[60px]" />}
    </div>
  )
}
