'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Category } from '@/lib/store'

/**
 * CosmikaExpertises — Enlarged category circles for consulting & professional sectors.
 *
 * Uses a 2→4 columns grid with larger circles (w-32→w-40) instead of
 * the standard 2→3→6 columns grid used by CosmikaCategories.
 */
interface CosmikaExpertisesProps {
  categories: Category[]
  config: ThemeConfig
  activeCategoryId?: string | null
  onCategoryClick?: (categoryId: string) => void
}

export function CosmikaExpertises({
  categories,
  config,
  activeCategoryId,
  onCategoryClick,
}: CosmikaExpertisesProps) {
  const colors = config.colors
  const hero = config.hero

  if (categories.length === 0) return null

  return (
    <section id="expertises" className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* ── Section heading ── */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className="font-semibold text-sm tracking-widest uppercase"
            style={{ color: colors.primary }}
          >
            {hero.defaultTagline}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-gray-900">
            {config.navLabels.categories}
          </h2>
        </div>

        {/* ── Enlarged circles grid: 2→4 cols ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {categories.map((category, index) => {
            const isActive = activeCategoryId === category.id
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.4 }}
                onClick={() => onCategoryClick?.(category.id)}
                className="text-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full"
                style={{ '--tw-ring-color': colors.primary } as React.CSSProperties}
                aria-label={category.name}
                aria-pressed={isActive}
              >
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mx-auto mb-4 border-4 transition-all duration-300 group-hover:scale-110"
                  style={{ borderColor: isActive ? colors.primary : colors.primaryLight + '66' }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = colors.primary
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = colors.primaryLight + '66'
                  }}
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-4xl md:text-5xl"
                      style={{ backgroundColor: colors.primaryBg }}
                    >
                      📁
                    </div>
                  )}
                </div>
                <span
                  className="text-base md:text-lg font-medium transition-colors duration-200"
                  style={{ color: isActive ? colors.primary : '#374151' }}
                >
                  {category.name}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}