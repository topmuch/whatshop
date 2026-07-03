'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface AnnouncementBarProps {
  shop: { name?: string; whatsapp?: string } | null
  primaryColor: string
}

const DEFAULT_MESSAGES = [
  { text: 'Livraison gratuite à partir de 25 000 FCFA', type: 'shipping' as const },
  { text: 'Paiement Mobile Money & Wave disponible', type: 'payment' as const },
  { text: 'Retour facile sous 7 jours', type: 'return' as const },
]

const ICONS: Record<string, string> = {
  shipping: '🚚',
  payment: '💳',
  return: '↩️',
  promo: '🔥',
  default: '✨',
}

export function EleganceAnnouncementBar({ shop, primaryColor }: AnnouncementBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  
  // Build messages: shop-specific promo + defaults
  const messages = [
    { text: `Bienvenue chez ${shop?.name || 'notre boutique'} ! Découvrez nos offres`, type: 'promo' as const },
    ...DEFAULT_MESSAGES,
  ]

  useEffect(() => {
    if (dismissed) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [dismissed, messages.length])

  if (dismissed) return null

  const current = messages[currentIndex]

  return (
    <div
      className="relative overflow-hidden py-2.5 text-center"
      style={{ backgroundColor: primaryColor }}
      role="marquee"
      aria-label="Annonces promotionnelles"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-white text-xs sm:text-sm font-medium px-10 flex items-center justify-center gap-2"
        >
          <span className="text-base" aria-hidden="true">
            {ICONS[current.type] || ICONS.default}
          </span>
          {current.text}
        </motion.p>
      </AnimatePresence>

      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
        aria-label="Fermer l'annonce"
      >
        <X className="size-3.5" />
      </button>

      {/* Nav dots (desktop) */}
      <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 bottom-0.5 gap-1">
        {messages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-0.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-4 bg-white/80' : 'w-1.5 bg-white/30'
            }`}
            aria-label={`Annonce ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}