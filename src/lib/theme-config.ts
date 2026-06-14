/**
 * theme-config.ts — Visual theme configuration per sector.
 *
 * This extends sector-config.ts (which owns labels, CTA text, pricing rules)
 * with the VISUAL layer: colors, hero defaults, trust badges, and category styling.
 *
 * Two template engines:
 *   - COSMIKA  → used by beaute, mode, alimentation, autre, beaute-service, restaurant,
 *                consulting, sante, formation
 *   - ELECTRO  → used by electronique, auto-moto, quincaillerie, artisanat
 *
 * The templates read BOTH files:
 *   - sector-config.ts  → labels, CTA button text, WhatsApp messages, showPrice
 *   - theme-config.ts   → colors, hero defaults, trust badges, product card mode
 */

import type { BusinessType } from './sector-config'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ThemeColors {
  /** Primary accent color (used for borders, glows, active states) */
  primary: string
  /** Darker variant for hover states */
  primaryDark: string
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
  /** Main text color */
  text: string
  /** Background color */
  background: string
  /** Dark overlay for hero sections */
  heroOverlay: string
}

export interface ApproachStep {
  number: string
  title: string
  description: string
  icon: string
}

export interface WhyChooseUs {
  icon: string
  title: string
  description: string
}

export interface ThemeHero {
  defaultTitle: string
  defaultSubtitle: string
  defaultTagline: string
  /** Whether the hero uses a dark overlay (dark bg) or light bg */
  darkMode: boolean
  /** Show a consultant photo on the right side of the hero (consulting sector) */
  showConsultantPhoto?: boolean
}

export interface ThemeTrustBadge {
  emoji: string
  title: string
  subtitle: string
  order: number
}

/**
 * Determines how the product/service card is displayed.
 * - 'specs': E-commerce with tech specs (RAM, Storage, etc.) — Tech sector
 * - 'compat': E-commerce with compatibility/category info — Auto-Moto, Quincaillerie
 * - 'service': Service mode — no price, shows zone, "Demander un devis"
 * - 'price': Standard e-commerce price display — generic fallback
 */
export type ElectroCardMode = 'specs' | 'compat' | 'service' | 'price'

export interface ThemeConfig {
  /** Which sector this config targets */
  sector: string
  /** ECOMMERCE or SERVICE */
  businessType: BusinessType
  /** Which template engine this config belongs to */
  engine: 'cosmika' | 'electro'
  /** Color palette for the template */
  colors: ThemeColors
  /** Default hero content when shop hasn't customised it */
  hero: ThemeHero
  /** Default trust badges when shop hasn't customised them */
  defaultTrustBadges: ThemeTrustBadge[]
  /** (Electro only) How product/service cards should render */
  cardMode: ElectroCardMode
  /** (Electro only) Navigation labels */
  navLabels: {
    /** Main catalog link label — "Produits", "Pièces", "Services", etc. */
    catalog: string
    /** Secondary link — "Catégories" or "Nos rayons" etc. */
    categories: string
  }
  /** (Electro only) Hero CTA button label */
  heroCtaText: string
  /** (Electro only) Whether to show the search bar in header */
  showSearch: boolean
  /** (Electro only) Section heading for the products/services grid */
  productsSectionTitle: string
  /** (Cosmika Consulting) Approach steps — Diagnostic, Stratégie, Accompagnement */
  approachSteps?: ApproachStep[]
  /** (Cosmika Consulting) Why choose us — key differentiators */
  whyChooseUs?: WhyChooseUs[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// COSMIKA SECTORS
// ═══════════════════════════════════════════════════════════════════════════════

const BEAUTE_THEME: ThemeConfig = {
  sector: 'beaute',
  businessType: 'ECOMMERCE',
  engine: 'cosmika',
  colors: {
    primary: '#E11D48',
    primaryDark: '#BE123C',
    primaryLight: '#FECDD3',
    primaryBg: '#FFF1F2',
    secondary: '#F59E0B',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#FFFFFF',
    heroOverlay: 'rgba(0,0,0,0.5)',
  },
  hero: {
    defaultTitle: 'GLAMOUR SHINE',
    defaultSubtitle: 'Découvrez notre nouvelle collection de cosmétiques premium',
    defaultTagline: 'ILLUMINATE DAILY',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '🚚', title: 'Livraison 24h', subtitle: 'Partout au Sénégal', order: 0 },
    { emoji: '💵', title: 'Paiement Mobile Money', subtitle: 'Orange Money, Wave…', order: 1 },
    { emoji: '🔄', title: 'Retour facile', subtitle: 'Satisfait ou remboursé', order: 2 },
    { emoji: '📱', title: 'Support WhatsApp', subtitle: 'Réponse rapide', order: 3 },
  ],
  cardMode: 'price',
  navLabels: { catalog: 'Produits', categories: 'Catégories' },
  heroCtaText: 'Découvrir',
  showSearch: false,
  productsSectionTitle: 'Nos Produits',
}

const MODE_THEME: ThemeConfig = {
  sector: 'mode',
  businessType: 'ECOMMERCE',
  engine: 'cosmika',
  colors: {
    primary: '#DB2777',
    primaryDark: '#BE185D',
    primaryLight: '#FBCFE8',
    primaryBg: '#FDF2F8',
    secondary: '#A855F7',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#FFFFFF',
    heroOverlay: 'rgba(0,0,0,0.5)',
  },
  hero: {
    defaultTitle: 'STYLE & ÉLÉGANCE',
    defaultSubtitle: 'Découvrez les dernières tendances de la saison',
    defaultTagline: 'NEW COLLECTION',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '🚚', title: 'Livraison Express', subtitle: 'Délai 48-72h', order: 0 },
    { emoji: '👗', title: 'Tendances Actuelles', subtitle: 'Collections fraîches', order: 1 },
    { emoji: '🔄', title: 'Échange Gratuit', subtitle: 'Sous 7 jours', order: 2 },
    { emoji: '💬', title: 'Conseil Style', subtitle: 'Via WhatsApp', order: 3 },
  ],
  cardMode: 'price',
  navLabels: { catalog: 'Boutique', categories: 'Collections' },
  heroCtaText: 'Voir la collection',
  showSearch: false,
  productsSectionTitle: 'Nos Produits',
}

