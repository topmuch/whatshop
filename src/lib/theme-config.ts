/**
 * theme-config.ts — Visual theme configuration per sector for the Cosmika template.
 *
 * This extends sector-config.ts (which owns labels, CTA text, pricing rules)
 * with the VISUAL layer: colors, hero defaults, trust badges, and category styling.
 *
 * The Cosmika template reads BOTH files:
 *   - sector-config.ts  → labels, CTA button text, WhatsApp messages, showPrice
 *   - theme-config.ts   → colors, hero defaults, trust badges, category styling
 */

import type { BusinessType } from './sector-config'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ThemeColors {
  /** Primary accent color (used for borders, glows, active states) */
  primary: string
  /** Lighter variant for category borders and hover */
  primaryLight: string
  /** Very light tint for card backgrounds */
  primaryBg: string
  /** Secondary / glow color (decorative gradients) */
  secondary: string
  /** CTA button background */
  ctaBg: string
  /** CTA button text color */
  ctaText: string
}

export interface ThemeHero {
  defaultTitle: string
  defaultSubtitle: string
  defaultTagline: string
}

export interface ThemeTrustBadge {
  emoji: string
  title: string
  subtitle: string
  order: number
}

export interface ThemeConfig {
  /** Which sector this config targets */
  sector: string
  /** ECOMMERCE or SERVICE */
  businessType: BusinessType
  /** Color palette for the template */
  colors: ThemeColors
  /** Default hero content when shop hasn't customised it */
  hero: ThemeHero
  /** Default trust badges when shop hasn't customised them */
  defaultTrustBadges: ThemeTrustBadge[]
}

// ─── ECOMMERCE SECTORS ──────────────────────────────────────────────────────

const BEAUTE_THEME: ThemeConfig = {
  sector: 'beaute',
  businessType: 'ECOMMERCE',
  colors: {
    primary: '#E11D48',
    primaryLight: '#FECDD3',
    primaryBg: '#FFF1F2',
    secondary: '#F59E0B',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
  },
  hero: {
    defaultTitle: 'GLAMOUR SHINE',
    defaultSubtitle: 'Découvrez notre nouvelle collection de cosmétiques premium',
    defaultTagline: 'ILLUMINATE DAILY',
  },
  defaultTrustBadges: [
    { emoji: '🚚', title: 'Livraison 24h', subtitle: 'Partout au Sénégal', order: 0 },
    { emoji: '💵', title: 'Paiement Mobile Money', subtitle: 'Orange Money, Wave…', order: 1 },
    { emoji: '🔄', title: 'Retour facile', subtitle: 'Satisfait ou remboursé', order: 2 },
    { emoji: '📱', title: 'Support WhatsApp', subtitle: 'Réponse rapide', order: 3 },
  ],
}

const MODE_THEME: ThemeConfig = {
  sector: 'mode',
  businessType: 'ECOMMERCE',
  colors: {
    primary: '#DB2777',
    primaryLight: '#FBCFE8',
    primaryBg: '#FDF2F8',
    secondary: '#A855F7',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
  },
  hero: {
    defaultTitle: 'STYLE & ÉLÉGANCE',
    defaultSubtitle: 'Découvrez les dernières tendances de la saison',
    defaultTagline: 'NEW COLLECTION',
  },
  defaultTrustBadges: [
    { emoji: '🚚', title: 'Livraison Express', subtitle: 'Délai 48-72h', order: 0 },
    { emoji: '👗', title: 'Tendances Actuelles', subtitle: 'Collections fraîches', order: 1 },
    { emoji: '🔄', title: 'Échange Gratuit', subtitle: 'Sous 7 jours', order: 2 },
    { emoji: '💬', title: 'Conseil Style', subtitle: 'Via WhatsApp', order: 3 },
  ],
}

const ALIMENTATION_THEME: ThemeConfig = {
  sector: 'alimentation',
  businessType: 'ECOMMERCE',
  colors: {
    primary: '#D97706',
    primaryLight: '#FDE68A',
    primaryBg: '#FFFBEB',
    secondary: '#EA580C',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
  },
  hero: {
    defaultTitle: 'SAVEURS D\'ICI',
    defaultSubtitle: 'Produits locaux soigneusement sélectionnés pour votre table',
    defaultTagline: 'QUALITÉ & FRAÎCHEUR',
  },
  defaultTrustBadges: [
    { emoji: '🌿', title: 'Produits Locaux', subtitle: 'Frais et naturels', order: 0 },
    { emoji: '🚚', title: 'Livraison Rapide', subtitle: 'Réfrigérée si besoin', order: 1 },
    { emoji: '✅', title: 'Qualité Garantie', subtitle: 'Sélection rigoureuse', order: 2 },
    { emoji: '💳', title: 'Paiement Flexible', subtitle: 'Cash ou Mobile Money', order: 3 },
  ],
}

