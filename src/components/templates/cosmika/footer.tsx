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
    shop?.description ?? 'Votre satisfaction est notre priorité. Contactez-nous pour toute question.'

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
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

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-semibold mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <button
                onClick={() => handleNavClick('#accueil')}
                className="hover:text-white transition-colors"
              >
                Accueil
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('#categories')}
                className="hover:text-white transition-colors"
              >
                {config.navLabels.categories}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('#products')}
                className="hover:text-white transition-colors"
              >
                {config.navLabels.catalog}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('#avis')}
                className="hover:text-white transition-colors"
              >
                Avis clients
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Powered by Boutiko */}
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
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
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
    </footer>
  )
}