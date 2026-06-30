'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { type AppView } from '@/lib/store'
import { navigateTo } from '@/lib/navigation'
import { PLATFORM_CONFIG } from '@/lib/shared'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  ArrowRight,
  Menu,
  Instagram,
  MessageCircle,
  Mail,
  Phone,
  Globe2,
  Palmtree,
} from 'lucide-react'

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const DARK_BG = '#0B1426'
const PRIMARY = '#EC4899'

/* ──────────────────────────── NAVIGATION CONFIG ──────────────────────────── */
const navItems = [
  { label: 'Accueil', view: 'landing' as AppView },
  { label: 'À propos', view: 'about' as AppView },
  { label: 'Tarifs', view: 'pricing' as AppView },
  { label: 'Contact', view: 'contact' as AppView },
  { label: 'FAQ', view: 'faq' as AppView },
]

/* ──────────────────────────── ANIMATIONS ──────────────────────────── */
const fadeInDown = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

/* ──────────────────────────── LOGO ──────────────────────────── */
function Logo({ light = false }: { light?: boolean }) {
  return (
    <img
      src="/logo-boutiko.png"
      alt="Boutiko"
      className="h-auto w-auto max-w-full object-contain"
      style={{ height: 75, width: 225 }}
    />
  )
}

/* ──────────────────────────── HEADER ──────────────────────────── */
function PublicHeader({ currentView }: { currentView: AppView }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <motion.header
      variants={fadeInDown}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
    >
      <div className="mx-auto max-w-[1400px] flex h-18 items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16">
        {/* Logo */}
        <button onClick={() => navigateTo('landing')} className="flex-shrink-0">
          <Logo />
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.view
            return (
              <button
                key={item.view}
                onClick={() => navigateTo(item.view)}
                className={`relative text-[14px] font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-primary/8'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="public-nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('login')}
            className="font-medium text-gray-600 hover:text-gray-900"
          >
            Se connecter
          </Button>
          <Button
            size="sm"
            onClick={() => navigateTo('register')}
            className="font-medium shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
          >
            Créer ma boutique
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="mb-6">
              <Logo />
            </SheetTitle>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = currentView === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      setMobileOpen(false)
                      navigateTo(item.view)
                    }}
                    className={`text-base font-medium px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
                      isActive
                        ? 'text-primary bg-primary/8'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setMobileOpen(false)
                  navigateTo('login')
                }}
              >
                Se connecter
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  setMobileOpen(false)
                  navigateTo('register')
                }}
              >
                Créer ma boutique
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  )
}

/* ──────────────────────────── FOOTER ──────────────────────────── */
function PublicFooter() {

  return (
    <motion.footer
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mt-auto"
      style={{ backgroundColor: DARK_BG }}
    >
      {/* Top border accent */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16 py-16 md:py-20 pb-36">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo light />
            <p className="text-sm text-white/50 mt-4 max-w-[280px] leading-relaxed">
              La plateforme e-commerce N°1 pour les vendeurs africains.
              Créez votre boutique, vendez sur WhatsApp, développez votre business.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4 text-white/60" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
                <MessageCircle className="w-4 h-4 text-white/60" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
                <Globe2 className="w-4 h-4 text-white/60" />
              </a>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-5">PRODUIT</h4>
            <ul className="space-y-3">
              {[
                { label: 'Fonctionnalités', action: () => navigateTo('landing') },
                { label: 'Tarifs', action: () => navigateTo('pricing') },
                { label: 'FAQ', action: () => navigateTo('faq') },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-sm text-white/50 hover:text-white/80 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-5">ENTREPRISE</h4>
            <ul className="space-y-3">
              {[
                { label: 'À propos', action: () => navigateTo('about') },
                { label: 'Contact', action: () => navigateTo('contact') },
                { label: "Conditions d'utilisation", action: () => navigateTo('terms') },
                { label: 'Politique de confidentialité', action: () => navigateTo('privacy') },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-sm text-white/50 hover:text-white/80 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-5">CONTACT</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                <a
                  href={`https://wa.me/${PLATFORM_CONFIG.DEFAULT_WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  +221 78 485 822 26
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a
                  href="mailto:contact@boutiko.pro"
                  className="text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  contact@boutiko.pro
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-white/50">Dakar, Sénégal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <Separator className="my-10 bg-white/[0.06]" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Boutiko. Tous droits réservés.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/40">
              <Palmtree className="w-4 h-4 text-primary/60" />
              <span className="text-sm">Made in Africa</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

/* ──────────────────────────── PUBLIC LAYOUT ──────────────────────────── */
export function PublicLayout({
  children,
  currentView,
}: {
  children: React.ReactNode
  currentView: AppView
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader currentView={currentView} />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
