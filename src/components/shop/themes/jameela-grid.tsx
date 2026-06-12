'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingBag,
  Sparkles,
  Flame,
  ArrowRight,
  Gem,
  MessageCircle,
  Truck,
  Star,
} from 'lucide-react'
import { Product as ProductType, formatPrice } from '@/lib/shared'
import { LiveShopFeatures } from '../live-shop-features'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface JameelaGridProps {
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
}

/* ------------------------------------------------------------------ */
/*  Colour tokens (Jameela Beauty)                                     */
/* ------------------------------------------------------------------ */

const JAMEELA = {
  headerDark: '#1a1a1a',
  beigeGold: '#C8A882',
  roseCta: '#C9788F',
  white: '#ffffff',
  saleRed: '#ff4757',
  newOrange: '#ffa502',
  mutedText: '#6b6b6b',
  lightBg: '#f9f6f2',
} as const

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isNew(product: ProductType): boolean {
  if (!product.createdAt) return false
  const created = new Date(product.createdAt)
  const now = new Date()
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 14
}

function isSale(product: ProductType): boolean {
  // If stock is very low consider it on sale as a heuristic
  return (product.stock !== undefined && product.stock > 0 && product.stock <= 3) || false
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/* ---------- Product Card ---------- */

function JameelaProductCard({
  product,
  index,
  onProductClick,
  onAddToCart,
  getCartQuantity,
  updateCartQuantity,
}: {
  product: ProductType
  index: number
  onProductClick: (p: ProductType) => void
  onAddToCart: (p: ProductType) => void
  getCartQuantity: (id: string) => number
  updateCartQuantity: (id: string, qty: number) => void
}) {
  const qty = getCartQuantity(product.id)
  const productImage = product.image || product.images?.[0]

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onAddToCart(product)
      toast.success(`${product.name} ajouté au panier`, {
        style: {
          background: JAMEELA.headerDark,
          color: JAMEELA.white,
          border: `1px solid ${JAMEELA.beigeGold}`,
        },
      })
    },
    [onAddToCart, product],
  )

  const handleIncrease = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      updateCartQuantity(product.id, qty + 1)
    },
    [product.id, qty, updateCartQuantity],
  )

  const handleDecrease = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (qty <= 1) {
        updateCartQuantity(product.id, 0)
        toast.info(`${product.name} retiré du panier`, {
          style: {
            background: JAMEELA.headerDark,
            color: JAMEELA.white,
          },
        })
      } else {
        updateCartQuantity(product.id, qty - 1)
      }
    },
    [product.id, qty, product.name, updateCartQuantity],
  )

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
      className="group cursor-pointer flex flex-col"
      onClick={() => onProductClick(product)}
    >
      {/* Image wrapper */}
      <div className="relative overflow-hidden rounded-lg bg-[#f3f0ec] mb-3" style={{ aspectRatio: '336 / 280' }}>
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1' }}
            style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="size-10 text-[#c8c8c8]" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isSale(product) && (
            <Badge
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border-0"
              style={{
                backgroundColor: JAMEELA.saleRed,
                color: JAMEELA.white,
              }}
            >
              Promo
            </Badge>
          )}
          {isNew(product) && (
            <Badge
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border-0"
              style={{
                backgroundColor: JAMEELA.newOrange,
                color: JAMEELA.white,
              }}
            >
              Nouveau
            </Badge>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-xs font-semibold text-white bg-black/60 px-3 py-1 rounded-full">
              Rupture
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-0.5">
        <h3 className="text-sm font-medium leading-tight text-[#333] line-clamp-2 group-hover:text-[#1a1a1a] transition-colors">
          {product.name}
        </h3>

        <span
          className="text-sm font-semibold tracking-wide"
          style={{ color: JAMEELA.beigeGold }}
        >
          {formatPrice(product.price)}
        </span>

        {/* Add to cart / quantity controls */}
        {product.isAvailable && product.stock !== 0 ? (
          qty === 0 ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAdd}
              className="mt-1 flex h-8 w-full items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all hover:shadow-md active:scale-95"
              style={{
                backgroundColor: JAMEELA.roseCta,
                color: JAMEELA.headerDark,
              }}
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              Ajouter
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-1 flex h-8 w-full items-center justify-between rounded-md border"
              style={{ borderColor: JAMEELA.beigeGold }}
            >
              <button
                onClick={handleDecrease}
                className="flex h-full w-8 items-center justify-center text-[#333] hover:text-[#1a1a1a] transition-colors"
              >
                {qty === 1 ? (
                  <Trash2 className="size-3.5" style={{ color: JAMEELA.saleRed }} />
                ) : (
                  <Minus className="size-3.5" />
                )}
              </button>
              <span className="text-sm font-semibold" style={{ color: JAMEELA.headerDark }}>
                {qty}
              </span>
              <button
                onClick={handleIncrease}
                className="flex h-full w-8 items-center justify-center text-[#333] hover:text-[#1a1a1a] transition-colors"
              >
                <Plus className="size-3.5" />
              </button>
            </motion.div>
          )
        ) : (
          <div
            className="mt-1 flex h-8 w-full items-center justify-center rounded-md text-xs font-medium border"
            style={{
              borderColor: '#ddd',
              color: JAMEELA.mutedText,
            }}
          >
            Indisponible
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ---------- Section Header ---------- */

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="mb-8 flex items-center gap-3"
    >
      <div
        className="flex size-10 items-center justify-center rounded-full"
        style={{ backgroundColor: JAMEELA.lightBg }}
      >
        <Icon className="size-5" style={{ color: JAMEELA.beigeGold }} />
      </div>
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: JAMEELA.headerDark }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs tracking-widest uppercase" style={{ color: JAMEELA.mutedText }}>
            {subtitle}
          </p>
        )}
      </div>
      <div
        className="ml-3 h-px flex-1"
        style={{ backgroundColor: `${JAMEELA.beigeGold}33` }}
      />
    </motion.div>
  )
}

