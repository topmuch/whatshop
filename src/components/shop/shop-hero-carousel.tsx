'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTemplate } from './template-provider'
import { cn } from '@/lib/utils'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

interface Slide {
  id: string
  image: string
  title: string
  subtitle: string
  cta?: string
}

const DEFAULT_SLIDES: Slide[] = [
  { id: 'beauty-soins', image: '/banners/beauty-soins.png', title: 'Soins de Luxe', subtitle: 'Crèmes, sérums et soins premium pour une peau éclatante de beauté', cta: 'Découvrir' },
  { id: 'beauty-maquillage', image: '/banners/beauty-maquillage.png', title: 'Maquillage Professionnel', subtitle: 'Palettes, rouges à lèvres et mascaras pour un look sublime', cta: 'Voir la collection' },
  { id: 'beauty-promo', image: '/banners/beauty-promo.png', title: 'Offres Exclusives', subtitle: 'Coffrets cadeaux et promotions exceptionnelles à ne pas manquer', cta: 'En profiter' },
  { id: 'beauty-naturel', image: '/banners/beauty-naturel.png', title: 'Beauté Naturelle', subtitle: 'Huiles essentielles, argan et produits bio pour votre bien-être', cta: 'Explorer' },
]

interface ShopHeroCarouselProps {
  slides?: Slide[]
  shopName?: string
  whatsapp?: string
  heroImages?: string
}

export function ShopHeroCarousel({ slides, shopName, whatsapp, heroImages }: ShopHeroCarouselProps) {
  const template = useTemplate()

  // Parse custom hero images from JSON string
  let customSlides: Slide[] = []
  if (heroImages) {
    try {
      const imgs = JSON.parse(heroImages)
      if (Array.isArray(imgs) && imgs.length > 0) {
        customSlides = imgs.map((img: string, idx: number) => ({
          id: `custom-${idx}`,
          image: img,
          title: shopName || 'Bienvenue',
          subtitle: 'Découvrez nos produits',
          cta: 'Commander',
        }))
      }
    } catch {
      // fallback to defaults
    }
  }

  const carouselSlides = slides || customSlides.length > 0 ? customSlides : DEFAULT_SLIDES

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4500, stopOnInteraction: false }),
  ])
  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  function handleCtaClick(slide: Slide) {
    if (whatsapp) {
      const msg = encodeURIComponent(`Bonjour ${shopName || ''} ! 👋\nJe suis intéressé(e) par : ${slide.title}\n\nPouvez-vous me donner plus d'informations ?`)
      const phone = whatsapp.replace(/\D/g, '')
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    }
  }

  // Template-specific carousel heights
  const heroHeight = template.id === 'xstore-electro'
    ? 'h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]'
    : 'h-52 sm:h-64 md:h-80 lg:h-96'

  // Template-specific overlay styles
  const overlayStyle = 'bg-gradient-to-r from-black/70 via-black/40 to-black/20'

  // Template-specific CTA style
  const ctaStyle = template.layout.buttonStyle === 'rounded'
    ? 'rounded-lg'
    : 'rounded-md'

  return (
    <div className={cn('relative w-full overflow-hidden bg-black', heroHeight)}>
      {/* Carousel */}
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {carouselSlides.map((slide) => (
            <div key={slide.id} className="min-w-0 flex-[0_0_100%] h-full relative">
              <ImageWithFallback
                src={slide.image}
                alt={slide.title}
                fill
                className={cn(
                  'w-full h-full object-cover',
                  template.id === 'xstore-electro' && 'object-center'
                )}
                fallbackIcon="image"
              />
              {/* Template-aware overlay */}
              <div className={cn('absolute inset-0', overlayStyle)} />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-5xl mx-auto px-6 sm:px-8 w-full">
                  <div className="max-w-md">
                    {/* Shop name badge */}
                    <div
                      className="inline-flex items-center gap-1.5 backdrop-blur-sm text-white text-[11px] sm:text-xs font-medium px-3 py-1 rounded-full mb-3"
                      style={{ background: 'var(--tpl-hero-badge)' }}
                    >
                      <Sparkles className="h-3 w-3" />
                      {shopName || 'Boutiko'}
                    </div>
                    <h2
                      className={cn(
                        'font-bold leading-tight drop-shadow-lg',
                          'text-xl sm:text-2xl md:text-4xl'
                      )}
                      style={{ color: 'var(--tpl-hero-text)' }}
                    >
                      {slide.title}
                    </h2>
                    <p
                      className={cn(
                        'mt-2 line-clamp-2 drop-shadow-md',
                        'text-xs sm:text-sm md:text-base'
                      )}
                      style={{ color: 'var(--tpl-hero-text)', opacity: 0.8 }}
                    >
                      {slide.subtitle}
                    </p>
                    <div className="flex items-center gap-3 mt-4 sm:mt-6">
                      {slide.cta && (
                        <Button
                          size='default'
                          className={cn('h-9 sm:h-10 px-4 sm:px-6 gap-2 text-xs sm:text-sm font-semibold shadow-lg', ctaStyle)}
                          style={{ background: 'var(--tpl-cta-bg)', color: 'var(--tpl-cta-fg)' }}
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
          'flex items-center justify-center hover:bg-white/30 transition-all duration-200'
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
          'flex items-center justify-center hover:bg-white/30 transition-all duration-200'
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
                ? 'w-6 h-2 shadow-sm'
                : 'w-2 h-2 hover:opacity-80'
            )}
            style={{
              background: currentIndex === idx ? 'var(--tpl-primary)' : 'rgba(255,255,255,0.5)',
            }}
            aria-label={`Aller au slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-10">
        <div
          className="h-full transition-transform duration-[4500ms] ease-linear"
          style={{
            background: 'var(--tpl-primary)',
            transform: currentIndex === 0 ? 'translateX(0%)' : 'translateX(100%)',
          }}
        />
      </div>
    </div>
  )
}
