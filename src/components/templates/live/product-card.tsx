'use client'

import Image from 'next/image'
import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Star } from 'lucide-react'
import type { Product, Shop } from '@/lib/store'
import { formatPrice, openWhatsApp, PLATFORM_CONFIG } from '@/lib/shared'

interface LiveProductCardProps {
  product: Product
  shop: Shop | null
}

function isNewProduct(createdAt?: string): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt).getTime()
  const threshold = PLATFORM_CONFIG.NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - created < threshold
}

function getDiscountPercent(price: number, oldPrice?: number | null): number | null {
  if (!oldPrice || oldPrice <= price || oldPrice <= 0) return null
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

function LiveProductCard({ product, shop }: LiveProductCardProps) {
  const whatsapp = shop?.whatsapp || ''
  const inStock = (product.stock ?? 0) > 0 || product.stock === undefined || product.stock === null
  const isNew = isNewProduct(product.createdAt)
  const discount = getDiscountPercent(product.price, product.oldPrice)
  const lowStock = inStock && product.stock !== undefined && product.stock !== null && product.stock <= 5

  const handleWhatsApp = () => {
    if (!whatsapp) return
    openWhatsApp(product, whatsapp)
  }

  // stagger animation variants
  const variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0 },
    }),
    [],
  )

  return (
    <motion.div
      variants={variants}
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      initial="hidden"
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="product-card-shimmer group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]"
    >
      {/* ── Image ── */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#FAFAFA]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* ── Badges ── */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isNew && (
            <span className="inline-block rounded-lg bg-[#FF6154] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              NOUVEAU
            </span>
          )}
          {discount !== null && (
            <span className="inline-block rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
              -{discount}%
            </span>
          )}
          {/* ⭐ Populaire badge for featured/best-seller products */}
          {product.isBestSeller && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-1 text-[10px] font-extrabold text-amber-900 shadow-sm"
            >
              <Star className="size-3 fill-current text-amber-900" />
              Populaire
            </motion.span>
          )}
        </div>

        {/* ── Low stock ── */}
        {lowStock && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-lg bg-amber-400/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-amber-900 shadow-sm">
            ⚡ Plus que {product.stock} !
          </span>
        )}

        {/* ── Out of stock overlay ── */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-xl bg-white/95 px-4 py-2 text-xs font-bold text-gray-900 shadow-lg">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-2 p-3.5 md:p-4 flex-1">
        {/* Name */}
        <h3 className="text-sm font-semibold text-[#1A1A2E] line-clamp-1 leading-snug">
          {product.name}
        </h3>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-extrabold bg-gradient-to-r from-[#FF6154] to-[#FF9A44] bg-clip-text text-transparent leading-none">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-gray-400 line-through leading-none">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {/* WhatsApp CTA */}
        <button
          type="button"
          onClick={handleWhatsApp}
          disabled={!inStock || !whatsapp}
          className={`mt-1 flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-sm min-h-[44px] transition-all duration-200 hover:brightness-105 hover:shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${
            isNew ? 'wa-btn-pulse' : ''
          }`}
        >
          <MessageCircle className="size-4 shrink-0" />
          Commander
        </button>
      </div>
    </motion.div>
  )
}

export default memo(LiveProductCard)