'use client'

import { Truck, ShieldCheck, RotateCcw, BadgeCheck, Headphones, Wallet, Package, Clock } from 'lucide-react'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  ShieldCheck,
  RotateCcw,
  BadgeCheck,
  Headphones,
  Wallet,
  Package,
  Clock,
}

export interface TrustBadgeItem {
  icon: string
  title: string
  description: string
}

export function TrustBadges({ badges, accent }: { badges: TrustBadgeItem[]; accent: string }) {
  if (!badges.length) return null
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {badges.map((b, i) => {
        const Icon = ICONS[b.icon] || ShieldCheck
        return (
          <div key={i} className="flex flex-col items-center gap-2 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${accent}12`, color: accent }}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{b.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{b.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
