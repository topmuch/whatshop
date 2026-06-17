/**
 * template-display.ts — Centralized display names for templates.
 *
 * Internal template IDs (cosmika-beauty, xstore-electro) stay unchanged
 * in the database and codebase. This file only controls what the CLIENT sees
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
  'cosmika-beauty': {
    displayName: 'Élégance',
    tagline: 'Design raffiné et professionnel',
    description:
      'Un template polyvalent et élégant, parfait pour les métiers de service, le consulting, la beauté et la restauration. Typographie serif premium et mise en page aérée.',
    features: [
      'Design premium avec typographie serif',
      'Sections : Expertises, Approche, Témoignages',
      'Page Contact avec Google Maps',
      'Fiche service détaillée',
      'Intégration WhatsApp complète',
    ],
    style: {
      primaryColor: '#e11d48',
      badge: 'Populaire',
      emoji: '✨',
    },
  },
  'elegance-plus': {
    displayName: 'Elegance Plus',
    tagline: 'Design premium enrichi avec sections marketing avancées',
    description:
      "L'expérience ultime : barre d'annonces promo, catégories en cartes rectangulaires, bannières promotionnelles, newsletter, section nouveautés, bouton scroll-to-top et animations avancées. Le meilleur du e-commerce premium.",
    features: [
      'Barre d\'annonces promo rotative',
      'Catégories en cartes rectangulaires modernes',
      'Bannière promotionnelle mid-page',
      'Section Newsletter avec inscription',
      'Produits avec badges Promo, Nouveau, Best Seller',
      'Section Nouveautés dédiée',
      'Bouton Scroll-to-top animé',
      'Header deux niveaux avec barre utilitaire',
      'Footer enrichi multi-colonnes',
      'Animations parallax et reveal-on-scroll',
    ],
    style: {
      primaryColor: '#9333ea',
      badge: 'Premium',
      emoji: '👑',
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
}

/**
 * Get display info for a template engine ID.
 * Falls back to cosmika-beauty if unknown.
 */
export function getTemplateDisplayInfo(
  templateId: string | undefined | null,
): TemplateDisplayInfo {
  return TEMPLATE_DISPLAY[templateId ?? ''] ?? TEMPLATE_DISPLAY['cosmika-beauty']
}