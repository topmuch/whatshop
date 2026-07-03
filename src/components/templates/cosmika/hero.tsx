'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'

interface CosmikaHeroProps {
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

const fadeVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.6, ease: 'easeOut' as const },
  }),
}

const SLIDE_INTERVAL_MS = 6000

export function CosmikaHero({ config, shop }: CosmikaHeroProps) {
  const colors = config.colors
  const hero = config.hero
  const ctaText = config.heroCtaText

  const tagline = shop?.heroTagline ?? hero.defaultTagline
  const title = shop?.heroTitle ?? hero.defaultTitle
  const subtitle = shop?.heroSubtitle ?? hero.defaultSubtitle

  // Build image list: custom hero URL + hero images array
  const heroImages = parseHeroImages(shop?.heroImages)
  const customHeroUrl = shop?.heroImageUrl
  const allImages: string[] = []
  if (customHeroUrl) allImages.push(customHeroUrl)
  allImages.push(...heroImages)
  const hasImages = allImages.length > 0

  // Consultant photo (only for consulting sector when enabled in theme)
  const showConsultantPhoto = hero.showConsultantPhoto && shop?.consultantPhotoUrl

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
    <section
      id="accueil"
      className="relative min-h-[80vh] md:h-[85vh] overflow-hidden"
      aria-label="Hero"
    >
      {/* ── Background layer ── */}
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
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}22 0%, ${colors.secondary}22 100%)`,
          }}
        />
      )}

      {/* ── Overlay ── */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: colors.heroOverlay }}
        aria-hidden="true"
      />

      {/* ── Slide indicators (only when multiple images) ── */}
      {allImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-2">
          {allImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-7 bg-white' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div className="relative z-[2] flex items-center h-full px-6 md:px-16 lg:px-32 py-20">
        <div
          className={`w-full max-w-7xl mx-auto grid gap-12 items-center ${
            showConsultantPhoto ? 'md:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* ── Left: Text content ── */}
          <div className="text-left">
            <motion.p
              custom={0}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              className="font-semibold text-xs md:text-sm tracking-widest uppercase mb-4"
              style={{ color: colors.secondary, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
              {tagline}
            </motion.p>

            <motion.h1
              custom={1}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.45)' }}
            >
              {title}
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              className="text-base md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 max-w-xl"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
            >
              {subtitle}
            </motion.p>

            {/* ── CTA Button ── */}
            <motion.div
              custom={3}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-sm md:text-base text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
                style={{ backgroundColor: colors.ctaBg }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primaryDark
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.ctaBg
                }}
              >
                {ctaText}
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
              </a>
            </motion.div>
          </div>

          {/* ── Right: Consultant photo (consulting only) ── */}
          {showConsultantPhoto && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
              className="hidden md:flex justify-center"
            >
              <div className="relative">
                {/* Glow effect behind the photo */}
                <div
                  className="absolute -inset-4 rounded-full opacity-20 blur-2xl"
                  style={{ backgroundColor: colors.primary }}
                />
                <Image
                  src={shop.consultantPhotoUrl!}
                  alt="Consultant"
                  width={320}
                  height={320}
                  className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-full object-cover border-4 border-white shadow-2xl"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}