const ALIMENTATION_THEME: ThemeConfig = {
  sector: 'alimentation',
  businessType: 'ECOMMERCE',
  engine: 'cosmika',
  colors: {
    primary: '#D97706',
    primaryDark: '#B45309',
    primaryLight: '#FDE68A',
    primaryBg: '#FFFBEB',
    secondary: '#EA580C',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#FFFFFF',
    heroOverlay: 'rgba(0,0,0,0.5)',
  },
  hero: {
    defaultTitle: "SAVEURS D'ICI",
    defaultSubtitle: 'Produits locaux soigneusement sélectionnés pour votre table',
    defaultTagline: 'QUALITÉ & FRAÎCHEUR',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '🌿', title: 'Produits Locaux', subtitle: 'Frais et naturels', order: 0 },
    { emoji: '🚚', title: 'Livraison Rapide', subtitle: 'Réfrigérée si besoin', order: 1 },
    { emoji: '✅', title: 'Qualité Garantie', subtitle: 'Sélection rigoureuse', order: 2 },
    { emoji: '💳', title: 'Paiement Flexible', subtitle: 'Cash ou Mobile Money', order: 3 },
  ],
  cardMode: 'price',
  navLabels: { catalog: 'Nos Produits', categories: 'Rayons' },
  heroCtaText: 'Commander',
  showSearch: false,
  productsSectionTitle: 'Nos Produits',
}

const AUTRE_ECOMMERCE_THEME: ThemeConfig = {
  sector: 'autre',
  businessType: 'ECOMMERCE',
  engine: 'cosmika',
  colors: {
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    primaryLight: '#DDD6FE',
    primaryBg: '#F5F3FF',
    secondary: '#6366F1',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#FFFFFF',
    heroOverlay: 'rgba(0,0,0,0.5)',
  },
  hero: {
    defaultTitle: 'BIENVENUE CHEZ NOUS',
    defaultSubtitle: 'Découvrez notre sélection de produits pour vous',
    defaultTagline: 'EXCEPTIONNEL',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '🚚', title: 'Livraison Disponible', subtitle: 'Sur demande', order: 0 },
    { emoji: '💳', title: 'Paiement Sécurisé', subtitle: 'Mobile Money & Cash', order: 1 },
    { emoji: '⭐', title: 'Qualité Premium', subtitle: 'Produits sélectionnés', order: 2 },
    { emoji: '💬', title: 'Support Réactif', subtitle: 'Via WhatsApp', order: 3 },
  ],
  cardMode: 'price',
  navLabels: { catalog: 'Produits', categories: 'Catégories' },
  heroCtaText: 'Découvrir',
  showSearch: false,
  productsSectionTitle: 'Nos Produits',
}