const AUTRE_ECOMMERCE_THEME: ThemeConfig = {
  sector: 'autre',
  businessType: 'ECOMMERCE',
  colors: {
    primary: '#7C3AED',
    primaryLight: '#DDD6FE',
    primaryBg: '#F5F3FF',
    secondary: '#6366F1',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
  },
  hero: {
    defaultTitle: 'BIENVENUE CHEZ NOUS',
    defaultSubtitle: 'Découvrez notre sélection de produits pour vous',
    defaultTagline: 'EXCEPTIONNEL',
  },
  defaultTrustBadges: [
    { emoji: '🚚', title: 'Livraison Disponible', subtitle: 'Sur demande', order: 0 },
    { emoji: '💳', title: 'Paiement Sécurisé', subtitle: 'Mobile Money & Cash', order: 1 },
    { emoji: '⭐', title: 'Qualité Premium', subtitle: 'Produits sélectionnés', order: 2 },
    { emoji: '💬', title: 'Support Réactif', subtitle: 'Via WhatsApp', order: 3 },
  ],
}

// ─── SERVICE SECTORS ─────────────────────────────────────────────────────────

const BEAUTE_SERVICE_THEME: ThemeConfig = {
  sector: 'beaute-service',
  businessType: 'SERVICE',
  colors: {
    primary: '#DB2777',
    primaryLight: '#F9A8D4',
    primaryBg: '#FDF2F8',
    secondary: '#A855F7',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
  },
  hero: {
    defaultTitle: 'VOTRE BEAUTÉ, NOTRE PASSION',
    defaultSubtitle: 'Prestations de qualité dans un cadre raffiné et chaleureux',
    defaultTagline: 'BIEN-ÊTRE & SOIN',
  },
  defaultTrustBadges: [
    { emoji: '💇', title: 'Stylistes Certifiés', subtitle: 'Formation continue', order: 0 },
    { emoji: '✨', title: 'Produits Premium', subtitle: 'Marques reconnues', order: 1 },
    { emoji: '🕐', title: 'RDV Flexible', subtitle: '7j/7 sur réservation', order: 2 },
    { emoji: '💆', title: 'Cadre Relaxant', subtitle: 'Votre bien-être d\'abord', order: 3 },
  ],
}

const RESTAURANT_THEME: ThemeConfig = {
  sector: 'restaurant',
  businessType: 'SERVICE',
  colors: {
    primary: '#EA580C',
    primaryLight: '#FDBA74',
    primaryBg: '#FFF7ED',
    secondary: '#B45309',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
  },
  hero: {
    defaultTitle: 'SAVEURS AUTHENTIQUES',
    defaultSubtitle: 'Une expérience culinaire unique au cœur de la ville',
    defaultTagline: 'GOÛT & TRADITION',
  },
  defaultTrustBadges: [
    { emoji: '🍽️', title: 'Produits Frais', subtitle: 'Ingrédients locaux', order: 0 },
    { emoji: '👨‍🍳', title: 'Chef Expérimenté', subtitle: '10 ans de passion', order: 1 },
    { emoji: '🚚', title: 'Livraison Rapide', subtitle: '30 min max', order: 2 },
    { emoji: '💬', title: 'Réservation Facile', subtitle: 'Via WhatsApp', order: 3 },
  ],
}

const CONSULTING_THEME: ThemeConfig = {
  sector: 'consulting',
  businessType: 'SERVICE',
  colors: {
    primary: '#4F46E5',
    primaryLight: '#A5B4FC',
    primaryBg: '#EEF2FF',
    secondary: '#64748B',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
  },
  hero: {
    defaultTitle: 'EXPERTISE & CONSEIL',
    defaultSubtitle: 'Accompagnement professionnel pour booster votre activité',
    defaultTagline: 'PERFORMANCE & RÉSULTATS',
  },
  defaultTrustBadges: [
    { emoji: '🏆', title: '10 ans d\'Expérience', subtitle: 'Expertise reconnue', order: 0 },
    { emoji: '👥', title: '50+ Clients Satisfaits', subtitle: 'Témoignages vérifiés', order: 1 },
    { emoji: '📊', title: 'Méthodologie Éprouvée', subtitle: 'Résultats mesurables', order: 2 },
    { emoji: '🎯', title: 'Support Dédié', subtitle: 'Suivi personnalisé', order: 3 },
  ],
}

