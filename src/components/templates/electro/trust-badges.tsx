'use client'

import type { ThemeTrustBadge, ThemeColors } from '@/lib/theme-config'

interface ElectroTrustBadgesProps {
  badges: ThemeTrustBadge[]
  colors: ThemeColors
}

export default function ElectroTrustBadges({ badges, colors }: ElectroTrustBadgesProps) {
  const sortedBadges = [...badges].sort((a, b) => a.order - b.order)

  return (
    <section className="bg-gray-900 text-white py-10 px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
        {sortedBadges.map((badge) => (
          <div key={badge.title} className="flex flex-col items-center text-center">
            <span className="text-3xl md:text-4xl mb-2" role="img" aria-hidden="true">
              {badge.emoji}
            </span>
            <span className="text-sm md:text-base font-semibold">{badge.title}</span>
            <span className="text-xs md:text-sm opacity-70 mt-1">{badge.subtitle}</span>
          </div>
        ))}
      </div>
    </section>
  )
}