'use client'

import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'
import { MessageCircle, Phone, Mail, MapPin, ArrowUp } from 'lucide-react'

interface EleganceFooterProps {
  config: ThemeConfig
  shop: Shop | null
}

export function EleganceFooter({ config, shop }: EleganceFooterProps) {
  const colors = config.colors
  const name = shop?.name ?? 'Boutiko'
  const description = shop?.description ?? 'Votre partenaire de confiance pour des produits et services de qualité.'
  const isConsulting = config.hero.showConsultantPhoto

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navItems = [
    { href: '#accueil', label: 'Accueil' },
    { href: isConsulting ? '#expertises' : '#categories', label: config.navLabels.categories },
    { href: '#best-sellers', label: 'Meilleures Ventes' },
    { href: isConsulting ? '#services' : '#products', label: config.navLabels.catalog },
    { href: '#avis', label: 'Témoignages' },
    ...(isConsulting ? [
      { href: '#about', label: 'Qui sommes-nous' },
      { href: '#contact', label: 'Contact' },
    ] : []),
  ]

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: '#111827' }}>
      {/* Top gradient line */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary || colors.primary})` }} />

      {/* Back to top button */}
      <div className="flex justify-center -mt-5 relative z-10">
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          style={{ backgroundColor: colors.primary }}
          aria-label="Retour en haut"
        >
          <ArrowUp className="size-4" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className={`grid gap-8 mb-10 ${isConsulting ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-serif text-xl font-bold mb-4" style={{ color: colors.primary }}>
              {name}
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {description}
            </p>
            {/* Social / Contact icons */}
            <div className="flex gap-3">
              {shop?.whatsapp && (
                <a
                  href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="size-4 text-white" />
                </a>
              )}
              {shop?.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Téléphone"
                >
                  <Phone className="size-4 text-white" />
                </a>
              )}
              {shop?.contactEmail && (
                <a
                  href={`mailto:${shop.contactEmail}`}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="size-4 text-white" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-white group-hover:w-3 transition-all duration-200" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {shop?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="size-4 shrink-0 mt-0.5" style={{ color: colors.primary }} />
                  <span>{shop.address}</span>
                </li>
              )}
              {shop?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" style={{ color: colors.primary }} />
                  <span>{shop.phone}</span>
                </li>
              )}
              {shop?.contactEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0" style={{ color: colors.primary }} />
                  <span>{shop.contactEmail}</span>
                </li>
              )}
              {shop?.businessHours && (
                <li className="flex items-start gap-2">
                  <span className="text-base shrink-0 mt-0.5">🕐</span>
                  <span>{shop.businessHours}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: CTA */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Restez connecté</h4>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Suivez-nous pour recevoir nos offres exclusives et nouveautés en avant-première.
            </p>
            {shop?.whatsapp && (
              <a
                href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${name}, je souhaite recevoir vos offres.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03]"
                style={{ backgroundColor: colors.primary }}
              >
                <MessageCircle className="size-4" />
                Rejoindre sur WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} {name}. Propulsé par{' '}
            <span className="text-white font-medium">Boutiko</span>.
          </p>
          <a
            href="https://boutiko.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            Créer ma boutique
            <span>→</span>
          </a>
        </div>
      </div>
    </footer>
  )
}