const SANTE_THEME: ThemeConfig = {
  sector: 'sante',
  businessType: 'SERVICE',
  colors: {
    primary: '#059669',
    primaryLight: '#6EE7B7',
    primaryBg: '#ECFDF5',
    secondary: '#14B8A6',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
  },
  hero: {
    defaultTitle: 'SANTÉ & BIEN-ÊTRE',
    defaultSubtitle: 'Des soins de qualité pour votre santé au quotidien',
    defaultTagline: 'SOINS PROFESSIONNELS',
  },
  defaultTrustBadges: [
    { emoji: '🏥', title: 'Personnel Qualifié', subtitle: 'Professionnels certifiés', order: 0 },
    { emoji: '💊', title: 'Produits Fiables', subtitle: 'Médicaments authentiques', order: 1 },
    { emoji: '🕐', title: 'Disponible 7j/7', subtitle: 'Urgences incluses', order: 2 },
    { emoji: '🤝', title: 'Suivi Personnalisé', subtitle: 'Confidentialité garantie', order: 3 },
  ],
}

const FORMATION_THEME: ThemeConfig = {
  sector: 'formation',
  businessType: 'SERVICE',
  colors: {
    primary: '#2563EB',
    primaryLight: '#93C5FD',
    primaryBg: '#EFF6FF',
    secondary: '#7C3AED',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
  },
  hero: {
    defaultTitle: 'FORMEZ-VOUS AVANTAGEUSEMENT',
    defaultSubtitle: 'Programmes conçus par des experts pour votre réussite',
    defaultTagline: 'EXPERTISE & CARRIÈRE',
  },
  defaultTrustBadges: [
    { emoji: '🎓', title: 'Certifiants', subtitle: 'Diplômes reconnus', order: 0 },
    { emoji: '👨‍🏫', title: 'Experts Formateurs', subtitle: 'Praticiens expérimentés', order: 1 },
    { emoji: '📱', title: 'Accès Mobile', subtitle: 'Apprenez partout', order: 2 },
    { emoji: '💼', title: 'Débouchés', subtitle: 'Réseau professionnel', order: 3 },
  ],
}

// ─── REGISTRY & LOOKUP ──────────────────────────────────────────────────────

const THEME_MAP = new Map<string, ThemeConfig>([
  [BEAUTE_THEME.sector, BEAUTE_THEME],
  [MODE_THEME.sector, MODE_THEME],
  [ALIMENTATION_THEME.sector, ALIMENTATION_THEME],
  [AUTRE_ECOMMERCE_THEME.sector, AUTRE_ECOMMERCE_THEME],
  [BEAUTE_SERVICE_THEME.sector, BEAUTE_SERVICE_THEME],
  [RESTAURANT_THEME.sector, RESTAURANT_THEME],
  [CONSULTING_THEME.sector, CONSULTING_THEME],
  [SANTE_THEME.sector, SANTE_THEME],
  [FORMATION_THEME.sector, FORMATION_THEME],
])

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

/**
 * Get the full theme configuration for a sector.
 * Falls back to BEAUTE theme (the original Cosmika design) when unknown.
 */
export function getThemeConfig(sector: string | undefined | null): ThemeConfig {
  if (!sector) return BEAUTE_THEME
  return THEME_MAP.get(sector) ?? BEAUTE_THEME
}

/**
 * Get the color palette for a sector.
 */
export function getThemeColors(sector: string | undefined | null): ThemeColors {
  return getThemeConfig(sector).colors
}

/**
 * Get default hero content for a sector.
 */
export function getThemeHero(sector: string | undefined | null): ThemeHero {
  return getThemeConfig(sector).hero
}

/**
 * Get default trust badges for a sector.
 */
export function getThemeTrustBadges(sector: string | undefined | null): ThemeTrustBadge[] {
  return getThemeConfig(sector).defaultTrustBadges
}