'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { formatPrice, openWhatsApp } from '@/lib/shared'
import { Button } from '@/components/ui/button'
import { MessageCircle, Star, Flame, Store, ArrowLeft, Truck, ShieldCheck, RotateCcw, BadgeCheck, LogIn } from 'lucide-react'
import { ImageGallery } from './image-gallery'
import { CountdownTimer } from './countdown-timer'
import { VariantSelector } from './variant-selector'
import { ReviewSection } from './review-section'
import { FAQAccordion } from './faq-accordion'
import { TrustBadges } from './trust-badges'
import { StickyCTA } from './sticky-cta'
import { ProductCard, type CrossSellProduct } from './product-card'
import type { SingleProductData, SingleProductConfig, ProductImage, Review, FAQItem } from '@/lib/single-product-types'
import type { ProductVariant, VariantSelection } from '@/lib/variant-utils'

interface PublicShopData {
  id: string
  name: string
  slug: string
  whatsapp: string
  logo?: string | null
  description?: string | null
  accentColor?: string | null
  primaryColor?: string | null
  templateType: string
  singleProductConfig: string | null
}

export function SingleProductTemplate() {
  const { publicShop, setView } = useAppStore()
  const [data, setData] = useState<SingleProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [finalPrice, setFinalPrice] = useState<number | null>(null)
  const [availableStock, setAvailableStock] = useState<number | null>(null)
  const [selection, setSelection] = useState<VariantSelection>({ colorVariantId: null, sizeVariantId: null })

  const shop = publicShop as PublicShopData | null
  const accent = shop?.accentColor || shop?.primaryColor || '#EC4899'

  useEffect(() => {
    if (!shop) return
    let cancelled = false
    async function load() {
      try {
        const configRes = await fetch(`/api/shops/${shop!.slug}/single-product-config`)
        const configData = await configRes.json()
        const config: SingleProductConfig = configData.config || {
          productId: null,
          countdown: { enabled: false, endHour: 23, endMinute: 59 },
          benefits: [],
          crossSellProductIds: [],
        }

        if (!config.productId) {
          if (!cancelled) {
            setData({ product: null, images: [], variants: [], reviews: [], faqs: [], config, crossSellProducts: [] })
            setLoading(false)
          }
          return
        }

        const [prodRes, imgRes, varRes, revRes, faqRes] = await Promise.all([
          fetch(`/api/shops/${shop!.slug}/products`),
          fetch(`/api/products/${config.productId}/images`),
          fetch(`/api/products/${config.productId}/variants`),
          fetch(`/api/products/${config.productId}/reviews`),
          fetch(`/api/shops/${shop!.slug}/faqs`),
        ])

        const allProducts = prodRes.ok ? await prodRes.json() : []
        const product = (Array.isArray(allProducts) ? allProducts : allProducts.products || []).find(
          (p: { id: string }) => p.id === config.productId,
        )
        const images: ProductImage[] = imgRes.ok ? await imgRes.json() : []
        const variants: ProductVariant[] = varRes.ok ? await varRes.json() : []
        const reviews: Review[] = revRes.ok ? await revRes.json() : []
        const faqs: FAQItem[] = faqRes.ok ? await faqRes.json() : []

        const crossSell: CrossSellProduct[] = config.crossSellProductIds
          .map((id) => (Array.isArray(allProducts) ? allProducts : allProducts.products || []).find((p: { id: string }) => p.id === id))
          .filter(Boolean)

        if (!cancelled) {
          setData({ product, images, variants, reviews, faqs, config, crossSellProducts: crossSell })
          setFinalPrice(product?.price ?? null)
          setAvailableStock(product?.stock ?? null)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [shop])

  const handleSelectionChange = useCallback((sel: VariantSelection, price: number, stock: number | null) => {
    setSelection(sel)
    setFinalPrice(price)
    setAvailableStock(stock)
  }, [])

  const handleOrder = useCallback(() => {
    if (!data?.product || !shop) return
    const colorVariant = data.variants.find((v) => v.id === selection.colorVariantId)
    const sizeVariant = data.variants.find((v) => v.id === selection.sizeVariantId)
    const variantText = [colorVariant?.name, sizeVariant?.name].filter(Boolean).join(' / ')
    const product = {
      name: variantText ? `${data.product.name} (${variantText})` : data.product.name,
      price: finalPrice ?? data.product.price,
    }
    openWhatsApp(product, shop.whatsapp, 1)
  }, [data, shop, selection, finalPrice])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
      </div>
    )
  }

  if (!shop) return null

  if (!data?.product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4">
        <Store className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Cette boutique n'a pas encore configuré son produit.</p>
        <Button variant="outline" onClick={() => setView('landing')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
        </Button>
      </div>
    )
  }

  const product = data.product
  const currentPrice = finalPrice ?? product.price
  const discount = product.oldPrice && product.oldPrice > currentPrice
    ? Math.round(((product.oldPrice - currentPrice) / product.oldPrice) * 100)
    : 0
  const savings = product.oldPrice && product.oldPrice > currentPrice
    ? product.oldPrice - currentPrice
    : 0
  const avgRating = data.reviews.length
    ? data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length
    : 0
  const lowStock = availableStock !== null && availableStock <= 10 && availableStock > 0

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0">
      {/* ─── Top promo bar ─── */}
      <div className="bg-gray-900 px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
        Livraison gratuite sur chaque commande · Paiement à la livraison disponible
      </div>

      {/* ─── Minimal header ─── */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button onClick={() => setView('landing')} aria-label="Retour" className="rounded-full p-1.5 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          {shop.logo ? (
            <img src={shop.logo} alt={shop.name} className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white">
              <Store className="h-4 w-4" />
            </div>
          )}
          <span className="font-semibold text-gray-900">{shop.name}</span>
          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={() => { window.location.href = '/login' }}
              aria-label="Connexion"
              className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">Connexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── SECTION 1: HERO (2 colonnes desktop) ─── */}
      <section className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* ─── Galerie ─── */}
          <div>
            <ImageGallery
              images={data.images}
              fallbackUrl={product.image}
              alt={product.name}
              discountPercent={discount}
            />
          </div>

          {/* ─── Infos produit ─── */}
          <div className="flex flex-col gap-5">
            {/* Eyebrow + titre */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                Produit
              </p>
              <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="mt-2 text-base text-gray-500">{product.shortDescription}</p>
              )}
            </div>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  · {data.reviews.length} avis
                </span>
              </div>
            )}

            {/* Price block */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-black text-gray-900 md:text-5xl">
                {formatPrice(currentPrice)}
              </span>
              {product.oldPrice && product.oldPrice > currentPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-lg bg-red-100 px-2 py-0.5 text-sm font-bold text-red-600">
                  −{discount}%
                </span>
              )}
            </div>
            {/* You save + pay on delivery */}
            {savings > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-green-600">
                  Vous économisez {formatPrice(savings)}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">Paiement à la livraison</span>
              </div>
            )}

            {/* Scarcity */}
            {lowStock && (
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <Flame className="h-4 w-4 animate-pulse" />
                Plus que {availableStock} en stock
              </div>
            )}

            {/* Countdown */}
            <CountdownTimer
              enabled={data.config.countdown.enabled}
              endHour={data.config.countdown.endHour}
              endMinute={data.config.countdown.endMinute}
              isoEnd={data.config.countdown.isoEnd}
              accent={accent}
            />

            {/* Variants */}
            {data.variants.length > 0 && (
              <VariantSelector
                variants={data.variants}
                basePrice={product.price}
                accent={accent}
                onSelectionChange={handleSelectionChange}
              />
            )}

            {/* CTA WhatsApp */}
            <Button
              size="lg"
              className="w-full gap-3 rounded-2xl bg-green-500 py-6 text-lg font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-[0.98]"
              onClick={handleOrder}
            >
              <MessageCircle className="h-6 w-6" fill="white" />
              COMMANDER VIA WHATSAPP
            </Button>
            <p className="-mt-2 text-center text-xs text-gray-400">
              Commandez maintenant · Payez à la livraison
            </p>

            {/* Trust pills inline */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Paiement à la livraison
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                <RotateCcw className="h-3.5 w-3.5 text-blue-600" /> Retour 7 jours
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                <Truck className="h-3.5 w-3.5 text-orange-600" /> Livraison 24-48h
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: Trust grid (4 colonnes) ─── */}
      {data.config.benefits.length > 0 && (
        <section className="border-y border-gray-100 bg-gray-50 py-10">
          <div className="mx-auto max-w-6xl px-4">
            <TrustBadges badges={data.config.benefits} accent={accent} />
          </div>
        </section>
      )}

      {/* ─── SECTION 3: Description détaillée ─── */}
      {product.description && (
        <section className="mx-auto max-w-3xl px-4 py-12">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            À propos de ce produit
          </p>
          <h2 className="mb-5 text-2xl font-bold text-gray-900 md:text-3xl">Description</h2>
          <div className="prose prose-sm max-w-none text-gray-600 sm:prose-base">
            <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
          </div>
        </section>
      )}

      {/* ─── SECTION 4: Avis clients ─── */}
      {data.reviews.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-12">
          <div className="mx-auto max-w-3xl px-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              Ce que les gens disent
            </p>
            <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
              Avis clients ({data.reviews.length})
            </h2>
            <ReviewSection reviews={data.reviews} />
          </div>
        </section>
      )}

      {/* ─── SECTION 5: FAQ ─── */}
      {data.faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-12">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            Les gens se demandent
          </p>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">Questions fréquentes</h2>
          <FAQAccordion faqs={data.faqs} />
        </section>
      )}

      {/* ─── SECTION 6: Cross-sell ─── */}
      {data.crossSellProducts.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-12">
          <div className="mx-auto max-w-6xl px-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              Ça va bien avec
            </p>
            <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
              Les clients ont aussi acheté
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {data.crossSellProducts.map((p) => (
                <ProductCard key={p.id} product={p} whatsapp={shop.whatsapp} accent={accent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        Propulsé par <span className="font-bold text-gray-500">Boutiko</span>
      </footer>

      {/* ─── Sticky CTA (mobile) ─── */}
      <StickyCTA
        productName={product.name}
        price={currentPrice}
        oldPrice={product.oldPrice}
        whatsapp={shop.whatsapp}
        countdown={
          data.config.countdown.enabled ? (
            <CountdownTimer
              enabled
              endHour={data.config.countdown.endHour}
              endMinute={data.config.countdown.endMinute}
              isoEnd={data.config.countdown.isoEnd}
              compact
            />
          ) : undefined
        }
      />
    </div>
  )
}
