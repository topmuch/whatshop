'use client'

import Image from 'next/image'
import { Star, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/shared'
import type { ModernStoreProduct } from '@/lib/modern-store-types'

interface ProductCardProps {
  product: ModernStoreProduct
  accent: string
  whatsapp: string
  shopId: string
  shopName: string
  /** Note moyenne 0-5 (optionnel, défaut 0 → pas d'étoiles) */
  rating?: number
  onQuickView?: (product: ModernStoreProduct) => void
}

function discountPercent(price: number, oldPrice?: number | null): number {
  if (!oldPrice || oldPrice <= price) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

export function ProductCard({
  product,
  accent,
  shopId,
  rating = 0,
  onQuickView,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)

  const discount = discountPercent(product.price, product.oldPrice)
  const image = product.images?.[0] || product.image

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image,
        quantity: 1,
        slug: product.slug ?? null,
      },
      shopId,
    )
  }

  const handleCardClick = () => {
    onQuickView?.(product)
  }

  return (
    <article
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-150 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      aria-label={`Voir le produit ${product.name}`}
    >
      {/* ─── Image ─── */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl opacity-40">🛍️</span>
          </div>
        )}

        {/* Top-left: bestseller badge */}
        {product.isBestSeller && (
          <span className="absolute left-2 top-2 rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            ★ Top vente
          </span>
        )}

        {/* Top-right: discount badge */}
        {discount > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-md">
            −{discount}%
          </span>
        )}

        {/* Rating stars overlay (bottom-left) */}
        {rating > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 shadow-md backdrop-blur-sm">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
            <span className="ml-1 text-[10px] font-semibold text-gray-700">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* ─── Info ─── */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-1 text-sm font-medium text-gray-900">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold" style={{ color: accent }}>
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleAddToCart()
          }}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-all active:scale-[0.98]"
          style={{ backgroundColor: accent }}
          aria-label={`Ajouter ${product.name} au panier`}
        >
          <ShoppingBag className="h-4 w-4" />
          Ajouter au panier
        </button>
      </div>
    </article>
  )
}