const BEAUTE_SERVICE_THEME: ThemeConfig = {
  sector: 'beaute-service',
  businessType: 'SERVICE',
  engine: 'cosmika',
  colors: {
    primary: '#DB2777',
    primaryDark: '#BE185D',
    primaryLight: '#F9A8D4',
    primaryBg: '#FDF2F8',
    secondary: '#A855F7',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#FFFFFF',
    heroOverlay: 'rgba(0,0,0,0.5)',
  },
  hero: {
    defaultTitle: 'VOTRE BEAUTÉ, NOTRE PASSION',
    defaultSubtitle: 'Prestations de qualité dans un cadre raffiné et chaleureux',
    defaultTagline: 'BIEN-ÊTRE & SOIN',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '💇', title: 'Stylistes Certifiés', subtitle: 'Formation continue', order: 0 },
    { emoji: '✨', title: 'Produits Premium', subtitle: 'Marques reconnues', order: 1 },
    { emoji: '🕐', title: 'RDV Flexible', subtitle: '7j/7 sur réservation', order: 2 },
    { emoji: '💆', title: 'Cadre Relaxant', subtitle: 'Votre bien-être d\'abord', order: 3 },
  ],
  cardMode: 'price',
  navLabels: { catalog: 'Prestations', categories: 'Soins' },
  heroCtaText: 'Réserver',
  showSearch: false,
  productsSectionTitle: 'Nos Prestations',
}

const RESTAURANT_THEME: ThemeConfig = {
  sector: 'restaurant',
  businessType: 'SERVICE',
  engine: 'cosmika',
  colors: {
    primary: '#EA580C',
    primaryDark: '#C2410C',
    primaryLight: '#FDBA74',
    primaryBg: '#FFF7ED',
    secondary: '#B45309',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#FFFFFF',
    heroOverlay: 'rgba(0,0,0,0.5)',
  },
  hero: {
    defaultTitle: 'SAVEURS AUTHENTIQUES',
    defaultSubtitle: 'Une expérience culinaire unique au cœur de la ville',
    defaultTagline: 'GOÛT & TRADITION',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '🍽️', title: 'Produits Frais', subtitle: 'Ingrédients locaux', order: 0 },
    { emoji: '👨‍🍳', title: 'Chef Expérimenté', subtitle: '10 ans de passion', order: 1 },
    { emoji: '🚚', title: 'Livraison Rapide', subtitle: '30 min max', order: 2 },
    { emoji: '💬', title: 'Réservation Facile', subtitle: 'Via WhatsApp', order: 3 },
  ],
  cardMode: 'price',
  navLabels: { catalog: 'La Carte', categories: 'Catégories' },
  heroCtaText: 'Commander',
  showSearch: false,
  productsSectionTitle: 'Notre Carte',
}

const CONSULTING_THEME: ThemeConfig = {
  sector: 'consulting',
  businessType: 'SERVICE',
  engine: 'cosmika',
  colors: {
    primary: '#1e40af',
    primaryDark: '#1e3a8a',
    primaryLight: '#93C5FD',
    primaryBg: '#EFF6FF',
    secondary: '#64748b',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#FFFFFF',
    heroOverlay: 'rgba(0,0,0,0.5)',
  },
  hero: {
    defaultTitle: 'EXPERTISE & CONSEIL',
    defaultSubtitle: 'Accompagnement professionnel pour booster votre activité',
    defaultTagline: 'PERFORMANCE & RÉSULTATS',
    darkMode: true,
    showConsultantPhoto: true,
  },
  defaultTrustBadges: [
    { emoji: '🏆', title: "10 ans d'Expérience", subtitle: 'Expertise reconnue', order: 0 },
    { emoji: '👥', title: '50+ Clients Satisfaits', subtitle: 'Témoignages vérifiés', order: 1 },
    { emoji: '📊', title: 'Méthodologie Éprouvée', subtitle: 'Résultats mesurables', order: 2 },
    { emoji: '🎯', title: 'Support Dédié', subtitle: 'Suivi personnalisé', order: 3 },
  ],
  cardMode: 'price',
  navLabels: { catalog: 'Services', categories: 'Expertises' },
  heroCtaText: 'Demander un devis',
  showSearch: false,
  productsSectionTitle: 'Nos Services',
  approachSteps: [
    {
      number: '01',
      title: 'Diagnostic',
      description: 'Analyse complète de votre situation actuelle et identification des enjeux.',
      icon: '🔍',
    },
    {
      number: '02',
      title: 'Stratégie',
      description: "Élaboration d'un plan d'action sur mesure avec objectifs mesurables.",
      icon: '📋',
    },
    {
      number: '03',
      title: 'Accompagnement',
      description: 'Mise en œuvre et suivi régulier pour garantir les résultats.',
      icon: '🚀',
    },
  ],
  whyChooseUs: [
    {
      icon: '✅',
      title: 'Expertise Reconnue',
      description: "Plus de 10 ans d'expérience dans le conseil aux entreprises.",
    },
    {
      icon: '🎯',
      title: 'Résultats Concrets',
      description: 'Méthodologie éprouvée avec des KPIs mesurables à chaque étape.',
    },
    {
      icon: '🤝',
      title: 'Approche Personnalisée',
      description: 'Chaque mission est adaptée à vos enjeux spécifiques.',
    },
    {
      icon: '⚡',
      title: 'Réactivité',
      description: 'Réponse sous 24h et disponibilité pour vos urgences.',
    },
  ],
}

