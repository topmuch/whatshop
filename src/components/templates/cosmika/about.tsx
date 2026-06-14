'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'

/**
 * CosmikaAbout — "Qui sommes-nous" section for consulting.
 * Shows consultant photo, description, and quick stats.
 */
interface CosmikaAboutProps {
  config: ThemeConfig
  shop: Shop | null
}

export function CosmikaAbout({ config, shop }: CosmikaAboutProps) {
  const primary = config.colors.primary

  if (!shop) return null

  const aboutText = shop.aboutText
    || shop.description
    || `${shop.name} est un cabinet de conseil spécialisé dans l'accompagnement des entreprises et des dirigeants. Notre mission : vous aider à atteindre vos objectifs avec des solutions concrètes et mesurables.`

  return (
    <section id="about" className="py-16 md:py-20 px-4" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* ── Image side ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {shop.consultantPhotoUrl ? (
              <Image
                src={shop.consultantPhotoUrl}
                alt={shop.name}
                width={600}
                height={384}
                className="rounded-2xl shadow-2xl w-full h-80 md:h-96 object-cover"
              />
            ) : (
              <div
                className="rounded-2xl h-80 md:h-96 flex items-center justify-center text-white text-6xl font-bold shadow-2xl"
                style={{ backgroundColor: primary }}
              >
                {shop.name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Decorative badge */}
            <div
              className="absolute -bottom-5 -right-3 md:-bottom-6 md:-right-6 w-28 h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl"
              style={{ backgroundColor: primary }}
            >
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">10+</div>
                <div className="text-xs">Années</div>
              </div>
            </div>
          </motion.div>

          {/* ── Text side ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span
              className="font-semibold text-sm tracking-widest uppercase"
              style={{ color: primary }}
            >
              QUI SOMMES-NOUS
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2 mb-6 text-gray-900">
              {shop.name}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {aboutText}
            </p>
            <p className="text-gray-700 leading-relaxed mb-8">
              Forts de notre expérience et de notre réseau, nous intervenons sur des missions variées : stratégie, management, formation, audit et coaching.
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div>
                <div className="text-2xl md:text-3xl font-bold" style={{ color: primary }}>50+</div>
                <div className="text-sm text-gray-600">Clients</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold" style={{ color: primary }}>100+</div>
                <div className="text-sm text-gray-600">Missions</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold" style={{ color: primary }}>10</div>
                <div className="text-sm text-gray-600">Années</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}