'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ThemeColors } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'
import { getAppearance } from '@/lib/appearance'

interface ElectroHeaderProps {
  colors: ThemeColors
  shop: Shop | null
  cartItemCount: number
  isServiceMode: boolean
  onCartClick: () => void
  onAccueilClick: () => void
  onCatalogClick: () => void
  onContactClick: () => void
}

export function ElectroHeader({
  colors,
  shop,
  cartItemCount,
  isServiceMode,
  onCartClick,
  onAccueilClick,
  onCatalogClick,
  onContactClick,
}: ElectroHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { logoSize } = getAppearance(shop?.customColors)

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
    { label: 'Catalogue', onClick: onCatalogClick },
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
        className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* ── Logo (well-dimensioned uploaded logo) ── */}
            <button
              onClick={() => handleNavClick(onAccueilClick)}
              className="flex items-center shrink-0 min-h-[44px] min-w-[44px]"
              aria-label="Retour à l'accueil"
            >
              {shop?.logo ? (
                <Image
                  src={shop.logo}
                  alt={shop.name ?? 'Logo'}
                  width={200}
                  height={53}
                  className='h-14 md:h-16 w-auto max-w-[200px] md:max-w-[240px] object-contain'
                  style={logoSize ? { height: parseInt(logoSize) } : undefined}
                  priority
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-black text-white"
                  >
                    <span className="text-base font-bold">
                      {(shop?.name ?? 'B').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-base font-bold leading-tight max-w-[160px] truncate text-gray-900">
                    {shop?.name ?? 'Boutiko'}
                  </span>
                </div>
              )}
            </button>

            {/* ── Right Section: Cart + Mobile Toggle ── */}
            <div className="flex items-center gap-2">
              {/* Cart Button (e-commerce only) */}
              {!isServiceMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-11 w-11 rounded-lg transition-colors duration-200"
                  onClick={onCartClick}
                  aria-label={`Panier${cartItemCount > 0 ? `, ${cartItemCount} article${cartItemCount > 1 ? 's' : ''}` : ''}`}
                >
                  <ShoppingCart className="size-5 text-gray-700" />
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
                  <X className="size-5 text-gray-700" />
                ) : (
                  <Menu className="size-5 text-gray-700" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-In Menu ── */}
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
                className="flex items-center justify-between px-5 h-14 shrink-0 border-b"
                style={{ borderColor: colors.primaryLight }}
              >
                <span className="text-base font-bold text-gray-900">
                  Menu
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-lg"
                  onClick={closeMobileMenu}
                  aria-label="Fermer le menu"
                >
                  <X className="size-5 text-gray-700" />
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
                      className="flex items-center w-full px-4 py-3.5 text-sm font-semibold rounded-lg transition-colors duration-200 min-h-[44px] text-gray-900"
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
                        className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold rounded-lg transition-colors duration-200 min-h-[44px] text-gray-900"
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
                        className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold rounded-lg transition-colors duration-200 min-h-[44px] text-gray-900"
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