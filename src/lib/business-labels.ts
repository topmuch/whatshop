/**
 * Dynamic labels based on the shop's businessType.
 * Single source of truth for all dashboard terminology.
 */

export type BusinessType = 'ECOMMERCE' | 'SERVICE'

export function isServiceBusiness(businessType?: string | null): boolean {
  return businessType === 'SERVICE'
}

export interface BusinessLabels {
  /** Nav sidebar labels */
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
}

const ECOMMERCE_LABELS: BusinessLabels = {
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

const SERVICE_LABELS: BusinessLabels = {
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
 * Get the correct labels for the shop's business type.
 * Falls back to ECOMMERCE labels when businessType is not set.
 */
export function getBusinessLabels(businessType?: string | null): BusinessLabels {
  if (isServiceBusiness(businessType)) {
    return SERVICE_LABELS
  }
  return ECOMMERCE_LABELS
}