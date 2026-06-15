/**
 * sector-config.ts — Single source of truth for ALL sector-related configuration.
 * Used by: onboarding flow, dashboard labels, storefront templates.
 *
 * Each sector defines:
 *  - Display metadata (emoji, name, subtitle)
 *  - Which template engine to use (COSMIKA or ELECTRO)
 *  - Default categories to auto-create
 *  - Dashboard/UI labels (nav, products, categories, orders, stats)
 *  - CTA text for storefront (button on product/service cards)
 *  - Color accent for the template
 */

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export type BusinessType = 'ECOMMERCE' | 'SERVICE'
export type TemplateEngine = 'cosmika-beauty' | 'xstore-electro' | 'elegance-plus'

export type EcommerceSector = 'beaute' | 'mode' | 'electronique' | 'alimentation' | 'autre' | 'auto-moto' | 'quincaillerie'
export type ServiceSector = 'beaute-service' | 'restaurant' | 'consulting' | 'artisanat' | 'sante' | 'formation'
export type Sector = EcommerceSector | ServiceSector

// ─── LABEL INTERFACES ────────────────────────────────────────────────────────

export interface SectorLabels {
  /** Navigation sidebar */
  navProducts: string
  navCategories: string
  navOrders: string

  /** Page titles & headings */
  productsTitle: string
  productsAddButton: string
  productsEmpty: string
  productsSearch: string
  categoriesTitle: string
  categoriesAddButton: string
  categoriesEmpty: string
  ordersTitle: string
  ordersEmpty: string

  /** Form field labels */
  productLabel: string
  productDescriptionPlaceholder: string
  categoryLabel: string

  /** Overview stats */
  statProducts: string
  statOrders: string

  /** Price display */
  showPrice: boolean
  priceLabel: string
  pricePlaceholder: string
  priceOptional: boolean

  /** Storefront CTA */
  ctaButton: string
  ctaWhatsAppMessage: string
}

// ─── SECTOR DEFINITION ───────────────────────────────────────────────────────

export interface SectorDefinition {
  id: Sector
  businessType: BusinessType
  emoji: string
  name: string
  subtitle: string
  template: TemplateEngine
  accentColor: string
  defaultCategories: string[]
  labels: SectorLabels
}

// ─── ECOMMERCE SECTORS ───────────────────────────────────────────────────────

const BEAUTE_LABELS: SectorLabels = {
  navProducts: 'Produits Beauté',
  navCategories: 'Catégories Beauté',
  navOrders: 'Commandes',
  productsTitle: 'Produits Beauté',
  productsAddButton: 'Ajouter un produit',
  productsEmpty: 'Aucun produit beauté pour le moment',
  productsSearch: 'Rechercher un produit...',
  categoriesTitle: 'Catégories',
  categoriesAddButton: 'Ajouter une catégorie',
  categoriesEmpty: 'Aucune catégorie pour le moment',
  ordersTitle: 'Commandes',
  ordersEmpty: 'Aucune commande pour le moment',
  productLabel: 'Produit',
  productDescriptionPlaceholder: 'Décrivez votre produit (ingrédients, bienfaits)...',
  categoryLabel: 'Catégorie',
  statProducts: 'Produits',
  statOrders: 'Commandes',
  showPrice: true,
  priceLabel: 'Prix (FCFA)',
  pricePlaceholder: 'Ex: 5000',
  priceOptional: false,
  ctaButton: 'Commander sur WhatsApp',
  ctaWhatsAppMessage: "Bonjour, je souhaite commander : {productName} - {productPrice} FCFA",
}

const MODE_LABELS: SectorLabels = {
  navProducts: 'Articles Mode',
  navCategories: 'Collections',
  navOrders: 'Commandes',
  productsTitle: 'Articles Mode',
  productsAddButton: 'Ajouter un article',
  productsEmpty: 'Aucun article mode pour le moment',
  productsSearch: 'Rechercher un article...',
  categoriesTitle: 'Collections',
  categoriesAddButton: 'Ajouter une collection',
  categoriesEmpty: 'Aucune collection pour le moment',
  ordersTitle: 'Commandes',
  ordersEmpty: 'Aucune commande pour le moment',
  productLabel: 'Article',
  productDescriptionPlaceholder: 'Décrivez votre article (taille, matière, coupe)...',
  categoryLabel: 'Collection',
  statProducts: 'Articles',
  statOrders: 'Commandes',
  showPrice: true,
  priceLabel: 'Prix (FCFA)',
  pricePlaceholder: 'Ex: 15000',
  priceOptional: false,
  ctaButton: 'Commander sur WhatsApp',
  ctaWhatsAppMessage: "Bonjour, je souhaite commander : {productName} - {productPrice} FCFA",
}

