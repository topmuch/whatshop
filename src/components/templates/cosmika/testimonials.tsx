'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ThemeConfig } from '@/lib/theme-config'

export interface TestimonialItem {
  id: string
  clientName: string
  clientAvatar?: string
  /** Client's role/position — e.g. "CEO, StartupXYZ" */
  clientRole?: string
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
  const primary = config.colors.primary

  if (testimonials.length === 0) return null

  return (
    <section id="avis" className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* ── Heading ── */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className="font-semibold text-sm tracking-widest uppercase"
            style={{ color: primary }}
          >
            TÉMOIGNAGES
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-gray-900">
            Ce que nos clients disent
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            La satisfaction de nos clients est notre meilleure carte de visite.
          </p>
        </div>

        {/* ── Testimonial cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.08 * index, duration: 0.4 }}
              className="p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow bg-white"
            >
              {/* Stars */}
              <div className="flex text-yellow-400 mb-4 text-lg" aria-label={`${t.rating} sur 5 étoiles`}>
                {'⭐'.repeat(Math.min(5, Math.max(0, t.rating)))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                &ldquo;{t.comment}&rdquo;
              </p>

              {/* Client info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {t.clientAvatar ? (
                  <Image
                    src={t.clientAvatar}
                    alt={t.clientName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: primary }}
                  >
                    {t.clientName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {t.clientName}
                  </p>
                  {t.clientRole ? (
                    <p className="text-xs text-gray-500">{t.clientRole}</p>
                  ) : (
                    <p className="text-xs text-gray-500">Client vérifié</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}