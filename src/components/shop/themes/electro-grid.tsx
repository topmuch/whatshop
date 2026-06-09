'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Eye,
  Clock,
  Zap,
  Truck,
  Shield,
  ChevronRight,
  MessageCircle,
} from 'lucide-react'
import { Product as ProductType, formatPrice, openWhatsApp } from '@/lib/shared'

// ─── Props ───
interface ElectroGridProps {
  filteredProducts: ProductType[]
  publicCategories: any[]
  publicProducts: ProductType[]
  activeCategory: string | null
  searchQuery: string
  sortBy: string
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

// ─── Product Card — 400×400 image ───
function ElectroProductCard({
  product,
  onAddToCart,
  onProductClick,
  getCartQuantity,
  updateCartQuantity,
  whatsapp,
  index,
}: {
  product: ProductType
  onAddToCart: (product: ProductType) => void
  onProductClick: (product: ProductType) => void
  getCartQuantity: (productId: string) => number
  updateCartQuantity: (productId: string, qty: number) => void
  whatsapp?: string
  index: number
}) {
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
      {/* Product Image — 400x400 (square aspect) */}
      <div className="relative w-full bg-[#f8fafc] overflow-hidden" style={{ aspectRatio: '400 / 400' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Package className="size-12 text-gray-300" />
          </div>
        )}

        {/* Quick View overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-center size-12 rounded-full bg-white/90">
              <Eye className="size-6 text-[#1e293b]" />
            </div>
            <span className="text-sm font-semibold text-white drop-shadow-sm">
              Voir détails
            </span>
          </div>
        </div>

        {/* Stock badge */}
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
        {/* Name */}
        <h3 className="font-semibold leading-snug line-clamp-2 text-sm text-[#1e293b]">
          {product.name}
        </h3>

        {/* Stock indicator */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {inStock ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-[#10B981] font-medium">
              ✓ En stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-red-500 font-medium">
              Rupture de stock
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-1">
          <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-bold text-[#10B981] border border-emerald-100">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Buttons */}
        <div onClick={(e) => e.stopPropagation()}>
          {cartQty === 0 ? (
            <div className="flex gap-1.5">
              <Button
                onClick={() => {
                  onAddToCart(product)
                  toast.success(`${product.name} ajouté au panier !`)
                }}
                className="flex-1 gap-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg text-sm h-9"
                disabled={!product.isAvailable || !inStock}
              >
                <Plus className="size-3.5" />
                Ajouter
              </Button>
              {whatsapp && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    openWhatsApp(product, whatsapp)
                  }}
                  className="gap-1.5 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold rounded-lg text-sm h-9 px-3"
                  disabled={!product.isAvailable || !inStock}
                >
                  <MessageCircle className="size-3.5" />
                </Button>
              )}
            </div>
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
              {whatsapp && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-[#25D366] hover:bg-[#25D366]/10"
                  onClick={() => openWhatsApp(product, whatsapp, cartQty)}
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
          Cette boutique n&apos;a pas encore de produits. Revenez bientôt !
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1180px] mx-auto px-4 py-6 space-y-6">
      {/* ─── Search Bar + Sort ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
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
            <SelectItem value="price-asc">Prix croissant</SelectItem>
            <SelectItem value="price-desc">Prix décroissant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Category Pills ─── */}
      {publicCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
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
              onClick={() => onCategoryClick(activeCategory === cat.id ? null : cat.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-[#10B981] text-white border-[#10B981] shadow-md shadow-emerald-200/50'
                  : 'bg-white text-[#64748b] border-gray-200 hover:border-[#10B981] hover:text-[#10B981]'
              }`}
            >
              {cat.name}
              <ChevronRight className={`size-3.5 transition-transform ${activeCategory === cat.id ? 'rotate-90' : ''}`} />
            </button>
          ))}
        </div>
      )}

      {/* ─── Results info ─── */}
      {(searchQuery || activeCategory) && filteredProducts.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-[#64748b]">
          <ShoppingBag className="size-4" />
          <span>
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            {searchQuery && <span> pour &laquo;{searchQuery}&raquo;</span>}
          </span>
        </div>
      )}

      {/* ─── Loading state ─── */}
      {isSearching && filteredProducts.length === 0 && publicProducts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 overflow-hidden rounded-xl border border-gray-100 bg-white">
              <Skeleton className="w-full" style={{ aspectRatio: '400 / 400' }} />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
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
          <h3 className="text-lg font-bold text-[#1e293b]">Aucun résultat trouvé</h3>
          <p className="mt-1 text-sm text-[#64748b] max-w-md">
            {searchQuery
              ? `Aucun produit ne correspond à "${searchQuery}".`
              : 'Aucun produit dans cette catégorie.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-xl border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white"
            onClick={() => { onSearchChange(''); setLocalSearch(''); onCategoryClick(null) }}
          >
            Réinitialiser les filtres
          </Button>
        </motion.div>
      )}

      {/* ─── Product Grid — 400x400 images ─── */}
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
              whatsapp={whatsapp}
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
          <span>Livraison rapide</span>
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
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#64748b] text-sm hover:text-[#25D366] transition-colors"
          >
            <MessageCircle className="size-4 text-[#25D366]" />
            <span>Commander via WhatsApp</span>
          </a>
        )}
      </motion.div>
    </div>
  )
}
