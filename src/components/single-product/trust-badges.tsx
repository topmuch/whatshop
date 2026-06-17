'use client'

import { Truck, ShieldCheck, RotateCcw, BadgeCheck, Headphones, Wallet } from 'lucide-react'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  ShieldCheck,
  RotateCcw,
  BadgeCheck,
  Headphones,
  Wallet,
}

export interface TrustBadgeItem {
  icon: string
  title: string
  description: string
}

export function TrustBadges({ badges, accent }: { badges: TrustBadgeItem[]; accent: string }) {
  if (!badges.length) return null
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {badges.map((b, i) => {
        const Icon = ICONS[b.icon] || ShieldCheck
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${accent}15`, color: accent }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{b.title}</p>
            <p className="text-xs text-gray-500">{b.description}</p>
          </div>
        )
      })}
    </div>
  )
}
