/**
 * Types partagés pour le template "Modern Store".
 */

export interface ModernStoreProduct {
  id: string
  name: string
  slug?: string | null
  shortDescription?: string | null
  description?: string | null
  price: number
  oldPrice?: number | null
  image?: string | null
  images: string[]
  stock?: number | null
  isAvailable: boolean
  isFeatured: boolean
  isBestSeller: boolean
  sku?: string | null
  promoEndDate?: string | null
  categoryId?: string | null
  categoryName?: string | null
}

export interface ModernStoreVariant {
  id: string
  type: 'COLOR' | 'SIZE'
  name: string
  value?: string | null
  priceOffset: number
  stock: number
}

export interface ModernStoreReview {
  id: string
  customerName: string
  rating: number
  comment?: string | null
  verified: boolean
  source: string
  createdAt: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  image?: string | null
  quantity: number
  variantId?: string | null
  variantName?: string | null
  /** slug produit pour navigation */
  slug?: string | null
}

export interface ModernStoreConfig {
  hero: {
    title: string
    subtitle: string
    stats: { label: string; value: string }[]
    ctaText: string
    productId: string | null
  }
  benefits: { icon: string; title: string; description: string }[]
  newsletter: {
    enabled: boolean
    title: string
    placeholder: string
  }
}

export const DEFAULT_MODERN_STORE_CONFIG: ModernStoreConfig = {
  hero: {
    title: 'Bienvenue dans notre boutique',
    subtitle: 'Découvrez nos produits sélectionnés pour vous',
    stats: [
      { label: 'Clients satisfaits', value: '500+' },
      { label: 'Produits', value: '50+' },
      { label: 'Note moyenne', value: '4.8/5' },
    ],
    ctaText: 'Voir les produits',
    productId: null,
  },
  benefits: [
    { icon: 'Truck', title: 'Livraison rapide', description: 'Partout en Côte d\'Ivoire' },
    { icon: 'ShieldCheck', title: 'Paiement sécurisé', description: 'Paiement à la livraison' },
    { icon: 'RotateCcw', title: 'Retour gratuit', description: 'Sous 7 jours' },
    { icon: 'Headphones', title: 'Support 7j/7', description: 'Une équipe à votre écoute' },
  ],
  newsletter: {
    enabled: true,
    title: 'Restez informé de nos offres',
    placeholder: 'Votre email',
  },
}

export function parseModernStoreConfig(raw: string | null | undefined): ModernStoreConfig {
  if (!raw) return DEFAULT_MODERN_STORE_CONFIG
  try {
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_MODERN_STORE_CONFIG, ...parsed }
  } catch {
    return DEFAULT_MODERN_STORE_CONFIG
  }
}
