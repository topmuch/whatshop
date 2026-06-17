'use client'

import { MessageCircle } from 'lucide-react'
import { formatPrice } from '@/lib/shared'

interface StickyCTAProps {
  productName: string
  price: number
  oldPrice?: number | null
  whatsapp: string
  /** Message WhatsApp optionnel pré-rempli */
  message?: string
  /** Compte à rebours compact (optionnel) */
  countdown?: React.ReactNode
}

export function StickyCTA({ productName, price, oldPrice, whatsapp, message, countdown }: StickyCTAProps) {
  const phone = whatsapp?.replace(/\D/g, '') || ''
  const defaultMsg = `Bonjour, je veux commander : ${productName} à ${formatPrice(price)}.`
  const text = encodeURIComponent(message || defaultMsg)
  const link = `https://wa.me/${phone}?text=${text}`

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{productName}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-green-600">{formatPrice(price)}</span>
            {oldPrice && oldPrice > price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(oldPrice)}</span>
            )}
            {countdown}
          </div>
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 flex-shrink-0 items-center gap-2 rounded-xl bg-green-500 px-5 font-bold text-white shadow-lg transition-transform active:scale-95"
        >
          <MessageCircle className="h-5 w-5" fill="white" />
          Commander
        </a>
      </div>
    </div>
  )
}