const ELECTRONIQUE_LABELS: SectorLabels = {
  navProducts: 'Produits Tech',
  navCategories: 'Catégories Tech',
  navOrders: 'Commandes',
  productsTitle: 'Produits Tech',
  productsAddButton: 'Ajouter un produit',
  productsEmpty: 'Aucun produit tech pour le moment',
  productsSearch: 'Rechercher un produit...',
  categoriesTitle: 'Catégories',
  categoriesAddButton: 'Ajouter une catégorie',
  categoriesEmpty: 'Aucune catégorie pour le moment',
  ordersTitle: 'Commandes',
  ordersEmpty: 'Aucune commande pour le moment',
  productLabel: 'Produit',
  productDescriptionPlaceholder: 'Décrivez le produit (marque, caractéristiques)...',
  categoryLabel: 'Catégorie',
  statProducts: 'Produits',
  statOrders: 'Commandes',
  showPrice: true,
  priceLabel: 'Prix (FCFA)',
  pricePlaceholder: 'Ex: 50000',
  priceOptional: false,
  ctaButton: 'Commander sur WhatsApp',
  ctaWhatsAppMessage: "Bonjour, je souhaite commander : {productName} - {productPrice} FCFA",
}

const ALIMENTATION_LABELS: SectorLabels = {
  navProducts: 'Produits Alimentaires',
  navCategories: 'Rayons',
  navOrders: 'Commandes',
  productsTitle: 'Produits Alimentaires',
  productsAddButton: 'Ajouter un produit',
  productsEmpty: 'Aucun produit alimentaire pour le moment',
  productsSearch: 'Rechercher un produit...',
  categoriesTitle: 'Rayons',
  categoriesAddButton: 'Ajouter un rayon',
  categoriesEmpty: 'Aucun rayon pour le moment',
  ordersTitle: 'Commandes',
  ordersEmpty: 'Aucune commande pour le moment',
  productLabel: 'Produit',
  productDescriptionPlaceholder: 'Décrivez le produit (poids, ingrédients, conservation)...',
  categoryLabel: 'Rayon',
  statProducts: 'Produits',
  statOrders: 'Commandes',
  showPrice: true,
  priceLabel: 'Prix (FCFA)',
  pricePlaceholder: 'Ex: 2500',
  priceOptional: false,
  ctaButton: 'Commander sur WhatsApp',
  ctaWhatsAppMessage: "Bonjour, je souhaite commander : {productName} - {productPrice} FCFA",
}

const AUTO_MOTO_LABELS: SectorLabels = {
  navProducts: 'Pièces & Accessoires',
  navCategories: 'Catégories Pièces',
  navOrders: 'Commandes',
  productsTitle: 'Pièces & Accessoires',
  productsAddButton: 'Ajouter une pièce',
  productsEmpty: 'Aucune pièce disponible pour le moment',
  productsSearch: 'Rechercher une pièce...',
  categoriesTitle: 'Catégories',
  categoriesAddButton: 'Ajouter une catégorie',
  categoriesEmpty: 'Aucune catégorie pour le moment',
  ordersTitle: 'Commandes',
  ordersEmpty: 'Aucune commande pour le moment',
  productLabel: 'Pièce',
  productDescriptionPlaceholder: 'Décrivez la pièce (marque, compatibilité, référence)...',
  categoryLabel: 'Catégorie',
  statProducts: 'Pièces',
  statOrders: 'Commandes',
  showPrice: true,
  priceLabel: 'Prix (FCFA)',
  pricePlaceholder: 'Ex: 15000',
  priceOptional: false,
  ctaButton: 'Commander la pièce',
  ctaWhatsAppMessage: "Bonjour, je souhaite commander cette pièce : {productName} - {productPrice} FCFA",
}

