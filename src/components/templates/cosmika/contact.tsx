'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

/**
 * CosmikaContact — Full contact section for consulting.
 * Form on the left, contact info + WhatsApp on the right.
 * Form submits via WhatsApp (no backend needed).
 */
interface CosmikaContactProps {
  config: ThemeConfig
  shop: Shop | null
}

export function CosmikaContact({ config, shop }: CosmikaContactProps) {
  const primary = config.colors.primary
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  if (!shop) return null

  const whatsappNumber = shop.whatsapp?.replace(/\D/g, '') || ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = `👤 *${name}*\n📧 ${email}\n📱 ${phone}\n\n💬 ${message}`
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const contactItems: Array<{ icon: React.ReactNode; label: string; value?: string }> = [
    { icon: <MapPin className="size-5" />, label: 'Adresse', value: shop.address },
    { icon: <Phone className="size-5" />, label: 'Téléphone', value: shop.phone },
    { icon: <Mail className="size-5" />, label: 'Email', value: shop.contactEmail },
    ...(shop.businessHours ? [{ icon: <Clock className="size-5" />, label: 'Horaires', value: shop.businessHours }] : []),
  ]

  return (
    <section id="contact" className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* ── Heading ── */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className="font-semibold text-sm tracking-widest uppercase"
            style={{ color: primary }}
          >
            CONTACT
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mt-2 text-gray-900">
            Contactez-nous
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Une question ? Un projet ? Parlons-en.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 md:gap-12">
          {/* ── Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 md:p-8"
            style={{ backgroundColor: '#f9fafb' }}
          >
            <h3 className="font-bold text-lg md:text-xl mb-6 text-gray-900">Envoyez-nous un message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 transition"
                  style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 transition"
                  style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 transition"
                  style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  placeholder="+225 07 07 07 07"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 transition resize-none"
                  style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  placeholder="Décrivez votre besoin..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] min-h-[44px]"
                style={{ backgroundColor: primary }}
              >
                Envoyer via WhatsApp
              </button>
            </form>
          </motion.div>

          {/* ── Contact info ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Contact details card */}
            <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: '#f9fafb' }}>
              <h3 className="font-bold text-lg md:text-xl mb-6 text-gray-900">Nos coordonnées</h3>
              <div className="space-y-4">
                {contactItems.map((item) =>
                  item.value ? (
                    <div key={item.label} className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: primary + '15', color: primary }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                        <p className="text-gray-600 text-sm">{item.value}</p>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-4">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold text-center transition flex items-center justify-center gap-2 min-h-[52px]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" /></svg>
                  WhatsApp
                </a>
              )}
              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="py-4 rounded-xl font-semibold text-center border-2 border-gray-200 hover:border-gray-400 transition flex items-center justify-center gap-2 min-h-[52px] text-gray-700"
                >
                  <Phone className="w-5 h-5" />
                  Appeler
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}