'use client'

import { ShoppingBag, MessageCircle } from 'lucide-react'
import { formatPrice } from '@/lib/shared'
import { buildWhatsAppBuyNowLink } from '@/lib/whatsapp-utils'

interface StickyCTAProps {
  price: number
  oldPrice?: number | null
  productName: string
  whatsapp: string
  shopName: string
  onAddToCart?: () => void
}

/**
 * Barre sticky mobile (md:hidden) avec prix + bouton "Ajouter" + bouton WhatsApp.
 */
export function StickyCTA({
  price,
  oldPrice,
  productName,
  whatsapp,
  shopName,
  onAddToCart,
}: StickyCTAProps) {
  const waLink = buildWhatsAppBuyNowLink({
    whatsapp,
    shopName,
    productName,
    price,
    quantity: 1,
  })

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        {/* Left: name + price */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {productName}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(price)}
            </span>
            {oldPrice && oldPrice > price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Right: ADD + WhatsApp */}
        <button
          type="button"
          onClick={onAddToCart}
          className="flex h-11 flex-shrink-0 items-center gap-1.5 rounded-xl border-2 border-gray-900 bg-white px-4 text-xs font-bold uppercase tracking-wide text-gray-900 transition-transform active:scale-95"
        >
          <ShoppingBag className="h-4 w-4" />
          Ajouter
        </button>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Commander ${productName} via WhatsApp`}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform active:scale-95"
        >
          <MessageCircle className="h-5 w-5" fill="white" />
        </a>
      </div>
    </div>
  )
}
