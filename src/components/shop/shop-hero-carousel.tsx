'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Slide {
  id: string
  image: string
  title: string
  subtitle: string
  cta?: string
  ctaLink?: string
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'fashion',
    image: '/banners/banner-fashion.png',
    title: 'Nouvelle Collection',
    subtitle: 'Découvrez nos robes et tenues uniques en tissu Wax et Bazin',
    cta: 'Découvrir',
  },
  {
    id: 'accessoires',
    image: '/banners/banner-accessoires.png',
    title: 'Accessoires Artisanaux',
    subtitle: 'Bijoux, sacs et accessoires faits main avec amour',
    cta: 'Voir la collection',
  },
  {
    id: 'promo',
    image: '/banners/banner-promo.png',
    title: 'Offres Spéciales',
    subtitle: 'Promotions exceptionnelles sur une sélection de produits',
    cta: 'En profiter',
  },
  {
    id: 'tissus',
    image: '/banners/banner-tissus.png',
    title: 'Tissus Premium',
    subtitle: 'Wax Hollandais, Bazin riche et Kente authentique',
    cta: 'Explorer',
  },
]

interface ShopHeroCarouselProps {
  slides?: Slide[]
  shopName?: string
  whatsapp?: string
}

export function ShopHeroCarousel({ slides, shopName, whatsapp }: ShopHeroCarouselProps) {
  const carouselSlides = slides || DEFAULT_SLIDES

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4500, stopOnInteraction: false }),
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  function handleCtaClick(slide: Slide) {
    if (whatsapp) {
      const msg = encodeURIComponent(
        `Bonjour ${shopName || ''} ! 👋\nJe suis intéressé(e) par : ${slide.title}\n\nPouvez-vous me donner plus d'informations ?`
      )
      const phone = whatsapp.replace(/\D/g, '')
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    }
  }

  return (
    <div className="relative w-full h-52 sm:h-64 md:h-80 lg:h-96 overflow-hidden bg-black">
      {/* Carousel */}
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {carouselSlides.map((slide) => (
            <div key={slide.id} className="min-w-0 flex-[0_0_100%] h-full relative">
              {/* Background image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-5xl mx-auto px-6 sm:px-8 w-full">
                  <div className="max-w-md">
                    <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-[11px] sm:text-xs font-medium px-3 py-1 rounded-full mb-3">
                      <Sparkles className="h-3 w-3" />
                      {shopName || 'WhatsShop'}
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base text-white/80 mt-2 line-clamp-2 drop-shadow-md">
                      {slide.subtitle}
                    </p>
                    <div className="flex items-center gap-3 mt-4 sm:mt-6">
                      {slide.cta && (
                        <Button
                          size={slide.cta ? 'default' : 'sm'}
                          className="h-9 sm:h-10 px-4 sm:px-6 gap-2 text-xs sm:text-sm font-semibold shadow-lg"
                          onClick={() => handleCtaClick(slide)}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          {slide.cta}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className={cn(
          'absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 sm:h-10 sm:w-10 rounded-full',
          'bg-white/20 backdrop-blur-sm text-white border border-white/30',
          'flex items-center justify-center hover:bg-white/30 transition-all duration-200',
          'opacity-0 sm:opacity-100 group-hover:opacity-100'
        )}
        aria-label="Slide précédent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={scrollNext}
        className={cn(
          'absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 sm:h-10 sm:w-10 rounded-full',
          'bg-white/20 backdrop-blur-sm text-white border border-white/30',
          'flex items-center justify-center hover:bg-white/30 transition-all duration-200',
          'opacity-0 sm:opacity-100 group-hover:opacity-100'
        )}
        aria-label="Slide suivant"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {carouselSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={cn(
              'rounded-full transition-all duration-300',
              currentIndex === idx
                ? 'w-6 h-2 bg-white shadow-sm'
                : 'w-2 h-2 bg-white/50 hover:bg-white/70'
            )}
            aria-label={`Aller au slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-10">
        <div
          className="h-full bg-white/60 transition-transform duration-[4500ms] ease-linear"
          style={{
            transform: currentIndex === 0 ? 'translateX(0%)' : 'translateX(100%)',
          }}
        />
      </div>
    </div>
  )
}
