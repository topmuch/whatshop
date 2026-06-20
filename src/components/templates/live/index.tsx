'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ShoppingBag, SlidersHorizontal, ArrowUp } from 'lucide-react'
import { useAppStore, type Product, type Category } from '@/lib/store'
import LiveHeader from './header'
import LiveHero from './hero'
import LiveProductCard from './product-card'
import LiveFooter from './footer'
import ShopSwitcher from './shop-switcher'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Stagger animation for product grid ───
const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

// ─── Main Template Component ───
export function LivePulseTemplate() {
  const publicShop = useAppStore((s) => s.publicShop)
  const publicProducts = useAppStore((s) => s.publicProducts)
  const publicCategories = useAppStore((s) => s.publicCategories)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const categoryScrollRef = useRef<HTMLDivElement>(null)

  // ── Scroll-to-top visibility ──
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Available categories (with products) ──
  const categoriesWithProducts = useMemo(() => {
    if (!publicCategories || publicCategories.length === 0) return []
    const productCategoryIds = new Set(
      publicProducts.filter((p) => p.isAvailable && p.categoryId).map((p) => p.categoryId),
    )
    return publicCategories.filter((c) => productCategoryIds.has(c.id))
  }, [publicCategories, publicProducts])

  // ── Filtered products ──
  const filteredProducts = useMemo(() => {
    let products = publicProducts.filter((p) => p.isAvailable)

    if (activeCategory) {
      products = products.filter((p) => p.categoryId === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)),
      )
    }

    return products
  }, [publicProducts, activeCategory, searchQuery])

  // ── Category click handler ──
  const handleCategoryClick = useCallback((categoryId: string | null) => {
    setActiveCategory(categoryId)
    // Scroll category pills into view
    if (categoryScrollRef.current && categoryId) {
      const btn = categoryScrollRef.current.querySelector(`[data-cat="${categoryId}"]`)
      btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [])

  // ── Scroll to top ──
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Loading skeleton ──
  if (!publicShop) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        {/* Header skeleton */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b h-14">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
        {/* Hero skeleton */}
        <Skeleton className="w-full h-72 md:h-80" />
        {/* Products skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* ── Header ── */}
      <LiveHeader shop={publicShop} />

      {/* ── Shop Switcher (LIVE PRO — multi-shop) ── */}
      {publicShop.ownerId && <ShopSwitcher currentShopId={publicShop.id} ownerId={publicShop.ownerId} />}

      {/* ── Hero ── */}
      <LiveHero shop={publicShop} />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-6 py-8 md:py-12">
        {/* ── Search + Filter Bar ── */}
        <div className="flex items-center gap-3 mb-6">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-gray-200 text-sm text-[#1A1A2E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6154]/30 focus:border-[#FF6154]/50 transition-all duration-200 min-h-[44px]"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 transition-colors min-w-[24px] min-h-[24px]"
                  aria-label="Effacer la recherche"
                >
                  <X className="size-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Result count */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-500 shrink-0 min-h-[44px]">
            <SlidersHorizontal className="size-4 text-gray-400" />
            <span className="font-medium">{filteredProducts.length}</span>
            <span className="hidden md:inline">article{filteredProducts.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* ── Category Pills ── */}
        {categoriesWithProducts.length > 1 && (
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide -mx-4 px-4"
            role="tablist"
            aria-label="Filtrer par catégorie"
          >
            {/* All button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              role="tab"
              aria-selected={!activeCategory}
              onClick={() => handleCategoryClick(null)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[40px] ${
                !activeCategory
                  ? 'bg-gradient-to-r from-[#FF6154] to-[#FF9A44] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              Tout
            </motion.button>

            {/* Category buttons */}
            {categoriesWithProducts.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                role="tab"
                aria-selected={activeCategory === cat.id}
                data-cat={cat.id}
                onClick={() =>
                  handleCategoryClick(activeCategory === cat.id ? null : cat.id)
                }
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[40px] ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-[#FF6154] to-[#FF9A44] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        )}

        {/* ── Product Grid ── */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key="grid"
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5"
              role="list"
              aria-label="Liste des produits"
            >
              {filteredProducts.map((product) => (
                <div key={product.id} role="listitem">
                  <LiveProductCard product={product} shop={publicShop} />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
                <ShoppingBag className="size-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">
                {searchQuery ? 'Aucun résultat' : 'Aucun produit disponible'}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs mb-6">
                {searchQuery
                  ? `Aucun produit ne correspond à "${searchQuery}". Essayez un autre terme.`
                  : 'Cette boutique n\'a pas encore de produits. Revenez bientôt !'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6154] to-[#FF9A44] text-white font-semibold text-sm min-h-[44px] transition-all duration-200 hover:brightness-105"
                >
                  <X className="size-4" />
                  Effacer la recherche
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <LiveFooter shop={publicShop} />

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
  )
}

export default LivePulseTemplate