/* ---------- Promotional Banner ---------- */

function PromoBanner({ shopName }: { shopName: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="my-12 rounded-2xl overflow-hidden"
    >
      <div className="grid md:grid-cols-2 min-h-[260px]">
        {/* Left: gradient visual */}
        <div
          className="relative flex items-center justify-center p-8 md:p-12"
          style={{
            background: `linear-gradient(135deg, ${JAMEELA.headerDark} 0%, #2d2520 50%, ${JAMEELA.beigeGold}66 100%)`,
          }}
        >
          <div className="relative flex flex-col items-center gap-4">
            {/* Decorative circles */}
            <div
              className="absolute -top-8 -left-8 size-40 rounded-full opacity-20 blur-2xl"
              style={{ backgroundColor: JAMEELA.beigeGold }}
            />
            <div
              className="absolute -bottom-6 -right-6 size-32 rounded-full opacity-15 blur-2xl"
              style={{ backgroundColor: JAMEELA.roseCta }}
            />
            <Gem className="size-16 relative z-10" style={{ color: JAMEELA.beigeGold }} />
            <p
              className="text-sm font-medium tracking-widest uppercase relative z-10"
              style={{ color: JAMEELA.beigeGold }}
            >
              {shopName || 'Jameela'}
            </p>
          </div>
        </div>

        {/* Right: text + CTA */}
        <div
          className="flex flex-col justify-center p-8 md:p-12"
          style={{ backgroundColor: JAMEELA.white }}
        >
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: JAMEELA.beigeGold }}
          >
            Offre exclusive
          </p>
          <h3
            className="text-2xl md:text-3xl font-bold leading-snug mb-3"
            style={{ color: JAMEELA.headerDark }}
          >
            Découvrez notre nouvelle collection de soins
          </h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: JAMEELA.mutedText }}>
            Des produits formulés avec les meilleurs ingrédients naturels pour sublimer votre
            beauté au quotidien. Livraison gratuite sur Dakar.
          </p>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-shadow hover:shadow-lg"
              style={{
                backgroundColor: JAMEELA.beigeGold,
                color: JAMEELA.headerDark,
              }}
            >
              Découvrir
              <ArrowRight className="size-4" />
            </motion.button>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: JAMEELA.mutedText }}>
              <Truck className="size-4" style={{ color: JAMEELA.beigeGold }} />
              <span>Livraison rapide</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* ---------- Empty State ---------- */

