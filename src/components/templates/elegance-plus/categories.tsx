'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Category } from '@/lib/store'

interface EleganceCategoriesProps {
  categories: Category[]
  config: ThemeConfig
  activeCategoryId?: string | null
  onCategoryClick?: (categoryId: string) => void
}

export function EleganceCategories({
  categories,
  config,
  activeCategoryId,
  onCategoryClick,
}: EleganceCategoriesProps) {
  const colors = config.colors
  const hero = config.hero

  if (categories.length === 0) return null

  return (
    <section id="categories" className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block font-semibold text-sm tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ color: colors.primary, backgroundColor: colors.primaryBg }}
          >
            {hero.defaultTagline}
          </motion.span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            {config.navLabels.categories}
          </h2>
          <div
            className="w-16 h-1 rounded-full mx-auto mt-4"
            style={{ backgroundColor: colors.primary }}
          />
        </div>

        {/* Rectangular Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const isActive = activeCategoryId === category.id
            const productCount = category.productCount ?? 0
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: 0.06 * index, duration: 0.4 }}
                onClick={() => onCategoryClick?.(category.id)}
                className="group relative overflow-hidden rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  '--tw-ring-color': colors.primary,
                  aspectRatio: '4/5',
                } as React.CSSProperties}
                aria-label={category.name}
                aria-pressed={isActive}
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-5xl"
                    style={{ backgroundColor: colors.primaryBg }}
                  >
                    📁
                  </div>
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: isActive
                      ? `linear-gradient(to top, ${colors.primary}cc 0%, ${colors.primary}66 40%, transparent 100%)`
                      : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
                  }}
                />

                {/* Active border glow */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-2xl border-2 z-10 pointer-events-none"
                    style={{ borderColor: colors.primary }}
                  />
                )}

                {/* Text content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <h3 className="text-white font-bold text-sm md:text-base mb-1 drop-shadow-lg">
                    {category.name}
                  </h3>
                  {productCount > 0 && (
                    <p className="text-white/80 text-xs drop-shadow">
                      {productCount} {productCount > 1 ? 'produits' : 'produit'}
                    </p>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
