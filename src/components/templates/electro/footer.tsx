'use client'

import { MessageCircle, MapPin, Phone, Mail, Clock } from 'lucide-react'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'
import { Separator } from '@/components/ui/separator'

interface ElectroFooterProps {
  shop: Shop
  theme: ThemeConfig
}

export default function ElectroFooter({ shop, theme }: ElectroFooterProps) {
  const { colors, navLabels } = theme

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About */}
          <div>
            <h3 className="font-bold text-xl mb-4" style={{ color: colors.primary }}>
              {shop.name}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {shop.aboutText || 'Votre partenaire de confiance pour des produits et services de qualité.'}
            </p>
            {shop.whatsapp && (
              <a
                href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold hover:underline inline-flex items-center gap-1.5 min-h-[44px]"
                style={{ color: colors.primary }}
              >
                Nous contacter sur WhatsApp →
              </a>
            )}
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#accueil" className="hover:text-white transition min-h-[44px] flex items-center">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition min-h-[44px] flex items-center">
                  {navLabels.categories}
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-white transition min-h-[44px] flex items-center">
                  {navLabels.catalog}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition min-h-[44px] flex items-center">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {shop.address && (
                <li className="flex items-start gap-2 min-h-[44px]">
                  <MapPin className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{shop.address}</span>
                </li>
              )}
              {shop.phone && (
                <li className="flex items-center gap-2 min-h-[44px]">
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  <span>{shop.phone}</span>
                </li>
              )}
              {shop.contactEmail && (
                <li className="flex items-center gap-2 min-h-[44px]">
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  <span>{shop.contactEmail}</span>
                </li>
              )}
              {shop.businessHours && (
                <li className="flex items-center gap-2 min-h-[44px]">
                  <Clock className="size-4 shrink-0" aria-hidden="true" />
                  <span>{shop.businessHours}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">
              Recevez nos offres et promotions.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': colors.primary } as React.CSSProperties}
                aria-label="Adresse email pour la newsletter"
              />
              <button
                className="px-4 py-2 rounded-r-lg font-semibold text-sm transition-colors duration-200 text-white"
                style={{ backgroundColor: colors.primary }}
              >
                OK
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <Separator className="my-6 bg-gray-800" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {shop.name}. Propulsé par{' '}
            <span className="font-semibold text-gray-400">Boutiko</span>.
          </p>
          <a
            href="/onboarding"
            className="text-sm text-gray-500 hover:text-white transition min-h-[44px] flex items-center"
          >
            Créer ma boutique →
          </a>
        </div>
      </div>
    </footer>
  )
}