const QUINCAILLERIE_LABELS: SectorLabels = {
  navProducts: 'Articles Bricolage',
  navCategories: 'Rayons',
  navOrders: 'Commandes',
  productsTitle: 'Articles Bricolage',
  productsAddButton: 'Ajouter un article',
  productsEmpty: 'Aucun article disponible pour le moment',
  productsSearch: 'Rechercher un article...',
  categoriesTitle: 'Rayons',
  categoriesAddButton: 'Ajouter un rayon',
  categoriesEmpty: 'Aucun rayon pour le moment',
  ordersTitle: 'Commandes',
  ordersEmpty: 'Aucune commande pour le moment',
  productLabel: 'Article',
  productDescriptionPlaceholder: 'Décrivez l\'article (matériau, dimensions, usage)...',
  categoryLabel: 'Rayon',
  statProducts: 'Articles',
  statOrders: 'Commandes',
  showPrice: true,
  priceLabel: 'Prix (FCFA)',
  pricePlaceholder: 'Ex: 3500',
  priceOptional: false,
  ctaButton: 'Commander sur WhatsApp',
  ctaWhatsAppMessage: "Bonjour, je souhaite commander : {productName} - {productPrice} FCFA",
}

const AUTRE_ECOMMERCE_LABELS: SectorLabels = {
  navProducts: 'Produits',
  navCategories: 'Catégories',
  navOrders: 'Commandes',
  productsTitle: 'Produits',
  productsAddButton: 'Ajouter un produit',
  productsEmpty: 'Aucun produit pour le moment',
  productsSearch: 'Rechercher un produit...',
  categoriesTitle: 'Catégories',
  categoriesAddButton: 'Ajouter une catégorie',
  categoriesEmpty: 'Aucune catégorie pour le moment',
  ordersTitle: 'Commandes',
  ordersEmpty: 'Aucune commande pour le moment',
  productLabel: 'Produit',
  productDescriptionPlaceholder: 'Décrivez votre produit...',
  categoryLabel: 'Catégorie',
  statProducts: 'Produits',
  statOrders: 'Commandes',
  showPrice: true,
  priceLabel: 'Prix (FCFA)',
  pricePlaceholder: 'Ex: 5000',
  priceOptional: false,
  ctaButton: 'Commander sur WhatsApp',
  ctaWhatsAppMessage: "Bonjour, je souhaite commander : {productName} - {productPrice} FCFA",
}

// ─── SERVICE SECTORS ─────────────────────────────────────────────────────────

const BEAUTE_SERVICE_LABELS: SectorLabels = {
  navProducts: 'Prestations',
  navCategories: 'Types de soins',
  navOrders: 'Réservations',
  productsTitle: 'Prestations',
  productsAddButton: 'Ajouter une prestation',
  productsEmpty: 'Aucune prestation pour le moment',
  productsSearch: 'Rechercher une prestation...',
  categoriesTitle: 'Types de soins',
  categoriesAddButton: 'Ajouter un type',
  categoriesEmpty: 'Aucun type de soin pour le moment',
  ordersTitle: 'Réservations',
  ordersEmpty: 'Aucune réservation pour le moment',
  productLabel: 'Prestation',
  productDescriptionPlaceholder: 'Décrivez la prestation (durée, déroulement)...',
  categoryLabel: 'Type de soin',
  statProducts: 'Prestations',
  statOrders: 'Réservations',
  showPrice: false,
  priceLabel: 'Tarif indicatif (FCFA)',
  pricePlaceholder: 'Ex: 10000 (optionnel)',
  priceOptional: true,
  ctaButton: 'Réserver sur WhatsApp',
  ctaWhatsAppMessage: "Bonjour, je souhaite réserver : {productName}",
}

const RESTAURANT_LABELS: SectorLabels = {
  navProducts: 'Carte & Menus',
  navCategories: 'Catégories Plats',
  navOrders: 'Commandes',
  productsTitle: 'Carte & Menus',
  productsAddButton: 'Ajouter un plat',
  productsEmpty: 'Aucun plat pour le moment',
  productsSearch: 'Rechercher un plat...',
  categoriesTitle: 'Catégories Plats',
  categoriesAddButton: 'Ajouter une catégorie',
  categoriesEmpty: 'Aucune catégorie de plats pour le moment',
  ordersTitle: 'Commandes',
  ordersEmpty: 'Aucune commande pour le moment',
  productLabel: 'Plat',
  productDescriptionPlaceholder: 'Décrivez le plat (ingrédients, allergènes)...',
  categoryLabel: 'Catégorie',
  statProducts: 'Plats',
  statOrders: 'Commandes',
  showPrice: true,
  priceLabel: 'Prix (FCFA)',
  pricePlaceholder: 'Ex: 3000',
  priceOptional: false,
  ctaButton: 'Commander sur WhatsApp',
  ctaWhatsAppMessage: "Bonjour, je souhaite commander : {productName} - {productPrice} FCFA",
}

