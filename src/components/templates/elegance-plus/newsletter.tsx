'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail } from 'lucide-react'
import type { ThemeConfig } from '@/lib/theme-config'
import type { Shop } from '@/lib/store'
import { toast } from 'sonner'

interface EleganceNewsletterProps {
  config: ThemeConfig
  shop: Shop | null
}

export function EleganceNewsletter({ config, shop }: EleganceNewsletterProps) {
  const colors = config.colors
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // Send via WhatsApp if available
    if (shop?.whatsapp) {
      const msg = `Newsletter — Nouvel abonné : ${email}`
      window.open(
        `https://wa.me/${shop.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
        '_blank'
      )
    }

    setSubmitted(true)
    toast.success('Merci pour votre inscription !')
    setEmail('')
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section className="py-16 md:py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
      {/* Decorative shapes */}
      <div
        className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-5 blur-3xl -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: colors.primary }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl translate-x-1/2 translate-y-1/2"
        style={{ backgroundColor: colors.secondary }}
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-sm"
            style={{ backgroundColor: 'white' }}
          >
            <Mail className="size-7" style={{ color: colors.primary }} />
          </div>

          <span
            className="font-semibold text-sm tracking-[0.2em] uppercase"
            style={{ color: colors.primary }}
          >
            NEWSLETTER
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900">
            Restez informé
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Inscrivez-vous pour recevoir nos offres exclusives, nouveautés et promotions directement dans votre boîte mail.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="flex-1 px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 transition min-h-[48px]"
            style={{ '--tw-ring-color': colors.primary } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={submitted}
            className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] min-h-[48px] flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            style={{ backgroundColor: colors.ctaBg }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryDark
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.ctaBg
            }}
          >
            <Send className="size-4" />
            {submitted ? 'Inscrit !' : "S'inscrire"}
          </button>
        </motion.form>

        <p className="text-xs text-gray-400 mt-4">
          En vous inscrivant, vous acceptez de recevoir nos communications. Désabonnement possible à tout moment.
        </p>
      </div>
    </section>
  )
}