'use client'

import { motion } from 'framer-motion'
import type { ThemeConfig, ThemeTrustBadge } from '@/lib/theme-config'

interface CosmikaTrustBadgesProps {
  config: ThemeConfig
}

export function CosmikaTrustBadges({ config }: CosmikaTrustBadgesProps) {
  const colors = config.colors
  // Trust badges are sorted by `order` field
  const badges = [...config.defaultTrustBadges].sort(
    (a, b) => a.order - b.order
  )

  if (badges.length === 0) return null

  return (
    <section className="py-12 md:py-16 px-4 border-y border-gray-100" style={{ backgroundColor: colors.primaryBg }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {badges.map((badge: ThemeTrustBadge, index) => (
            <motion.div
              key={`${badge.title}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.08 * index, duration: 0.4 }}
              className="flex flex-col items-center p-4"
            >
              {badge.emoji && (
                <div className="text-4xl mb-3" aria-hidden="true">
                  {badge.emoji}
                </div>
              )}
              <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
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