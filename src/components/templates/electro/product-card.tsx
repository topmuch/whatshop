'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, MessageCircle, Wrench } from 'lucide-react'
import type { Product } from '@/lib/shared'
import { formatPrice, openWhatsApp, PLATFORM_CONFIG } from '@/lib/shared'
import type { ElectroCardMode, ThemeColors } from '@/lib/theme-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ElectroProductCardProps {
  product: Product
  colors: ThemeColors
  cardMode: ElectroCardMode
  ctaText: string
  whatsappNumber: string
  whatsappMessage: string
  showPrice: boolean
  categoryName?: string
  onAddToCart: (product: Product) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse specs from a product description.
 * Looks for pipe-separated ("|") or comma-separated items and returns the first 3.
 */
function parseSpecs(description: string | undefined): string[] {
  if (!description) return []

  const parts = description.includes('|')
    ? description.split('|').map((s) => s.trim()).filter(Boolean)
    : description.split(',').map((s) => s.trim()).filter(Boolean)

  return parts.slice(0, 3)
}

/**
 * Extract a compare/old price from the description.
 * Looks for a pattern like "some text / <number>" and returns that number.
 */
function extractComparePrice(description: string | undefined): number | null {
  if (!description) return null

  const match = description.match(/\/\s*(\d[\d\s]*)$/)
  if (!match) return null

  const cleaned = match[1].replace(/\s/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

/**
 * Check if a product was created within the "new" threshold.
 */
function isNewProduct(createdAt: string | undefined): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt).getTime()
  const threshold = PLATFORM_CONFIG.NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - created < threshold
}

/**
 * Check if a product qualifies for the "promo" badge.
 */
function isPromoProduct(price: number): boolean {
  return price > 0 && price < PLATFORM_CONFIG.PROMO_PRICE_THRESHOLD
}

/**
 * Build a WhatsApp message by replacing placeholders.
 */
function buildWhatsAppMessage(
  template: string,
  product: Product,
): string {
  return template
    .replace('{productName}', product.name)
    .replace('{productPrice}', formatPrice(product.price))
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ElectroProductCard({
  product,
  colors,
  cardMode,
  ctaText,
  whatsappNumber,
  whatsappMessage,
  showPrice,
  categoryName,
  onAddToCart,
}: ElectroProductCardProps) {
  const isService = cardMode === 'service'
  const showBadges = cardMode !== 'service'

  const specs = cardMode === 'specs' ? parseSpecs(product.description) : []
  const comparePrice = cardMode === 'specs' ? extractComparePrice(product.description) : null

  const displayCategory = categoryName || product.categoryName || product.category?.name
  const shouldShowPrice = showPrice && !isService
  const showSurDevis = isService && product.price <= 0
  const showAPartirDe = isService && product.price > 0

  const isNew = showBadges && isNewProduct(product.createdAt)
  const isPromo = showBadges && isPromoProduct(product.price)

  const inStock = (product.stock ?? 0) > 0 || product.stock === undefined || product.stock === null

  function handleCta(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!whatsappNumber) return

    const msg = buildWhatsAppMessage(whatsappMessage, product)
    const phone = whatsappNumber.replace(/\D/g, '')
    const encoded = encodeURIComponent(msg)
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart(product)
  }

  return (
    <motion.div
      className="group relative flex flex-col overflow-hidden rounded-lg bg-white border border-gray-100 hover:shadow-lg transition-all duration-200"
      whileHover={{ scale: 1.02 }}
    >
      {/* ── Image ─────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}

        {/* ── Badges ──────────────────────────────────────────────── */}
        {showBadges && (isNew || isPromo) && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <span className="inline-block rounded-md bg-green-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Nouveau
              </span>
            )}
            {isPromo && (
              <span className="inline-block rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Promo
              </span>
            )}
          </div>
        )}

        {/* ── Out of stock overlay ─────────────────────────────────── */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 p-3 md:p-4 flex-1">
        {/* Name */}
        <h3
          className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] leading-snug"
        >
          {product.name}
        </h3>

        {/* ── Specs line (specs mode only) ────────────────────────── */}
        {cardMode === 'specs' && specs.length > 0 && (
          <p className="text-xs text-gray-500 line-clamp-1">
            {specs.join(' | ')}
          </p>
        )}

        {/* ── Compatibility tag (compat mode only) ────────────────── */}
        {cardMode === 'compat' && displayCategory && (
          <span
            className="inline-block self-start rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{
              background: colors.primaryBg,
              color: colors.primary,
              border: `1px solid ${colors.primaryLight}`,
            }}
          >
            {displayCategory}
          </span>
        )}

        {/* ── Service description (service mode only) ─────────────── */}
        {cardMode === 'service' && product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* ── Service type tag (service mode only) ────────────────── */}
        {cardMode === 'service' && displayCategory && (
          <span
            className="inline-block self-start rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{
              background: colors.primaryBg,
              color: colors.primary,
              border: `1px solid ${colors.primaryLight}`,
            }}
          >
            {displayCategory}
          </span>
        )}

        {/* ── Spacer ──────────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Price ───────────────────────────────────────────────── */}
        {shouldShowPrice && (
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span
              className="text-lg font-bold"
              style={{ color: colors.primary }}
            >
              {formatPrice(product.price)}
            </span>
            {comparePrice !== null && comparePrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
        )}

        {/* ── "À partir de" (service mode with price) ──────────── */}
        {showAPartirDe && (
          <p className="text-sm text-gray-600 mt-1">
            À partir de{' '}
            <span className="font-bold" style={{ color: colors.primary }}>
              {formatPrice(product.price)}
            </span>
          </p>
        )}

        {/* ── "Sur devis" (service mode without price) ──────────── */}
        {showSurDevis && (
          <p className="text-sm text-gray-400 mt-1 italic">
            Sur devis
          </p>
        )}

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div className="mt-2 flex items-center gap-2">
          {/* CTA Button */}
          <button
            type="button"
            onClick={handleCta}
            disabled={!inStock}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg font-semibold text-sm min-h-[44px] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: colors.ctaBg,
              color: colors.ctaText,
            }}
          >
            {isService ? (
              <Wrench className="size-4 shrink-0" />
            ) : (
              <MessageCircle className="size-4 shrink-0" />
            )}
            <span>{ctaText}</span>
          </button>

          {/* Add to Cart (specs & compat modes only) */}
          {!isService && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: colors.primaryLight,
                color: colors.primary,
              }}
              aria-label={`Ajouter ${product.name} au panier`}
            >
              <ShoppingCart className="size-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}