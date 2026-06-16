'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Category } from '@/lib/store'
import type { ThemeConfig } from '@/lib/theme-config'

interface ElectroCategoriesProps {
  categories: Category[]
  theme: ThemeConfig
  onCategoryClick?: (categoryId: string | null) => void
}

export default function ElectroCategories({ categories, theme, onCategoryClick }: ElectroCategoriesProps) {
  const { colors, navLabels } = theme

  if (categories.length === 0) return null

  return (
    <section id="categories" className="py-16 px-4" style={{ background: colors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-4 text-white"
            style={{ backgroundColor: colors.primary }}
          >
            {theme.hero.defaultTagline}
          </span>
          <h2 className="font-bold text-2xl md:text-4xl" style={{ color: colors.text }}>
            {navLabels.categories}
          </h2>
        </div>

        {/* Rectangular grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              type="button"
              onClick={() => onCategoryClick?.(category.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="relative group cursor-pointer overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 text-left"
            >
              {/* Background image */}
              <div className="aspect-[4/3] overflow-hidden">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">
                    📁
                  </div>
                )}
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-white text-base md:text-lg mb-1">
                  {category.name}
                </h3>
                {category.productCount !== undefined && (
                  <p className="text-xs text-white/80">
                    {category.productCount} {category.productCount > 1 ? 'produits' : 'produit'}
                  </p>
                )}
              </div>

              {/* Hover tint */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ backgroundColor: colors.primary + '20' }}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}