const SANTE_THEME: ThemeConfig = {
  sector: 'sante',
  businessType: 'SERVICE',
  engine: 'cosmika',
  colors: {
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#6EE7B7',
    primaryBg: '#ECFDF5',
    secondary: '#14B8A6',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#FFFFFF',
    heroOverlay: 'rgba(0,0,0,0.5)',
  },
  hero: {
    defaultTitle: 'SANTÉ & BIEN-ÊTRE',
    defaultSubtitle: 'Des soins de qualité pour votre santé au quotidien',
    defaultTagline: 'SOINS PROFESSIONNELS',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '🏥', title: 'Personnel Qualifié', subtitle: 'Professionnels certifiés', order: 0 },
    { emoji: '💊', title: 'Produits Fiables', subtitle: 'Médicaments authentiques', order: 1 },
    { emoji: '🕐', title: 'Disponible 7j/7', subtitle: 'Urgences incluses', order: 2 },
    { emoji: '🤝', title: 'Suivi Personnalisé', subtitle: 'Confidentialité garantie', order: 3 },
  ],
  cardMode: 'price',
  navLabels: { catalog: 'Soins', categories: 'Spécialités' },
  heroCtaText: 'Prendre RDV',
  showSearch: false,
  productsSectionTitle: 'Nos Soins',
}

const FORMATION_THEME: ThemeConfig = {
  sector: 'formation',
  businessType: 'SERVICE',
  engine: 'cosmika',
  colors: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#93C5FD',
    primaryBg: '#EFF6FF',
    secondary: '#7C3AED',
    ctaBg: '#000000',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#FFFFFF',
    heroOverlay: 'rgba(0,0,0,0.5)',
  },
  hero: {
    defaultTitle: 'FORMEZ-VOUS AVANTAGEUSEMENT',
    defaultSubtitle: 'Programmes conçus par des experts pour votre réussite',
    defaultTagline: 'EXPERTISE & CARRIÈRE',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '🎓', title: 'Certifiants', subtitle: 'Diplômes reconnus', order: 0 },
    { emoji: '👨‍🏫', title: 'Experts Formateurs', subtitle: 'Praticiens expérimentés', order: 1 },
    { emoji: '📱', title: 'Accès Mobile', subtitle: 'Apprenez partout', order: 2 },
    { emoji: '💼', title: 'Débouchés', subtitle: 'Réseau professionnel', order: 3 },
  ],
  cardMode: 'price',
  navLabels: { catalog: 'Formations', categories: 'Domaines' },
  heroCtaText: "S'inscrire",
  showSearch: false,
  productsSectionTitle: 'Nos Formations',
}

// ═══════════════════════════════════════════════════════════════════════════════
// ELECTRO SECTORS
// ═══════════════════════════════════════════════════════════════════════════════

