/**
 * template-display.ts — Centralized display names for templates.
 *
 * Internal template IDs stay unchanged in the database and codebase.
 * This file only controls what the CLIENT sees
 * during onboarding and in the dashboard.
 */

import type { TemplateEngine } from '@/lib/sector-config'

export interface TemplateDisplayInfo {
  displayName: string       // Marketing name shown to the client
  tagline: string           // Short tagline
  description: string       // Longer description
  features: string[]        // Key feature bullets
  style: {
    primaryColor: string
    badge: string            // Badge text (e.g. "Populaire", "Nouveau")
    emoji: string
  }
}

export const TEMPLATE_DISPLAY: Record<string, TemplateDisplayInfo> = {
  'live-template': {
    displayName: 'Live',
    tagline: 'Live commerce avec effet waouh',
    description:
      "Template pensé pour les vendeurs en live shopping (TikTok, Instagram, YouTube). Hero gradient animé, badge LIVE pulsant, bouton WhatsApp direct, design mobile-first. Parfait pour les forfaits LIVE et LIVE PRO.",
    features: [
      'Badge EN DIRECT animé avec pulsation rouge',
      'Hero gradient coral-orange style TikTok',
      'Bouton "Rejoindre le live" configurable',
      'Produits avec WhatsApp direct (sans panier)',
      'Animations Framer Motion fluides',
      'Design mobile-first ultra responsive',
      'Sélecteur multi-boutiques (LIVE PRO)',
    ],
    style: {
      primaryColor: '#FF6154',
      badge: 'Live',
      emoji: '🎬',
    },
  },
  'live-1': {
    displayName: 'Live 1 — Jaune/Rouge',
    tagline: 'Thème flashy jaune et rouge',
    description:
      'Variante jaune/rouge du template live. Couleurs vives et énergiques, parfait pour attirer l\'attention pendant vos lives.',
    features: [
      'Thème jaune/rouge flashy',
      'Badge EN DIRECT animé',
      'Marquee défilant',
      'Bouton WhatsApp direct',
      'Animations Framer Motion',
      'Design mobile-first',
    ],
    style: {
      primaryColor: '#eab308',
      badge: 'Jaune/Rouge',
      emoji: '🔥',
    },
  },
  'live-2': {
    displayName: 'Live 2 — Violet/Rose',
    tagline: 'Thème flashy violet et rose',
    description:
      'Variante violet/rose du template live. Ambiance nightlife et moderne pour des lives immersifs.',
    features: [
      'Thème violet/rose flashy',
      'Badge EN DIRECT animé',
      'Marquee défilant',
      'Bouton WhatsApp direct',
      'Animations Framer Motion',
      'Design mobile-first',
    ],
    style: {
      primaryColor: '#9333EA',
      badge: 'Violet/Rose',
      emoji: '💜',
    },
  },
  'live-3': {
    displayName: 'Live 3 — Cyan/Orange',
    tagline: 'Thème flashy cyan et orange',
    description:
      'Variante cyan/orange du template live. Style tech et électrique pour des lives dynamiques.',
    features: [
      'Thème cyan/orange flashy',
      'Badge EN DIRECT animé',
      'Marquee défilant',
      'Bouton WhatsApp direct',
      'Animations Framer Motion',
      'Design mobile-first',
    ],
    style: {
      primaryColor: '#06B6D4',
      badge: 'Cyan/Orange',
      emoji: '⚡',
    },
  },
  'xstore-electro': {
    displayName: 'Moderne',
    tagline: 'Design tech et épuré',
    description:
      "Un template moderne et structuré, idéal pour la tech, l'automobile, la quincaillerie et l'artisanat BTP. Focus sur les fiches techniques et la confiance.",
    features: [
      'Design moderne avec typographie sans-serif',
      'Fiches produits techniques détaillées',
      'Barre de recherche intégrée',
      'Badges de garantie et SAV',
      'Optimisé pour les produits avec specs',
    ],
    style: {
      primaryColor: '#10b981',
      badge: 'Nouveau',
      emoji: '⚡',
    },
  },
  'modern-store': {
    displayName: 'Modern Store',
    tagline: 'E-commerce avec panier et checkout',
    description:
      "Template e-commerce complet avec page d'accueil, fiches produit détaillées, panier persistant, checkout formulaire (COD/Mobile Money) ET bouton « Buy It Now » WhatsApp. Idéal pour les boutiques en ligne professionnelles.",
    features: [
      'Page d\'accueil avec hero, best sellers, témoignages',
      'Fiches produit avec galerie, variantes, produits similaires',
      'Panier persistant (localStorage)',
      'Checkout formulaire (COD, Mobile Money)',
      'Bouton « Buy It Now » WhatsApp direct',
      'Sticky CTA mobile',
    ],
    style: {
      primaryColor: '#3B82F6',
      badge: 'E-commerce',
      emoji: '🛒',
    },
  },
  'cosmika-dark': {
    displayName: 'Cosmika',
    tagline: 'Design épuré avec accents orange',
    description:
      "Template e-commerce premium au design clair et moderne. Barre défilante animée, accents orange, catégories en onglets, produit phare en plein écran. Idéal pour la beauté, la mode et les produits haut de gamme.",
    features: [
      'Design clair et moderne avec accents orange #F97316',
      'Barre défilante animée (marquee) en haut',
      'Navigation sticky avec menu mobile plein écran',
      'Catégories en onglets horizontaux scrollables',
      'Grille produits responsive avec badges orange',
      'Compte à rebours sur les offres promotionnelles',
      'Fiches produit avec galerie, variantes et similaires',
      'Panier persistant + checkout formulaire',
      'Bouton « Acheter maintenant » WhatsApp',
      'Footer multi-colonnes premium',
    ],
    style: {
      primaryColor: '#f97316',
      badge: 'Premium',
      emoji: '💎',
    },
  },
  'single-product': {
    displayName: 'Single Produit',
    tagline: 'Landing page optimisée conversion',
    description:
      "Landing page focalisée sur un seul produit, optimisée pour la conversion. Compte à rebours, avis clients, FAQ, preuve sociale. Parfait pour les TikTokeurs et vendeurs mono-produit.",
    features: [
      'Landing page mono-produit optimisée conversion',
      'Compte à rebours avec reset quotidien',
      'Galerie d\'images avec lightbox',
      'Sélecteur de variantes (couleurs/tailles)',
      'Avis clients avec distribution',
      'FAQ accordéon',
      'Sticky CTA mobile',
    ],
    style: {
      primaryColor: '#EC4899',
      badge: 'Conversion',
      emoji: '🎯',
    },
  },
  'fresh-market': {
    displayName: 'Fresh Market',
    tagline: 'Marché frais et épicerie fine',
    description:
      "Template marché frais inspiré des grandes surfaces alimentaires. En-tête teal, hero orange promotionnel, catégories circulaires avec images, sections produits défilantes (Nouveautés, Offres, Best-sellers). Parfait pour l'alimentation, fruits & légumes, boulangerie, épicerie.",
    features: [
      'En-tête teal professionnel avec infos livraison',
      'Catégories circulaires avec images défilantes',
      'Hero orange avec promotions mises en avant',
      'Tuiles promotionnelles colorées',
      'Sections produits horizontales (Nouveautés, Offres, Best-sellers)',
      'Cart drawer intégré avec thème cohérent',
      'Icônes de confiance (livraison, qualité, prix)',
      'Footer multi-colonnes professionnel',
      'Design mobile-first responsive',
    ],
    style: {
      primaryColor: '#0D9488',
      badge: 'Alimentaire',
      emoji: '🥬',
    },
  },
}

/**
 * Get display info for a template engine ID.
 * Falls back to xstore-electro if unknown.
 */
export function getTemplateDisplayInfo(
  templateId: string | undefined | null,
): TemplateDisplayInfo {
  return TEMPLATE_DISPLAY[templateId ?? ''] ?? TEMPLATE_DISPLAY['xstore-electro']
}