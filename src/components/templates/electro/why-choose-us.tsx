'use client'

import { motion } from 'framer-motion'
import type { ThemeConfig, WhyChooseUs } from '@/lib/theme-config'

interface ElectroWhyChooseUsProps {
  items: WhyChooseUs[]
  theme: ThemeConfig
}

export default function ElectroWhyChooseUs({ items, theme }: ElectroWhyChooseUsProps) {
  const { colors } = theme

  if (items.length === 0) return null

  return (
    <section className="py-20 px-4" style={{ backgroundColor: colors.primary + '08' }}>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-4 text-white"
            style={{ backgroundColor: colors.primary }}
          >
            NOS ATOUTS
          </span>
          <h2 className="font-bold text-2xl md:text-4xl" style={{ color: colors.text }}>
            Pourquoi nous choisir ?
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Des raisons concrètes de nous faire confiance pour vos travaux.
          </p>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl mb-4"
                style={{ backgroundColor: colors.primary + '15' }}
              >
                {item.icon}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: colors.text }}>
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