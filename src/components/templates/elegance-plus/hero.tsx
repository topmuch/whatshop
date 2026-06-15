'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'

interface EleganceHeroProps {
  config: ThemeConfig
  shop: Shop | null
}

function parseHeroImages(heroImagesJson: string | undefined): string[] {
  if (!heroImagesJson) return []
  try {
    const parsed: unknown = JSON.parse(heroImagesJson)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)
    }
    return []
  } catch {
    return []
  }
}

const SLIDE_INTERVAL_MS = 6000

export function EleganceHero({ config, shop }: EleganceHeroProps) {
  const colors = config.colors
  const hero = config.hero
  const ctaText = config.heroCtaText

  const tagline = shop?.heroTagline ?? hero.defaultTagline
  const title = shop?.heroTitle ?? hero.defaultTitle
  const subtitle = shop?.heroSubtitle ?? hero.defaultSubtitle

  const heroImages = parseHeroImages(shop?.heroImages)
  const customHeroUrl = shop?.heroImageUrl
  const allImages: string[] = []
  if (customHeroUrl) allImages.push(customHeroUrl)
  allImages.push(...heroImages)
  const hasImages = allImages.length > 0

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (allImages.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % allImages.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [allImages.length])

  const whatsappUrl = shop?.whatsapp
    ? `https://wa.me/${shop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Bonjour ${shop.name}, je souhaite avoir des informations.`
      )}`
    : '#'

  return (
    <section id="accueil" className="relative min-h-[85vh] lg:h-[90vh] overflow-hidden" aria-label="Hero">
      {/* Background */}
      {hasImages ? (
        <div className="absolute inset-0 z-0">
          {allImages.map((src, idx) => (
            <motion.div
              key={src}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: idx === activeIndex ? 1 : 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              aria-hidden={idx !== activeIndex}
            >
              <Image src={src} alt="" fill className="object-cover" priority={idx === 0} sizes="100vw" quality={90} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}30 0%, ${colors.secondary}30 50%, ${colors.primary}10 100%)`,
          }}
        />
      )}

      {/* Overlay with gradient */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `linear-gradient(135deg, ${colors.heroOverlay} 0%, rgba(0,0,0,0.3) 50%, ${colors.heroOverlay} 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Decorative shapes */}
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10 blur-3xl z-[1]"
        style={{ backgroundColor: colors.secondary }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-5 blur-3xl z-[1]"
        style={{ backgroundColor: colors.primary }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Slide indicators */}
      {allImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-2">
          {allImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-[2] flex items-center h-full px-6 md:px-16 lg:px-32 py-20">
        <div className="w-full max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-semibold text-xs md:text-sm tracking-[0.2em] uppercase mb-4"
              style={{ color: colors.secondary, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
              {tagline}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-5 md:mb-6 leading-[1.1]"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-base md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-10 max-w-xl leading-relaxed"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
            >
              {subtitle}
            </motion.p>

            {/* Dual CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {/* Primary CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-sm md:text-base text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-xl hover:shadow-2xl"
                style={{ backgroundColor: colors.ctaBg }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primaryDark
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.ctaBg
                }}
              >
                {ctaText}
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
              </a>

              {/* Secondary CTA */}
              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-sm md:text-base text-white border-2 border-white/40 hover:border-white/80 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Voir le catalogue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}