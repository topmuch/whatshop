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