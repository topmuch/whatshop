'use client'

import { motion } from 'framer-motion'
import type { ThemeConfig, WhyChooseUs as WhyChooseUsItem } from '@/lib/theme-config'

/**
 * CosmikaWhyChooseUs — "Pourquoi nous choisir" section for consulting.
 * Displays 4 key differentiators in a card grid.
 */
interface CosmikaWhyChooseUsProps {
  config: ThemeConfig
}

export function CosmikaWhyChooseUs({ config }: CosmikaWhyChooseUsProps) {
  const items = config.whyChooseUs
  if (!items || items.length === 0) return null

  const primary = config.colors.primary

  return (
    <section className="py-16 md:py-20 px-4" style={{ backgroundColor: primary + '08' }}>
      <div className="max-w-7xl mx-auto">
        {/* ── Heading ── */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className="font-semibold text-sm tracking-widest uppercase"
            style={{ color: primary }}
          >
            NOS ATOUTS
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-gray-900">
            Pourquoi nous choisir ?
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Des raisons concrètes de nous faire confiance pour votre transformation.
          </p>
        </div>

        {/* ── 4-column card grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {items.map((item: WhyChooseUsItem, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-2xl md:text-3xl mb-5 md:mb-6"
                style={{ backgroundColor: primary + '15' }}
              >
                {item.icon}
              </div>
              <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2 md:mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}