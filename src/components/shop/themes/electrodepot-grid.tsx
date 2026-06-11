'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  Award,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Star,
  Eye,
  Clock,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Product as ProductType, formatPrice } from '@/lib/shared'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
}

interface ElectroDepotGridProps {
  filteredProducts: ProductType[]
  publicCategories: Category[]
  publicProducts: ProductType[]
  activeCategory: string | null
  searchQuery: string
  sortBy: string
  isSearching: boolean
  totalProductCount: number
  onCategoryClick: (id: string | null) => void
  onProductClick: (product: ProductType) => void
  onAddToCart: (product: ProductType) => void
  getCartQuantity: (productId: string) => number
  updateCartQuantity: (productId: string, qty: number) => void
  onSortChange: (sort: string) => void
  onSearchChange: (query: string) => void
  shopName?: string
  whatsapp?: string
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#E31837',
  secondary: '#1a1a2e',
  accent: '#ff6b00',
  bg: '#ffffff',
  text: '#1a1a1a',
  muted: '#666666',
  border: '#e0e0e0',
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PROMO_MESSAGES = [
  '🚚 Livraison gratuite dès 50 000 FCFA',
  '🔥 Méga Promo : jusqu\'à -40% sur les TV',
  '📞 Contactez-nous au +225 00 00 00 00',
  '✅ Retour gratuit sous 30 jours',
  '⚡ Paiement sécurisé & garanti',
  '🎁 Offre spéciale : Écouteurs offerts dès 100 000 FCFA',
]

const HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'MÉGA PROMO TV & SON',
    subtitle: 'Jusqu\'à -40% sur une sélection exceptionnelle de téléviseurs et systèmes audio. Ne manquez pas ces offres !',
    cta: 'Découvrir les offres',
    gradient: 'linear-gradient(135deg, #E31837 0%, #ff6b00 50%, #1a1a2e 100%)',
  },
  {
    id: 'slide-2',
    title: 'NOUVEAUTÉS SMARTPHONE',
    subtitle: 'Les derniers modèles de smartphones aux meilleurs prix. Livraison offerte et garantie 2 ans incluse.',
    cta: 'Voir les nouveautés',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #E31837 50%, #ff6b00 100%)',
  },
  {
    id: 'slide-3',
    title: 'CLIMATISATION : SOLDES',
    subtitle: 'Préparez l\'été avec nos climatiseurs et ventilateurs. Économisez jusqu\'à -35% ce mois-ci.',
    cta: 'Profiter des soldes',
    gradient: 'linear-gradient(135deg, #ff6b00 0%, #E31837 50%, #1a1a2e 100%)',
  },
]

const QUICK_CATEGORIES = [
  { id: 'qc-tel', name: 'Téléphone', emoji: '📱' },
  { id: 'qc-tv', name: 'TV', emoji: '📺' },
  { id: 'qc-pc', name: 'PC', emoji: '💻' },
  { id: 'qc-cuisine', name: 'Cuisine', emoji: '🍳' },
  { id: 'qc-frigo', name: 'Frigo', emoji: '🧊' },
  { id: 'qc-clim', name: 'Climatisation', emoji: '❄️' },
  { id: 'qc-audio', name: 'Audio', emoji: '🔊' },
  { id: 'qc-photo', name: 'Photo', emoji: '📷' },
  { id: 'qc-gaming', name: 'Gaming', emoji: '🎮' },
  { id: 'qc-access', name: 'Accessoires', emoji: '⚡' },
]

const TRUST_BADGES = [
  { icon: Truck, label: 'Livraison gratuite', desc: 'Dès 50 000 FCFA' },
  { icon: RotateCcw, label: 'Retour gratuit', desc: 'Sous 30 jours' },
  { icon: Shield, label: 'Paiement sécurisé', desc: 'SSL 256 bits' },
  { icon: Award, label: 'Garantie 2 ans', desc: 'Sur tous les produits' },
]

