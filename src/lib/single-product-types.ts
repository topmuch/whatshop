/**
 * Types partagés pour le template "Single Product Landing Page".
 */
import type { ProductVariant } from './variant-utils'

export interface ProductImage {
  id: string
  url: string
  order: number
}

export interface Review {
  id: string
  customerName: string
  rating: number
  comment?: string | null
  photos: string[]
  source: 'MANUAL' | 'FACEBOOK' | 'TIKTOK'
  verified: boolean
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED'
  createdAt: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  order: number
}

export interface Benefit {
  icon: string // nom d'icône Lucide (ex: "Truck", "ShieldCheck")
  title: string
  description: string
}

export interface SingleProductConfig {
  /** ID du produit mis en avant (mono-produit) */
  productId: string | null
  /** Compte à rebours */
  countdown: {
    enabled: boolean
    endHour: number // 0-23
    endMinute: number // 0-59
    isoEnd?: string // override absolu (optionnel)
  }
  /** Avantages affichés sous le hero (3-4) */
  benefits: Benefit[]
  /** IDs des produits cross-sell */
  crossSellProductIds: string[]
}

export interface SingleProductData {
  product: {
    id: string
    name: string
    shortDescription?: string | null
    description?: string | null
    price: number
    oldPrice?: number | null
    image?: string | null
    stock?: number | null
    slug?: string | null
  } | null
  images: ProductImage[]
  variants: ProductVariant[]
  reviews: Review[]
  faqs: FAQItem[]
  config: SingleProductConfig
  crossSellProducts: Array<{
    id: string
    name: string
    price: number
    oldPrice?: number | null
    image?: string | null
    slug?: string | null
  }>
}

/** Config par défaut pour une boutique qui active le template mono-produit */
export const DEFAULT_SINGLE_PRODUCT_CONFIG: SingleProductConfig = {
  productId: null,
  countdown: {
    enabled: false,
    endHour: 23,
    endMinute: 59,
  },
  benefits: [
    { icon: 'Truck', title: 'Livraison rapide', description: 'Partout en Côte d\'Ivoire' },
    { icon: 'ShieldCheck', title: 'Paiement à la livraison', description: 'Payez en recevant' },
    { icon: 'RotateCcw', title: 'Retour 7 jours', description: 'Satisfait ou remboursé' },
  ],
  crossSellProductIds: [],
}

/** Parse une config JSON stockée en base, avec fallback sur les défauts. */
export function parseSingleProductConfig(raw: string | null | undefined): SingleProductConfig {
  if (!raw) return DEFAULT_SINGLE_PRODUCT_CONFIG
  try {
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SINGLE_PRODUCT_CONFIG, ...parsed }
  } catch {
    return DEFAULT_SINGLE_PRODUCT_CONFIG
  }
}
