'use client'

import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'
import { MessageCircle } from 'lucide-react'

interface CosmikaFooterProps {
  config: ThemeConfig
  shop: Shop | null
}

export function CosmikaFooter({ config, shop }: CosmikaFooterProps) {
  const colors = config.colors
  const name = shop?.name ?? 'Boutiko'
  const description =
    shop?.description ?? 'Votre partenaire de confiance pour atteindre vos objectifs.'
  const isConsulting = config.hero.showConsultantPhoto

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const navItems = [
    { href: '#accueil', label: 'Accueil' },
    { href: isConsulting ? '#expertises' : '#categories', label: config.navLabels.categories },
    { href: isConsulting ? '#services' : '#products', label: config.navLabels.catalog },
    ...(isConsulting ? [
      { href: '#about', label: 'Qui sommes-nous' },
      { href: '#contact', label: 'Contact' },
    ] : []),
  ]

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className={`grid gap-8 mb-8 ${isConsulting ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
          {/* Column 1: About */}
          <div>
            <h3
              className="font-serif text-xl font-bold mb-4"
              style={{ color: colors.primary }}
            >
              {name}
            </h3>
            <p className="text-gray-400 text-sm mb-4">{description}</p>
            {shop?.whatsapp && (
              <a
                href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: colors.secondary }}
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Nous contacter sur WhatsApp →
              </a>
            )}
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {navItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact (consulting only) */}
          {isConsulting && shop && (
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {shop.address && <li>📍 {shop.address}</li>}
                {shop.phone && <li>📞 {shop.phone}</li>}
              </ul>
            </div>
          )}

          {/* Column 3/4: WhatsApp CTA */}
          <div>
            <h4 className="font-semibold mb-4">Restez informé</h4>
            <p className="text-gray-400 text-sm mb-4">
              Suivez-nous pour recevoir nos offres exclusives et nouveautés.
            </p>
            <a
              href={
                shop?.whatsapp
                  ? `https://wa.me/${shop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Bonjour ${name}, je souhaite recevoir vos offres.`
                    )}`
                  : '#'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03]"
              style={{ backgroundColor: colors.primary }}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Rejoindre sur WhatsApp
            </a>
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
            className="hover:text-white transition-colors"
          >
            Créer ma boutique →
          </a>
        </div>
      </div>
    </footer>
  )
}