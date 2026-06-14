'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Category } from '@/lib/store'

interface CosmikaCategoriesProps {
  categories: Category[]
  config: ThemeConfig
  activeCategoryId?: string | null
  onCategoryClick?: (categoryId: string) => void
}

export function CosmikaCategories({
  categories,
  config,
  activeCategoryId,
  onCategoryClick,
}: CosmikaCategoriesProps) {
  const colors = config.colors
  const hero = config.hero

  if (categories.length === 0) return null

  return (
    <section id="categories" className="py-16 md:py-20 px-4 bg-white">
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

        {/* ── Category circles grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {categories.map((category, index) => {
            const isActive = activeCategoryId === category.id
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.4 }}
                onClick={() => onCategoryClick?.(category.id)}
                className="text-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full"
                style={{
                  '--tw-ring-color': colors.primary,
                } as React.CSSProperties}
                aria-label={category.name}
                aria-pressed={isActive}
              >
                <div
                  className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden mx-auto mb-3 border-4 transition-all duration-300 group-hover:scale-105"
                  style={{
                    borderColor: isActive ? colors.primary : colors.primaryLight,
                    boxShadow: isActive
                      ? `0 0 0 4px ${colors.primaryBg}`
                      : undefined,
                  }}
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: colors.primaryBg }}
                    >
                      📁
                    </div>
                  )}
                </div>
                <span
                  className="text-sm md:text-base font-medium transition-colors duration-200"
                  style={{
                    color: isActive ? colors.primary : '#374151',
                  }}
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