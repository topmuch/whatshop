'use client'

import { motion } from 'framer-motion'
import type { ThemeConfig } from '@/lib/theme-config'
import ElectroProductCard from './product-card'
import type { Product } from '@/lib/store'

interface ElectroProductsGridProps {
  products: Product[]
  theme: ThemeConfig
  ctaText: string
  whatsappNumber: string
  whatsappMessage: string
  showPrice: boolean
  onProductClick?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  getCategoryName?: (categoryId: string) => string | undefined
}

export default function ElectroProductsGrid({
  products,
  theme,
  ctaText,
  whatsappNumber,
  whatsappMessage,
  showPrice,
  onProductClick,
  onAddToCart,
  getCategoryName,
}: ElectroProductsGridProps) {
  const { colors, cardMode, productsSectionTitle } = theme

  if (products.length === 0) return null

  return (
    <section id="products" className="py-20 px-4 bg-white">
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
            {productsSectionTitle}
          </h2>
          <p className="text-gray-600 mt-4">
            {products.length} {products.length > 1 ? 'articles disponibles' : 'article disponible'}
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              onClick={() => onProductClick?.(product)}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <ElectroProductCard
                product={product}
                colors={colors}
                cardMode={cardMode}
                ctaText={ctaText}
                whatsappNumber={whatsappNumber}
                whatsappMessage={whatsappMessage}
                showPrice={showPrice}
                categoryName={getCategoryName?.(product.categoryId || '')}
                onAddToCart={onAddToCart || (() => {})}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}