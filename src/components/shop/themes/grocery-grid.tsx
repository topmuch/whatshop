'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
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
  Truck,
  Lock,
  CheckCircle,
  Phone,
  Clock,
  ArrowRight,
  Leaf,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Product as ProductType, formatPrice } from '@/lib/shared'
import { LiveShopFeatures } from '../live-shop-features'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

// ─── Types ───────────────────────────────────────────────────────────────────

interface GroceryGridProps {
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

// ─── Constants ───────────────────────────────────────────────────────────────

const GROCERY_COLORS = {
  green: '#00A651',
  red: '#ff4757',
  dark: '#1a1a1a',
  greenLight: '#e8f8ef',
  orange: '#FF6B35',
}

const GROCERY_EMOJIS: Record<string, string> = {
  boissons: '🥤',
  drinks: '🥤',
  snacks: '🍪',
  conserve: '🥫',
  conserves: '🥫',
  épices: '🌶️',
  epices: '🌶️',
  spices: '🌶️',
  fruits: '🍎',
  legumes: '🥕',
  légumes: '🥕',
  vegetables: '🥕',
  viandes: '🥩',
  meats: '🥩',
  poissons: '🐟',
  fish: '🐟',
  laitier: '🧀',
  dairy: '🧀',
  boulangerie: '🍞',
  bakery: '🍞',
  sucre: '🍬',
  sugar: '🍬',
  céréales: '🌾',
  cereales: '🌾',
  cereals: '🌾',
  huile: '🫒',
  oil: '🫒',
  savon: '🧴',
  savons: '🧴',
  hygiène: '🧼',
  hygiene: '🧼',
  entretien: '🧹',
  bio: '🌱',
  organic: '🌱',
  frais: '🥬',
  frozen: '🧊',
  surgelé: '🧊',
  bebe: '🍼',
  bébé: '🍼',
}

const TRUST_BADGES = [
  { icon: Truck, label: 'Livraison Rapide' },
  { icon: Lock, label: 'Paiement Sécurisé' },
  { icon: CheckCircle, label: 'Qualité Garantie' },
  { icon: Phone, label: 'Service Client 24/7' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGroceryEmoji(name: string): string {
  const lower = name.toLowerCase().trim()
  for (const [key, emoji] of Object.entries(GROCERY_EMOJIS)) {
    if (lower.includes(key)) return emoji
  }
  return '🛒'
}

// ─── Countdown Timer ────────────────────────────────────────────────────────

function useCountdown(initialSeconds = 5 * 3600) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 0) return initialSeconds
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [initialSeconds])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
    isExpired: seconds <= 0,
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GroceryGrid({
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
}: GroceryGridProps) {
  const countdown = useCountdown(5 * 3600)
  const isFiltering = isSearching || activeCategory !== null || searchQuery.trim() !== ''

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts]
    switch (sortBy) {
      case 'price-asc':
        return products.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return products.sort((a, b) => b.price - a.price)
      case 'recent':
      default:
        return products.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
    }
  }, [filteredProducts, sortBy])

  const handleAddToCart = useCallback(
    (product: ProductType) => {
      onAddToCart(product)
      toast.success(`${product.name} ajouté au panier`, {
        description: formatPrice(product.price),
      })
    },
    [onAddToCart]
  )

  const handleQuantityChange = useCallback(
    (productId: string, qty: number) => {
      if (qty <= 0) {
        updateCartQuantity(productId, 0)
        toast.info('Produit retiré du panier')
      } else {
        updateCartQuantity(productId, qty)
      }
    },
    [updateCartQuantity]
  )

  return (
    <div className="w-full max-w-6xl mx-auto">
      <LiveShopFeatures />
      {/* ── 1. Delivery Info Bar ────────────────────────────────────────── */}
      <div
        className="mb-6 rounded-xl px-4 py-3.5 flex items-center justify-center gap-3 text-white font-semibold text-sm sm:text-base"
        style={{ backgroundColor: GROCERY_COLORS.green }}
      >
        <Truck className="size-5 flex-shrink-0" />
        <span>🚚 Livraison gratuite dès 10 000 FCFA</span>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 hidden sm:inline-flex items-center gap-1 text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
          >
            Commander via WhatsApp
            <ArrowRight className="size-3" />
          </a>
        )}
      </div>

      {/* ── 2. Circular Categories ──────────────────────────────────────── */}
      {publicCategories.length > 0 && (
        <section
          className="mb-6"
        >
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
            {/* All category circle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryClick(null)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <div
                className={`flex items-center justify-center rounded-full text-2xl transition-all ${
                  activeCategory === null
                    ? 'ring-3 shadow-lg scale-110'
                    : 'hover:ring-2'
                }`}
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor:
                    activeCategory === null
                      ? GROCERY_COLORS.green
                      : '#f3f4f6',

                }}
              >
                <span className={activeCategory === null ? 'text-white' : ''}>
                  🛒
                </span>
              </div>
              <span
                className="text-xs font-medium text-center leading-tight max-w-[64px] truncate"
                style={{
                  color:
                    activeCategory === null
                      ? GROCERY_COLORS.green
                      : GROCERY_COLORS.dark,
                }}
              >
                Tout
              </span>
            </motion.button>

            {publicCategories.map((cat, index) => {
              const emoji = getGroceryEmoji(cat.name)
              const isActive = activeCategory === cat.id
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    onCategoryClick(isActive ? null : cat.id)
                  }
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <div
                    className={`flex items-center justify-center rounded-full text-2xl transition-all overflow-hidden ${
                      isActive ? 'ring-3 shadow-lg scale-110' : 'hover:ring-2'
                    }`}
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: isActive
                        ? GROCERY_COLORS.green
                        : '#f3f4f6',

                    }}
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className={isActive ? 'text-white' : ''}>
                        {emoji}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-xs font-medium text-center leading-tight max-w-[64px] truncate"
                    style={{
                      color: isActive
                        ? GROCERY_COLORS.green
                        : GROCERY_COLORS.dark,
                    }}
                  >
                    {cat.name}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 3. Search Bar + Sort ────────────────────────────────────────── */}
      <div
        className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
            style={{ color: '#9ca3af' }}
          />
          <Input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-xl border-gray-200 focus-visible:border-[#00A651] focus-visible:ring-[#00A651]/20"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="size-3.5 text-gray-400" />
            </button>
          )}
        </div>

        <Select
          value={sortBy}
          onValueChange={onSortChange}
        >
          <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl border-gray-200">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récents</SelectItem>
            <SelectItem value="price-asc">Prix croissant</SelectItem>
            <SelectItem value="price-desc">Prix décroissant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── 4. Deal of the Day ───────────────────────────────────────────── */}
      {!isFiltering && publicProducts.length > 0 && (
        <section
          className="mb-8"
        >
          <div
            className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
            style={{
              background: `linear-gradient(135deg, ${GROCERY_COLORS.red}, #e03e4f)`,
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-12 bg-white/20 rounded-xl">
                  <Flame className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
                    Deal du Jour
                    <Sparkles className="size-4 sm:size-5 text-yellow-300" />
                  </h3>
                  <p className="text-white/80 text-sm mt-0.5">
                    Offres spéciales à ne pas manquer !
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-white/70" />
                  {[
                    countdown.hours,
                    countdown.minutes,
                    countdown.seconds,
                  ].map((val, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center bg-white text-[#ff4757] font-bold text-lg rounded-lg w-10 h-10">
                        {val}
                      </span>
                      {i < 2 && (
                        <span className="text-white font-bold text-sm">:</span>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    onSearchChange('')
                    onCategoryClick(null)
                    toast.info('Découvrez nos offres du jour !')
                  }}
                  className="bg-white text-[#ff4757] hover:bg-white/90 font-semibold rounded-xl px-4 h-10 shadow-md transition-all"
                >
                  Voir les offres
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Product Grid ─────────────────────────────────────────────── */}
      {sortedProducts.length === 0 ? (
        <EmptyState
          searchQuery={searchQuery}
          isSearching={isSearching}
          onReset={() => {
            onSearchChange('')
            onCategoryClick(null)
          }}
        />
      ) : (
        <>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${activeCategory}-${searchQuery}-${sortBy}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedProducts.map((product, index) => (
                  <GroceryProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    cartQuantity={getCartQuantity(product.id)}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleQuantityChange}
                    onProductClick={onProductClick}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Product count */}
          <p
            className="text-center text-sm text-gray-400 mt-6"
          >
            {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''} affiché{sortedProducts.length > 1 ? 's' : ''}
          </p>
        </>
      )}

      {/* ── 6. Promotional Grid ─────────────────────────────────────────── */}
      {!isFiltering && publicProducts.length > 0 && (
        <section
          className="mt-10 mb-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Promo Card 1 - Green */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl p-6 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, #00A651, #00C853)`,
              }}
            >
              <div className="absolute top-3 right-4 text-5xl opacity-80">
                🍎🥕
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full" />
              <h3 className="text-white font-bold text-xl relative z-10">
                Fruits & Légumes Frais
              </h3>
              <p className="text-white/80 text-sm mt-1.5 relative z-10">
                Produits frais sélectionnés chaque jour
              </p>
              <Button
                onClick={() => {
                  const fruitsCat = publicCategories.find((c) =>
                    c.name.toLowerCase().includes('fruit')
                  )
                  if (fruitsCat) {
                    onCategoryClick(fruitsCat.id)
                  } else {
                    onCategoryClick(null)
                    toast.info('Découvrez nos fruits et légumes !')
                  }
                }}
                className="mt-4 bg-white text-[#00A651] hover:bg-white/90 font-semibold rounded-full px-5 relative z-10"
              >
                Explorer
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </motion.div>

            {/* Promo Card 2 - Orange */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl p-6 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, #FF6B35, #FF8C42)`,
              }}
            >
              <div className="absolute top-3 right-4 text-5xl opacity-80">
                🌱🌿
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full" />
              <h3 className="text-white font-bold text-xl relative z-10">
                Produits Bio
              </h3>
              <p className="text-white/80 text-sm mt-1.5 relative z-10">
                100% naturel, pour votre santé
              </p>
              <Button
                onClick={() => {
                  const bioCat = publicCategories.find((c) =>
                    c.name.toLowerCase().includes('bio')
                  )
                  if (bioCat) {
                    onCategoryClick(bioCat.id)
                  } else {
                    onCategoryClick(null)
                    toast.info('Découvrez nos produits bio !')
                  }
                }}
                className="mt-4 bg-white text-[#FF6B35] hover:bg-white/90 font-semibold rounded-full px-5 relative z-10"
              >
                Explorer
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── 7. Trust Badges ─────────────────────────────────────────────── */}
      <section
        className="mb-10"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TRUST_BADGES.map((badge, index) => (
            <motion.div
              key={badge.label}
              whileHover={{ y: -2 }}
              className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div
                className="flex items-center justify-center size-10 rounded-full"
                style={{ backgroundColor: GROCERY_COLORS.greenLight }}
              >
                <badge.icon
                  className="size-5"
                  style={{ color: GROCERY_COLORS.green }}
                />
              </div>
              <span
                className="text-xs font-medium text-center leading-tight"
                style={{ color: GROCERY_COLORS.dark }}
              >
                {badge.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Product Card ────────────────────────────────────────────────────────────

interface GroceryProductCardProps {
  product: ProductType
  index: number
  cartQuantity: number
  onAddToCart: (product: ProductType) => void
  onUpdateQuantity: (productId: string, qty: number) => void
  onProductClick: (product: ProductType) => void
}

function GroceryProductCard({
  product,
  index,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  onProductClick,
}: GroceryProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group flex flex-col rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Product Image */}
      <div
        className="relative aspect-square bg-gray-50 overflow-hidden cursor-pointer"
        onClick={() => onProductClick(product)}
      >
        <ImageWithFallback
          src={product.image || product.images?.[0]}
          alt={product.name}
          fill
          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
          fallbackIcon="package"
        />

        {/* Stock indicator */}
        {product.stock !== undefined && product.stock <= 3 && product.stock > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              <Leaf className="size-3" />
              Stock limité
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-2 p-3">
        {/* Product Name */}
        <h4
          className="text-sm font-medium leading-tight line-clamp-2 cursor-pointer hover:underline"
          style={{ color: GROCERY_COLORS.dark }}
          onClick={() => onProductClick(product)}
          title={product.name}
        >
          {product.name}
        </h4>

        {/* Price */}
        <p className="font-bold text-base" style={{ color: GROCERY_COLORS.green }}>
          {formatPrice(product.price)}
        </p>

        {/* Add to Cart / Quantity Control */}
        {cartQuantity === 0 ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            disabled={!product.isAvailable}
            className="mt-1 w-full flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: product.isAvailable
                ? GROCERY_COLORS.green
                : '#9ca3af',
            }}
          >
            <Plus className="size-3.5" />
            Ajouter
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-1 flex items-center justify-center gap-0"
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (cartQuantity === 1) {
                  onUpdateQuantity(product.id, 0)
                } else {
                  onUpdateQuantity(product.id, cartQuantity - 1)
                }
              }}
              className="flex items-center justify-center size-9 rounded-l-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {cartQuantity === 1 ? (
                <Trash2 className="size-3.5 text-red-400" />
              ) : (
                <Minus className="size-3.5 text-gray-500" />
              )}
            </button>
            <span
              className="flex items-center justify-center h-9 min-w-[40px] px-2 text-sm font-bold border-y border-gray-200"
              style={{ color: GROCERY_COLORS.green }}
            >
              {cartQuantity}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUpdateQuantity(product.id, cartQuantity + 1)
              }}
              className="flex items-center justify-center size-9 rounded-r-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Plus className="size-3.5 text-gray-500" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({
  searchQuery,
  isSearching,
  onReset,
}: {
  searchQuery: string
  isSearching: boolean
  onReset: () => void
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="flex items-center justify-center size-20 rounded-full bg-gray-50 mb-5">
        <Package className="size-10 text-gray-300" />
      </div>
      <h3
        className="text-xl font-bold"
        style={{ color: GROCERY_COLORS.dark }}
      >
        Aucun produit trouvé
      </h3>
      <p className="mt-2 text-sm text-gray-400 max-w-sm">
        {searchQuery
          ? `Aucun résultat pour "${searchQuery}". Essayez d'autres mots-clés.`
          : 'Cette catégorie ne contient pas encore de produits.'}
      </p>
      {(searchQuery || isSearching) && (
        <Button
          onClick={onReset}
          className="mt-5 rounded-xl px-5 font-semibold"
          style={{
            backgroundColor: GROCERY_COLORS.green,
            color: 'white',
          }}
        >
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  )
}
