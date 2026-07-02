'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingBag,
  Flame,
  Sparkles,
  ArrowRight,
  Mail,
  Newspaper,
  Heart,
} from 'lucide-react'
import { Product as ProductType, formatPrice } from '@/lib/shared'
import { LiveShopFeatures } from '../live-shop-features'
import { ThemedCartDrawer } from '@/components/shop/themed-cart-drawer'

/* ─── Types ─── */

interface FashionGridProps {
  filteredProducts: ProductType[]
  publicCategories: any[]
  publicProducts: ProductType[]
  activeCategory: string | null
  searchQuery: string
  sortBy: 'recent' | 'price-asc' | 'price-desc'
  isSearching: boolean
  totalProductCount: number
  onCategoryClick: (id: string | null) => void
  onProductClick: (product: ProductType) => void
  onAddToCart: (product: ProductType) => void
  getCartQuantity: (productId: string) => number
  updateCartQuantity: (productId: string, qty: number) => void
  onSortChange: (sort: string) => void
  onSearchChange: (query: string) => void
  shopName: string
  whatsapp?: string
  cart: any[]
  total: number
  itemCount: number
  clearCart: () => void
  handleWhatsAppCheckout: () => void
}

/* ─── Theme Colors ─── */
const COLORS = {
  bg: '#FFFFFF',
  text: '#222222',
  textMuted: '#777777',
  accent: '#C8102E',
  border: '#e8e8e8',
  borderLight: '#f2f2f2',
  darkBtn: '#222222',
  darkBtnFg: '#FFFFFF',
} as const

/* ─── Category Emoji Map ─── */
function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('robe') || lower.includes('dress')) return '👗'
  if (lower.includes('accessoir') || lower.includes('bijou') || lower.includes('ring') || lower.includes('bague')) return '💍'
  if (lower.includes('chaussur') || lower.includes('shoe') || lower.includes('sandal') || lower.includes('basket')) return '👠'
  if (lower.includes('haut') || lower.includes('top') || lower.includes('chemis') || lower.includes('t-shirt') || lower.includes('blouse')) return '👚'
  if (lower.includes('pantal') || lower.includes('jean') || lower.includes('short') || lower.includes('pant')) return '👖'
  if (lower.includes('sac') || lower.includes('bag')) return '👜'
  if (lower.includes('montre') || lower.includes('watch')) return '⌚'
  if (lower.includes('lunett') || lower.includes('verr') || lower.includes('glass')) return '🕶️'
  if (lower.includes('parfum') || lower.includes('fragranc')) return '🌸'
  if (lower.includes('enfant') || lower.includes('kid') || lower.includes('baby')) return '👶'
  if (lower.includes('homme') || lower.includes('men') || lower.includes('male')) return '🧔'
  if (lower.includes('femm') || lower.includes('women') || lower.includes('ladi')) return '💃'
  if (lower.includes('sport') || lower.includes('fitness')) return '🏃'
  if (lower.includes('maquill') || lower.includes('beauté') || lower.includes('beauty') || lower.includes('cosmét')) return '💄'
  if (lower.includes('écharp') || lower.includes('foular')) return '🧣'
  return '🏷️'
}

/* ─── Featured Products (first 3 available products) ─── */
function useFeaturedProducts(products: ProductType[]): ProductType[] {
  return useMemo(() => products.filter((p) => p.isAvailable).slice(0, 3), [products])
}

