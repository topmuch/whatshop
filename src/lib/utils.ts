import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// ─── Class names ───────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Slug generation ───────────────────────────────────────────────────────────

/**
 * Convert text to a URL-safe slug.
 * Strips accents, lowercases, replaces non-alphanumerics with hyphens.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Date formatting ───────────────────────────────────────────────────────────

/**
 * Format a date string to French locale (e.g. "12 jan. 2025").
 * Falls back to the raw string on invalid input.
 */
export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Format a date string with time (e.g. "12 jan. 2025, 14:30").
 * Falls back to the raw string on invalid input.
 */
export function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// ─── Currency formatting ───────────────────────────────────────────────────────

/**
 * Format a number as XOF currency (e.g. "15 000 FCFA").
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' FCFA'
}