const ELECTRONIQUE_THEME: ThemeConfig = {
  sector: 'electronique',
  businessType: 'ECOMMERCE',
  engine: 'electro',
  colors: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    primaryLight: '#93C5FD',
    primaryBg: '#EFF6FF',
    secondary: '#111827',
    ctaBg: '#2563EB',
    ctaText: '#FFFFFF',
    text: '#111827',
    background: '#F9FAFB',
    heroOverlay: 'linear-gradient(135deg, rgba(17,24,39,0.88) 0%, rgba(37,99,235,0.75) 100%)',
  },
  hero: {
    defaultTitle: 'Le Meilleur de la Tech',
    defaultSubtitle: 'Smartphones, PC et gadgets au meilleur prix',
    defaultTagline: 'INNOVATION & PERFORMANCE',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '🛡️', title: 'Garantie 1 an', subtitle: 'Sur tous nos produits', order: 0 },
    { emoji: '🚚', title: 'Livraison Express', subtitle: 'Partout dans le pays', order: 1 },
    { emoji: '🔧', title: 'SAV Réactif', subtitle: 'Support technique inclus', order: 2 },
    { emoji: '💳', title: 'Paiement Sécurisé', subtitle: 'Mobile Money & Cash', order: 3 },
  ],
  cardMode: 'specs',
  navLabels: { catalog: 'Nos Produits', categories: 'Catégories' },
  heroCtaText: 'Voir les offres',
  showSearch: true,
  productsSectionTitle: 'Nos Produits',
}

const AUTO_MOTO_THEME: ThemeConfig = {
  sector: 'auto-moto',
  businessType: 'ECOMMERCE',
  engine: 'electro',
  colors: {
    primary: '#DC2626',
    primaryDark: '#B91C1C',
    primaryLight: '#FCA5A5',
    primaryBg: '#FEF2F2',
    secondary: '#1F2937',
    ctaBg: '#DC2626',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#F9FAFB',
    heroOverlay: 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(220,38,38,0.7) 100%)',
  },
  hero: {
    defaultTitle: 'Pièces Auto & Moto de Qualité',
    defaultSubtitle: 'Pièces détachées, accessoires et entretien pour votre véhicule',
    defaultTagline: 'FIABILITÉ & PERFORMANCE',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '✅', title: 'Pièces Certifiées', subtitle: 'Originales et compatibles', order: 0 },
    { emoji: '🔧', title: 'Compatibilité Garantie', subtitle: 'Vérifiée avant envoi', order: 1 },
    { emoji: '🚚', title: 'Livraison Rapide', subtitle: 'Partout dans le pays', order: 2 },
    { emoji: '💬', title: 'Conseil Expert', subtitle: 'Via WhatsApp', order: 3 },
  ],
  cardMode: 'compat',
  navLabels: { catalog: 'Pièces', categories: 'Catégories' },
  heroCtaText: 'Trouver ma pièce',
  showSearch: true,
  productsSectionTitle: 'Nos Pièces',
}

const QUINCAILLERIE_THEME: ThemeConfig = {
  sector: 'quincaillerie',
  businessType: 'ECOMMERCE',
  engine: 'electro',
  colors: {
    primary: '#D97706',
    primaryDark: '#B45309',
    primaryLight: '#FDE68A',
    primaryBg: '#FFFBEB',
    secondary: '#1F2937',
    ctaBg: '#D97706',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#F9FAFB',
    heroOverlay: 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(217,119,6,0.7) 100%)',
  },
  hero: {
    defaultTitle: 'Tout pour le Bricolage',
    defaultSubtitle: 'Outils, matériaux et quincaillerie pour tous vos projets',
    defaultTagline: 'QUALITÉ & DURABILITÉ',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '🔨', title: 'Outils Professionnels', subtitle: 'Marques de confiance', order: 0 },
    { emoji: '📦', title: 'Stock Disponible', subtitle: 'Livraison immédiate', order: 1 },
    { emoji: '🚚', title: 'Livraison Rapide', subtitle: 'Sur tous vos chantiers', order: 2 },
    { emoji: '💎', title: 'Prix Compétitifs', subtitle: 'Meilleur rapport qualité', order: 3 },
  ],
  cardMode: 'compat',
  navLabels: { catalog: 'Articles', categories: 'Rayons' },
  heroCtaText: 'Voir le catalogue',
  showSearch: true,
  productsSectionTitle: 'Nos Articles',
}

