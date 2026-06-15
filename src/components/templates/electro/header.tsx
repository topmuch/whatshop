'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, Menu, X, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { ThemeColors } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'

interface ElectroHeaderProps {
  colors: ThemeColors
  shop: Shop | null
  cartItemCount: number
  showSearch: boolean
  isServiceMode: boolean
  catalogLabel: string
  onAccueilClick: () => void
  onCatalogClick: () => void
  onContactClick: () => void
  onCartClick: () => void
  onSearchChange: (query: string) => void
  searchQuery: string
}

export function ElectroHeader({
  colors,
  shop,
  cartItemCount,
  showSearch,
  isServiceMode,
  catalogLabel,
  onAccueilClick,
  onCatalogClick,
  onContactClick,
  onCartClick,
  onSearchChange,
  searchQuery,
}: ElectroHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  const handleNavClick = useCallback(
    (action: () => void) => {
      action()
      closeMobileMenu()
    },
    [closeMobileMenu]
  )

  const navItems = [
    { label: 'Accueil', onClick: onAccueilClick },
    { label: catalogLabel, onClick: onCatalogClick },
    { label: 'Contact', onClick: onContactClick },
  ]

  return (
    <>
      {/* ── Announcement bar ── */}
      <div
        className="text-center py-2 text-xs md:text-sm font-medium"
        style={{ backgroundColor: colors.primary, color: '#ffffff' }}
      >
        {isServiceMode
          ? 'Devis gratuit sous 24h | Support 7j/7'
          : 'Livraison gratuite à partir de 50 000 FCFA | Support 7j/7'}
      </div>

      <header
        className="sticky top-0 z-50 bg-white shadow-md"
        role="banner"
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 md:h-[70px]">
            {/* ── Logo / Shop Name ── */}
            <button
              onClick={() => handleNavClick(() => {})}
              className="flex items-center gap-2.5 shrink-0 min-h-[44px] min-w-[44px]"
              aria-label="Retour à l'accueil"
            >
              {shop?.logo ? (
                <Image
                  src={shop.logo}
                  alt={shop.name ?? 'Logo'}
                  width={180}
                  height={40}
                  className="h-10 max-h-[40px] w-auto max-w-[180px] object-contain"
                  priority
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-black text-white"
                  >
                    <span className="text-lg font-bold">
                      {(shop?.name ?? 'B').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span
                    className="text-base font-bold leading-tight max-w-[160px] truncate text-black"
                  >
                    {shop?.name ?? 'Boutiko'}
                  </span>
                </div>
              )}
            </button>

            {/* ── Desktop Navigation ── */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Navigation principale"
            >
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.onClick)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 min-h-[44px] flex items-center text-black"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.primaryBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* ── Right Section: Search + Cart + Mobile Toggle ── */}
            <div className="flex items-center gap-2">
              {/* Desktop Search */}
              {showSearch && (
                <div className="hidden md:flex items-center relative">
                  <Search
                    className="absolute left-3 size-4 pointer-events-none text-black"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 pr-4 h-10 w-[300px] rounded-lg border text-sm focus:ring-2"
                    style={{
                      borderColor: colors.primaryLight,
                      '--tw-ring-color': colors.primary,
                    } as React.CSSProperties}
                    aria-label="Rechercher des produits"
                  />
                </div>
              )}

              {/* Cart Button (e-commerce only) */}
              {!isServiceMode && (
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11 rounded-lg transition-colors duration-200"
                onClick={onCartClick}
                aria-label={`Panier${cartItemCount > 0 ? `, ${cartItemCount} article${cartItemCount > 1 ? 's' : ''}` : ''}`}
              >
                <ShoppingCart className="size-5 text-black" />
                {cartItemCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-[10px] font-bold px-1 rounded-full border-2 border-white"
                    style={{
                      background: colors.primary,
                      color: colors.ctaText,
                    }}
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </Button>
              )}

              {/* Mobile Search Toggle */}
              {showSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-11 w-11 rounded-lg"
                  onClick={() => setMobileSearchOpen((prev) => !prev)}
                  aria-label="Rechercher"
                >
                  <Search className="size-5 text-black" />
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-11 w-11 rounded-lg"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="electro-mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="size-5 text-black" />
                ) : (
                  <Menu className="size-5 text-black" />
                )}
              </Button>
            </div>
          </div>

          {/* ── Mobile Search Bar (collapsible) ── */}
          <AnimatePresence>
            {showSearch && mobileSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="md:hidden overflow-hidden"
              >
                <div className="pb-3 relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none text-black"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 pr-4 h-11 w-full rounded-lg border text-sm focus:ring-2"
                    style={{
                      borderColor: colors.primaryLight,
                      '--tw-ring-color': colors.primary,
                    } as React.CSSProperties}
                    autoFocus
                    aria-label="Rechercher des produits"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Mobile Slide-In Menu Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Slide-in Drawer */}
            <motion.div
              id="electro-mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-[300px] max-w-[80vw] bg-white shadow-2xl md:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
            >
              {/* Drawer Header */}
              <div
                className="flex items-center justify-between px-5 h-16 shrink-0 border-b"
                style={{ borderColor: colors.primaryLight }}
              >
                <span
                  className="text-base font-bold text-black"
                >
                  Menu
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-lg"
                  onClick={closeMobileMenu}
                  aria-label="Fermer le menu"
                >
                  <X className="size-5 text-black" />
                </Button>
              </div>

              {/* Drawer Nav Links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation mobile">
                <div className="space-y-1">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.2 }}
                      onClick={() => handleNavClick(item.onClick)}
                      className="flex items-center w-full px-4 py-3.5 text-sm font-semibold rounded-lg transition-colors duration-200 min-h-[44px] text-black"
                      onTouchStart={(e) => {
                        e.currentTarget.style.background = colors.primaryBg
                      }}
                      onTouchEnd={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
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
                  <div className="mt-6 pt-4 border-t space-y-1" style={{ borderColor: colors.primaryLight }}>
                    {shop.phone && (
                      <motion.a
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.2 }}
                        href={`tel:${shop.phone.replace(/\D/g, '')}`}
                        className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold rounded-lg transition-colors duration-200 min-h-[44px] text-black"
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
                        transition={{ delay: 0.25, duration: 0.2 }}
                        href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold rounded-lg transition-colors duration-200 min-h-[44px] text-black"
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

              {/* Drawer Footer with Cart (e-commerce only) */}
              {!isServiceMode && (
              <div
                className="shrink-0 px-4 py-4 border-t"
                style={{ borderColor: colors.primaryLight }}
              >
                <Button
                  className="w-full h-12 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: colors.primary,
                    color: colors.ctaText,
                  }}
                  onClick={() => {
                    onCartClick()
                    closeMobileMenu()
                  }}
                >
                  <ShoppingCart className="size-4" />
                  <span>Panier</span>
                  {cartItemCount > 0 && (
                    <Badge
                      className="ml-1 h-5 min-w-[20px] flex items-center justify-center text-[10px] font-bold px-1.5 rounded-full"
                      style={{
                        background: colors.primaryDark,
                        color: colors.ctaText,
                      }}
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Badge>
                  )}
                </Button>
              </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}