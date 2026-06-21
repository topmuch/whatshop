'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, MessageCircle } from 'lucide-react'
import { useAppStore, type Product } from '@/lib/store'
import { getLiveTheme, LiveThemeContext, useLiveTheme } from './live-themes'
import LiveHeader from './header'
import ProductSpotlight from './product-spotlight'
import ShopSwitcher from './shop-switcher'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Scrolling Marquee Banner ───
function LiveMarqueeBanner({
  isLive,
  products,
  shopName,
}: {
  isLive: boolean
  products: Product[]
  shopName: string
}) {
  const theme = useLiveTheme()

  const items = isLive
    ? products
        .filter((p) => p.isAvailable)
        .map((p) => `🔴 LIVE en cours — Promo : ${p.name} — ${p.price.toLocaleString('fr-FR')} FCFA`)
    : [`\u{1F525} Prochain live bientôt sur ${shopName} — Restez connectés !`]

  // Fallback if no products or not live
  const marqueeItems = items.length > 0
    ? items
    : [`\u{1F525} Prochain live bientôt sur ${shopName} — Restez connectés !`]

  // Duplicate for seamless loop
  const doubled = [...marqueeItems, ...marqueeItems]

  return (
    <div className={`relative overflow-hidden ${theme.marqueeBg}`}>
      {/* Shimmer overlay */}
      <div className="live-marquee-shimmer" />
      <div className="py-3.5 md:py-4.5">
        <div className="live-marquee-track">
          {doubled.map((text, i) => (
            <span
              key={i}
              className={`mx-6 md:mx-10 text-lg md:text-xl lg:text-2xl font-black ${theme.marqueeText} whitespace-nowrap tracking-wide`}
            >
              {text}
              <span className={`inline-block mx-4 md:mx-6 ${theme.marqueeSeparator}`}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Template Component ───
export function LivePulseTemplate() {
  const publicShop = useAppStore((s) => s.publicShop)
  const publicProducts = useAppStore((s) => s.publicProducts)

  const [showScrollTop, setShowScrollTop] = useState(false)

  const isLive = publicShop?.isLiveMode === true
  const whatsapp = publicShop?.whatsapp || ''

  // Resolve live theme from shop template ID
  const themeColors = useMemo(
    () => getLiveTheme(publicShop?.template ?? 'live-template'),
    [publicShop?.template],
  )

  // ── Scroll-to-top visibility ──
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Scroll to top ──
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Loading skeleton ──
  if (!publicShop) {
    return (
      <div className="min-h-screen" style={{ background: themeColors.pageBg }}>
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b h-14">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
        <Skeleton className="w-full h-72 md:h-80" />
      </div>
    )
  }

  return (
    <LiveThemeContext.Provider value={themeColors}>
      <div className="min-h-screen flex flex-col" style={{ background: themeColors.pageBg }}>
        {/* ── All content above background ── */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* ── Header ── */}
          <LiveHeader shop={publicShop} />

          {/* ── Shop Switcher (LIVE PRO — multi-shop) ── */}
          {publicShop.ownerId && <ShopSwitcher currentShopId={publicShop.id} ownerId={publicShop.ownerId} />}

          {/* ── Scrolling Marquee Banner ── */}
          <LiveMarqueeBanner
            isLive={isLive}
            products={publicProducts}
            shopName={publicShop.name ?? 'Ma Boutique'}
          />

          {/* ── PRODUCT SPOTLIGHT — shown when seller selects a live product ── */}
          {publicShop.liveProductId && (() => {
            const spotlightProduct = publicProducts.find((p) => p.id === publicShop.liveProductId)
            if (!spotlightProduct) return null
            return (
              <div className="max-w-7xl mx-auto w-full px-0 sm:px-4 lg:px-6 -mt-0">
                <ProductSpotlight product={spotlightProduct} shop={publicShop} />
              </div>
            )
          })()}

          </div>

        {/* ── Floating WhatsApp Button (always visible, bottom-left) ── */}
        {whatsapp && (
          <motion.a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_4px_28px_rgba(37,211,102,0.65)] flex items-center justify-center transition-shadow duration-300 min-w-[56px] min-h-[56px]"
            aria-label="Contacter sur WhatsApp"
          >
            <MessageCircle className="size-6" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#25D366] border-2 border-white" />
            </span>
          </motion.a>
        )}

        {/* ── Scroll to top ── */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6154] to-[#FF9A44] text-white shadow-lg shadow-[#FF6154]/30 flex items-center justify-center min-h-[48px] min-w-[48px] hover:brightness-110 transition-all duration-200"
              aria-label="Retour en haut"
            >
              <ArrowUp className="size-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </LiveThemeContext.Provider>
  )
}

export default LivePulseTemplate