const ARTISANAT_THEME: ThemeConfig = {
  sector: 'artisanat',
  businessType: 'SERVICE',
  engine: 'electro',
  colors: {
    primary: '#F59E0B',
    primaryDark: '#D97706',
    primaryLight: '#FDE68A',
    primaryBg: '#FFFBEB',
    secondary: '#1E3A8A',
    ctaBg: '#F59E0B',
    ctaText: '#FFFFFF',
    text: '#1F2937',
    background: '#F9FAFB',
    heroOverlay: 'linear-gradient(135deg, rgba(17,24,39,0.92) 0%, rgba(245,158,11,0.75) 100%)',
  },
  hero: {
    defaultTitle: 'Artisans Qualifiés à Votre Service',
    defaultSubtitle: 'Plomberie, électricité, rénovation — professionnels de confiance',
    defaultTagline: 'SAVOIR-FAIRE & CONFIANCE',
    darkMode: true,
  },
  defaultTrustBadges: [
    { emoji: '👷', title: 'Artisans Certifiés', subtitle: 'Expérience vérifiée', order: 0 },
    { emoji: '📝', title: 'Devis Gratuit', subtitle: 'Sans engagement', order: 1 },
    { emoji: '🛡️', title: 'Travaux Assurés', subtitle: 'Garantie satisfaction', order: 2 },
    { emoji: '📍', title: 'Intervention Rapide', subtitle: 'Zone élargie', order: 3 },
  ],
  cardMode: 'service',
  navLabels: { catalog: 'Services', categories: 'Nos Travaux' },
  heroCtaText: 'Demander un devis',
  showSearch: true,
  productsSectionTitle: 'Nos Services',
}

// ─── REGISTRY & LOOKUP ──────────────────────────────────────────────────────

const THEME_MAP = new Map<string, ThemeConfig>([
  // Cosmika sectors
  [BEAUTE_THEME.sector, BEAUTE_THEME],
  [MODE_THEME.sector, MODE_THEME],
  [ALIMENTATION_THEME.sector, ALIMENTATION_THEME],
  [AUTRE_ECOMMERCE_THEME.sector, AUTRE_ECOMMERCE_THEME],
  [BEAUTE_SERVICE_THEME.sector, BEAUTE_SERVICE_THEME],
  [RESTAURANT_THEME.sector, RESTAURANT_THEME],
  [CONSULTING_THEME.sector, CONSULTING_THEME],
  [SANTE_THEME.sector, SANTE_THEME],
  [FORMATION_THEME.sector, FORMATION_THEME],
  // Electro sectors
  [ELECTRONIQUE_THEME.sector, ELECTRONIQUE_THEME],
  [AUTO_MOTO_THEME.sector, AUTO_MOTO_THEME],
  [QUINCAILLERIE_THEME.sector, QUINCAILLERIE_THEME],
  [ARTISANAT_THEME.sector, ARTISANAT_THEME],
])

/** Default fallback when no sector matches — uses the original Cosmika beauty look */
const DEFAULT_COSMIKA_FALLBACK = BEAUTE_THEME
/** Default fallback for Electro template when sector is unknown */
const DEFAULT_ELECTRO_FALLBACK = ELECTRONIQUE_THEME

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

/**
 * Get the full theme configuration for a sector.
 * When `engine` hint is provided, uses the appropriate fallback for unknown sectors.
 */
export function getThemeConfig(
  sector: string | undefined | null,
  engine?: 'cosmika' | 'electro'
): ThemeConfig {
  if (!sector) {
    return engine === 'electro' ? DEFAULT_ELECTRO_FALLBACK : DEFAULT_COSMIKA_FALLBACK
  }
  const found = THEME_MAP.get(sector)
  if (found) return found
  return engine === 'electro' ? DEFAULT_ELECTRO_FALLBACK : DEFAULT_COSMIKA_FALLBACK
}

/**
 * Get the color palette for a sector.
 */
export function getThemeColors(
  sector: string | undefined | null,
  engine?: 'cosmika' | 'electro'
): ThemeColors {
  return getThemeConfig(sector, engine).colors
}

/**
 * Get default hero content for a sector.
 */
export function getThemeHero(
  sector: string | undefined | null,
  engine?: 'cosmika' | 'electro'
): ThemeHero {
  return getThemeConfig(sector, engine).hero
}

/**
 * Get default trust badges for a sector.
 */
export function getThemeTrustBadges(
  sector: string | undefined | null,
  engine?: 'cosmika' | 'electro'
): ThemeTrustBadge[] {
  return getThemeConfig(sector, engine).defaultTrustBadges
}

/**
 * Get the electro card display mode for a sector.
 */
export function getElectroCardMode(sector: string | undefined | null): ElectroCardMode {
  return getThemeConfig(sector, 'electro').cardMode
}

/**
 * Check if a sector uses the Electro template engine.
 */
export function isElectroSector(sector: string | undefined | null): boolean {
  if (!sector) return false
  const config = THEME_MAP.get(sector)
  return config?.engine === 'electro'
}