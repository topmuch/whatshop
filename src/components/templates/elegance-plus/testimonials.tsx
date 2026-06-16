'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ThemeConfig } from '@/lib/theme-config'

export interface TestimonialItem {
  id: string
  clientName: string
  clientAvatar?: string
  clientRole?: string
  comment: string
  rating: number
}

interface EleganceTestimonialsProps {
  testimonials: TestimonialItem[]
  config: ThemeConfig
}

export function EleganceTestimonials({ testimonials, config }: EleganceTestimonialsProps) {
  const colors = config.colors
  const primary = config.colors.primary

  if (testimonials.length === 0) return null

  return (
    <section id="avis" className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block font-semibold text-sm tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ color: primary, backgroundColor: primary + '10' }}
          >
            TÉMOIGNAGES
          </motion.span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Ce que nos clients disent
          </h2>
          <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: primary }} />
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="relative p-6 md:p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              {/* Quote mark */}
              <div
                className="absolute -top-3 left-6 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-serif shadow-md"
                style={{ backgroundColor: primary }}
              >
                "
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4 mt-2" aria-label={`${t.rating} sur 5 étoiles`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill={i < t.rating ? '#FBBF24' : '#E5E7EB'}
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 italic leading-relaxed text-sm md:text-base">
                &ldquo;{t.comment}&rdquo;
              </p>

              {/* Client info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {t.clientAvatar ? (
                  <Image src={t.clientAvatar} alt={t.clientName} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: primary }}
                  >
                    {t.clientName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.clientName}</p>
                  <p className="text-xs text-gray-500">{t.clientRole || 'Client vérifié'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}