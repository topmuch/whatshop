'use client'

/**
 * CosmikaBeautyShopPage — Template cosmika-beauty
 * Beauty / Cosmetics shop template with rose-gold & black palette.
 *
 * Sections:
 *   1. Header (sticky, dark)
 *   2. Hero (80vh, banner + overlay)
 *   3. Categories (circular images)
 *   4. Products Grid
 *   5. Testimonials (fetched from API)
 *   6. Trust Badges (shop.trustBadges JSON)
 *   7. Footer
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  X,
  Plus,
  Minus,
  Package,
  ArrowLeft,
  Star,
  MessageCircle,
  Menu,
} from 'lucide-react'
import { LiveShopFeatures } from '../live-shop-features'
import { useAppStore, type Product, type Category, type Testimonial, type TrustBadge } from '@/lib/store'
import { formatPrice, PLATFORM_CONFIG } from '@/lib/shared'
import { ShippingZoneSelector } from '../shipping-zone-selector'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'

// ─── Default trust badges ───
const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  { emoji: '🚚', title: 'Livraison 24h', subtitle: 'Partout au Sénégal', order: 0 },
  { emoji: '💵', title: 'Paiement Mobile Money', subtitle: 'Orange Money, Wave…', order: 1 },
  { emoji: '🔄', title: 'Retour facile', subtitle: 'Satisfait ou remboursé', order: 2 },
  { emoji: '📱', title: 'Support WhatsApp', subtitle: 'Réponse rapide', order: 3 },
]

// ═══════════════════════════════════════════════════════════════
// SECTION 1 : HEADER (sticky, dark)
// ═══════════════════════════════════════════════════════════════

function CosmikaHeader({
  shopName,
  logo,
  whatsapp,
  onNavAccueil,
  onNavCategories,
  onNavProduits,
  onNavAvis,
}: {
  shopName: string
  logo?: string
  whatsapp?: string
  onNavAccueil: () => void
  onNavCategories: () => void
  onNavProduits: () => void
  onNavAvis: () => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { label: 'Accueil', onClick: onNavAccueil },
    { label: 'Catégories', onClick: onNavCategories },
    { label: 'Produits', onClick: onNavProduits },
    { label: 'Avis', onClick: onNavAvis },
  ]

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={onNavAccueil} className="flex items-center gap-2 shrink-0">
            {logo && logo.length > 0 ? (
              <ImageWithFallback
                src={logo}
                alt={shopName}
                width={160}
                height={40}
                className="h-10 w-auto object-contain"
                fallbackIcon="image"
              />
            ) : (
              <span className="text-white font-bold text-lg tracking-wide">
                {shopName}
              </span>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-lg transition-colors duration-200 hover:bg-white/10"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Contact button + Mobile menu */}
          <div className="flex items-center gap-3">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors duration-200"
              >
                <MessageCircle className="size-4" />
                Contact
              </a>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Menu"
            >
              <span
                className="block w-5 h-0.5 rounded bg-white transition-all duration-200"
                style={{ transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }}
              />
              <span
                className="block w-5 h-0.5 rounded bg-white transition-all duration-200"
                style={{ opacity: mobileOpen ? 0 : 1 }}
              />
              <span
                className="block w-5 h-0.5 rounded bg-white transition-all duration-200"
                style={{ transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-black border-t border-white/10"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onClick()
                    setMobileOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Contact WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 2 : HERO (80vh)
// ═══════════════════════════════════════════════════════════════

function CosmikaHero({
  heroImageUrl,
  banner,
  heroTagline,
  heroTitle,
  heroSubtitle,
}: {
  heroImageUrl?: string
  banner?: string
  heroTagline?: string
  heroTitle?: string
  heroSubtitle?: string
}) {
  const backgroundImage = heroImageUrl || banner

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '80vh', minHeight: '500px' }}>
      {backgroundImage ? (
        <>
          <ImageWithFallback
            src={backgroundImage}
            alt="Hero"
            fill
            className="w-full h-full object-cover"
            fallbackIcon="image"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d1017 40%, #1a0a0a 100%)' }}
        />
      )}

      {/* Decorative glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-amber-400/5 blur-3xl" />

      {/* Text LEFT-aligned */}
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-xl"
          >
            {/* Tagline */}
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-4 text-amber-400">
              {heroTagline || 'ILLUMINATE DAILY'}
            </p>

            {/* Title */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {heroTitle || 'GLAMOUR SHINE'}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-white/70 max-w-md leading-relaxed">
              {heroSubtitle || 'Découvrez notre collection de soins et cosmétiques pour sublimer votre beauté naturelle.'}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 3 : CATEGORIES (circular)
// ═══════════════════════════════════════════════════════════════

function CosmikaCategories({
  categories,
  products,
  activeCategory,
  onCategoryClick,
  categoriesTitle,
  categoriesTagline,
}: {
  categories: Category[]
  products: Product[]
  activeCategory: string | null
  onCategoryClick: (id: string | null) => void
  categoriesTitle?: string
  categoriesTagline?: string
}) {
  if (categories.length === 0) return null

  return (
    <section id="cosmika-categories" className="w-full bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {categoriesTitle || 'NOS CATÉGORIES'}
          </h2>
          <p className="text-sm text-gray-500">
            {categoriesTagline || 'Trouvez ce que vous cherchez'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-[35px] sm:gap-[40px]">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            const catImage = cat.image || products.find((p) => p.categoryId === cat.id && p.image)?.image

            return (
              <motion.button
                key={cat.id}
                onClick={() => onCategoryClick(isActive ? null : cat.id)}
                className="flex flex-col items-center group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[160px] md:h-[160px] rounded-full overflow-hidden transition-all duration-300"
                >
                  <ImageWithFallback
                    src={catImage}
                    alt={cat.name}
                    fill
                    className="w-full h-full object-cover"
                    fallbackIcon="package"
                  />
                </div>
                <span
                  className={`mt-4 text-xs sm:text-sm font-medium text-center leading-tight max-w-[100px] sm:max-w-[140px] line-clamp-2 transition-colors duration-200 ${
                    isActive ? 'text-rose-600' : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                >
                  {cat.name}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 4 : PRODUCT CARD
// ═══════════════════════════════════════════════════════════════

function CosmikaProductCard({
  product,
  onProductClick,
  whatsapp,
  shopName,
}: {
  product: Product
  onProductClick: (product: Product) => void
  whatsapp?: string
  shopName: string
}) {
  const inStock = (product.stock ?? 0) > 0
  const isNew = product.createdAt
    ? (Date.now() - new Date(product.createdAt).getTime()) < PLATFORM_CONFIG.NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000
    : false
  const isPromo = product.price < PLATFORM_CONFIG.PROMO_PRICE_THRESHOLD

  const selectedShippingZone = useAppStore((s) => s.selectedShippingZone)

  function handleCommander(e: React.MouseEvent) {
    e.stopPropagation()
    const phone = whatsapp?.replace(/\D/g, '') || ''
    let msg: string
    if (selectedShippingZone) {
      const grandTotal = product.price + selectedShippingZone.price
      msg = `Bonjour ${shopName} 👋, je souhaite commander :\n\n📦 Produit : ${product.name}\n💰 Prix : ${product.price.toLocaleString('fr-FR')} FCFA\n📍 Zone de livraison : ${selectedShippingZone.name}\n🚚 Frais de livraison : ${selectedShippingZone.price.toLocaleString('fr-FR')} FCFA\n━━━━━━━━━━━━━━\n💵 Total : ${grandTotal.toLocaleString('fr-FR')} FCFA\n\nMerci de confirmer ma commande !`
    } else {
      msg = `Bonjour ${shopName} 👋, je souhaite commander : 📦 ${product.name} 💰 ${product.price.toLocaleString('fr-FR')} FCFA`
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <motion.div
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={() => onProductClick(product)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          fill
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackIcon="package"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-rose-500 rounded-full">
              Nouveau
            </span>
          )}
          {isPromo && !isNew && (
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-amber-500 rounded-full">
              Promo
            </span>
          )}
          {!inStock && (
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-red-500 rounded-full">
              Rupture
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-1">
          {product.name}
        </h3>
        <p className="font-bold text-gray-900">
          {product.price.toLocaleString('fr-FR')} <span className="font-semibold text-gray-500">FCFA</span>
        </p>

        <button
          onClick={handleCommander}
          disabled={!product.isAvailable || !inStock}
          className="mt-1 w-full bg-black text-white text-sm font-semibold rounded-full px-6 py-2.5 hover:opacity-90 transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Commander
        </button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 4b : PRODUCT DETAIL (slide-in panel)
// ═══════════════════════════════════════════════════════════════

function CosmikaProductDetail({
  product,
  whatsapp,
  shopName,
  onClose,
}: {
  product: Product
  whatsapp?: string
  shopName: string
  onClose: () => void
}) {
  const [qty, setQty] = useState(1)
  const [imgIndex, setImgIndex] = useState(0)
  const selectedShippingZone = useAppStore((s) => s.selectedShippingZone)

  const productImages = product.images?.length ? product.images : product.image ? [product.image] : []
  const inStock = (product.stock ?? 0) > 0

  function handleWhatsAppOrder() {
    const phone = whatsapp?.replace(/\D/g, '') || ''
    const itemTotal = product.price * qty
    let msg: string
    if (selectedShippingZone) {
      const grandTotal = itemTotal + selectedShippingZone.price
      msg = `Bonjour ${shopName} 👋, je souhaite commander :\n\n📦 Produit : ${product.name} x${qty}\n💰 Prix : ${itemTotal.toLocaleString('fr-FR')} FCFA\n📍 Zone de livraison : ${selectedShippingZone.name}\n🚚 Frais de livraison : ${selectedShippingZone.price.toLocaleString('fr-FR')} FCFA\n━━━━━━━━━━━━━━\n💵 Total : ${grandTotal.toLocaleString('fr-FR')} FCFA\n\nMerci de confirmer ma commande !`
    } else {
      const total = itemTotal.toLocaleString('fr-FR')
      msg = `Bonjour ${shopName} 👋, je souhaite commander : 📦 ${product.name} x${qty} 💰 ${total} FCFA`
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white overflow-y-auto"
        style={{ scrollbarWidth: 'thin' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Image */}
        <div className="aspect-square bg-gray-100 relative">
          <ImageWithFallback
            src={productImages[imgIndex]}
            alt={product.name}
            fill
            className="w-full h-full object-cover"
            fallbackIcon="package"
          />
          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === imgIndex ? 'border-rose-500 opacity-100' : 'border-white/50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {product.name}
          </h1>

          <p className="text-2xl font-bold text-gray-900">
            {product.price.toLocaleString('fr-FR')} <span className="text-base font-normal text-gray-500">FCFA</span>
          </p>

          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Stock */}
          {inStock && product.stock !== undefined && (
            <p className="text-sm text-green-600 font-medium">
              ✓ En stock ({product.stock} disponibles)
            </p>
          )}
          {!inStock && (
            <p className="text-sm text-red-500 font-medium">
              Rupture de stock
            </p>
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <span className="text-sm font-semibold text-gray-700">Quantité</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden ml-auto">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-[40px] text-center font-bold text-base text-gray-900">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Shipping zone selector */}
          <ShippingZoneSelector />

          {/* WhatsApp order button */}
          {whatsapp && (
            <button
              onClick={handleWhatsAppOrder}
              disabled={!inStock}
              className="w-full flex items-center justify-center gap-2 bg-black text-white font-semibold rounded-full px-6 py-3.5 hover:opacity-90 transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageCircle className="size-5" />
              Commander sur WhatsApp
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 5 : TESTIMONIALS
// ═══════════════════════════════════════════════════════════════

function CosmikaTestimonials({
  testimonialsTitle,
  testimonialsTagline,
}: {
  testimonialsTitle?: string
  testimonialsTagline?: string
}) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const shopSlug = useAppStore((s) => s.shopSlug)

  useEffect(() => {
    if (!shopSlug) return
    let cancelled = false
    fetch(`/api/shops/${shopSlug}/testimonials`)
      .then((res) => {
        if (res.ok && !cancelled) return res.json()
        return []
      })
      .then((data: Testimonial[]) => {
        if (!cancelled) setTestimonials(data)
      })
      .catch(() => {
        if (!cancelled) setTestimonials([])
      })
    return () => { cancelled = true }
  }, [shopSlug])

  if (testimonials.length === 0) return null

  return (
    <section id="cosmika-avis" className="w-full py-12 sm:py-16 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {testimonialsTitle || 'AVIS CLIENTS'}
          </h2>
          <p className="text-sm text-gray-500">
            {testimonialsTagline || 'Ce que nos clients disent'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-rose-50 rounded-2xl p-6"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className="size-4"
                    style={{
                      color: s < t.rating ? '#f59e0b' : '#e5e7eb',
                      fill: s < t.rating ? '#f59e0b' : 'none',
                    }}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                &ldquo;{t.comment}&rdquo;
              </p>

              {/* Client info */}
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={t.clientAvatar}
                  alt={t.clientName}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                  fallbackIcon="avatar"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.clientName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 6 : TRUST BADGES
// ═══════════════════════════════════════════════════════════════

function CosmikaTrustBadges({ rawTrustBadges }: { rawTrustBadges?: string }) {
  const badges = useMemo<TrustBadge[]>(() => {
    if (!rawTrustBadges) return DEFAULT_TRUST_BADGES
    try {
      const parsed = JSON.parse(rawTrustBadges)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .map((b: Record<string, unknown>) => ({
            emoji: typeof b.emoji === 'string' ? b.emoji : '',
            title: typeof b.title === 'string' ? b.title : '',
            subtitle: typeof b.subtitle === 'string' ? b.subtitle : '',
            order: typeof b.order === 'number' ? b.order : 0,
          }))
          .sort((a: TrustBadge, b: TrustBadge) => a.order - b.order)
      }
      return DEFAULT_TRUST_BADGES
    } catch {
      return DEFAULT_TRUST_BADGES
    }
  }, [rawTrustBadges])

  return (
    <section className="w-full bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <span className="text-2xl">{badge.emoji}</span>
              <span className="font-semibold text-sm text-gray-900">{badge.title}</span>
              <span className="text-xs text-gray-500">{badge.subtitle}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION 7 : FOOTER
// ═══════════════════════════════════════════════════════════════

interface FooterLink {
  section: string
  label: string
  url: string
}

function CosmikaFooter({
  shopName,
  logo,
  description,
  rawFooterLinks,
  whatsapp,
}: {
  shopName: string
  logo?: string
  description?: string
  rawFooterLinks?: string
  whatsapp?: string
}) {
  const footerLinks = useMemo<FooterLink[]>(() => {
    if (!rawFooterLinks) return []
    try {
      const parsed = JSON.parse(rawFooterLinks)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [rawFooterLinks])

  const sections = useMemo(() => {
    if (footerLinks.length === 0) {
      return [
        {
          title: 'Navigation',
          links: [
            { label: 'Accueil', url: '/' },
            { label: 'Catégories', url: '#cosmika-categories' },
            { label: 'Produits', url: '#cosmika-products' },
            { label: 'Avis clients', url: '#cosmika-avis' },
          ],
        },
        {
          title: 'Contact',
          links: whatsapp
            ? [{ label: 'WhatsApp', url: `https://wa.me/${whatsapp.replace(/\D/g, '')}` }]
            : [],
        },
      ]
    }

    const grouped: Record<string, { label: string; url: string }[]> = {}
    for (const link of footerLinks) {
      const sec = link.section || 'Liens'
      if (!grouped[sec]) grouped[sec] = []
      grouped[sec].push({ label: link.label, url: link.url })
    }
    return Object.entries(grouped).map(([title, links]) => ({ title, links }))
  }, [footerLinks, whatsapp])

  return (
    <footer className="w-full bg-gray-900 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {logo && logo.length > 0 ? (
                <ImageWithFallback src={logo} alt={shopName} width={160} height={40} className="h-10 w-auto object-contain brightness-0 invert" fallbackIcon="image" />
              ) : (
                <span className="text-lg font-bold">{shopName}</span>
              )}
            </div>
            {description && (
              <p className="text-sm text-white/60 leading-relaxed max-w-xs">
                {description}
              </p>
            )}
          </div>

          {/* Link sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : undefined}
                      rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-center text-xs text-white/30">
            © {new Date().getFullYear()} {shopName}. Propulsé par{' '}
            <span className="text-white/50 font-medium">Boutiko</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════

function CosmikaLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Boutiko</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN: CosmikaBeautyShopPage
// ═══════════════════════════════════════════════════════════════

export function CosmikaBeautyShopPage() {
  const {
    shopSlug,
    setView,
    publicShop,
    setPublicShop,
    publicProducts,
    setPublicProducts,
    publicCategories,
    setPublicCategories,
  } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const avisRef = useRef<HTMLDivElement>(null)

  // Scroll to top when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [selectedProduct])

  // ── URL-based product navigation ──
  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product)
    const slug = useAppStore.getState().shopSlug
    if (product?.slug && slug) {
      window.history.pushState(null, '', `/${slug}/p/${product.slug || product.id}`)
    }
  }, [])

  const handleBackFromProduct = useCallback(() => {
    setSelectedProduct(null)
    const slug = useAppStore.getState().shopSlug
    if (slug) {
      window.history.pushState(null, '', `/${slug}`)
    }
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname
      const match = pathname.match(/^\/([a-z0-9][a-z0-9-]*)\/p\/([a-z0-9][a-z0-9-]*)$/i)
      if (match) {
        const productSlug = match[2]
        const found = publicProducts.find((p: Product) => (p.slug || p.id) === productSlug)
        if (found) setSelectedProduct(found)
        else setSelectedProduct(null)
      } else {
        setSelectedProduct(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [publicProducts])

  // ── Fetch shop data ──
  const fetchShop = useCallback(async () => {
    if (!shopSlug) return
    setLoading(true)
    try {
      const shopRes = await fetch(`/api/shops/${shopSlug}`)
      if (!shopRes.ok) return
      const shopData = await shopRes.json()
      setPublicShop(shopData)
      fetch(`/api/shops/${shopSlug}/visit`, { method: 'POST' }).catch(() => {})
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/shops/${shopSlug}/products`),
        fetch(`/api/shops/${shopSlug}/categories`),
      ])
      if (prodRes.ok) setPublicProducts(await prodRes.json())
      if (catRes.ok) setPublicCategories(await catRes.json())
    } catch {
      // Error loading
    } finally {
      setLoading(false)
    }
  }, [shopSlug, setPublicShop, setPublicProducts, setPublicCategories])

  useEffect(() => {
    fetchShop()
  }, [fetchShop])

  // ── Filter products ──
  const filteredProducts = useMemo(() => {
    let products = publicProducts.filter((p) => p.isAvailable)
    if (activeCategory) products = products.filter((p) => p.categoryId === activeCategory)
    return products
  }, [publicProducts, activeCategory])

  // ── Navigation handlers ──
  function handleNavAccueil() {
    handleBackFromProduct()
    setActiveCategory(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleNavCategories() {
    handleBackFromProduct()
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleNavProduits() {
    handleBackFromProduct()
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleNavAvis() {
    handleBackFromProduct()
    avisRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ── Loading ──
  if (loading) return <CosmikaLoadingSkeleton />

  // ── Shop not found ──
  if (!publicShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-4 bg-rose-50">
            <Package className="size-10 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Boutique introuvable</h2>
          <p className="text-sm text-gray-500 mb-4">
            Cette boutique n&apos;existe pas ou a été désactivée.
          </p>
          <button
            onClick={() => setView('landing')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    )
  }

  const heroBannerUrl = (() => {
    if (publicShop.heroImageUrl) return publicShop.heroImageUrl
    if (publicShop.banner) return publicShop.banner
    if (publicShop.heroImages) {
      try {
        const imgs = JSON.parse(publicShop.heroImages)
        if (Array.isArray(imgs) && imgs.length > 0 && imgs[0]) return imgs[0]
      } catch {
        // ignore
      }
    }
    return undefined
  })()

  return (
    <motion.div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* ═══ SECTION 1 : HEADER ═══ */}
      <CosmikaHeader
        shopName={publicShop.name}
        logo={publicShop.logo}
        whatsapp={publicShop.whatsapp}
        onNavAccueil={handleNavAccueil}
        onNavCategories={handleNavCategories}
        onNavProduits={handleNavProduits}
        onNavAvis={handleNavAvis}
      />

      <main className="flex-1">
        {/* Live features (banner + pinned product) */}
        <LiveShopFeatures />

        <AnimatePresence mode="wait" initial={false}>
          {selectedProduct ? (
            <CosmikaProductDetail
              key={selectedProduct.id}
              product={selectedProduct}
              whatsapp={publicShop.whatsapp}
              shopName={publicShop.name}
              onClose={handleBackFromProduct}
            />
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* ═══ SECTION 2 : HERO ═══ */}
              <CosmikaHero
                heroImageUrl={heroBannerUrl}
                banner={publicShop.banner}
                heroTagline={publicShop.heroTagline}
                heroTitle={publicShop.heroTitle}
                heroSubtitle={publicShop.heroSubtitle}
              />

              {/* ═══ SECTION 3 : CATÉGORIES ═══ */}
              <div ref={categoriesRef}>
                <CosmikaCategories
                  categories={publicCategories}
                  products={publicProducts}
                  activeCategory={activeCategory}
                  onCategoryClick={(id) => {
                    setActiveCategory(id)
                    // Scroll to products after selecting a category
                    setTimeout(() => {
                      productsRef.current?.scrollIntoView({ behavior: 'smooth' })
                    }, 100)
                  }}
                  categoriesTitle={publicShop.categoriesTitle}
                  categoriesTagline={publicShop.categoriesTagline}
                />
              </div>

              {/* ═══ SECTION 4 : PRODUCTS GRID ═══ */}
              <section id="cosmika-products" className="w-full bg-gray-50/50 py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4 lg:px-6" ref={productsRef}>
                  {/* Section title */}
                  <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {publicShop.productsTitle || 'NOS PRODUITS'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {publicShop.productsTagline || 'Sélection pour vous'}
                    </p>
                  </div>

                  {/* Empty state */}
                  {publicProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="flex items-center justify-center w-20 h-20 rounded-full mb-4 bg-rose-50">
                        <Package className="size-10 text-rose-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Aucun produit disponible</h3>
                      <p className="mt-1 text-sm max-w-md text-gray-500">
                        Cette boutique n&apos;a pas encore de produits. Revenez bientôt !
                      </p>
                    </div>
                  )}

                  {/* Empty category filter */}
                  {filteredProducts.length === 0 && publicProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <h3 className="text-lg font-bold text-gray-900">Aucun produit dans cette catégorie</h3>
                      <p className="mt-1 text-sm text-gray-500 mb-4">
                        Essayez une autre catégorie.
                      </p>
                      <button
                        onClick={() => setActiveCategory(null)}
                        className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        Voir tous les produits
                      </button>
                    </motion.div>
                  )}

                  {/* Product Grid */}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                    >
                      {filteredProducts.map((product) => (
                        <CosmikaProductCard
                          key={product.id}
                          product={product}
                          onProductClick={handleProductClick}
                          whatsapp={publicShop.whatsapp}
                          shopName={publicShop.name}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>

              {/* ═══ SECTION 5 : TESTIMONIALS ═══ */}
              <div ref={avisRef}>
                <CosmikaTestimonials
                  testimonialsTitle={publicShop.testimonialsTitle}
                  testimonialsTagline={publicShop.testimonialsTagline}
                />
              </div>

              {/* ═══ SECTION 6 : TRUST BADGES ═══ */}
              <CosmikaTrustBadges rawTrustBadges={publicShop.trustBadges} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ SECTION 7 : FOOTER ═══ */}
      <CosmikaFooter
        shopName={publicShop.name}
        logo={publicShop.logo}
        description={publicShop.description}
        rawFooterLinks={publicShop.footerLinks}
        whatsapp={publicShop.whatsapp}
      />
    </motion.div>
  )
}