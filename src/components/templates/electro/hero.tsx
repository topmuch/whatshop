'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ThemeColors, ThemeHero } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'
import { MessageCircle } from 'lucide-react'

interface ElectroHeroProps {
  colors: ThemeColors
  hero: ThemeHero
  shop: Shop | null
  ctaText: string
  isServiceMode?: boolean
  showConsultantPhoto?: boolean
  onCtaClick: () => void
  onCatalogClick: () => void
}

const SLIDE_INTERVAL_MS = 6000

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

const fadeVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.6, ease: 'easeOut' as const },
  }),
}

/** Hero stats — shown for e-commerce sectors */
const HERO_STATS = [
  { value: '500+', label: 'Produits' },
  { value: '1000+', label: 'Clients' },
  { value: '24h', label: 'Livraison' },
]

export default function ElectroHero({
  colors,
  hero,
  shop,
  ctaText,
  isServiceMode = false,
  showConsultantPhoto = false,
  onCtaClick,
  onCatalogClick,
}: ElectroHeroProps) {
  const tagline = shop?.heroTagline ?? hero.defaultTagline
  const title = shop?.heroTitle ?? hero.defaultTitle
  const subtitle = shop?.heroSubtitle ?? hero.defaultSubtitle

  const heroImages = parseHeroImages(shop?.heroImages)
  const customHeroUrl = shop?.heroImageUrl
  const allImages: string[] = []
  if (customHeroUrl) {
    allImages.push(customHeroUrl)
  }
  allImages.push(...heroImages)

  const hasImages = allImages.length > 0

  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  function goToSlide(nextIndex: number) {
    if (isTransitioning || allImages.length <= 1) return
    setIsTransitioning(true)
    setActiveIndex(nextIndex)
    setTimeout(() => setIsTransitioning(false), 700)
  }

  useEffect(() => {
    if (allImages.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % allImages.length
        setIsTransitioning(true)
        setTimeout(() => setIsTransitioning(false), 700)
        return next
      })
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [allImages.length])

  const consultantPhoto = showConsultantPhoto && shop?.consultantPhotoUrl

  return (
    <section
      className="relative w-full min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background layer — images or gradient only */}
      {hasImages ? (
        <div className="absolute inset-0 z-0">
          {allImages.map((src, idx) => (
            <motion.div
              key={src}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: idx === activeIndex ? 1 : 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              aria-hidden={idx !== activeIndex}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                priority={idx === 0}
                sizes="100vw"
                quality={85}
              />
            </motion.div>
          ))}
        </div>
      ) : null}

      {/* Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: colors.heroOverlay }}
        aria-hidden="true"
      />

      {/* Slide indicators (only when multiple images) */}
      {allImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-2">
          {allImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-7 bg-white' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-[2] w-full px-6 md:px-16 lg:px-24 py-20 md:py-24">
        <div className={`max-w-7xl mx-auto ${consultantPhoto ? 'flex flex-col md:flex-row items-center gap-12' : ''}`}>
          {/* Left: Text content */}
          <div className={`${consultantPhoto ? 'flex-1' : 'max-w-3xl'}`}>
            <motion.p
              custom={0}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              className="text-xs md:text-sm uppercase tracking-[0.3em] font-medium text-white opacity-80"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
            >
              {tagline}
            </motion.p>

            <motion.h1
              custom={1}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mt-4 leading-tight"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.45)' }}
            >
              {title}
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              className="text-base md:text-lg lg:text-xl max-w-2xl text-white opacity-90 mt-4 leading-relaxed"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
            >
              {subtitle}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8"
            >
              <button
                onClick={onCtaClick}
                className="px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{
                  backgroundColor: colors.ctaBg,
                  color: colors.ctaText,
                }}
              >
                {ctaText}
              </button>

              <a
                href={shop?.whatsapp ? `https://wa.me/${shop.whatsapp.replace(/\D/g, '')}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white border border-white/25 hover:bg-white/10 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </motion.div>

            {/* Stats bar — e-commerce only */}
            {!isServiceMode && (
              <motion.div
                custom={4}
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20 max-w-2xl"
              >
                {HERO_STATS.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right: Consultant photo (artisanat/BTP) */}
          {consultantPhoto && (
            <motion.div
              custom={2}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              className="hidden md:flex flex-col items-center"
            >
              <div className="relative">
                <div
                  className="w-64 lg:w-80 h-64 lg:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl"
                >
                  <Image
                    src={shop.consultantPhotoUrl ?? ''}
                    alt={shop.name ?? 'Consultant'}
                    width={320}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Glow effect */}
                <div
                  className="absolute -inset-6 rounded-full opacity-15 blur-3xl -z-10"
                  style={{ backgroundColor: colors.primary }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}