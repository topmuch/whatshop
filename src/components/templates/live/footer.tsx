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
    <footer className="relative overflow-hidden bg-[#1A1A2E] text-white" role="contentinfo">
      {/* Decorative gradient glow at top of footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#FF6154]/40 to-transparent" aria-hidden="true" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-24 bg-[#FF6154]/5 blur-3xl rounded-full" aria-hidden="true" />

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
            {/* Trust indicator */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex -space-x-2">
                {['bg-[#FF6154]', 'bg-[#FF9A44]', 'bg-amber-400'].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full ${bg} border-2 border-[#1A1A2E] flex items-center justify-center`}
                  >
                    <span className="text-[8px] font-bold text-white">
                      {['★', '★', '★'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-500">Clients satisfaits</span>
            </div>
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
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <MessageCircle className="size-4 shrink-0" />
                    </div>
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
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Phone className="size-4 shrink-0" />
                    </div>
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
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Mail className="size-4 shrink-0" />
                    </div>
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
              {[
                { icon: Instagram, label: 'Instagram' },
                { icon: Heart, label: 'TikTok' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="group flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 hover:bg-gradient-to-br hover:from-[#FF6154] hover:to-[#FF9A44] text-gray-400 hover:text-white transition-all duration-300 min-h-[44px] min-w-[44px] hover:shadow-lg hover:shadow-[#FF6154]/20"
                  aria-label={label}
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
            {/* Newsletter tease */}
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Rejoignez nos lives pour des offres exclusives !
            </p>
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