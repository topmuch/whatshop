'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, MessageCircle, Search, ShoppingBag, ChevronDown } from 'lucide-react'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'

interface EleganceHeaderProps {
  config: ThemeConfig
  shop: Shop | null
  cartCount?: number
  onCartClick?: () => void
  onSearchClick?: () => void
  isScrolled?: boolean
}

export function EleganceHeader({
  config,
  shop,
  cartCount = 0,
  onCartClick,
  onSearchClick,
  isScrolled = false,
}: EleganceHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const colors = config.colors
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  const navItems = [
    { label: 'Accueil', href: '#accueil' },
    { label: config.navLabels.categories, href: '#categories' },
    { label: 'Meilleures Ventes', href: '#best-sellers' },
    { label: 'Nouveautés', href: '#new-arrivals' },
    { label: config.navLabels.catalog, href: '#products' },
    { label: 'Témoignages', href: '#avis' },
  ]

  const handleNavClick = useCallback(
    (href: string) => {
      closeMobileMenu()
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    },
    [closeMobileMenu]
  )

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const headerBg = isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-sm'

  return (
    <>
      {/* ── Top Utility Bar ── */}
      <div className="hidden lg:block border-b border-gray-100" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9 text-xs text-black">
          <div className="flex items-center gap-4">
            {shop?.phone && (
              <a href={`tel:${shop.phone}`} className="hover:text-black/70 transition-colors flex items-center gap-1">
                <Phone className="size-3" />
                {shop.phone}
              </a>
            )}
            {shop?.contactEmail && (
              <span className="flex items-center gap-1">✉️ {shop.contactEmail}</span>
            )}
            {shop?.businessHours && (
              <span className="flex items-center gap-1">🕐 {shop.businessHours}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>🇨🇮 Livraison partout en Côte d'Ivoire</span>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 lg:py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 min-h-[44px] min-w-[44px]">
            {shop?.logo ? (
              <Image
                src={shop.logo}
                alt={shop.name ?? 'Logo'}
                width={200}
                height={53}
                className="h-[53px] w-auto max-w-[200px] object-contain"
                priority
              />
            ) : (
              <h1
                className="font-serif text-xl lg:text-2xl font-bold text-black"
              >
                {shop?.name ?? 'Boutiko'}
              </h1>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1 text-sm font-medium"
            aria-label="Navigation principale"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="relative px-3 py-2 text-black hover:text-black/80 transition-colors duration-200 min-h-[44px] flex items-center group"
              >
                {item.label}
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-6 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={onSearchClick}
              className="hidden md:flex w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Rechercher"
            >
              <Search className="size-5 text-black" />
            </button>

            {/* Cart */}
            {onCartClick && (
              <button
                onClick={onCartClick}
                className="hidden md:flex relative w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label={`Panier (${cartCount} articles)`}
              >
                <ShoppingBag className="size-5 text-black" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* WhatsApp CTA — Desktop */}
            <a
              href={
                shop?.whatsapp
                  ? `https://wa.me/${shop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Bonjour ${shop.name}, je souhaite avoir des informations.`
                    )}`
                  : '#'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] min-h-[44px] shadow-md"
              style={{ backgroundColor: colors.ctaBg }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryDark
                e.currentTarget.style.boxShadow = `0 4px 20px ${colors.primary}40`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.ctaBg
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <MessageCircle className="size-4" />
              Contact
            </a>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden h-11 w-11 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="elegance-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="size-5 text-black" />
              ) : (
                <Menu className="size-5 text-black" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-In Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            <motion.div
              id="elegance-mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-[300px] max-w-[85vw] bg-white shadow-2xl lg:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
            >
              {/* Drawer Header */}
              <div
                className="flex items-center justify-between px-5 h-16 shrink-0 border-b"
                style={{ borderColor: colors.primaryLight }}
              >
                <span className="text-base font-bold text-black">
                  Menu
                </span>
                <button
                  onClick={closeMobileMenu}
                  className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="size-5 text-black" />
                </button>
              </div>

              {/* Drawer Nav */}
              <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation mobile">
                <div className="space-y-1">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.2 }}
                      onClick={() => handleNavClick(item.href)}
                      className="flex items-center w-full px-4 py-3.5 text-sm font-semibold rounded-xl transition-colors duration-200 min-h-[44px] text-black"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.primaryBg
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </div>

                {/* Contact Actions */}
                {shop && (
                  <div
                    className="mt-6 pt-4 border-t space-y-1"
                    style={{ borderColor: colors.primaryLight }}
                  >
                    {shop.phone && (
                      <motion.a
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35, duration: 0.2 }}
                        href={`tel:${shop.phone.replace(/\D/g, '')}`}
                        className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold rounded-xl transition-colors duration-200 min-h-[44px] text-black"
                        onClick={closeMobileMenu}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.primaryBg
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <Phone className="size-4 shrink-0" aria-hidden="true" />
                        <span>Appeler</span>
                      </motion.a>
                    )}
                    {shop.whatsapp && (
                      <motion.a
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.2 }}
                        href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold rounded-xl transition-colors duration-200 min-h-[44px] text-black"
                        onClick={closeMobileMenu}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.primaryBg
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
                        <span>WhatsApp</span>
                      </motion.a>
                    )}
                  </div>
                )}
              </nav>

              {/* Drawer Footer */}
              <div className="shrink-0 px-4 py-4 border-t" style={{ borderColor: colors.primaryLight }}>
                <a
                  href={
                    shop?.whatsapp
                      ? `https://wa.me/${shop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Bonjour ${shop.name}, je souhaite avoir des informations.`
                        )}`
                      : '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full h-12 rounded-full font-semibold text-sm text-white transition-all duration-200"
                  style={{ backgroundColor: colors.ctaBg }}
                  onClick={closeMobileMenu}
                >
                  <MessageCircle className="size-4 mr-2" />
                  Contact
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}