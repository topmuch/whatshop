'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  Star,
  Eye,
  Clock,
  Zap,
  Truck,
  Shield,
  ChevronRight,
} from 'lucide-react'

// ─── Product type (local, no external imports from store/templates) ───
interface Product {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  images?: string[]
  stock?: number
  isAvailable: boolean
  categoryId?: string
  categoryName?: string
  createdAt?: string
}

// ─── Props ───
interface ElectroGridProps {
  filteredProducts: Product[]
  publicCategories: any[]
  publicProducts: Product[]
  activeCategory: string | null
  searchQuery: string
  sortBy: 'recent' | 'price-asc' | 'price-desc'
  isSearching: boolean
  totalProductCount: number
  onCategoryClick: (id: string | null) => void
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product) => void
  getCartQuantity: (productId: string) => number
  updateCartQuantity: (productId: string, qty: number) => void
  onSortChange: (sort: string) => void
  onSearchChange: (query: string) => void
  shopName: string
  whatsapp?: string
}

// ─── Star rating helper: hash product.id to get a consistent 3-5 star rating ───
function getStarRating(productId: string): number {
  let hash = 0
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return 3 + (Math.abs(hash) % 3) // returns 3, 4, or 5
}

function StarRating({ productId }: { productId: string }) {
  const rating = getStarRating(productId)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-3.5 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-none text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-[#64748b]">({rating}.0)</span>
    </div>
  )
}

// ─── Countdown Timer Hook ───
function useCountdown(initialMs: number = 2 * 24 * 60 * 60 * 1000) {
  const [timeLeft, setTimeLeft] = useState(initialMs)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1000, 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, timeLeft }
}

// ─── Countdown Time Block ───
function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm px-3 py-2 min-w-[56px]">
        <span className="text-xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-teal-100">
        {label}
      </span>
    </div>
  )
}

// ─── Flash Deal Section ───
function FlashDealSection({
  product,
  onAddToCart,
  getCartQuantity,
  updateCartQuantity,
  onProductClick,
}: {
  product: Product | undefined
  onAddToCart: (product: Product) => void
  getCartQuantity: (productId: string) => number
  updateCartQuantity: (productId: string, qty: number) => void
  onProductClick: (product: Product) => void
}) {
  const { days, hours, minutes, seconds } = useCountdown()

  if (!product) return null

  const priceFormatted = product.price.toLocaleString('fr-FR') + ' FCFA'
  const cartQty = getCartQuantity(product.id)
  const discountPercent = 25 // fake discount for flash deal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f766e] via-[#10B981] to-[#059669] p-1"
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 size-64 rounded-full bg-white/30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 size-48 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative flex flex-col md:flex-row items-center gap-6 rounded-xl bg-[#0d9488]/40 p-6">
        {/* Flash Deal badge */}
        <div className="absolute -top-3 left-6">
          <Badge className="bg-red-500 text-white border-none shadow-lg gap-1.5 px-3 py-1 text-xs font-bold">
            <Zap className="size-3.5" />
            -{discountPercent}%
          </Badge>
        </div>

        {/* Featured product image */}
        <div
          className="relative w-full md:w-48 aspect-square rounded-xl overflow-hidden cursor-pointer flex-shrink-0 bg-white/10"
          onClick={() => onProductClick(product)}
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 192px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="size-16 text-white/30" />
            </div>
          )}
          {/* Quick overlay hint */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
            <Eye className="size-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Deal info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Zap className="size-5 text-amber-300" />
            <h2 className="text-xl font-bold text-white">Offre Flash</h2>
            <Zap className="size-5 text-amber-300" />
          </div>

          <h3 className="text-lg font-semibold text-white/90 mb-1 line-clamp-1">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
            <span className="text-2xl font-extrabold text-white">
              {priceFormatted}
            </span>
            <span className="text-sm text-white/50 line-through">
              {Math.round(product.price * 1.33).toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-teal-100">
              <Truck className="size-3.5" /> Livraison gratuite
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-teal-100">
              <Shield className="size-3.5" /> Garantie 2 ans
            </span>
          </div>
        </div>

        {/* Countdown + CTA */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-white/70 text-sm">
            <Clock className="size-4" />
            <span>Se termine dans:</span>
          </div>
          <div className="flex gap-2">
            <TimeBlock value={days} label="Jours" />
            <TimeBlock value={hours} label="Heures" />
            <TimeBlock value={minutes} label="Min" />
            <TimeBlock value={seconds} label="Sec" />
          </div>

          {cartQty === 0 ? (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart(product)
                toast.success(`${product.name} ajouté au panier !`)
              }}
              className="bg-white text-[#0d9488] hover:bg-white/90 font-bold rounded-xl px-6 shadow-lg"
            >
              <ShoppingBag className="size-4 mr-2" />
              Profiter de l&apos;offre
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  updateCartQuantity(product.id, cartQty - 1)
                }}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="min-w-[2rem] text-center font-bold text-white text-sm">
                {cartQty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  updateCartQuantity(product.id, cartQty + 1)
                }}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Product Card ───
