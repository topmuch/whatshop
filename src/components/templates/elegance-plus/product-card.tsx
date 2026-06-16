'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Eye, ShoppingCart, Star } from 'lucide-react'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Product, Shop } from '@/lib/store'
import { formatPrice, openWhatsApp } from '@/lib/shared'
import { getCtaButton } from '@/lib/sector-config'
import { useTracking } from '@/hooks/useTracking'
import { useFacebookTracking } from '@/hooks/useFacebookTracking'

interface EleganceProductCardProps {
  product: Product
  config: ThemeConfig
  shop: Shop | null
  onProductClick?: (product: Product) => void
  onAddToCart?: (product: Product, qty: number) => void
  variant?: 'default' | 'best-seller' | 'new-arrival'
}

export function EleganceProductCard({
  product,
  config,
  shop,
  onProductClick,
  onAddToCart,
  variant = 'default',
}: EleganceProductCardProps) {
  const colors = config.colors
  const isService = config.businessType === 'SERVICE'
  const sector = shop?.sector
  const ctaText = getCtaButton(sector)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const imageUrl = product.images?.[0] || product.image

  const { trackWhatsAppClick } = useTracking(shop?.id)
  const { trackContact } = useFacebookTracking(shop?.id)

  const handleCTA = () => {
    if (!shop?.whatsapp) return
    trackWhatsAppClick(product.id, product.name)
    trackContact('whatsapp', product.price)
    openWhatsApp(product, shop.whatsapp)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart?.(product, 1)
  }

  // Determine badges
  const isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 7
  // Note: promo badges could use a dedicated field in the future
  const hasPromo = false

  // Star rating (mock: always 5 for demo, could come from product data)
  const rating = 5

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4 }}
      className="group bg-white rounded-2xl overflow-hidden flex flex-col h-full border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ borderColor: colors.primaryLight + '60' }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden aspect-square bg-gray-100 cursor-pointer"
        onClick={() => onProductClick?.(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onProductClick?.(product)
        }}
        aria-label={`Voir ${product.name}`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {variant === 'best-seller' && (
            <span className="text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md" style={{ backgroundColor: '#059669' }}>
              ★ Best Seller
            </span>
          )}
          {variant === 'new-arrival' && isNew && (
            <span className="text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md" style={{ backgroundColor: colors.primary }}>
              Nouveau
            </span>
          )}
          {variant === 'default' && isNew && (
            <span className="text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md" style={{ backgroundColor: colors.primary }}>
              Nouveau
            </span>
          )}
          {hasPromo && (
            <span className="text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md bg-amber-500">
              Promo
            </span>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsWishlisted((prev) => !prev)
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 hover:scale-110 z-10"
          aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            className="size-4 transition-colors duration-200"
            style={{ color: isWishlisted ? '#EF4444' : '#9CA3AF', fill: isWishlisted ? '#EF4444' : 'none' }}
          />
        </button>

        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 z-10">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onProductClick?.(product)
              }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              aria-label="Aperçu rapide"
            >
              <Eye className="size-4 text-gray-700" />
            </button>
            {!isService && onAddToCart && (
              <button
                onClick={handleAddToCart}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                aria-label="Ajouter au panier"
              >
                <ShoppingCart className="size-4 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Rating stars */}
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="size-3.5"
              style={{ color: i < rating ? '#FBBF24' : '#E5E7EB', fill: i < rating ? '#FBBF24' : 'none' }}
            />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">({rating})</span>
        </div>

        <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2 text-gray-900 group-hover:text-gray-700 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto">
          {isService ? (
            product.price > 0 ? (
              <p className="text-sm text-gray-600">
                À partir de{' '}
                <span className="font-bold text-lg" style={{ color: colors.primary }}>
                  {formatPrice(product.price)}
                </span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-gray-500 italic">Sur devis</p>
            )
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold" style={{ color: colors.text }}>
                {formatPrice(product.price)}
              </span>

            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleCTA}
            className="mt-3 block w-full text-center py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
            style={{ backgroundColor: colors.ctaBg }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryDark
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.ctaBg
            }}
          >
            {ctaText}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
