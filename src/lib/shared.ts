/**
 * Shared utilities and configuration used across the app.
 * Single source of truth for common helpers and platform settings.
 */

// ─── Product Type (single source of truth) ───
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  images?: string[]
  stock?: number
  isAvailable: boolean
  categoryId?: string
  categoryName?: string
  createdAt?: string
  category?: { id: string; name: string } | null
}

// ─── Formatters ───

/**
 * Format a price in FCFA with French locale separators.
 * Example: 15000 → "15 000 FCFA"
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA'
}

/**
 * Open WhatsApp with a pre-filled message for a product order.
 */
export function openWhatsApp(product: { name: string; price: number }, whatsapp: string, qty: number = 1) {
  const price = (product.price * qty).toLocaleString('fr-FR')
  const msg = `Bonjour ! 👋\n\nJe souhaite commander :\n\n🛍️ ${product.name} x${qty} — ${price} FCFA\n\nMerci ! 🙏`
  const encoded = encodeURIComponent(msg)
  const phone = whatsapp.replace(/\D/g, '')
  window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
}

// ─── Platform Configuration ───

export const PLATFORM_CONFIG = {
  /** Default WhatsApp number for the platform (landing, support, etc.) */
  DEFAULT_WHATSAPP: process.env.NEXT_PUBLIC_WHATSAPP || '2217848582226',
  /** Base URL for the platform (used in SEO, QR codes, etc.) */
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'boutiko.com',
  /** Promo threshold — products below this price get a "promo" badge */
  PROMO_PRICE_THRESHOLD: 5000,
  /** "New" badge threshold in days */
  NEW_PRODUCT_DAYS: 7,
  /** Products per page for pagination */
  PRODUCTS_PER_PAGE: 20,
} as const

// ─── Validation Helpers ───

/**
 * Basic email format validation.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validate a phone/WhatsApp number (must contain at least 8 digits).
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 8
}