function ElectroProductCard({
  product,
  onAddToCart,
  onProductClick,
  getCartQuantity,
  updateCartQuantity,
  index,
}: {
  product: Product
  onAddToCart: (product: Product) => void
  onProductClick: (product: Product) => void
  getCartQuantity: (productId: string) => number
  updateCartQuantity: (productId: string, qty: number) => void
  index: number
}) {
  const priceFormatted = product.price.toLocaleString('fr-FR') + ' FCFA'
  const cartQty = getCartQuantity(product.id)
  const inStock = (product.stock ?? 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-[#10B981] hover:shadow-lg hover:shadow-emerald-100/50 cursor-pointer"
      onClick={() => onProductClick(product)}
    >
      {/* Product Image with Quick View Overlay */}
      <div className="relative aspect-square w-full bg-[#f8fafc] overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Package className="size-12 text-gray-300" />
          </div>
        )}

        {/* Quick View overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#10B981]/90 via-[#10B981]/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center size-12 rounded-full bg-white/20 backdrop-blur-sm">
              <Eye className="size-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-white drop-shadow-sm">
              Voir détails
            </span>
          </div>
        </div>

        {/* Stock badge top-right */}
        {!inStock && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-red-500 text-white border-none text-[10px]">
              Rupture
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Star Rating */}
        <StarRating productId={product.id} />

        {/* Name */}
        <h3 className="font-semibold leading-snug line-clamp-2 text-sm text-[#1e293b]">
          {product.name}
        </h3>

        {/* Tech Specs */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {inStock && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-[#10B981] font-medium">
              ✓ En stock
            </span>
          )}
          <span className="inline-flex items-center gap-0.5 text-[11px] text-[#64748b]">
            🚚 Livraison gratuite
          </span>
        </div>

        {/* Price with teal tag */}
        <div className="mt-1">
          <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-bold text-[#10B981] border border-emerald-100">
            {priceFormatted}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Add to Cart / Quantity Controls */}
        <div onClick={(e) => e.stopPropagation()}>
          {cartQty === 0 ? (
            <Button
              onClick={() => {
                onAddToCart(product)
                toast.success(`${product.name} ajouté au panier !`)
              }}
              className="w-full gap-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg text-sm h-9"
              disabled={!product.isAvailable || !inStock}
            >
              <Plus className="size-3.5" />
              Ajouter
            </Button>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-[#10B981]/30 bg-emerald-50 p-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-[#10B981] hover:bg-[#10B981]/10"
                onClick={() => updateCartQuantity(product.id, cartQty - 1)}
              >
                {cartQty === 1 ? (
                  <Trash2 className="size-3.5 text-red-500" />
                ) : (
                  <Minus className="size-3.5" />
                )}
              </Button>
              <span className="min-w-[2rem] text-center font-bold text-sm text-[#1e293b]">
                {cartQty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-[#10B981] hover:bg-[#10B981]/10"
                onClick={() => updateCartQuantity(product.id, cartQty + 1)}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main ElectroGrid Component ───
export function ElectroGrid({
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
}: ElectroGridProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const categoryScrollRef = useRef<HTMLDivElement>(null)

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value)
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      searchTimerRef.current = setTimeout(() => {
        onSearchChange(value)
      }, 300)
    },
    [onSearchChange]
  )

  // Determine if flash deal should be shown (hide when filtering/searching)
  const showFlashDeal =
    !isSearching && !searchQuery && !activeCategory && publicProducts.length > 0

  // Featured product for flash deal
  const flashDealProduct = useMemo(() => {
    return publicProducts.find((p) => p.isAvailable && (p.stock ?? 0) > 0)
  }, [publicProducts])

  // Empty state
  if (!isSearching && publicProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-50 mb-4">
          <Package className="size-10 text-[#10B981]/60" />
        </div>
        <h3 className="text-lg font-bold text-[#1e293b]">
          Aucun produit disponible
        </h3>
        <p className="mt-1 text-sm text-[#64748b] text-center max-w-md">
          Cette boutique n&apos;a pas encore de produits. Revenez bientôt pour
          découvrir notre sélection !
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* ─── Search Bar + Sort ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#64748b]" />
          <Input
            type="text"
            placeholder="Rechercher un produit..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10 h-10 rounded-xl border-gray-200 bg-white focus-visible:border-[#10B981] focus-visible:ring-[#10B981]/20"
          />
          {localSearch && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1e293b] transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl border-gray-200 bg-white">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="recent">
              <span className="flex items-center gap-2">
                <Clock className="size-3.5" /> Plus récent
              </span>
            </SelectItem>
            <SelectItem value="price-asc">
              <span className="flex items-center gap-2">
                Prix croissant
              </span>
            </SelectItem>
            <SelectItem value="price-desc">
              <span className="flex items-center gap-2">
                Prix décroissant
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Category Pills (Horizontal Scroll) ─── */}
      {publicCategories.length > 0 && (
        <div
          ref={categoryScrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        >
          <button
            onClick={() => onCategoryClick(null)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border ${
              activeCategory === null
                ? 'bg-[#10B981] text-white border-[#10B981] shadow-md shadow-emerald-200/50'
                : 'bg-white text-[#64748b] border-gray-200 hover:border-[#10B981] hover:text-[#10B981]'
            }`}
          >
            Tous
          </button>
          {publicCategories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() =>
                onCategoryClick(
                  activeCategory === cat.id ? null : cat.id
                )
              }
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-[#10B981] text-white border-[#10B981] shadow-md shadow-emerald-200/50'
                  : 'bg-white text-[#64748b] border-gray-200 hover:border-[#10B981] hover:text-[#10B981]'
              }`}
            >
              {cat.name}
              <ChevronRight
                className={`size-3.5 transition-transform ${
                  activeCategory === cat.id ? 'rotate-90' : ''
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* ─── Flash Deal Section ─── */}
      <AnimatePresence>
        {showFlashDeal && flashDealProduct && (
          <FlashDealSection
            product={flashDealProduct}
            onAddToCart={onAddToCart}
            getCartQuantity={getCartQuantity}
            updateCartQuantity={updateCartQuantity}
            onProductClick={onProductClick}
          />
        )}
      </AnimatePresence>

      {/* ─── Results info ─── */}
      {(searchQuery || activeCategory) && filteredProducts.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-[#64748b]">
          <ShoppingBag className="size-4" />
          <span>
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? 's' : ''} trouvé
            {filteredProducts.length > 1 ? 's' : ''}
            {searchQuery && (
              <span>
                {' '}
                pour &laquo;{searchQuery}&raquo;
              </span>
            )}
          </span>
        </div>
      )}

      {/* ─── Loading state ─── */}
      {isSearching &&
        filteredProducts.length === 0 &&
        publicProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 overflow-hidden rounded-xl border border-gray-100 bg-white"
              >
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

      {/* ─── Empty search state ─── */}
      {filteredProducts.length === 0 && publicProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-amber-50 mb-4">
            <Search className="size-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-[#1e293b]">
            Aucun résultat trouvé
          </h3>
          <p className="mt-1 text-sm text-[#64748b] max-w-md">
            {searchQuery
              ? `Aucun produit ne correspond à "${searchQuery}". Essayez un autre terme de recherche.`
              : 'Aucun produit dans cette catégorie pour le moment.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-xl border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white"
            onClick={() => {
              onSearchChange('')
              setLocalSearch('')
              onCategoryClick(null)
            }}
          >
            Réinitialiser les filtres
          </Button>
        </motion.div>
      )}

      {/* ─── Product Grid ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + searchQuery + sortBy}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {filteredProducts.map((product, index) => (
            <ElectroProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
              getCartQuantity={getCartQuantity}
              updateCartQuantity={updateCartQuantity}
              index={index}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ─── Footer Trust Badges ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-gray-100"
      >
        <div className="flex items-center gap-2 text-[#64748b] text-sm">
          <Truck className="size-4 text-[#10B981]" />
          <span>Livraison gratuite</span>
        </div>
        <div className="flex items-center gap-2 text-[#64748b] text-sm">
          <Shield className="size-4 text-[#10B981]" />
          <span>Garantie 1 an</span>
        </div>
        <div className="flex items-center gap-2 text-[#64748b] text-sm">
          <Package className="size-4 text-[#10B981]" />
          <span>Paiement sécurisé</span>
        </div>
        {whatsapp && (
          <div className="flex items-center gap-2 text-[#64748b] text-sm">
            <ShoppingBag className="size-4 text-[#10B981]" />
            <span>Service client WhatsApp</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
