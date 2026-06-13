/**
 * Dynamic labels based on the shop's businessType AND sector.
 *
 * This module now delegates to sector-config.ts (single source of truth)
 * while maintaining full backward compatibility for existing imports.
 *
 * Usage:
 *   getBusinessLabels(businessType)           — generic ECOMMERCE / SERVICE labels
 *   getBusinessLabels(businessType, sector)   — sector-specific labels when sector is set
 */

import { getBestLabels, type SectorLabels } from '@/lib/sector-config'

export type BusinessType = 'ECOMMERCE' | 'SERVICE'

export function isServiceBusiness(businessType?: string | null): boolean {
  return businessType === 'SERVICE'
}

/**
 * Re-export the full SectorLabels interface for consumers that need it.
 */
export type { SectorLabels } from '@/lib/sector-config'

/**
 * Get the correct labels for the shop's business type and sector.
 *
 * - When `sector` is provided and recognised, returns sector-specific labels
 *   (e.g., Restaurant → "Carte & Menus", "Plats", "Catégories Plats").
 * - When `sector` is null/unknown, falls back to generic ECOMMERCE or SERVICE labels.
 * - When `businessType` is also null, falls back to generic ECOMMERCE labels.
 */
export function getBusinessLabels(
  businessType?: string | null,
  sector?: string | null,
): SectorLabels {
  return getBestLabels(businessType, sector)
}