'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Product } from '@/lib/store'

/**
 * CosmikaServicesGrid — Service cards for consulting sector.
 * Displays services with "En savoir plus" CTA that opens product detail.
 */
interface CosmikaServicesGridProps {
  products: Product[]
  config: ThemeConfig
  onProductClick?: (product: Product) => void
}

export function CosmikaServicesGrid({ products, config, onProductClick }: CosmikaServicesGridProps) {
  const colors = config.colors
  const primary = config.colors.primary

  if (products.length === 0) return null

  return (
    <section id="services" className="py-16 md:py-20 px-4" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-7xl mx-auto">
        {/* ── Heading ── */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className="font-semibold text-sm tracking-widest uppercase"
            style={{ color: primary }}
          >
            {config.hero.defaultTagline}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-gray-900">
            {config.productsSectionTitle}
          </h2>
          <p className="text-gray-600 mt-4">
            {products.length} {products.length > 1 ? 'services' : 'service'} disponibles
          </p>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const imageUrl = product.images?.[0] || product.image
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: 0.05 * index, duration: 0.4 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: colors.primaryBg }}>
                      📋
                    </div>
                  )}
                  {product.isNew && (
                    <span
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: primary }}
                    >
                      Nouveau
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                    {product.description || product.shortDescription}
                  </p>

                  {/* Price (if applicable) */}
                  {product.price != null && product.price > 0 && (
                    <p className="text-sm text-gray-700 mb-4">
                      À partir de{' '}
                      <span className="font-bold" style={{ color: primary }}>
                        {product.price.toLocaleString('fr-FR')} FCFA
                      </span>
                    </p>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => onProductClick?.(product)}
                    className="block w-full text-center py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ backgroundColor: colors.ctaBg }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.primaryDark }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.ctaBg }}
                  >
                    En savoir plus
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}