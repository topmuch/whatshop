'use client'

import { type Product } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  cartQuantity: number
  onUpdateQuantity: (productId: string, qty: number) => void
}

export function ProductCard({
  product,
  onAddToCart,
  cartQuantity,
  onUpdateQuantity,
}: ProductCardProps) {
  const priceFormatted = product.price.toLocaleString('fr-FR') + ' FCFA'
  const lowStock = product.stock !== undefined && product.stock !== null && product.stock <= 3 && product.stock > 0

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg">
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          fill
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          fallbackIcon="package"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Name */}
        <h3 className="font-semibold leading-tight line-clamp-2 text-sm">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-lg font-bold text-primary">{priceFormatted}</p>

        {/* Stock Indicator */}
        {lowStock && (
          <p className="text-xs font-medium text-orange-500">
            Plus que {product.stock} en stock
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Add to Cart / Quantity Controls */}
        {cartQuantity === 0 ? (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            className="w-full gap-1.5"
            size="sm"
          >
            <Plus className="size-4" />
            Ajouter au panier
          </Button>
        ) : (
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => {
                e.stopPropagation()
                onUpdateQuantity(product.id, cartQuantity - 1)
              }}
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="min-w-[2rem] text-center font-semibold text-sm">
              {cartQuantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => {
                e.stopPropagation()
                onUpdateQuantity(product.id, cartQuantity + 1)
              }}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
