'use client'

import Image from 'next/image'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Product, Shop } from '@/lib/store'
import { formatPrice, openWhatsApp } from '@/lib/shared'
import { getCtaButton, getCtaWhatsAppMessage } from '@/lib/sector-config'
import { useTracking } from '@/hooks/useTracking'

interface CosmikaProductCardProps {
  product: Product
  config: ThemeConfig
  shop: Shop | null
  onProductClick?: (product: Product) => void
}

export function CosmikaProductCard({
  product,
  config,
  shop,
  onProductClick,
}: CosmikaProductCardProps) {
  const colors = config.colors
  const isService = config.businessType === 'SERVICE'
  const sector = shop?.sector
  const ctaText = getCtaButton(sector)

  const imageUrl = product.images?.[0] || product.image

  // ── Price rendering: Service vs E-commerce ──
  const renderPrice = () => {
    if (isService) {
      // Services: "À partir de X FCFA" or "Sur devis"
      if (product.price > 0) {
        return (
          <p className="text-sm text-gray-600 mb-3">
            À partir de{' '}
            <span className="font-bold text-lg" style={{ color: colors.primary }}>
              {formatPrice(product.price)}
            </span>
          </p>
        )
      }
      return (
        <p className="text-sm font-semibold text-gray-500 mb-3 italic">
          Sur devis
        </p>
      )
    }

    // E-commerce: standard price with optional strikethrough
    return (
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="text-xl font-bold"
          style={{ color: colors.text }}
        >
          {formatPrice(product.price)}
        </span>
      </div>
    )
  }

  // ── Tracking ──
  const { trackWhatsAppClick } = useTracking(shop?.id)

  // ── WhatsApp link with sector-specific message ──
  const handleCTA = () => {
    if (!shop?.whatsapp) return
    trackWhatsAppClick(product.id, product.name)
    openWhatsApp(product, shop.whatsapp)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100 group">
      {/* ── Image ── */}
      <div
        className="relative overflow-hidden aspect-[4/5] bg-gray-100 cursor-pointer"
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
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* New badge */}
        {product.createdAt && (
          (() => {
            const created = new Date(product.createdAt)
            const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
            if (diffDays <= 7) {
              return (
                <span
                  className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                >
                  Nouveau
                </span>
              )
            }
            return null
          })()
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-base md:text-lg mb-1 line-clamp-2 text-gray-900">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {renderPrice()}

        {/* ── CTA Button (sector-adaptive) ── */}
        <button
          onClick={handleCTA}
          className="mt-auto block w-full text-center py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
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
  )
}