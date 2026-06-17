'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface GalleryImage {
  id: string
  url: string
  order: number
}

interface ImageGalleryProps {
  images: GalleryImage[]
  fallbackUrl?: string | null
  alt: string
  discountPercent?: number
}

export function ImageGallery({ images, fallbackUrl, alt, discountPercent }: ImageGalleryProps) {
  const allImages = images.length > 0
    ? images.sort((a, b) => a.order - b.order).map((i) => i.url)
    : fallbackUrl
      ? [fallbackUrl]
      : []

  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const next = useCallback(() => setActiveIndex((i) => (i + 1) % allImages.length), [allImages.length])
  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + allImages.length) % allImages.length), [allImages.length])

  // Navigation clavier dans la lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, next, prev])

  if (allImages.length === 0) {
    return (
      <div className="relative flex aspect-square w-full items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200">
        <span className="text-7xl opacity-40">🛍️</span>
      </div>
    )
  }

  return (
    <>
      {/* Image principale */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gray-50">
        <Image
          key={activeIndex}
          src={allImages[activeIndex]}
          alt={alt}
          fill
          unoptimized
          priority={activeIndex === 0}
          className="cursor-zoom-in object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          onClick={() => setLightboxOpen(true)}
        />
        {/* Badge promo */}
        {discountPercent && discountPercent > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-bold text-black shadow-lg">
            -{discountPercent}%
          </span>
        )}
        {/* Bouton zoom */}
        <button
          onClick={() => setLightboxOpen(true)}
          aria-label="Agrandir l'image"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition-colors hover:bg-white"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        {/* Navigation (desktop) */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition-colors hover:bg-white md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition-colors hover:bg-white md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Miniatures */}
      {allImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {allImages.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Voir l'image ${i + 1}`}
              aria-current={i === activeIndex}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                i === activeIndex ? 'border-gray-900 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={url} alt="" fill unoptimized className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false) }}
              aria-label="Fermer"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  aria-label="Précédent"
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next() }}
                  aria-label="Suivant"
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <motion.div
              key={activeIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="relative h-[85vh] w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[activeIndex]}
                alt={alt}
                fill
                unoptimized
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