const CONSULTING_LABELS: SectorLabels = {
  navProducts: 'Services',
  navCategories: 'Types de services',
  navOrders: 'Demandes de devis',
  productsTitle: 'Services',
  productsAddButton: 'Ajouter un service',
  productsEmpty: 'Aucun service pour le moment',
  productsSearch: 'Rechercher un service...',
  categoriesTitle: 'Types de services',
  categoriesAddButton: 'Ajouter un type',
  categoriesEmpty: 'Aucun type de service pour le moment',
  ordersTitle: 'Demandes de devis',
  ordersEmpty: 'Aucune demande de devis pour le moment',
  productLabel: 'Service',
  productDescriptionPlaceholder: 'Décrivez le service (durée, livrables)...',
  categoryLabel: 'Type de service',
  statProducts: 'Services',
  statOrders: 'Devis',
  showPrice: false,
  priceLabel: 'Tarif indicatif (FCFA)',
  pricePlaceholder: 'Ex: 25000 (optionnel)',
  priceOptional: true,
  ctaButton: 'Demander un devis',
  ctaWhatsAppMessage: "Bonjour, je souhaite un devis pour : {productName}",
}

const ARTISANAT_LABELS: SectorLabels = {
  navProducts: 'Services',
  navCategories: 'Types de travaux',
  navOrders: 'Demandes de devis',
  productsTitle: 'Services',
  productsAddButton: 'Ajouter un service',
  productsEmpty: 'Aucun service pour le moment',
  productsSearch: 'Rechercher un service...',
  categoriesTitle: 'Types de travaux',
  categoriesAddButton: 'Ajouter un type',
  categoriesEmpty: 'Aucun type de travaux pour le moment',
  ordersTitle: 'Demandes de devis',
  ordersEmpty: 'Aucune demande de devis pour le moment',
  productLabel: 'Service',
  productDescriptionPlaceholder: 'Décrivez le service (matériaux, délais)...',
  categoryLabel: 'Type de travaux',
  statProducts: 'Services',
  statOrders: 'Devis',
  showPrice: false,
  priceLabel: 'Tarif indicatif (FCFA)',
  pricePlaceholder: 'Ex: 50000 (optionnel)',
  priceOptional: true,
  ctaButton: 'Demander un devis',
  ctaWhatsAppMessage: "Bonjour, je souhaite un devis pour : {productName}",
}

const SANTE_LABELS: SectorLabels = {
  navProducts: 'Soins & Services',
  navCategories: 'Spécialités',
  navOrders: 'Rendez-vous',
  productsTitle: 'Soins & Services',
  productsAddButton: 'Ajouter un soin',
  productsEmpty: 'Aucun soin pour le moment',
  productsSearch: 'Rechercher un soin...',
  categoriesTitle: 'Spécialités',
  categoriesAddButton: 'Ajouter une spécialité',
  categoriesEmpty: 'Aucune spécialité pour le moment',
  ordersTitle: 'Rendez-vous',
  ordersEmpty: 'Aucun rendez-vous pour le moment',
  productLabel: 'Soin',
  productDescriptionPlaceholder: 'Décrivez le soin (durée, prérequis)...',
  categoryLabel: 'Spécialité',
  statProducts: 'Soins',
  statOrders: 'RDV',
  showPrice: false,
  priceLabel: 'Tarif indicatif (FCFA)',
  pricePlaceholder: 'Ex: 15000 (optionnel)',
  priceOptional: true,
  ctaButton: 'Prendre RDV sur WhatsApp',
  ctaWhatsAppMessage: "Bonjour, je souhaite prendre rendez-vous pour : {productName}",
}