function EmptyState({
  searchQuery,
  onClear,
}: {
  searchQuery: string
  onClear: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center px-4"
    >
      <div
        className="flex size-20 items-center justify-center rounded-full mb-6"
        style={{ backgroundColor: JAMEELA.lightBg }}
      >
        <ShoppingBag className="size-10" style={{ color: JAMEELA.beigeGold }} />
      </div>
      <h3
        className="text-xl font-bold mb-2"
        style={{ color: JAMEELA.headerDark }}
      >
        Aucun produit trouvé
      </h3>
      <p className="text-sm max-w-sm" style={{ color: JAMEELA.mutedText }}>
        {searchQuery
          ? `Aucun résultat pour "${searchQuery}". Essayez un autre terme.`
          : "Cette boutique n'a pas encore de produits dans cette catégorie."}
      </p>
      {searchQuery && (
        <Button
          variant="outline"
          size="sm"
          className="mt-6 rounded-full"
          onClick={onClear}
          style={{ borderColor: JAMEELA.beigeGold, color: JAMEELA.beigeGold }}
        >
          <X className="size-4 mr-1.5" />
          Réinitialiser
        </Button>
      )}
    </motion.div>
  )
}

/* ---------- Product Grid ---------- */

function ProductGridSection({
  products,
  startIndex,
  onProductClick,
  onAddToCart,
  getCartQuantity,
  updateCartQuantity,
}: {
  products: ProductType[]
  startIndex: number
  onProductClick: (p: ProductType) => void
  onAddToCart: (p: ProductType) => void
  getCartQuantity: (id: string) => number
  updateCartQuantity: (id: string, qty: number) => void
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
      {products.map((product, i) => (
        <JameelaProductCard
          key={product.id}
          product={product}
          index={startIndex + i}
          onProductClick={onProductClick}
          onAddToCart={onAddToCart}
          getCartQuantity={getCartQuantity}
          updateCartQuantity={updateCartQuantity}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function JameelaGrid({
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
  whatsapp,
}: JameelaGridProps) {
  /* ----- sort products for sections ----- */
  const sortedByDate = useMemo(() => {
    return [...publicProducts]
      .filter((p) => p.isAvailable)
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return db - da // newest first
      })
  }, [publicProducts])

  const midIndex = Math.ceil(sortedByDate.length / 2)
  const nouveauProducts = sortedByDate.slice(0, midIndex)
  const bestSellers = sortedByDate.slice(midIndex)

  /* ----- filtered & sorted list (for search / category mode) ----- */
  const displayProducts = useMemo(() => {
    const products = [...filteredProducts]
    if (sortBy === 'price-asc') {
      products.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      products.sort((a, b) => b.price - a.price)
    } else {
      products.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return db - da
      })
    }
    return products
  }, [filteredProducts, sortBy])

  const showSections = !isSearching && !activeCategory

  const handleClearFilters = useCallback(() => {
    onSearchChange('')
    onCategoryClick(null)
  }, [onSearchChange, onCategoryClick])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <LiveShopFeatures />
      {/* ============================================================ */}
      {/*  TOP BAR: Search + Sort                                       */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none"
            style={{ color: JAMEELA.mutedText }}
          />
          <Input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-10 rounded-lg text-sm border-[#e0dcd6] bg-white focus-visible:border-[#C8A882] focus-visible:ring-[#C8A882]/20"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="size-4 hover:text-[#ff4757] transition-colors" />
            </button>
          )}
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger
            className="h-10 w-full sm:w-[180px] rounded-lg text-sm border-[#e0dcd6] bg-white"
          >
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="recent">Plus récents</SelectItem>
            <SelectItem value="price-asc">Prix croissant</SelectItem>
            <SelectItem value="price-desc">Prix décroissant</SelectItem>
          </SelectContent>
        </Select>

        {/* Product count */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs ml-auto" style={{ color: JAMEELA.mutedText }}>
          <Package className="size-3.5" />
          <span>{totalProductCount} produit{totalProductCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  CATEGORY NAVIGATION (underline style)                        */}
      {/* ============================================================ */}
      {publicCategories.length > 0 && (
        <nav className="mb-8 border-b overflow-x-auto scrollbar-none" style={{ borderColor: `${JAMEELA.beigeGold}22` }}>
          <div className="flex gap-1 min-w-max">
            <button
              onClick={() => onCategoryClick(null)}
              className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                color: activeCategory === null ? JAMEELA.headerDark : JAMEELA.mutedText,
              }}
            >
              Tous
              {activeCategory === null && (
                <motion.span
                  layoutId="cat-underline"
                  className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full"
                  style={{ backgroundColor: JAMEELA.beigeGold }}
                />
              )}
            </button>
            {publicCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryClick(activeCategory === cat.id ? null : cat.id)}
                className="relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  color: activeCategory === cat.id ? JAMEELA.headerDark : JAMEELA.mutedText,
                }}
              >
                {cat.name}
                {activeCategory === cat.id && (
                  <motion.span
                    layoutId="cat-underline"
                    className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full"
                    style={{ backgroundColor: JAMEELA.beigeGold }}
                  />
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ============================================================ */}
      {/*  MAIN CONTENT                                                 */}
      {/* ============================================================ */}
      <AnimatePresence mode="wait" initial={false}>
        {/* No products found */}
        {filteredProducts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState searchQuery={searchQuery} onClear={handleClearFilters} />
          </motion.div>
        ) : showSections ? (
          /* ============================================================ */
          /*  SECTIONS MODE: Nouveautés + Promo + Meilleures Ventes       */
          /* ============================================================ */
          <motion.div
            key="sections"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* --- Nouveautés --- */}
            {nouveauProducts.length > 0 && (
              <section className="mb-4">
                <SectionHeader
                  icon={Sparkles}
                  title="Nouveautés"
                  subtitle="Nos derniers ajouts"
                />
                <ProductGridSection
                  products={nouveauProducts}
                  startIndex={0}
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                  getCartQuantity={getCartQuantity}
                  updateCartQuantity={updateCartQuantity}
                />
              </section>
            )}

            {/* --- Promotional Banner --- */}
            <PromoBanner shopName={shopName} />

            {/* --- Meilleures Ventes --- */}
            {bestSellers.length > 0 && (
              <section className="mt-4">
                <SectionHeader
                  icon={Flame}
                  title="Meilleures Ventes"
                  subtitle="Les plus populaires"
                />
                <ProductGridSection
                  products={bestSellers}
                  startIndex={nouveauProducts.length}
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                  getCartQuantity={getCartQuantity}
                  updateCartQuantity={updateCartQuantity}
                />
              </section>
            )}
          </motion.div>
        ) : (
          /* ============================================================ */
          /*  FILTERED / SEARCH MODE: single flat grid                     */
          /* ============================================================ */
          <motion.div
            key="filtered"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Section label for context */}
            <div className="mb-6 flex items-center gap-2">
              <Search className="size-4" style={{ color: JAMEELA.beigeGold }} />
              <span className="text-sm font-medium" style={{ color: JAMEELA.headerDark }}>
                {searchQuery
                  ? `Résultats pour "${searchQuery}" (${displayProducts.length})`
                  : activeCategory
                    ? `${publicCategories.find((c) => c.id === activeCategory)?.name || 'Catégorie'} (${displayProducts.length})`
                    : `Tous les produits (${displayProducts.length})`}
              </span>
            </div>
            <ProductGridSection
              products={displayProducts}
              startIndex={0}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
              getCartQuantity={getCartQuantity}
              updateCartQuantity={updateCartQuantity}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/*  TRUST BADGES (bottom strip)                                  */}
      {/* ============================================================ */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Truck, label: 'Livraison rapide', desc: 'Sur Dakar & environs' },
          { icon: Star, label: 'Qualité garantie', desc: 'Produits authentiques' },
          { icon: Gem, label: 'Beauté naturelle', desc: 'Ingrédients premium' },
          { icon: MessageCircle, label: 'Support client', desc: 'Disponible 7j/7' },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex flex-col items-center text-center p-5 rounded-xl"
            style={{ backgroundColor: JAMEELA.lightBg }}
          >
            <Icon className="size-6 mb-2" style={{ color: JAMEELA.beigeGold }} />
            <p className="text-xs font-semibold" style={{ color: JAMEELA.headerDark }}>
              {label}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: JAMEELA.mutedText }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/*  WHATSAPP CTA (if configured)                                */}
      {/* ============================================================ */}
      {whatsapp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 p-6 rounded-2xl"
          style={{ backgroundColor: JAMEELA.lightBg }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-10 items-center justify-center rounded-full"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="size-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: JAMEELA.headerDark }}>
                Besoin d&apos;aide ?
              </p>
              <p className="text-xs" style={{ color: JAMEELA.mutedText }}>
                Contactez-nous sur WhatsApp
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-shadow hover:shadow-lg"
              style={{ backgroundColor: '#25D366', color: JAMEELA.white }}
            >
              <MessageCircle className="size-4" />
              Écrire sur WhatsApp
            </motion.button>
          </a>
        </motion.div>
      )}
    </div>
  )
}
