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
  marquee: {
    enabled: boolean
    text: string
    /** Séparateur entre les éléments, ex: " ★ " */
    separator: string
    /** Durée de l'animation en secondes (plus petit = plus rapide) */
    speed: number
    /** Couleur de fond, ex: "#000000" */
    backgroundColor: string
    /** Couleur du texte, ex: "#ffffff" */
    textColor: string
    /** Taille du texte Tailwind, ex: "sm", "base", "lg" */
    fontSize: string
    /** Espacement des lettres CSS, ex: "0.25em" */
    letterSpacing: string
    /** Padding vertical Tailwind, ex: "py-3", "py-4" */
    padding: string
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
  marquee: {
    enabled: true,
    text: 'BIENVENUE DANS NOTRE BOUTIQUE ★ LIVRAISON GRATUITE ★ PAIEMENT À LA LIVRAISON ★ RETOURS SOUS 7 JOURS ★ SERVICE CLIENT 24/7',
    separator: ' ★ ',
    speed: 25,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    fontSize: 'sm',
    letterSpacing: '0.25em',
    padding: 'py-3.5',
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
