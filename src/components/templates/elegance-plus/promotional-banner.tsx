'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'

interface ElegancePromotionalBannerProps {
  config: ThemeConfig
  shop: Shop | null
  promoTitle?: string
  promoSubtitle?: string
  promoImageUrl?: string
}

export function ElegancePromotionalBanner({
  config,
  shop,
  promoTitle,
  promoSubtitle,
  promoImageUrl,
}: ElegancePromotionalBannerProps) {
  const colors = config.colors
  const title = promoTitle || 'Offre Spéciale'
  const subtitle = promoSubtitle || 'Découvrez nos meilleures ventes et profitez de prix exclusifs'
  const bannerImage = promoImageUrl || shop?.heroImageUrl

  return (
    <section className="px-4 py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl min-h-[250px] md:min-h-[300px] flex items-center"
        >
          {/* Background */}
          {bannerImage ? (
            <Image
              src={bannerImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              quality={85}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary || colors.primaryDark} 100%)`,
              }}
            />
          )}

          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: bannerImage
                ? 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 px-8 md:px-16 py-10 md:py-16">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-4"
              style={{ backgroundColor: colors.secondary || '#F59E0B' }}
            >
              Offre Limitée
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 max-w-lg"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-white/80 text-sm md:text-base mb-6 max-w-md"
            >
              {subtitle}
            </motion.p>

            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              href="#products"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-[1.03]"
            >
              Découvrir
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </div>

          {/* Decorative shape */}
          <div
            className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full opacity-10 blur-2xl"
            style={{ backgroundColor: 'white' }}
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </section>
  )
}