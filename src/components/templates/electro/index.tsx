'use client'

/**
 * ElectroTemplate — Multi-sector adaptive template for the Electro engine.
 *
 * Adapts automatically to 4 sectors:
 *   - electronique  (E-commerce, Tech)   → specs card mode
 *   - auto-moto     (E-commerce, Auto)   → compat card mode
 *   - quincaillerie (E-commerce, DIY)    → compat card mode
 *   - artisanat     (Service, BTP)       → service card mode
 *
 * Reads visual config from theme-config.ts and labels from sector-config.ts.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingCart,
  ArrowLeft,
  Truck,
  Shield,
  Phone,
  MapPin,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  ArrowDown,
  SlidersHorizontal,
} from 'lucide-react'
import { useAppStore, type Product, type Category, type Shop } from '@/lib/store'
import { formatPrice, openWhatsApp } from '@/lib/shared'
import {
  getThemeConfig,
  getThemeTrustBadges,
  type ThemeConfig,
  type ElectroCardMode,
} from '@/lib/theme-config'
import { getCtaButton, getCtaWhatsAppMessage, getSectorLabels } from '@/lib/sector-config'
import { LiveShopFeatures } from '@/components/shop/live-shop-features'
import { ShippingZoneSelector } from '@/components/shop/shipping-zone-selector'

// ─── Modular Electro Components ──────────────────────────────────────────────
import { ElectroHeader } from './header'
import ElectroHero from './hero'
import ElectroProductCard from './product-card'
import ElectroTrustBadges from './trust-badges'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortOption = 'recent' | 'price-asc' | 'price-desc'

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ElectroLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-7 w-7 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
    </div>
  )
}

// ─── Categories Section ──────────────────────────────────────────────────────

interface CategoriesSectionProps {
  categories: Category[]
  products: Product[]
  activeCategory: string | null
  colors: ThemeConfig['colors']
  onCategoryClick: (categoryId: string | null) => void
}

function CategoriesSection({
  categories,
  products,
  activeCategory,
  colors,
  onCategoryClick,
}: CategoriesSectionProps) {
  if (categories.length === 0) return null

  return (
    <section className="w-full py-8 md:py-12" style={{ background: colors.background }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full" style={{ background: colors.primary }} />
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>
            Catégories
          </h2>
        </div>

        {/* Horizontal scroll on mobile, wrap on desktop */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible scrollbar-hide">
          <button
            onClick={() => onCategoryClick(null)}
            className="shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold min-h-[44px] transition-all duration-200 border"
            style={{
              background: !activeCategory ? colors.primary : 'transparent',
              color: !activeCategory ? colors.ctaText : colors.text,
              borderColor: !activeCategory ? colors.primary : colors.primaryLight,
            }}
          >
            Tout voir
          </button>
          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.categoryId === cat.id && p.isAvailable
            ).length
            if (count === 0) return null
            return (
              <button
                key={cat.id}
                onClick={() =>
                  onCategoryClick(activeCategory === cat.id ? null : cat.id)
                }
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold min-h-[44px] transition-all duration-200 border"
                style={{
                  background: activeCategory === cat.id ? colors.primary : 'transparent',
                  color: activeCategory === cat.id ? colors.ctaText : colors.text,
                  borderColor:
                    activeCategory === cat.id ? colors.primary : colors.primaryLight,
                }}
              >
                {cat.image ? (
                  <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                ) : null}
                <span>{cat.name}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      activeCategory === cat.id
                        ? 'rgba(255,255,255,0.25)'
                        : colors.primaryBg,
                    color: activeCategory === cat.id ? colors.ctaText : colors.primary,
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Sort Dropdown ────────────────────────────────────────────────────────────

interface SortBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  sortBy: SortOption
  onSortChange: (s: SortOption) => void
  resultCount: number
  totalCount: number
  colors: ThemeConfig['colors']
  showSearch: boolean
}

function SortBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
  totalCount,
  colors,
  showSearch,
}: SortBarProps) {
  const [sortOpen, setSortOpen] = useState(false)
  const sortLabels: Record<SortOption, string> = {
    recent: 'Plus récents',
    'price-asc': 'Prix croissant',
    'price-desc': 'Prix décroissant',
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Search (mobile + inline) */}
      {showSearch && (
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none"
            style={{ color: '#9CA3AF' }}
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-10 w-full rounded-lg border text-sm"
            style={{ borderColor: colors.primaryLight }}
            aria-label="Rechercher"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Effacer la recherche"
            >
              <X className="size-4 text-gray-400" />
            </button>
          )}
        </div>
      )}

      {/* Sort + count */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <span className="text-sm text-gray-500">
          {searchQuery
            ? `${resultCount} résultat${resultCount !== 1 ? 's' : ''}`
            : `${totalCount} article${totalCount !== 1 ? 's' : ''}`}
        </span>

        <div className="relative ml-auto">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors border"
            style={{ borderColor: colors.primaryLight, color: colors.text }}
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
            <ArrowDown className="size-3.5" />
          </button>

          <AnimatePresence>
            {sortOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSortOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border py-1 min-w-[180px]"
                  style={{ borderColor: colors.primaryLight }}
                >
                  {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        onSortChange(key)
                        setSortOpen(false)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors min-h-[44px] flex items-center"
                      style={{
                        color: sortBy === key ? colors.primary : colors.text,
                        background: sortBy === key ? colors.primaryBg : 'transparent',
                      }}
                    >
                      {sortLabels[key]}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Cart Bar (bottom) ────────────────────────────────────────────────────────

interface CartBarProps {
  cart: ReturnType<typeof useAppStore>['cart']
  expanded: boolean
  onToggle: () => void
  onClear: () => void
  onCheckout: () => void
  total: number
  itemCount: number
  colors: ThemeConfig['colors']
  shop: Shop | null
  updateCartQuantity: (id: string, qty: number) => void
  removeFromCart: (id: string) => void
}

function CartBar({
  cart,
  expanded,
  onToggle,
  onClear,
  onCheckout,
  total,
  itemCount,
  colors,
  shop,
  updateCartQuantity,
  removeFromCart,
}: CartBarProps) {
  return (
    <>
      {/* Expandable panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed bottom-[60px] left-0 right-0 z-40 bg-white border-t shadow-2xl overflow-hidden"
            style={{ borderColor: colors.primaryLight }}
          >
            <ScrollArea className="max-h-[50vh]">
              <div className="max-w-[1400px] mx-auto px-4 py-3 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2"
                  >
                    {item.image ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Package className="size-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
                        {item.name}
                      </p>
                      <p className="text-sm font-bold" style={{ color: colors.primary }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors"
                        style={{ borderColor: colors.primaryLight, color: colors.primary }}
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center" style={{ color: colors.text }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors"
                        style={{ borderColor: colors.primaryLight, color: colors.primary }}
                      >
                        <Plus className="size-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors ml-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t shadow-lg"
        style={{ background: 'white', borderColor: colors.primaryLight }}
      >
        <div className="max-w-[1400px] mx-auto px-4 h-[60px] flex items-center justify-between">
          <button
            onClick={onToggle}
            className="flex items-center gap-3 min-h-[44px]"
          >
            <div
              className="relative w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: colors.primaryBg }}
            >
              <ShoppingCart className="size-5" style={{ color: colors.primary }} />
              <span
                className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full text-white"
                style={{ background: colors.primary }}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-bold" style={{ color: colors.text }}>
                {formatPrice(total)}
              </p>
            </div>
            {expanded ? (
              <ChevronDown className="size-4 text-gray-400" />
            ) : (
              <ChevronUp className="size-4 text-gray-400" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 min-h-[44px] hidden sm:flex"
            >
              Vider
            </Button>
            <Button
              onClick={onCheckout}
              className="flex items-center gap-2 min-h-[44px] rounded-lg font-semibold text-sm"
              style={{ background: colors.primary, color: colors.ctaText }}
            >
              <MessageCircle className="size-4" />
              <span>Commander via WhatsApp</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

interface ElectroFooterProps {
  shop: Shop
  colors: ThemeConfig['colors']
}

function ElectroFooter({ shop, colors }: ElectroFooterProps) {
  return (
    <footer
      className="w-full py-10 px-4"
      style={{ background: colors.secondary, color: '#FFFFFF' }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-3">{shop.name}</h3>
            {shop.description && (
              <p className="text-sm opacity-70 leading-relaxed max-w-sm">
                {shop.description}
              </p>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-60">
              Contact
            </h4>
            <div className="space-y-2 text-sm opacity-80">
              {shop.phone && (
                <a
                  href={`tel:${shop.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-2 hover:opacity-100 transition-opacity min-h-[44px]"
                >
                  <Phone className="size-4 shrink-0" />
                  <span>{shop.phone}</span>
                </a>
              )}
              {shop.whatsapp && (
                <a
                  href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-100 transition-opacity min-h-[44px]"
                >
                  <MessageCircle className="size-4 shrink-0" />
                  <span>WhatsApp</span>
                </a>
              )}
              {shop.address && (
                <div className="flex items-start gap-2 min-h-[44px]">
                  <MapPin className="size-4 shrink-0 mt-0.5" />
                  <span>{shop.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-60">
              Plateforme
            </h4>
            <p className="text-sm opacity-70">
              Créé avec <span className="font-semibold">Boutiko</span> —
              Créez votre boutique en ligne en quelques minutes.
            </p>
          </div>
        </div>

        <Separator className="my-6 bg-white/10" />

        <p className="text-center text-xs opacity-50">
          © {new Date().getFullYear()} {shop.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}

// ─── Product Detail View ─────────────────────────────────────────────────────

interface ProductDetailProps {
  product: Product
  shop: Shop
  colors: ThemeConfig['colors']
  cardMode: ElectroCardMode
  ctaText: string
  whatsappMessage: string
  showPrice: boolean
  categoryName?: string
  onClose: () => void
  onAddToCart: (product: Product, qty: number) => void
  cartQty: number
  updateCartQuantity: (id: string, qty: number) => void
}

function ProductDetail({
  product,
  shop,
  colors,
  cardMode,
  ctaText,
  whatsappMessage,
  showPrice,
  categoryName,
  onClose,
  onAddToCart,
  cartQty,
  updateCartQuantity,
}: ProductDetailProps) {
  const [qty, setQty] = useState(1)
  const isService = cardMode === 'service'
  const shouldShowPrice = showPrice && !isService

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : []

  const msg = whatsappMessage
    .replace('{productName}', product.name)
    .replace('{productPrice}', formatPrice(product.price))

  function handleWhatsApp() {
    const encoded = encodeURIComponent(msg)
    const phone = shop.whatsapp?.replace(/\D/g, '') || ''
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      onAddToCart(product, 1)
    }
    setQty(1)
    toast.success('Ajouté au panier')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{ background: colors.background, color: colors.text }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 border-b bg-white"
        style={{ borderColor: colors.primaryLight }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 min-h-[44px] -ml-2 pl-2"
        >
          <ArrowLeft className="size-5" style={{ color: colors.primary }} />
          <span className="text-sm font-semibold" style={{ color: colors.primary }}>
            Retour
          </span>
        </button>
      </div>

      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
              {images[0] ? (
                <Image
                  src={images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package className="size-20" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border"
                    style={{ borderColor: colors.primaryLight }}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {categoryName && (
              <span
                className="inline-block self-start rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: colors.primaryBg,
                  color: colors.primary,
                  border: `1px solid ${colors.primaryLight}`,
                }}
              >
                {categoryName}
              </span>
            )}

            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            {shouldShowPrice && (
              <div>
                <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {formatPrice(product.price)}
                </span>
              </div>
            )}

            {isService && product.price <= 0 && (
              <p className="text-base font-medium text-gray-400">Sur devis</p>
            )}

            {!isService && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Quantité :</span>
                <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: colors.primaryLight }}>
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                {cartQty > 0 && (
                  <span className="text-xs text-gray-500">
                    {cartQty} dans le panier
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-lg font-semibold text-sm"
                style={{ background: colors.ctaBg, color: colors.ctaText }}
              >
                <MessageCircle className="size-4" />
                {ctaText}
              </Button>
              {!isService && (
                <Button
                  variant="outline"
                  onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-lg font-semibold text-sm"
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  <ShoppingCart className="size-4" />
                  Ajouter au panier
                </Button>
              )}
            </div>

            {/* Shipping zone + trust (e-commerce only) */}
            {!isService && (
            <>
            <div className="mt-4">
              <ShippingZoneSelector />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Truck className="size-4 shrink-0" />
                <span>Livraison disponible</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="size-4 shrink-0" />
                <span>Paiement sécurisé</span>
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN TEMPLATE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ElectroTemplate() {
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [cartExpanded, setCartExpanded] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  // ── Resolve theme config from sector ──
  const sector = publicShop?.sector
  const themeConfig = useMemo(
    () => getThemeConfig(sector, 'electro'),
    [sector]
  )
  const { colors, hero: heroConfig, cardMode, navLabels, showSearch, productsSectionTitle } = themeConfig
  const heroCtaText = themeConfig.heroCtaText
  const ctaButtonText = getCtaButton(sector)
  const whatsappMsg = getCtaWhatsAppMessage(sector)
  const sectorLabels = getSectorLabels(sector)
  const trustBadges = getThemeTrustBadges(sector, 'electro')
  const isServiceMode = cardMode === 'service'

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
        const found = publicProducts.find(
          (p: Product) => (p.slug || p.id) === match[2]
        )
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
      // Silent fail — loading state handles display
    } finally {
      setLoading(false)
    }
  }, [shopSlug, setPublicShop, setPublicProducts, setPublicCategories])

  useEffect(() => {
    fetchShop()
  }, [fetchShop])

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

  function handleNavAccueil() {
    handleBackFromProduct()
    setActiveCategory(null)
    setSearchQuery('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleNavCatalog() {
    handleBackFromProduct()
    setActiveCategory(null)
    setSearchQuery('')
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleContact() {
    if (publicShop?.whatsapp) {
      const phone = publicShop.whatsapp.replace(/\D/g, '')
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(`Bonjour ${publicShop.name} ! 👋\nJe suis intéressé(e) par vos ${isServiceMode ? 'services' : 'produits'}.`)}`,
        '_blank'
      )
    }
  }

  function handleHeroCta() {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleHeroCatalog() {
    handleNavCatalog()
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
  if (loading) return <ElectroLoadingSkeleton />

  // ── Shop not found ──
  if (!publicShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <div
            className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-4"
            style={{ background: colors.primaryBg }}
          >
            <Package className="size-10" style={{ color: colors.primary }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
            Boutique introuvable
          </h2>
          <p className="text-sm mb-4 text-gray-500">
            Cette boutique n&apos;existe pas ou a été désactivée.
          </p>
          <Button
            onClick={() => setView('landing')}
            className="font-semibold rounded-xl"
            style={{ background: colors.primary, color: colors.ctaText }}
          >
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    )
  }

  // ── Main render ──
  return (
    <motion.div
      className="min-h-screen flex flex-col"
      style={{ background: colors.background, color: colors.text }}
    >
      {/* ═══ HEADER ═══ */}
      <ElectroHeader
        colors={colors}
        shop={publicShop}
        cartItemCount={itemCount}
        showSearch={showSearch}
        isServiceMode={isServiceMode}
        catalogLabel={navLabels.catalog}
        onAccueilClick={handleNavAccueil}
        onCatalogClick={handleNavCatalog}
        onContactClick={handleContact}
        onCartClick={() => cart.length > 0 && setCartExpanded(!cartExpanded)}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      <main className="flex-1">
        <LiveShopFeatures />

        <AnimatePresence mode="wait" initial={false}>
          {selectedProduct ? (
            <ProductDetail
              key={selectedProduct.id}
              product={selectedProduct}
              shop={publicShop}
              colors={colors}
              cardMode={cardMode}
              ctaText={ctaButtonText}
              whatsappMessage={whatsappMsg}
              showPrice={sectorLabels.showPrice}
              categoryName={
                publicCategories.find((c) => c.id === selectedProduct.categoryId)?.name
              }
              onClose={handleBackFromProduct}
              onAddToCart={(product, qty) => {
                for (let i = 0; i < qty; i++) handleAddToCart(product, 1)
              }}
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
              <ElectroHero
                colors={colors}
                hero={heroConfig}
                shop={publicShop}
                ctaText={heroCtaText}
                onCtaClick={handleHeroCta}
                onCatalogClick={handleHeroCatalog}
              />

              {/* ═══ CATEGORIES ═══ */}
              <CategoriesSection
                categories={publicCategories}
                products={publicProducts}
                activeCategory={activeCategory}
                colors={colors}
                onCategoryClick={(id) => {
                  setActiveCategory(id)
                  productsRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
              />

              {/* ═══ PRODUCTS GRID ═══ */}
              <section className="w-full bg-white" id="produits">
                <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 md:py-12 space-y-6" ref={productsRef}>
                  {/* Section heading */}
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full" style={{ background: colors.primary }} />
                    <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                      {productsSectionTitle}
                    </h2>
                    <span className="text-sm text-gray-400">
                      ({totalProductCount} article{totalProductCount !== 1 ? 's' : ''})
                    </span>
                  </div>

                  {/* Search + Sort bar */}
                  <SortBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    resultCount={filteredProducts.length}
                    totalCount={totalProductCount}
                    colors={colors}
                    showSearch={showSearch}
                  />

                  {/* Search loading skeletons */}
                  {isSearching && filteredProducts.length === 0 && publicProducts.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-2 rounded-lg overflow-hidden border border-gray-100"
                        >
                          <Skeleton className="w-full aspect-square" />
                          <div className="p-3 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-10 w-full rounded-lg" />
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
                        style={{ background: colors.primaryBg }}
                      >
                        <Package className="size-10" style={{ color: colors.primary }} />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                        {isServiceMode ? 'Aucun service disponible' : 'Aucun produit disponible'}
                      </h3>
                      <p className="mt-1 text-sm max-w-md text-gray-500">
                        Cette boutique n&apos;a pas encore de{' '}
                        {isServiceMode ? 'services' : 'produits'}. Revenez bientôt !
                      </p>
                    </div>
                  )}

                  {/* Empty search results */}
                  {filteredProducts.length === 0 && publicProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-amber-50">
                        <Search className="size-7 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                        Aucun résultat trouvé
                      </h3>
                      <p className="mt-1 text-sm max-w-md text-gray-500">
                        {searchQuery
                          ? `Aucun ${isServiceMode ? 'service' : 'produit'} ne correspond à "${searchQuery}".`
                          : 'Aucun résultat dans cette catégorie.'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-lg"
                        style={{ borderColor: colors.primary, color: colors.primary }}
                        onClick={() => {
                          setSearchQuery('')
                          setActiveCategory(null)
                        }}
                      >
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
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
                    >
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="cursor-pointer"
                        >
                          <ElectroProductCard
                            product={product}
                            colors={colors}
                            cardMode={cardMode}
                            ctaText={ctaButtonText}
                            whatsappNumber={publicShop?.whatsapp || ''}
                            whatsappMessage={whatsappMsg}
                            showPrice={sectorLabels.showPrice}
                            categoryName={
                              publicCategories.find((c) => c.id === product.categoryId)?.name
                            }
                            onAddToCart={(p) => handleAddToCart(p, 1)}
                          />
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>

              {/* ═══ TRUST BADGES ═══ */}
              <ElectroTrustBadges badges={trustBadges} colors={colors} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ FOOTER ═══ */}
      <ElectroFooter shop={publicShop} colors={colors} />

      {/* ═══ CART BAR (e-commerce only) ═══ */}
      {!isServiceMode && (
        <AnimatePresence>
          {cart.length > 0 && (
            <CartBar
              cart={cart}
              expanded={cartExpanded}
              onToggle={() => setCartExpanded(!cartExpanded)}
              onClear={clearCart}
              onCheckout={handleWhatsAppCheckout}
              total={total}
              itemCount={itemCount}
              colors={colors}
              shop={publicShop}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
            />
          )}
        </AnimatePresence>
      )}

      {/* ═══ FLOATING WHATSAPP ═══ */}
      {publicShop.whatsapp && (
        <a
          href={`https://wa.me/${publicShop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${publicShop.name} ! 👋\nJe suis intéressé(e) par vos ${isServiceMode ? 'services' : 'produits'}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group ${!isServiceMode && cart.length > 0 ? 'bottom-[80px]' : ''}`}
          style={{ background: '#25D366' }}
          title={`Contacter ${publicShop.name} sur WhatsApp`}
        >
          <MessageCircle className="size-7 text-white" />
          <span
            className="absolute right-full mr-3 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gray-800 text-white"
          >
            {isServiceMode ? 'Demander un devis' : 'Commander'}
          </span>
        </a>
      )}

      {/* Bottom padding when cart is visible */}
      {!isServiceMode && cart.length > 0 && <div className="h-[60px]" />}
    </motion.div>
  )
}

export default ElectroTemplate