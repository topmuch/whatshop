'use client'

import { memo } from 'react'
import { MessageCircle, Phone, Mail, Instagram, Heart } from 'lucide-react'
import type { Shop } from '@/lib/store'

interface LiveFooterProps {
  shop: Shop | null
}

function LiveFooter({ shop }: LiveFooterProps) {
  const name = shop?.name ?? 'Boutiko'
  const description = shop?.description ?? 'Votre destination shopping en direct.'

  return (
    <footer className="bg-[#1A1A2E] text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 md:py-16">
        {/* ── Main content ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-[#FF6154] to-[#FF9A44] bg-clip-text text-transparent">
              {name}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              {description}
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3">
              {shop?.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#25D366] transition-colors duration-200 min-h-[44px]"
                  >
                    <MessageCircle className="size-4 shrink-0" />
                    WhatsApp
                  </a>
                </li>
              )}
              {shop?.phone && (
                <li>
                  <a
                    href={`tel:${shop.phone.replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors duration-200 min-h-[44px]"
                  >
                    <Phone className="size-4 shrink-0" />
                    {shop.phone}
                  </a>
                </li>
              )}
              {shop?.contactEmail && (
                <li>
                  <a
                    href={`mailto:${shop.contactEmail}`}
                    className="inline-flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors duration-200 min-h-[44px]"
                  >
                    <Mail className="size-4 shrink-0" />
                    {shop.contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Suivez-nous
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 min-h-[44px] min-w-[44px]"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="#"
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 min-h-[44px] min-w-[44px]"
                aria-label="TikTok"
              >
                <Heart className="size-5" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {name}. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            Propulsé par{' '}
            <span className="font-semibold bg-gradient-to-r from-[#FF6154] to-[#FF9A44] bg-clip-text text-transparent">
              Boutiko
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default memo(LiveFooter)
