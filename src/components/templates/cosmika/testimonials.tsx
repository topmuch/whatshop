'use client'

import { motion } from 'framer-motion'
import type { ThemeConfig } from '@/lib/theme-config'

export interface TestimonialItem {
  id: string
  clientName: string
  clientAvatar?: string
  comment: string
  rating: number
}

interface CosmikaTestimonialsProps {
  testimonials: TestimonialItem[]
  config: ThemeConfig
}

export function CosmikaTestimonials({
  testimonials,
  config,
}: CosmikaTestimonialsProps) {
  const colors = config.colors

  if (testimonials.length === 0) return null

  return (
    <section id="avis" className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-12">
          <span
            className="font-semibold text-sm tracking-widest uppercase"
            style={{ color: colors.primary }}
          >
            TÉMOIGNAGES
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2 text-gray-900">
            Ce que nos clients disent
          </h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.08 * index, duration: 0.4 }}
              className="p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: colors.primaryBg }}
            >
              <div className="flex text-yellow-400 mb-4 text-lg" aria-label={`${t.rating} sur 5 étoiles`}>
                {'⭐'.repeat(Math.min(5, Math.max(0, t.rating)))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                &ldquo;{t.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                {t.clientAvatar ? (
                  <img
                    src={t.clientAvatar}
                    alt={t.clientName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {t.clientName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {t.clientName}
                  </p>
                  <p className="text-xs text-gray-500">Client vérifié</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}