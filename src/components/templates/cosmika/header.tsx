'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'

interface CosmikaHeaderProps {
  config: ThemeConfig
  shop: Shop | null
}

export function CosmikaHeader({ config, shop }: CosmikaHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const colors = config.colors
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  const navItems = [
    { label: 'Accueil', href: '#accueil' },
    { label: config.navLabels.categories, href: '#categories' },
    { label: config.navLabels.catalog, href: '#products' },
  ]

  const handleNavClick = useCallback(
    (href: string) => {
      closeMobileMenu()
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    },
    [closeMobileMenu]
  )

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50" role="banner">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 min-h-[44px] min-w-[44px]">
            {shop?.logo ? (
              <Image
                src={shop.logo}
                alt={shop.name ?? 'Logo'}
                width={180}
                height={40}
                className="h-8 md:h-10 w-auto max-w-[180px] object-contain"
                priority
              />
            ) : (
              <h1
                className="font-serif text-xl md:text-2xl font-bold text-black"
              >
                {shop?.name ?? 'Boutiko'}
              </h1>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium"
            aria-label="Navigation principale"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-black hover:text-black/80 transition-colors duration-200 min-h-[44px] flex items-center"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Contact Button — Desktop */}
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
            className="hidden md:inline-flex items-center px-6 py-2 rounded-full font-semibold text-sm text-white transition-colors duration-200 min-h-[44px]"
            style={{ backgroundColor: colors.ctaBg }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryDark
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.ctaBg
            }}
          >
            Contact
          </a>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-11 w-11"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="cosmika-mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="size-5 text-black" />
            ) : (
              <Menu className="size-5 text-black" />
            )}
          </Button>
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
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
            <motion.div
              id="cosmika-mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-[280px] max-w-[80vw] bg-white shadow-2xl md:hidden flex flex-col"
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
                  className="h-11 w-11"
                  onClick={closeMobileMenu}
                  aria-label="Fermer le menu"
                >
                  <X className="size-5 text-black" />
                </Button>
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
                      className="flex items-center w-full px-4 py-3.5 text-sm font-semibold rounded-lg transition-colors duration-200 min-h-[44px] text-black"
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
                        transition={{ delay: 0.25, duration: 0.2 }}
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
                        transition={{ delay: 0.3, duration: 0.2 }}
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

              {/* Drawer Footer */}
              <div
                className="shrink-0 px-4 py-4 border-t"
                style={{ borderColor: colors.primaryLight }}
              >
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
                  className="flex items-center justify-center w-full h-12 rounded-full font-semibold text-sm text-white transition-colors duration-200"
                  style={{ backgroundColor: colors.ctaBg }}
                  onClick={closeMobileMenu}
                >
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