const FORMATION_LABELS: SectorLabels = {
  navProducts: 'Formations',
  navCategories: 'Domaines',
  navOrders: 'Inscriptions',
  productsTitle: 'Formations',
  productsAddButton: 'Ajouter une formation',
  productsEmpty: 'Aucune formation pour le moment',
  productsSearch: 'Rechercher une formation...',
  categoriesTitle: 'Domaines',
  categoriesAddButton: 'Ajouter un domaine',
  categoriesEmpty: 'Aucun domaine pour le moment',
  ordersTitle: 'Inscriptions',
  ordersEmpty: 'Aucune inscription pour le moment',
  productLabel: 'Formation',
  productDescriptionPlaceholder: 'Décrivez la formation (programme, durée, prérequis)...',
  categoryLabel: 'Domaine',
  statProducts: 'Formations',
  statOrders: 'Inscriptions',
  showPrice: false,
  priceLabel: 'Tarif indicatif (FCFA)',
  pricePlaceholder: 'Ex: 50000 (optionnel)',
  priceOptional: true,
  ctaButton: "S'inscrire sur WhatsApp",
  ctaWhatsAppMessage: "Bonjour, je souhaite m'inscrire à : {productName}",
}

// ─── FULL SECTOR REGISTRY ────────────────────────────────────────────────────

export const SECTORS: SectorDefinition[] = [
  // ── ECOMMERCE ──
  {
    id: 'beaute',
    businessType: 'ECOMMERCE',
    emoji: '💄',
    name: 'Beauté & Cosmétiques',
    subtitle: 'Maquillage, soins, parfums',
    template: 'cosmika-beauty',
    accentColor: '#EC4899',
    defaultCategories: ['Sérums', 'Crèmes', 'Maquillage', 'Soins', 'Parfums'],
    labels: BEAUTE_LABELS,
  },
  {
    id: 'mode',
    businessType: 'ECOMMERCE',
    emoji: '👗',
    name: 'Mode & Vêtements',
    subtitle: 'Vêtements, accessoires, chaussures',
    template: 'cosmika-beauty',
    accentColor: '#F472B6',
    defaultCategories: ['Robes', 'Accessoires', 'Chaussures', 'Hauts'],
    labels: MODE_LABELS,
  },
  {
    id: 'electronique',
    businessType: 'ECOMMERCE',
    emoji: '📱',
    name: 'Tech & Électronique',
    subtitle: 'Téléphones, accessoires, audio',
    template: 'xstore-electro',
    accentColor: '#10B981',
    defaultCategories: ['Téléphones', 'Accessoires', 'Ordinateurs', 'Audio'],
    labels: ELECTRONIQUE_LABELS,
  },
  {
    id: 'auto-moto',
    businessType: 'ECOMMERCE',
    emoji: '🚗',
    name: 'Auto & Moto',
    subtitle: 'Pièces détachées, accessoires, entretien',
    template: 'xstore-electro',
    accentColor: '#DC2626',
    defaultCategories: ['Moteur', 'Carrosserie', 'Éclairage', 'Entretien', 'Accessoires'],
    labels: AUTO_MOTO_LABELS,
  },
  {
    id: 'quincaillerie',
    businessType: 'ECOMMERCE',
    emoji: '🔨',
    name: 'Quincaillerie & Bricolage',
    subtitle: 'Outils, matériaux, fixation',
    template: 'xstore-electro',
    accentColor: '#D97706',
    defaultCategories: ['Outillage', 'Plomberie', 'Électricité', 'Visserie', 'Peinture'],
    labels: QUINCAILLERIE_LABELS,
  },
  {
    id: 'alimentation',
    businessType: 'ECOMMERCE',
    emoji: '🍔',
    name: 'Alimentation & Restaurant',
    subtitle: 'Boissons, snacks, épices',
    template: 'cosmika-beauty',
    accentColor: '#F59E0B',
    defaultCategories: ['Boissons', 'Snacks', 'Conserves', 'Épices'],
    labels: ALIMENTATION_LABELS,
  },
  {
    id: 'autre',
    businessType: 'ECOMMERCE',
    emoji: '🛍️',
    name: 'Autre / Généraliste',
    subtitle: 'Autres produits',
    template: 'cosmika-beauty',
    accentColor: '#8B5CF6',
    defaultCategories: ['Produits', 'Divers'],
    labels: AUTRE_ECOMMERCE_LABELS,
  },

  // ── SERVICE ──
  {
    id: 'beaute-service',
    businessType: 'SERVICE',
    emoji: '💇',
    name: 'Beauté & Bien-être',
    subtitle: 'Salon, spa, coiffure, esthétique',
    template: 'cosmika-beauty',
    accentColor: '#EC4899',
    defaultCategories: ['Maquillage', 'Coiffure', 'Soins', 'Ongles'],
    labels: BEAUTE_SERVICE_LABELS,
  },
  {
    id: 'restaurant',
    businessType: 'SERVICE',
    emoji: '🍽️',
    name: 'Restaurant & Hôtel',
    subtitle: 'Restaurant, bar, traiteur, hôtel',
    template: 'cosmika-beauty',
    accentColor: '#F59E0B',
    defaultCategories: ['Entrées', 'Plats', 'Desserts', 'Boissons', 'Menus spéciaux'],
    labels: RESTAURANT_LABELS,
  },
  {
    id: 'consulting',
    businessType: 'SERVICE',
    emoji: '💼',
    name: 'Professionnel & Consulting',
    subtitle: 'Conseil, formation, coaching',
    template: 'cosmika-beauty',
    accentColor: '#6366F1',
    defaultCategories: ['Consultation', 'Formation', 'Audit', 'Accompagnement'],
    labels: CONSULTING_LABELS,
  },
  {
    id: 'artisanat',
    businessType: 'SERVICE',
    emoji: '🔧',
    name: 'Artisan & BTP',
    subtitle: 'Plomberie, électricité, menuiserie',
    template: 'xstore-electro',
    accentColor: '#F97316',
    defaultCategories: ['Services', 'Réparations', 'Installations', 'Devis'],
    labels: ARTISANAT_LABELS,
  },
  {
    id: 'sante',
    businessType: 'SERVICE',
    emoji: '🏥',
    name: 'Santé & Médical',
    subtitle: 'Pharmacie, clinique, bien-être',
    template: 'cosmika-beauty',
    accentColor: '#10B981',
    defaultCategories: ['Consultations', 'Coaching', 'Soins', 'Programmes'],
    labels: SANTE_LABELS,
  },
  {
    id: 'formation',
    businessType: 'SERVICE',
    emoji: '🎓',
    name: 'Formation & Éducation',
    subtitle: 'Cours, ateliers, certifications',
    template: 'cosmika-beauty',
    accentColor: '#3B82F6',
    defaultCategories: ['Cours en ligne', 'Ateliers', 'Certifications', 'Coaching'],
    labels: FORMATION_LABELS,
  },
]

