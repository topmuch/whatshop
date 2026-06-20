'use client'

import { MessageCircle } from 'lucide-react'
import { formatPrice } from '@/lib/shared'
import Image from 'next/image'

export interface CrossSellProduct {
  id: string
  name: string
  price: number
  oldPrice?: number | null
  image?: string | null
  slug?: string | null
}

export function ProductCard({ product, whatsapp, accent }: { product: CrossSellProduct; whatsapp: string; accent: string }) {
  const phone = whatsapp?.replace(/\D/g, '') || ''
  const msg = encodeURIComponent(`Bonjour, je suis intéressé(e) par : ${product.name} à ${formatPrice(product.price)}.`)
  const link = `https://wa.me/${phone}?text=${msg}`

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl opacity-40">🛍️</span>
          </div>
        )}
        {product.oldPrice && product.oldPrice > product.price && (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm font-medium text-gray-900">{product.name}</p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-base font-bold" style={{ color: accent }}>
              {formatPrice(product.price)}
            </p>
            {product.oldPrice && product.oldPrice > product.price && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(product.oldPrice)}</p>
            )}
          </div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Commander ${product.name} via WhatsApp`}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
          >
            <MessageCircle className="h-4 w-4" fill="white" />
          </a>
        </div>
      </div>
    </div>
  )
}
