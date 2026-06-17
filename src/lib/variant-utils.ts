/**
 * Variant utilities — calcul du prix avec variantes (couleurs/tailles).
 *
 * Une variante peut avoir un `priceOffset` (positif ou négatif) appliqué au
 * prix de base du produit. Le prix final = prix de base + somme des offsets
 * des variantes sélectionnées.
 */

export type VariantType = 'COLOR' | 'SIZE'

export interface ProductVariant {
  id: string
  type: VariantType
  name: string
  priceOffset: number
  stock: number
  /** Pour les couleurs : code hex pour afficher le cercle de couleur */
  colorHex?: string | null
}

export interface VariantSelection {
  /** ID de la variante couleur sélectionnée (ou null) */
  colorVariantId: string | null
  /** ID de la variante taille sélectionnée (ou null) */
  sizeVariantId: string | null
}

/**
 * Calcule le prix final à partir du prix de base et des variantes sélectionnées.
 */
export function computeFinalPrice(
  basePrice: number,
  variants: ProductVariant[],
  selection: VariantSelection,
): number {
  let price = basePrice
  const selected = [selection.colorVariantId, selection.sizeVariantId].filter(Boolean) as string[]
  for (const variantId of selected) {
    const v = variants.find((x) => x.id === variantId)
    if (v) price += v.priceOffset
  }
  return Math.max(0, Math.round(price))
}

/**
 * Calcule le stock disponible pour la combinaison sélectionnée.
 * Si une variante est sélectionnée, on prend son stock. Sinon, stock global.
 */
export function computeAvailableStock(
  globalStock: number | null | undefined,
  variants: ProductVariant[],
  selection: VariantSelection,
): number | null {
  const selected = [selection.colorVariantId, selection.sizeVariantId].filter(Boolean) as string[]
  if (selected.length === 0) return globalStock ?? null
  // Prendre le stock minimum parmi les variantes sélectionnées (le plus restrictif)
  const stocks = selected
    .map((id) => variants.find((v) => v.id === id)?.stock)
    .filter((s): s is number => typeof s === 'number')
  if (stocks.length === 0) return globalStock ?? null
  return Math.min(...stocks)
}

/**
 * Sépare les variantes par type pour faciliter le rendu du sélecteur.
 */
export function groupVariantsByType(variants: ProductVariant[]): {
  colors: ProductVariant[]
  sizes: ProductVariant[]
} {
  return {
    colors: variants.filter((v) => v.type === 'COLOR'),
    sizes: variants.filter((v) => v.type === 'SIZE'),
  }
}

/**
 * Devine un code couleur hex à partir du nom (pour l'affichage du cercle).
 * Utile si colorHex n'est pas explicitement défini.
 */
const COLOR_NAME_MAP: Record<string, string> = {
  rouge: '#EF4444',
  red: '#EF4444',
  bleu: '#3B82F6',
  blue: '#3B82F6',
  vert: '#22C55E',
  green: '#22C55E',
  jaune: '#EAB308',
  yellow: '#EAB308',
  noir: '#111827',
  black: '#111827',
  blanc: '#F9FAFB',
  white: '#F9FAFB',
  rose: '#EC4899',
  pink: '#EC4899',
  violet: '#8B5CF6',
  purple: '#8B5CF6',
  orange: '#F97316',
  marron: '#92400E',
  brown: '#92400E',
  gris: '#6B7280',
  gray: '#6B7280',
  grey: '#6B7280',
  or: '#D4AF37',
  gold: '#D4AF37',
  argent: '#C0C0C0',
  silver: '#C0C0C0',
  beige: '#E8DCC4',
  kaki: '#4A5D23',
  khaki: '#4A5D23',
  turquoise: '#14B8A6',
  bordeaux: '#7F1D1D',
  marine: '#1E3A8A',
}

export function guessColorHex(name: string): string {
  const key = name.toLowerCase().trim()
  return COLOR_NAME_MAP[key] || '#9CA3AF'
}