/* ─── Circular Category Button ─── */
function CircularCategoryButton({
  label,
  emoji,
  active,
  onClick,
  count,
  image,
}: {
  label: string
  emoji: string
  active: boolean
  onClick: () => void
  count?: number
  image?: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 shrink-0 group"
    >
      <div
        className={`
          w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden
          flex items-center justify-center text-2xl sm:text-3xl
          transition-all duration-300 cursor-pointer
          ${active
            ? 'ring-2 ring-offset-2 shadow-lg scale-110'
            : 'hover:scale-105 hover:shadow-md'
          }
        `}
        style={{
          background: active ? COLORS.accent : COLORS.bg,
          boxShadow: active
            ? `0 4px 14px ${COLORS.accent}33`
            : `0 1px 4px rgba(0,0,0,0.06)`,
          border: active ? 'none' : `1px solid ${COLORS.border}`,
        }}
      >
        {image ? (
          <img
            src={image}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className="transition-colors duration-200"
            style={{ filter: active ? 'brightness(0) invert(1)' : 'none' }}
          >
            {emoji}
          </span>
        )}
      </div>
      <span
        className="text-[11px] sm:text-xs font-medium leading-tight max-w-[72px] sm:max-w-[84px] text-center line-clamp-2 transition-colors duration-200"
        style={{ color: active ? COLORS.accent : COLORS.text }}
      >
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span
          className="text-[10px] font-medium"
          style={{ color: COLORS.textMuted }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

/* ─── Fashion Product Card ─── */
function FashionProductCard({
  product,
  onProductClick,
  onAddToCart,
  cartQty,
  onUpdateQuantity,
  variant = 'default',
}: {
  product: ProductType
  onProductClick: (product: ProductType) => void
  onAddToCart: (product: ProductType) => void
  cartQty: number
  onUpdateQuantity: (productId: string, qty: number) => void
  variant?: 'default' | 'featured'
}) {
  const isFeatured = variant === 'featured'
  const productImage = (product.images && product.images[0]) || product.image || null
  const isNew = useMemo(() => {
    if (!product.createdAt) return false
    const diff = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7
  }, [product.createdAt])

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`
        group relative flex flex-col cursor-pointer
        transition-all duration-300
        ${isFeatured ? 'min-w-[260px] sm:min-w-[300px]' : 'w-full'}
      `}
      style={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: '4px',
        overflow: 'hidden',
        background: COLORS.bg,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.accent
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border
      }}
      onClick={() => onProductClick(product)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden bg-gray-50"
        style={{ aspectRatio: isFeatured ? '3/4' : '3/4' }}
      >
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1' }}
            style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
            <Package className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: COLORS.border }} />
          </div>
        )}

        {/* Wishlist Heart (top-right) */}
        <button
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
          style={{ background: `${COLORS.bg}ee`, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
          onClick={(e) => {
            e.stopPropagation()
            toast.success('Ajouté aux favoris')
          }}
        >
          <Heart className="h-4 w-4" style={{ color: COLORS.textMuted }} />
        </button>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {isNew && (
            <Badge
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 gap-0.5"
              style={{ background: COLORS.accent, color: '#fff' }}
            >
              <Sparkles className="h-2.5 w-2.5" />
              Nouveau
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={isFeatured ? 'p-4 sm:p-5' : 'p-3 sm:p-4'}>
        {/* Product Name */}
        <h3
          className="text-xs sm:text-sm font-medium line-clamp-2 leading-snug mb-1.5"
          style={{ color: COLORS.text }}
        >
          {product.name}
        </h3>

        {/* Category label */}
        {product.categoryName && (
          <p className="text-[10px] sm:text-[11px] mb-2" style={{ color: COLORS.textMuted }}>
            {product.categoryName}
          </p>
        )}

        {/* Price */}
        <p
          className={`font-bold mb-3 ${isFeatured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}
          style={{ color: COLORS.accent }}
        >
          {formatPrice(product.price)}
        </p>

        {/* Add to Cart / Quantity Controls */}
        <div onClick={(e) => e.stopPropagation()}>
          {cartQty === 0 ? (
            <Button
              className="w-full h-8 sm:h-9 gap-1.5 text-[11px] sm:text-xs font-medium rounded-sm transition-all duration-200"
              style={{ background: COLORS.darkBtn, color: COLORS.darkBtnFg }}
              onClick={() => {
                onAddToCart(product)
                toast.success(`${product.name} ajouté au panier`)
              }}
            >
              <Plus className="h-3 w-3" />
              Ajouter
            </Button>
          ) : (
            <div
              className="flex items-center justify-between rounded-sm overflow-hidden"
              style={{ border: `1px solid ${COLORS.border}` }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-gray-50 rounded-none"
                onClick={() => onUpdateQuantity(product.id, cartQty - 1)}
              >
                {cartQty === 1 ? (
                  <Trash2 className="h-3 w-3" style={{ color: COLORS.accent }} />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
              </Button>
              <span className="text-xs sm:text-sm font-semibold min-w-[24px] text-center" style={{ color: COLORS.text }}>
                {cartQty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-gray-50 rounded-none"
                onClick={() => onUpdateQuantity(product.id, cartQty + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Blog Card ─── */
function BlogCard({
  title,
  date,
  excerpt,
  index,
}: {
  title: string
  date: string
  excerpt: string
  index: number
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      {/* Placeholder image */}
      <div
        className="relative overflow-hidden rounded-sm mb-4 flex items-center justify-center"
        style={{ aspectRatio: '16/10', background: '#f5f5f5' }}
      >
        <Newspaper className="h-10 w-10" style={{ color: COLORS.border }} />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-100 to-transparent" />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs uppercase tracking-wider font-medium mb-1.5" style={{ color: COLORS.textMuted }}>
          {date}
        </p>
        <h3 className="text-sm sm:text-base font-semibold mb-1.5 line-clamp-2 leading-snug group-hover:underline" style={{ color: COLORS.text }}>
          {title}
        </h3>
        <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed" style={{ color: COLORS.textMuted }}>
          {excerpt}
        </p>
      </div>
    </motion.article>
  )
}

/* ─── Newsletter Section ─── */
function NewsletterSection() {
  const [email, setEmail] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubscribe = useCallback(() => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Veuillez entrer un email valide')
      inputRef.current?.focus()
      return
    }
    toast.info('Service bientôt disponible !')
    setEmail('')
  }, [email])

  return (
    <section
      className="w-full py-12 sm:py-16 px-4"
      style={{ background: '#f7f7f7' }}
    >
      <div className="max-w-xl mx-auto text-center">
        <Mail className="h-8 w-8 mx-auto mb-3" style={{ color: COLORS.accent }} />
        <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: COLORS.text }}>
          Restez informé
        </h2>
        <p className="text-xs sm:text-sm mb-6 max-w-md mx-auto" style={{ color: COLORS.textMuted }}>
          Inscrivez-vous à notre newsletter pour recevoir nos dernières nouveautés, promotions et tendances mode.
        </p>
        <div className="flex gap-2 max-w-md mx-auto">
          <Input
            ref={inputRef}
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            className="h-10 sm:h-11 text-sm rounded-sm flex-1"
            style={{
              border: `1px solid ${COLORS.border}`,
              background: COLORS.bg,
            }}
          />
          <Button
            className="h-10 sm:h-11 px-5 sm:px-6 text-xs sm:text-sm font-semibold rounded-sm shrink-0"
            style={{ background: COLORS.accent, color: '#fff' }}
            onClick={handleSubscribe}
          >
            <span className="hidden sm:inline">S&apos;inscrire</span>
            <ArrowRight className="h-4 w-4 sm:hidden" />
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT: FashionGrid
   ═══════════════════════════════════════════════════════════════ */
export function FashionGrid({
  filteredProducts,
  publicCategories,
  publicProducts,
  activeCategory,
  searchQuery,
  sortBy,
  isSearching,
  totalProductCount,
  onCategoryClick,
  onProductClick,
  onAddToCart,
  getCartQuantity,
  updateCartQuantity,
  onSortChange,
  onSearchChange,
  shopName,
  cart,
  total,
  itemCount,
  clearCart,
  handleWhatsAppCheckout,
}: FashionGridProps) {
  const [cartExpanded, setCartExpanded] = useState(false)
  const featuredRef = useRef<HTMLDivElement>(null)

  const featuredProducts = useFeaturedProducts(publicProducts)
  const showSpecialSections = !isSearching && !activeCategory

  return (
    <div className="w-full" style={{ background: COLORS.bg, color: COLORS.text }}>
      <LiveShopFeatures />

      {/* ════════════════════════════════════════════════
          SEARCH BAR & SORT
          ════════════════════════════════════════════════ */}
      <div className="px-4 pt-4 sm:pt-6 pb-2">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: COLORS.textMuted }}
            />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-9 h-9 sm:h-10 text-sm rounded-sm"
              style={{
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bg,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70"
                style={{ color: COLORS.textMuted }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-9 sm:h-10 text-sm px-3 rounded-sm cursor-pointer shrink-0 outline-none focus:ring-1"
            style={{
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
            }}
          >
            <option value="recent">Plus récents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CIRCULAR CATEGORY NAVIGATION
          ════════════════════════════════════════════════ */}
      {publicCategories.length > 0 && (
        <div className="px-4 py-4 sm:py-6">
          <div className="max-w-5xl mx-auto">
            {/* "All" button + Categories */}
            <div className="flex gap-5 sm:gap-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {/* Tous */}
              <CircularCategoryButton
                label="Tous"
                emoji="✨"
                active={activeCategory === null}
                onClick={() => onCategoryClick(null)}
                count={totalProductCount}
              />
              {publicCategories.map((cat: any) => {
                const count = publicProducts.filter(
                  (p) => p.categoryId === cat.id && p.isAvailable
                ).length
                if (count === 0) return null
                return (
                  <CircularCategoryButton
                    key={cat.id}
                    label={cat.name}
                    emoji={getCategoryEmoji(cat.name)}
                    image={cat.image}
                    active={activeCategory === cat.id}
                    onClick={() =>
                      onCategoryClick(activeCategory === cat.id ? null : cat.id)
                    }
                    count={count}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Results info */}
      <div className="px-4 pb-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs sm:text-sm" style={{ color: COLORS.textMuted }}>
            {isSearching ? (
              <span>
                {filteredProducts.length} résultat
                {filteredProducts.length !== 1 ? 's' : ''} pour &quot;{searchQuery}&quot;
              </span>
            ) : activeCategory ? (
              <span>
                {filteredProducts.length} produit
                {filteredProducts.length !== 1 ? 's' : ''} dans cette catégorie
              </span>
            ) : (
              <span>
                {totalProductCount} produit
                {totalProductCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          FEATURED SECTION (hidden when filtering/searching)
          ════════════════════════════════════════════════ */}
      <AnimatePresence initial={false}>
        {showSpecialSections && featuredProducts.length >= 3 && (
          <motion.section
            ref={featuredRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-6 sm:pb-8"
          >
            <div className="max-w-5xl mx-auto">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-4 w-4" style={{ color: COLORS.accent }} />
                <h2
                  className="text-sm sm:text-base font-bold uppercase tracking-wider"
                  style={{ color: COLORS.text }}
                >
                  Sélection
                </h2>
                <div className="flex-1 h-px" style={{ background: COLORS.border }} />
              </div>

              {/* Horizontal scroll with snap */}
              <div
                className="flex gap-4 overflow-x-auto pb-3"
                style={{
                  scrollbarWidth: 'none',
                  scrollSnapType: 'x mandatory',
                }}
              >
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="shrink-0 w-[260px] sm:w-[300px]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <FashionProductCard
                      product={product}
                      onProductClick={onProductClick}
                      onAddToCart={onAddToCart}
                      cartQty={getCartQuantity(product.id)}
                      onUpdateQuantity={updateCartQuantity}
                      variant="featured"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          PRODUCT GRID
          ════════════════════════════════════════════════ */}
      <div className="px-4 pb-6 sm:pb-10">
        <div className="max-w-5xl mx-auto">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <FashionProductCard
                      product={product}
                      onProductClick={onProductClick}
                      onAddToCart={onAddToCart}
                      cartQty={getCartQuantity(product.id)}
                      onUpdateQuantity={updateCartQuantity}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* ─── Empty State ─── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: COLORS.borderLight }}
              >
                {isSearching ? (
                  <Search className="h-7 w-7" style={{ color: COLORS.border }} />
                ) : (
                  <ShoppingBag className="h-7 w-7" style={{ color: COLORS.border }} />
                )}
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5" style={{ color: COLORS.text }}>
                {isSearching ? 'Aucun résultat' : 'Aucun produit disponible'}
              </h3>
              <p className="text-xs sm:text-sm max-w-sm mb-4" style={{ color: COLORS.textMuted }}>
                {isSearching
                  ? `Aucun produit ne correspond à "${searchQuery}". Essayez d'autres mots-clés.`
                  : 'Cette boutique n\'a pas encore ajouté de produits. Revenez bientôt !'}
              </p>
              {isSearching && (
                <Button
                  variant="outline"
                  className="text-xs sm:text-sm rounded-sm"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                  onClick={() => {
                    onSearchChange('')
                  }}
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Effacer la recherche
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          BLOG / NEWS SECTION (hidden when filtering/searching)
          ════════════════════════════════════════════════ */}
      <AnimatePresence initial={false}>
        {showSpecialSections && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-8 sm:pb-12"
          >
            <div className="max-w-5xl mx-auto">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-6">
                <Newspaper className="h-4 w-4" style={{ color: COLORS.accent }} />
                <h2
                  className="text-sm sm:text-base font-bold uppercase tracking-wider"
                  style={{ color: COLORS.text }}
                >
                  Notre Blog
                </h2>
                <div className="flex-1 h-px" style={{ background: COLORS.border }} />
              </div>

              {/* Blog cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <BlogCard
                  index={0}
                  title="Les tendances mode de cette saison : ce qu'il faut savoir"
                  date="15 Juin 2025"
                  excerpt="Découvrez les pièces incontournables de la saison et comment les intégrer à votre garde-robe pour un style impeccable."
                />
                <BlogCard
                  index={1}
                  title="5 conseils pour bien entretenir vos vêtements de qualité"
                  date="8 Juin 2025"
                  excerpt="Apprenez les meilleures astuces pour garder vos vêtements neufs plus longtemps et préserver leur qualité au fil des lavages."
                />
              </div>

              {/* View all link */}
              <div className="mt-6 text-center">
                <button
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors duration-200 hover:opacity-70"
                  style={{ color: COLORS.accent }}
                >
                  Voir tous les articles
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

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
              text: COLORS.text,
              textMuted: COLORS.textMuted,
              price: COLORS.accent,
              bg: '#ffffff',
              border: COLORS.border,
              primary: COLORS.accent,
              primaryLight: '#ffe4e6',
              whatsapp: '#25D366',
              whatsappFg: '#ffffff',
              shadow: '0 -4px 20px rgba(200,16,46,0.08)',
              roundedItem: 'rounded-full',
              roundedBtn: 'rounded-full',
              maxWidth: 'max-w-[1200px]',
            }}
          />
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          NEWSLETTER SECTION
          ════════════════════════════════════════════════ */}
      <NewsletterSection />

      {/* ════════════════════════════════════════════════
          FOOTER (minimal)
          ════════════════════════════════════════════════ */}
      <footer
        className="py-6 px-4 text-center"
        style={{ background: COLORS.bg, borderTop: `1px solid ${COLORS.border}` }}
      >
        <p className="text-[11px] sm:text-xs" style={{ color: COLORS.textMuted }}>
          © {new Date().getFullYear()} {shopName || 'Boutique'}. Tous droits réservés.
        </p>
      </footer>
    </div>
  )
}
