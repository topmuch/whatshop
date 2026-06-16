'use client'

import { motion } from 'framer-motion'
import type { ThemeConfig, ThemeTrustBadge } from '@/lib/theme-config'

interface EleganceTrustBadgesProps {
  config: ThemeConfig
}

export function EleganceTrustBadges({ config }: EleganceTrustBadgesProps) {
  const colors = config.colors
  const badges = [...config.defaultTrustBadges].sort((a, b) => a.order - b.order)

  if (badges.length === 0) return null

  return (
    <section
      className="py-14 md:py-16 px-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.primaryBg} 0%, ${colors.primary}08 50%, ${colors.primaryBg} 100%)`,
      }}
    >
      {/* Decorative element */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl"
        style={{ backgroundColor: colors.primary }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge: ThemeTrustBadge, index) => (
            <motion.div
              key={`${badge.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm"
                style={{ backgroundColor: 'white', boxShadow: `0 4px 12px ${colors.primary}15` }}
              >
                {badge.emoji}
              </div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
                {badge.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                {badge.subtitle}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
