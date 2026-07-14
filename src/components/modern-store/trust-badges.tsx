'use client'

import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  BadgeCheck,
  Wallet,
  Package,
  Clock,
} from 'lucide-react'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  BadgeCheck,
  Wallet,
  Package,
  Clock,
}

export interface TrustBadgeItem {
  icon: string
  title: string
  description: string
}

interface TrustBadgesProps {
  badges: TrustBadgeItem[]
  accent: string
  /** When true, renders text in light colors for dark backgrounds */
  dark?: boolean
}

/**
 * Grille 4 colonnes (desktop) / 2 colonnes (mobile) de badges de confiance.
 * Adapté de `src/components/single-product/trust-badges.tsx`.
 */
export function TrustBadges({ badges, accent, dark }: TrustBadgesProps) {
  if (!badges || badges.length === 0) return null
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {badges.map((b, i) => {
        const Icon = ICONS[b.icon] || ShieldCheck
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-2 text-center"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${accent}30`, color: accent }}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{b.title}</p>
              <p className={`mt-0.5 text-xs ${dark ? 'text-gray-300' : 'text-gray-500'}`}>{b.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}