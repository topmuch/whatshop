'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ThemeColors, ThemeHero } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'

interface ElectroHeroProps {
  colors: ThemeColors
  hero: ThemeHero
  shop: Shop | null
  isServiceMode?: boolean
  showConsultantPhoto?: boolean
}

/**
 * Parse the JSON array of hero images stored on the shop.
 */
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

/**
 * ElectroHero — Displays ONLY the featured product image, full width.
 * No text, no stats, no buttons, no overlay.
 * Mobile: one large image ~300-400px height.
 * Desktop: full width, max 600px height.
 */
export default function ElectroHero({
  shop,
}: ElectroHeroProps) {
  // ALL hooks must be called before any conditional return
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const displayImages = useMemo(() => {
    const heroImages = parseHeroImages(shop?.heroImages)
    const customHeroUrl = shop?.heroImageUrl

    const allImages: string[] = []
    if (customHeroUrl) allImages.push(customHeroUrl)
    allImages.push(...heroImages)

    if (allImages.length > 0) return allImages
    if (shop?.banner) return [shop.banner]
    return []
  }, [shop?.heroImages, shop?.heroImageUrl, shop?.banner])

  // Carousel auto-advance (no-op when 0-1 images)
  useEffect(() => {
    if (displayImages.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % displayImages.length
        setIsTransitioning(true)
        setTimeout(() => setIsTransitioning(false), 700)
        return next
      })
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [displayImages.length])

  // Early return AFTER all hooks
  if (displayImages.length === 0) return null

  function goToSlide(nextIndex: number) {
    if (isTransitioning || displayImages.length <= 1) return
    setIsTransitioning(true)
    setActiveIndex(nextIndex)
    setTimeout(() => setIsTransitioning(false), 700)
  }

  return (
    <section
      className="relative w-full bg-gray-50 overflow-hidden"
      aria-label="Image vedette"
    >
      <div className="relative w-full" style={{ maxHeight: '600px' }}>
        {displayImages.length === 1 ? (
          /* Single image — simple render */
          <Image
            src={displayImages[0]}
            alt="Produit vedette"
            width={1400}
            height={600}
            className="w-full h-auto object-cover"
            style={{ maxHeight: '600px' }}
            priority
            sizes="100vw"
            quality={85}
          />
        ) : (
          /* Multiple images — carousel */
          <>
            {displayImages.map((src, idx) => (
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
                  style={{ maxHeight: '600px' }}
                />
              </motion.div>
            ))}

            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {displayImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? 'w-7 bg-gray-800' : 'w-1.5 bg-gray-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}