// ─── LOOKUP MAPS ──────────────────────────────────────────────────────────────

const sectorMap = new Map<string, SectorDefinition>()
for (const s of SECTORS) {
  sectorMap.set(s.id, s)
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Get the full sector definition by its ID.
 * Returns `undefined` if the sector ID is not recognised.
 */
export function getSectorConfig(sector: string | undefined | null): SectorDefinition | undefined {
  if (!sector) return undefined
  return sectorMap.get(sector)
}

/**
 * Get sector-aware labels. Falls back to generic ECOMMERCE labels when
 * the sector is unknown or not provided.
 */
export function getSectorLabels(sector: string | undefined | null): SectorLabels {
  const config = getSectorConfig(sector)
  if (!config) {
    // Fallback: generic ECOMMERCE labels
    return AUTRE_ECOMMERCE_LABELS
  }
  return config.labels
}

/**
 * Get only the sectors matching a given business type.
 */
export function getSectorsByBusinessType(businessType: BusinessType): SectorDefinition[] {
  return SECTORS.filter((s) => s.businessType === businessType)
}

/**
 * Determine which template engine to use for a given sector.
 */
export function getTemplateForSector(sector: string | undefined | null): TemplateEngine {
  const config = getSectorConfig(sector)
  return config?.template ?? 'cosmika-beauty'
}

/**
 * Get the default categories to auto-create for a sector.
 */
export function getDefaultCategories(sector: string | undefined | null): string[] {
  const config = getSectorConfig(sector)
  return config?.defaultCategories ?? ['Produits', 'Divers']
}

/**
 * Get the accent color for a sector.
 */
export function getSectorAccentColor(sector: string | undefined | null): string {
  const config = getSectorConfig(sector)
  return config?.accentColor ?? '#EC4899'
}

/**
 * Check if a business type is SERVICE.
 */
export function isServiceBusiness(businessType?: string | null): boolean {
  return businessType === 'SERVICE'
}

/**
 * Convenience: get CTA button text for a sector.
 */
export function getCtaButton(sector: string | undefined | null): string {
  return getSectorLabels(sector).ctaButton
}

/**
 * Convenience: get WhatsApp message template for a sector.
 */
export function getCtaWhatsAppMessage(sector: string | undefined | null): string {
  return getSectorLabels(sector).ctaWhatsAppMessage
}

/**
 * Get business-type-level labels (for backward compat with getBusinessLabels).
 * These are the generic ECOMMERCE / SERVICE labels when no specific sector is set.
 */
export interface GenericBusinessLabels {
  navProducts: string
  navCategories: string
  navOrders: string
  productsTitle: string
  productsAddButton: string
  productsEmpty: string
  productsSearch: string
  categoriesTitle: string
  categoriesAddButton: string
  categoriesEmpty: string
  ordersTitle: string
  ordersEmpty: string
  productLabel: string
  productDescriptionPlaceholder: string
  categoryLabel: string
  statProducts: string
  statOrders: string
  showPrice: boolean
  priceLabel: string
  pricePlaceholder: string
  priceOptional: boolean
}

const GENERIC_ECOMMERCE_LABELS: GenericBusinessLabels = {
  navProducts: 'Produits',
  navCategories: 'Catégories',
  navOrders: 'Commandes',
  productsTitle: 'Produits',
  productsAddButton: 'Ajouter un produit',
  productsEmpty: 'Aucun produit pour le moment',
  productsSearch: 'Rechercher un produit...',
  categoriesTitle: 'Catégories',
  categoriesAddButton: 'Ajouter une catégorie',
  categoriesEmpty: 'Aucune catégorie pour le moment',
  ordersTitle: 'Commandes',
  ordersEmpty: 'Aucune commande pour le moment',
  productLabel: 'Produit',
  productDescriptionPlaceholder: 'Décrivez votre produit...',
  categoryLabel: 'Catégorie',
  statProducts: 'Produits',
  statOrders: 'Commandes',
  showPrice: true,
  priceLabel: 'Prix (FCFA)',
  pricePlaceholder: 'Ex: 5000',
  priceOptional: false,
}

const GENERIC_SERVICE_LABELS: GenericBusinessLabels = {
  navProducts: 'Services',
  navCategories: 'Types de services',
  navOrders: 'Demandes de devis',
  productsTitle: 'Services',
  productsAddButton: 'Ajouter un service',
  productsEmpty: 'Aucun service pour le moment',
  productsSearch: 'Rechercher un service...',
  categoriesTitle: 'Types de services',
  categoriesAddButton: 'Ajouter un type',
  categoriesEmpty: 'Aucun type de service pour le moment',
  ordersTitle: 'Demandes de devis',
  ordersEmpty: 'Aucune demande de devis pour le moment',
  productLabel: 'Service',
  productDescriptionPlaceholder: 'Décrivez votre service...',
  categoryLabel: 'Type de service',
  statProducts: 'Services',
  statOrders: 'Devis',
  showPrice: false,
  priceLabel: 'Tarif indicatif (FCFA)',
  pricePlaceholder: 'Ex: 5000 (optionnel)',
  priceOptional: true,
}

/**
 * Backward-compatible function: get labels by businessType (ECOMMERCE/SERVICE).
 * Prefer `getSectorLabels(sector)` for sector-specific labels.
 */
export function getBusinessLabels(businessType?: string | null): GenericBusinessLabels {
  if (isServiceBusiness(businessType)) {
    return GENERIC_SERVICE_LABELS
  }
  return GENERIC_ECOMMERCE_LABELS
}

/**
 * Get the best available labels: sector-specific if sector is set,
 * otherwise falls back to business-type generic labels.
 */
export function getBestLabels(businessType?: string | null, sector?: string | null): SectorLabels {
  if (sector) {
    const sectorLabels = getSectorLabels(sector)
    if (sectorLabels) return sectorLabels
  }
  // Fallback to business-type generic
  return getBusinessLabels(businessType) as unknown as SectorLabels
}