'use client'

/**
 * CosmikaBeautyShopPage — Template cosmika-beauty
 * Multi-sector adaptive template with sector-aware colors, labels, and CTA behavior.
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
import { getThemeConfig, type ThemeColors } from '@/lib/theme-config'
import { getSectorLabels, isServiceBusiness } from '@/lib/sector-config'

// ═══════════════════════════════════════════════════════════════
// SECTION 1 : HEADER (sticky, dark)
// ═══════════════════════════════════════════════════════════════

function CosmikaHeader({
  shopName,
  logo,
  whatsapp,
  sector,
  onNavAccueil,
  onNavCategories,
  onNavProduits,
  onNavAvis,
}: {
  shopName: string
  logo?: string
  whatsapp?: string
  sector?: string
  onNavAccueil: () => void
  onNavCategories: () => void
  onNavProduits: () => void
  onNavAvis: () => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const labels = getSectorLabels(sector)

  const navItems = [
    { label: 'Accueil', onClick: onNavAccueil },
    { label: labels.navCategories, onClick: onNavCategories },
    { label: labels.navProducts, onClick: onNavProduits },
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
                width={200}
                height={53}
                className="h-[53px] w-auto object-contain"
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
// SECTION 2 : HERO (min-h-[90vh] / md:h-screen)
// ═══════════════════════════════════════════════════════════════

function CosmikaHero({
  heroImageUrl,
  banner,
  heroTagline,
  heroTitle,
  heroSubtitle,
  sector,
  colors,
}: {
  heroImageUrl?: string
  banner?: string
  heroTagline?: string
  heroTitle?: string
  heroSubtitle?: string
  sector?: string
  colors: ThemeColors
}) {
  const theme = getThemeConfig(sector)
  const backgroundImage = heroImageUrl || banner

  return (
    <section id="accueil" className="relative min-h-[90vh] md:h-screen overflow-hidden">
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
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${colors.primary}1a` }} />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: `${colors.secondary}0d` }} />

      {/* Text LEFT-aligned */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full text-left px-8 md:px-16 lg:px-32 fade-in">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-xl"
        >
          {/* Tagline */}
          <span className="font-semibold text-sm tracking-widest uppercase mb-4 block" style={{ color: colors.primary }}>
            {heroTagline || theme.hero.defaultTagline}
          </span>

          {/* Title */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {heroTitle || theme.hero.defaultTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-xl leading-relaxed">
            {heroSubtitle || theme.hero.defaultSubtitle}
          </p>
        </motion.div>
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
  colors,
}: {
  categories: Category[]
  products: Product[]
  activeCategory: string | null
  onCategoryClick: (id: string | null) => void
  categoriesTitle?: string
  categoriesTagline?: string
  colors: ThemeColors
}) {
  if (categories.length === 0) return null

  return (
    <section id="cosmika-categories" className="w-full bg-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-semibold text-sm tracking-widest uppercase" style={{ color: colors.primary }}>Nos Produits</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {categoriesTitle || 'FOR ALL WALKS OF LIFE'}
          </h2>
          {categoriesTagline && (
            <p className="text-sm text-gray-500 mt-2">
              {categoriesTagline}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-10">
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
                  className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden mx-auto mb-4 border-4 transition-all duration-300"
                  style={{ borderColor: isActive ? colors.primary : colors.primaryLight }}
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
                  className="text-base md:text-lg font-medium text-center transition-colors duration-200"
                  style={{ color: isActive ? colors.primary : undefined }}
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
  sector,
  businessType,
  colors,
}: {
  product: Product
  onProductClick: (product: Product) => void
  whatsapp?: string
  shopName: string
  sector?: string
  businessType?: string
  colors: ThemeColors
}) {
  const inStock = (product.stock ?? 0) > 0
  const isNew = product.createdAt
    ? (Date.now() - new Date(product.createdAt).getTime()) < PLATFORM_CONFIG.NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000
    : false
  const isPromo = product.price < PLATFORM_CONFIG.PROMO_PRICE_THRESHOLD

  const selectedShippingZone = useAppStore((s) => s.selectedShippingZone)
  const labels = getSectorLabels(sector)
  const isService = isServiceBusiness(businessType)

  function handleCommander(e: React.MouseEvent) {
    e.stopPropagation()
    const phone = whatsapp?.replace(/\D/g, '') || ''
    let msg: string
    const priceStr = product.price ? `${product.price.toLocaleString('fr-FR')} FCFA` : ''
    const template = labels.ctaWhatsAppMessage
      .replace('{productName}', product.name)
      .replace('{productPrice}', priceStr)
    if (!isService && selectedShippingZone) {
      const grandTotal = product.price + selectedShippingZone.price
      msg = `${template}\n📍 Zone de livraison : ${selectedShippingZone.name}\n🚚 Frais de livraison : ${selectedShippingZone.price.toLocaleString('fr-FR')} FCFA\n━━━━━━━━━━━━━━\n💵 Total : ${grandTotal.toLocaleString('fr-FR')} FCFA`
    } else {
      msg = template
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
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white rounded-full" style={{ backgroundColor: colors.primary }}>
              Nouveau
            </span>
          )}
          {isPromo && !isNew && !isService && (
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-amber-500 rounded-full">
              Promo
            </span>
          )}
          {!inStock && !isService && (
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
          {!labels.showPrice && !product.price
            ? 'Sur devis'
            : !labels.showPrice && product.price
              ? <>À partir de {product.price.toLocaleString('fr-FR')} <span className="font-semibold text-gray-500">FCFA</span></>
              : <>{product.price.toLocaleString('fr-FR')} <span className="font-semibold text-gray-500">FCFA</span></>}
        </p>

        <button
          onClick={handleCommander}
          disabled={!product.isAvailable || (!isService && !inStock)}
          className="mt-1 w-full text-white text-sm font-semibold rounded-full px-6 py-2.5 hover:opacity-90 transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: colors.ctaBg, color: colors.ctaText }}
        >
          {labels.ctaButton}
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
  sector,
  businessType,
  colors,
  onClose,
}: {
  product: Product
  whatsapp?: string
  shopName: string
  sector?: string
  businessType?: string
  colors: ThemeColors
  onClose: () => void
}) {
  const [qty, setQty] = useState(1)
  const [imgIndex, setImgIndex] = useState(0)
  const selectedShippingZone = useAppStore((s) => s.selectedShippingZone)

  const productImages = product.images?.length ? product.images : product.image ? [product.image] : []
  const inStock = (product.stock ?? 0) > 0
  const labels = getSectorLabels(sector)
  const isService = isServiceBusiness(businessType)

  function handleWhatsAppOrder() {
    const phone = whatsapp?.replace(/\D/g, '') || ''
    const itemTotal = product.price * qty
    const priceStr = product.price ? `${itemTotal.toLocaleString('fr-FR')} FCFA` : ''
    const template = labels.ctaWhatsAppMessage
      .replace('{productName}', `${product.name}${!isService && qty > 1 ? ` x${qty}` : ''}`)
      .replace('{productPrice}', priceStr)
    let msg: string
    if (!isService && selectedShippingZone) {
      const grandTotal = itemTotal + selectedShippingZone.price
      msg = `${template}\n📍 Zone de livraison : ${selectedShippingZone.name}\n🚚 Frais de livraison : ${selectedShippingZone.price.toLocaleString('fr-FR')} FCFA\n━━━━━━━━━━━━━━\n💵 Total : ${grandTotal.toLocaleString('fr-FR')} FCFA`
    } else {
      msg = template
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
                  className="w-12 h-12 rounded-lg overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: idx === imgIndex ? colors.primary : 'rgba(255,255,255,0.5)',
                    opacity: idx === imgIndex ? 1 : 0.6,
                  }}
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
            {!labels.showPrice && !product.price
              ? 'Sur devis'
              : !labels.showPrice && product.price
                ? <>À partir de {product.price.toLocaleString('fr-FR')} <span className="text-base font-normal text-gray-500">FCFA</span></>
                : <>{product.price.toLocaleString('fr-FR')} <span className="text-base font-normal text-gray-500">FCFA</span></>}
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
          {!inStock && !isService && (
            <p className="text-sm text-red-500 font-medium">
              Rupture de stock
            </p>
          )}

          {/* Quantity selector (hidden for services) */}
          {!isService && (
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
          )}

          {/* Shipping zone selector (hidden for services) */}
          {!isService && <ShippingZoneSelector />}

          {/* WhatsApp order button */}
          {whatsapp && (
            <button
              onClick={handleWhatsAppOrder}
              disabled={!isService && !inStock}
              className="w-full flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3.5 hover:opacity-90 transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: colors.ctaBg, color: colors.ctaText }}
            >
              <MessageCircle className="size-5" />
              {labels.ctaButton}
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
  colors,
}: {
  testimonialsTitle?: string
  testimonialsTagline?: string
  colors: ThemeColors
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
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.primaryBg }}
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

function CosmikaTrustBadges({ rawTrustBadges, sector }: { rawTrustBadges?: string; sector?: string }) {
  const defaultBadges = getThemeConfig(sector).defaultTrustBadges

  const badges = useMemo<TrustBadge[]>(() => {
    if (!rawTrustBadges) return defaultBadges
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
      return defaultBadges
    } catch {
      return defaultBadges
    }
  }, [rawTrustBadges, defaultBadges])

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
  sector,
}: {
  shopName: string
  logo?: string
  description?: string
  rawFooterLinks?: string
  whatsapp?: string
  sector?: string
}) {
  const labels = getSectorLabels(sector)

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
            { label: labels.navCategories, url: '#cosmika-categories' },
            { label: labels.navProducts, url: '#cosmika-products' },
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
  }, [footerLinks, whatsapp, labels.navCategories, labels.navProducts])

  return (
    <footer className="w-full bg-gray-900 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {logo && logo.length > 0 ? (
                <ImageWithFallback src={logo} alt={shopName} width={200} height={53} className="h-[53px] w-auto object-contain brightness-0 invert" fallbackIcon="image" />
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

function CosmikaLoadingSkeleton({ colors }: { colors: ThemeColors }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: colors.primary }} />
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

  const sector = publicShop?.sector
  const businessType = publicShop?.businessType
  const theme = getThemeConfig(sector)
  const colors = theme.colors
  const labels = getSectorLabels(sector)

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
  if (loading) return <CosmikaLoadingSkeleton colors={colors} />

  // ── Shop not found ──
  if (!publicShop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-4" style={{ backgroundColor: colors.primaryBg }}>
            <Package className="size-10" style={{ color: colors.primary }} />
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
        sector={sector}
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
              sector={sector}
              businessType={businessType}
              colors={colors}
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
                sector={sector}
                colors={colors}
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
                  colors={colors}
                />
              </div>

              {/* ═══ SECTION 4 : PRODUCTS GRID ═══ */}
              <section id="cosmika-products" className="w-full bg-gray-50/50 py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4 lg:px-6" ref={productsRef}>
                  {/* Section title */}
                  <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {publicShop.productsTitle || labels.productsTitle}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {publicShop.productsTagline || 'Sélection pour vous'}
                    </p>
                  </div>

                  {/* Empty state */}
                  {publicProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: colors.primaryBg }}>
                        <Package className="size-10" style={{ color: colors.primary }} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{labels.productsEmpty}</h3>
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
                        className="text-sm font-semibold transition-colors"
                        style={{ color: colors.primary }}
                      >
                        Voir tous les {labels.navProducts.toLowerCase()}
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
                          sector={sector}
                          businessType={businessType}
                          colors={colors}
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
                  colors={colors}
                />
              </div>

              {/* ═══ SECTION 6 : TRUST BADGES ═══ */}
              <CosmikaTrustBadges rawTrustBadges={publicShop.trustBadges} sector={sector} />
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
        sector={sector}
      />
    </motion.div>
  )
}