const BRANDS = [
  'Samsung', 'LG', 'Sony', 'Apple', 'Philips', 'Bosch',
  'Whirlpool', 'Canon', 'Nikon', 'JBL', 'Huawei', 'Xiaomi',
  'Dell', 'HP', 'Lenovo', 'Asus', 'Hisense', 'TCL',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── CSS Keyframes (injected via <style>) ─────────────────────────────────────

function MarqueeStyles() {
  return (
    <style>{`
      @keyframes marquee-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes marquee-reverse {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(0); }
      }
      .marquee-track {
        animation: marquee-scroll 30s linear infinite;
      }
      .marquee-track:hover {
        animation-play-state: paused;
      }
      .marquee-brand-track {
        animation: marquee-scroll 20s linear infinite;
      }
      .marquee-brand-track:hover {
        animation-play-state: paused;
      }
    `}</style>
  )
}

// ─── Section Wrapper (fade-in on scroll) ──────────────────────────────────────

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ─── 1. Top Promo Bar ─────────────────────────────────────────────────────────

function PromoBar() {
  const doubledMessages = [...PROMO_MESSAGES, ...PROMO_MESSAGES]

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ backgroundColor: COLORS.primary }}
    >
      <div className="marquee-track flex items-center whitespace-nowrap py-2.5">
        {doubledMessages.map((msg, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 text-white text-xs sm:text-sm font-medium px-6"
          >
            {msg}
            <span className="text-white/40">|</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── 2. Hero Slider ──────────────────────────────────────────────────────────

function HeroSlider({ shopName, onCategoryClick }: { shopName?: string; onCategoryClick: (id: string | null) => void }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
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

  return (
    <div className="relative w-full overflow-hidden rounded-none">
      <div ref={emblaRef} className="w-full" style={{ aspectRatio: '16 / 5' }}>
        <div className="flex h-full">
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="min-w-0 flex-[0_0_100%] h-full relative"
              style={{ background: slide.gradient }}
            >
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                <div className="absolute top-1/4 right-[10%] w-64 h-64 rounded-full bg-white/20" />
                <div className="absolute bottom-1/4 right-[25%] w-40 h-40 rounded-full bg-white/15" />
                <div className="absolute top-1/3 right-[5%] w-24 h-24 rounded-full bg-white/10" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 w-full">
                  <div className="max-w-lg">
                    <span
                      className="inline-block text-white/80 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-2"
                    >
                      {shopName || 'ElectroDépôt'}
                    </span>
                    <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-lg">
                      {slide.title}
                    </h2>
                    <p className="mt-2 text-white/80 text-xs sm:text-sm md:text-base line-clamp-2 drop-shadow-md max-w-md">
                      {slide.subtitle}
                    </p>
                    <button
                      onClick={() => onCategoryClick(null)}
                      className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold transition-all hover:bg-white/90 hover:scale-[1.03] active:scale-[0.98]"
                      style={{ color: COLORS.primary }}
                    >
                      {slide.cta}
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: square aspect ratio overlay fix */}
      <style>{`
        @media (max-width: 640px) {
          [data-hero-root] > div:first-child { aspect-ratio: 1 / 1 !important; }
        }
      `}</style>

      {/* Nav arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 sm:h-10 sm:w-10 rounded-sm bg-white/20 backdrop-blur-sm text-white border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 sm:h-10 sm:w-10 rounded-sm bg-white/20 backdrop-blur-sm text-white border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all"
        aria-label="Slide suivant"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className="rounded-none transition-all duration-300"
            style={{
              width: currentIndex === idx ? 24 : 8,
              height: 8,
              background: currentIndex === idx ? COLORS.primary : 'rgba(255,255,255,0.5)',
            }}
            aria-label={`Aller au slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// ─── 3. Quick Category Circles ────────────────────────────────────────────────

function QuickCategoryCircles({
  publicCategories,
  activeCategory,
  onCategoryClick,
}: {
  publicCategories: Category[]
  activeCategory: string | null
  onCategoryClick: (id: string | null) => void
}) {
  // Merge predefined categories with real ones when possible
  const allCats = [...QUICK_CATEGORIES]
  for (const cat of publicCategories) {
    const exists = allCats.some(
      (qc) => qc.name.toLowerCase() === cat.name.toLowerCase()
    )
    if (!exists) {
      allCats.push({ id: cat.id, name: cat.name, emoji: '🏷️' })
    }
  }

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-4 sm:gap-6 px-2 sm:px-4 min-w-max">
        {allCats.map((cat) => {
          const isActive = activeCategory === cat.id
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryClick(isActive ? null : cat.id)}
              className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <div
                className="flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: isActive ? COLORS.primary : '#f5f5f5',
                  boxShadow: isActive ? `0 4px 12px ${COLORS.primary}40` : 'none',
                  border: isActive ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                }}
              >
                <span className="text-2xl">{cat.emoji}</span>
              </div>
              <span
                className="text-[11px] font-medium text-center leading-tight max-w-[64px] truncate transition-colors"
                style={{ color: isActive ? COLORS.primary : COLORS.muted }}
              >
                {cat.name}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ElectroDepotProductCard({
  product,
  onAddToCart,
  onProductClick,
  getCartQuantity,
  updateCartQuantity,
  index,
}: {
  product: ProductType
  onAddToCart: (product: ProductType) => void
  onProductClick: (product: ProductType) => void
  getCartQuantity: (productId: string) => number
  updateCartQuantity: (productId: string, qty: number) => void
  index: number
}) {
  const cartQty = getCartQuantity(product.id)
  const inStock = (product.stock ?? 0) > 0
  const priceFormatted = formatPrice(product.price)

  return (
    <motion.div
      className="group flex flex-col bg-white overflow-hidden cursor-pointer transition-shadow duration-200 hover:shadow-lg"
      style={{ border: `1px solid ${COLORS.border}`, borderRadius: '2px' }}
      onClick={() => onProductClick(product)}
    >
      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        {product.image || product.images?.[0] ? (
          <img
            src={product.image || product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1' }}
            style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Package className="size-12 text-gray-300" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/90 transition-all duration-300 opacity-0 group-hover:opacity-100">
            <Eye className="size-5 transition-colors text-white group-hover:text-[#1a1a1a]" />
          </div>
        </div>

        {/* Stock badge */}
        {inStock && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-none text-white bg-green-600">
              ✓ En stock
            </span>
          </div>
        )}

        {/* Out of stock */}
        {!inStock && product.isAvailable && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-none text-white bg-gray-500">
              Rupture
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        {/* Name */}
        <h3
          className="text-sm font-medium leading-snug line-clamp-2"
          style={{ color: COLORS.text }}
        >
          {product.name}
        </h3>

        {/* Category tag */}
        {product.category && (
          <span className="text-[11px]" style={{ color: COLORS.muted }}>
            {product.category.name}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <span className="text-base font-bold" style={{ color: COLORS.primary }}>
          {priceFormatted}
        </span>

        {/* CTA / Cart controls */}
        <div onClick={(e) => e.stopPropagation()}>
          {cartQty === 0 ? (
            <Button
              onClick={() => onAddToCart(product)}
              disabled={!product.isAvailable || !inStock}
              className="w-full h-9 gap-1.5 rounded-none text-xs font-bold uppercase tracking-wide transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: product.isAvailable && inStock ? COLORS.primary : '#999',
                color: '#fff',
              }}
            >
              <Plus className="size-3.5" />
              Ajouter au panier
            </Button>
          ) : (
            <div className="flex items-center" style={{ border: `1px solid ${COLORS.primary}30` }}>
              <button
                onClick={() => updateCartQuantity(product.id, cartQty - 1)}
                className="flex items-center justify-center w-9 h-9 transition-colors hover:bg-gray-50"
                style={{ borderRight: `1px solid ${COLORS.border}` }}
              >
                {cartQty === 1 ? (
                  <Trash2 className="size-3.5 text-red-500" />
                ) : (
                  <Minus className="size-3.5" style={{ color: COLORS.primary }} />
                )}
              </button>
              <span
                className="flex-1 flex items-center justify-center h-9 text-sm font-bold tabular-nums"
                style={{ color: COLORS.primary }}
              >
                {cartQty}
              </span>
              <button
                onClick={() => updateCartQuantity(product.id, cartQty + 1)}
                className="flex items-center justify-center w-9 h-9 transition-colors hover:bg-gray-50"
                style={{ borderLeft: `1px solid ${COLORS.border}` }}
              >
                <Plus className="size-3.5" style={{ color: COLORS.primary }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── 6. Promotional Banner ───────────────────────────────────────────────────

function PromoBanner({ onCategoryClick }: { onCategoryClick: (id: string | null) => void }) {
  return (
    <div
      className="relative overflow-hidden rounded-none p-6 sm:p-8 md:p-10 cursor-pointer"
      style={{ background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)` }}
      onClick={() => onCategoryClick(null)}
    >
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
            Offre exclusive
          </span>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
            🔥 VENTE FLASH : ÉLECTROMÉNAGER
          </h3>
          <p className="mt-1 text-white/70 text-sm sm:text-base max-w-lg">
            Jusqu&apos;à -50% sur une sélection de réfrigérateurs, machines à laver et climatiseurs. Offre limitée !
          </p>
        </div>
        <button
          className="flex-shrink-0 inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-bold rounded-none transition-all hover:bg-gray-100 hover:scale-[1.03] active:scale-[0.98]"
          style={{ color: COLORS.primary }}
          onClick={(e) => {
            e.stopPropagation()
            onCategoryClick(null)
          }}
        >
          Voir les offres
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

// ─── 8. Double Promo Banners ──────────────────────────────────────────────────

function DoublePromoBanners({ onCategoryClick }: { onCategoryClick: (id: string | null) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Left promo */}
      <div
        className="relative overflow-hidden rounded-none p-5 sm:p-6 cursor-pointer transition-all hover:opacity-95"
        style={{ background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff9500 100%)` }}
        onClick={() => onCategoryClick(null)}
      >
        <div className="absolute top-2 right-3 text-4xl opacity-80">📱💻</div>
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
          High-tech
        </span>
        <h3 className="text-lg sm:text-xl font-black text-white">
          PC & ÉCRANS
        </h3>
        <p className="mt-1 text-white/80 text-xs sm:text-sm">
          Ordinateurs portables et écrans 4K à prix cassés
        </p>
        <button
          className="mt-3 inline-flex items-center gap-1.5 bg-white px-4 py-2 text-xs font-bold rounded-none transition-all hover:scale-[1.03]"
          style={{ color: COLORS.accent }}
          onClick={(e) => { e.stopPropagation(); onCategoryClick(null) }}
        >
          Acheter <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* Right promo */}
      <div
        className="relative overflow-hidden rounded-none p-5 sm:p-6 cursor-pointer transition-all hover:opacity-95"
        style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #c41230 100%)` }}
        onClick={() => onCategoryClick(null)}
      >
        <div className="absolute top-2 right-3 text-4xl opacity-80">🎮⚡</div>
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
          Gaming
        </span>
        <h3 className="text-lg sm:text-xl font-black text-white">
          UNIVER GAMING
        </h3>
        <p className="mt-1 text-white/80 text-xs sm:text-sm">
          Consoles, manettes et accessoires pour gamers
        </p>
        <button
          className="mt-3 inline-flex items-center gap-1.5 bg-white px-4 py-2 text-xs font-bold rounded-none transition-all hover:scale-[1.03]"
          style={{ color: COLORS.primary }}
          onClick={(e) => { e.stopPropagation(); onCategoryClick(null) }}
        >
          Explorer <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── 9. Brands Marquee ────────────────────────────────────────────────────────

function BrandsMarquee() {
  const doubledBrands = [...BRANDS, ...BRANDS]

  return (
    <div className="w-full overflow-hidden py-6" style={{ borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
      <div className="marquee-brand-track flex items-center whitespace-nowrap">
        {doubledBrands.map((brand, i) => (
          <span
            key={i}
            className="inline-flex items-center px-8 sm:px-10 text-base sm:text-lg font-bold uppercase tracking-wide"
            style={{ color: COLORS.muted }}
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── 10. Newsletter Section ───────────────────────────────────────────────────

function NewsletterSection() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      toast.info('Service bientôt disponible !')
      setEmail('')
    }
  }

  return (
    <div
      className="rounded-none p-6 sm:p-8 text-center"
      style={{ backgroundColor: '#f8f9fa', border: `1px solid ${COLORS.border}` }}
    >
      <Send className="size-8 mx-auto mb-3" style={{ color: COLORS.primary }} />
      <h3 className="text-lg sm:text-xl font-bold" style={{ color: COLORS.secondary }}>
        Newsletter ElectroDépôt
      </h3>
      <p className="mt-1 text-sm max-w-md mx-auto" style={{ color: COLORS.muted }}>
        Inscrivez-vous pour recevoir nos offres exclusives, promotions et nouveautés directement dans votre boîte mail.
      </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 h-10 rounded-none text-sm"
            style={{ borderColor: COLORS.border }}
          />
          <Button
            type="submit"
            className="h-10 px-6 rounded-none text-sm font-bold uppercase tracking-wide hover:opacity-90"
            style={{ backgroundColor: COLORS.primary, color: '#fff' }}
          >
            S&apos;inscrire
          </Button>
        </form>
    </div>
  )
}

// ─── 11. Footer ──────────────────────────────────────────────────────────────

function Footer({ shopName, whatsapp }: { shopName?: string; whatsapp?: string }) {
  return (
    <footer style={{ backgroundColor: COLORS.secondary }} className="mt-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1 - About */}
          <div>
            <h4 className="text-white font-bold text-base mb-3">
              {shopName || 'ElectroDépôt'}
            </h4>
            <p className="text-white/60 text-sm leading-relaxed">
              Votre destination numéro 1 pour l&apos;électronique et l&apos;électroménager.
              Qualité, prix et service depuis plus de 10 ans.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center justify-center w-8 h-8 bg-white/10 text-white">
                <Phone className="size-4" />
              </div>
              <span className="text-white/60 text-sm">+225 00 00 00 00</span>
            </div>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors"
              >
                💬 Commander via WhatsApp
              </a>
            )}
          </div>

          {/* Col 2 - Categories */}
          <div>
            <h4 className="text-white font-bold text-base mb-3">Nos Catégories</h4>
            <ul className="space-y-2">
              {['Téléphones', 'TV & Son', 'Informatique', 'Électroménager', 'Climatisation', 'Gaming'].map((item) => (
                <li key={item}>
                  <span className="text-white/50 text-sm hover:text-white/80 transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 - Services */}
          <div>
            <h4 className="text-white font-bold text-base mb-3">Services</h4>
            <ul className="space-y-2">
              {[
                'Livraison gratuite',
                'Retour sous 30 jours',
                'Garantie 2 ans',
                'Paiement sécurisé',
                'Installation à domicile',
                'Service après-vente',
              ].map((item) => (
                <li key={item}>
                  <span className="text-white/50 text-sm hover:text-white/80 transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 - Contact */}
          <div>
            <h4 className="text-white font-bold text-base mb-3">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-white/40 flex-shrink-0 mt-0.5" />
                <span className="text-white/50 text-sm">Abidjan, Cocody Riviera Palmeraie</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="size-4 text-white/40 flex-shrink-0 mt-0.5" />
                <span className="text-white/50 text-sm">+225 00 00 00 00</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="size-4 text-white/40 flex-shrink-0 mt-0.5" />
                <span className="text-white/50 text-sm">contact@electrodepot.ci</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="size-4 text-white/40 flex-shrink-0 mt-0.5" />
                <span className="text-white/50 text-sm">Lun - Sam : 8h - 20h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="text-white/40 text-xs">
            © {new Date().getFullYear()} {shopName || 'ElectroDépôt'}. Tous droits réservés.
          </span>
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-xs hover:text-white/60 cursor-pointer transition-colors">Conditions générales</span>
            <span className="text-white/40 text-xs hover:text-white/60 cursor-pointer transition-colors">Politique de confidentialité</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  searchQuery,
  onReset,
}: {
  searchQuery: string
  onReset: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center px-4"
    >
      <div className="flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: '#fef2f2' }}>
        <Search className="size-8" style={{ color: COLORS.primary }} />
      </div>
      <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
        Aucun résultat trouvé
      </h3>
      <p className="mt-2 text-sm max-w-sm" style={{ color: COLORS.muted }}>
        {searchQuery
          ? `Aucun produit ne correspond à "${searchQuery}". Essayez un autre terme de recherche.`
          : 'Aucun produit dans cette catégorie pour le moment.'}
      </p>
      <Button
        onClick={onReset}
        className="mt-4 rounded-none px-5 font-bold text-sm uppercase tracking-wide hover:opacity-90"
        style={{ backgroundColor: COLORS.primary, color: '#fff' }}
      >
        Réinitialiser les filtres
      </Button>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ElectroDepotGrid({
  filteredProducts,
  publicCategories,
  publicProducts,
  activeCategory,
  searchQuery,
  sortBy,
  isSearching,
  totalProductCount,
  onCategoryClick,
  onProductClick,
  onAddToCart,
  getCartQuantity,
  updateCartQuantity,
  onSortChange,
  onSearchChange,
  shopName,
  whatsapp,
}: ElectroDepotGridProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value)
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      searchTimerRef.current = setTimeout(() => {
        onSearchChange(value)
      }, 300)
    },
    [onSearchChange]
  )

  // Whether we're in a "home" view vs filtered/search view
  const isFiltering = isSearching || searchQuery.trim() !== '' || activeCategory !== null

  // Determine "recommended" products (first 10 available)
  const recommendedProducts = publicProducts
    .filter((p) => p.isAvailable && (p.stock ?? 0) > 0)
    .slice(0, 10)

  // Determine "featured" products (next batch after recommended)
  const featuredProducts = publicProducts
    .filter((p) => p.isAvailable && (p.stock ?? 0) > 0)
    .slice(10, 18)

  // Empty state: no products at all
  if (!isSearching && publicProducts.length === 0) {
    return (
      <div className="w-full">
        <PromoBar />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: '#fef2f2' }}>
            <Package className="size-10" style={{ color: COLORS.primary, opacity: 0.5 }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
            Aucun produit disponible
          </h3>
          <p className="mt-2 text-sm text-center max-w-md" style={{ color: COLORS.muted }}>
            Cette boutique n&apos;a pas encore de produits. Revenez bientôt pour découvrir notre sélection !
          </p>
        </div>
        <Footer shopName={shopName} whatsapp={whatsapp} />
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ backgroundColor: COLORS.bg }}>
      <MarqueeStyles />

      {/* ─── 1. Promo Bar ─── */}
      <PromoBar />

      {/* ─── 2. Hero Slider ─── */}
      {!isFiltering && (
        <div className="px-0">
          <HeroSlider shopName={shopName} onCategoryClick={onCategoryClick} />
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6">
        {/* ─── 3. Quick Category Circles ─── */}
        <Section className="mt-6 sm:mt-8">
          <QuickCategoryCircles
            publicCategories={publicCategories}
            activeCategory={activeCategory}
            onCategoryClick={onCategoryClick}
          />
        </Section>

        {/* ─── Search + Sort ─── */}
        <Section className="mt-5">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: COLORS.muted }} />
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10 h-10 rounded-none text-sm"
                style={{ borderColor: COLORS.border }}
              />
              {localSearch && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                  aria-label="Effacer la recherche"
                >
                  <X className="size-4" style={{ color: COLORS.muted }} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="h-10 px-3 rounded-none text-sm border cursor-pointer focus:outline-none focus:ring-1"
                style={{ borderColor: COLORS.border, color: COLORS.text }}
              >
                <option value="recent">Plus récent</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              {isFiltering && (
                <Button
                  onClick={() => {
                    onSearchChange('')
                    setLocalSearch('')
                    onCategoryClick(null)
                  }}
                  className="h-10 px-3 rounded-none text-xs font-semibold hover:opacity-90"
                  style={{ backgroundColor: COLORS.secondary, color: '#fff' }}
                >
                  <X className="size-3.5 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </Section>

        {/* ─── Results Info ─── */}
        {isFiltering && filteredProducts.length > 0 && (
          <div className="flex items-center gap-2 mt-4 text-sm" style={{ color: COLORS.muted }}>
            <ShoppingBag className="size-4" />
            <span>
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
              {searchQuery && <> pour &laquo;{searchQuery}&raquo;</>}
            </span>
          </div>
        )}

        {/* ═══════════════ HOME VIEW (no filters) ═══════════════ */}
        {!isFiltering && (
          <>
            {/* ─── 4. Recommended Products ─── */}
            {recommendedProducts.length > 0 && (
              <Section className="mt-8 sm:mt-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-7 rounded-none" style={{ backgroundColor: COLORS.primary }} />
                  <h2 className="text-lg sm:text-xl font-bold" style={{ color: COLORS.secondary }}>
                    NOS PRODUITS RECOMMANDÉS
                  </h2>
                  <Star className="size-4" style={{ color: COLORS.accent }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {recommendedProducts.map((product, index) => (
                    <ElectroDepotProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      onProductClick={onProductClick}
                      getCartQuantity={getCartQuantity}
                      updateCartQuantity={updateCartQuantity}
                      index={index}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* ─── 5. Trust Badges ─── */}
            <Section className="mt-8 sm:mt-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {TRUST_BADGES.map((badge, index) => (
                  <motion.div
                    key={badge.label}
                    whileHover={{ y: -3 }}
                    className="flex flex-col items-center gap-2.5 p-4 sm:p-5 text-center"
                    style={{ border: `1px solid ${COLORS.border}`, borderRadius: '2px', backgroundColor: '#fafafa' }}
                  >
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-full"
                      style={{ backgroundColor: '#fef2f2' }}
                    >
                      <badge.icon className="size-5" style={{ color: COLORS.primary }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: COLORS.secondary }}>
                      {badge.label}
                    </span>
                    <span className="text-[11px]" style={{ color: COLORS.muted }}>
                      {badge.desc}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* ─── 6. Promotional Banner ─── */}
            <Section className="mt-8 sm:mt-10">
              <PromoBanner onCategoryClick={onCategoryClick} />
            </Section>

            {/* ─── 7. Featured Products ─── */}
            {featuredProducts.length > 0 && (
              <Section className="mt-8 sm:mt-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-7 rounded-none" style={{ backgroundColor: COLORS.accent }} />
                  <h2 className="text-lg sm:text-xl font-bold" style={{ color: COLORS.secondary }}>
                    PRODUITS EN VEDETTE
                  </h2>
                  <ShoppingBag className="size-4" style={{ color: COLORS.accent }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {featuredProducts.map((product, index) => (
                    <ElectroDepotProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      onProductClick={onProductClick}
                      getCartQuantity={getCartQuantity}
                      updateCartQuantity={updateCartQuantity}
                      index={index}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* ─── 8. Double Promo Banners ─── */}
            <Section className="mt-8 sm:mt-10">
              <DoublePromoBanners onCategoryClick={onCategoryClick} />
            </Section>

            {/* ─── 9. Brands Marquee ─── */}
            <Section className="mt-8 sm:mt-10">
              <BrandsMarquee />
            </Section>

            {/* ─── 10. Newsletter ─── */}
            <Section className="mt-8 sm:mt-10">
              <NewsletterSection />
            </Section>

            {/* ─── 11. Footer ─── */}
            <Footer shopName={shopName} whatsapp={whatsapp} />
          </>
        )}

        {/* ═══════════════ FILTERED / SEARCH VIEW ═══════════════ */}
        {isFiltering && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="mt-8">
                <EmptyState
                  searchQuery={searchQuery}
                  onReset={() => {
                    onSearchChange('')
                    setLocalSearch('')
                    onCategoryClick(null)
                  }}
                />
              </div>
            ) : (
              <>
                {/* Loading skeletons */}
                {isSearching && filteredProducts.length === 0 && publicProducts.length > 0 && (
                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex flex-col gap-2 overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
                        <div className="aspect-square bg-gray-100 animate-pulse" />
                        <div className="p-3 space-y-2">
                          <div className="h-3 w-3/4 bg-gray-100 rounded-none animate-pulse" />
                          <div className="h-4 w-1/2 bg-gray-100 rounded-none animate-pulse" />
                          <div className="h-8 w-full bg-gray-100 rounded-none animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Product Grid (filtered) */}
                <AnimatePresence initial={false}>
                <motion.div
                  key={activeCategory + searchQuery + sortBy}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
                >
                  {filteredProducts.map((product, index) => (
                    <ElectroDepotProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      onProductClick={onProductClick}
                      getCartQuantity={getCartQuantity}
                      updateCartQuantity={updateCartQuantity}
                      index={index}
                    />
                  ))}
                </motion.div>
                </AnimatePresence>

                {/* Product count */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm mt-6 pb-6"
                  style={{ color: COLORS.muted }}
                >
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} affiché{filteredProducts.length > 1 ? 's' : ''}
                </motion.p>

                <Footer shopName={shopName} whatsapp={whatsapp} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
