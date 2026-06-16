'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import type { ThemeConfig } from '@/lib/theme-config'

interface EleganceScrollToTopProps {
  config: ThemeConfig
}

export function EleganceScrollToTop({ config }: EleganceScrollToTopProps) {
  const [visible, setVisible] = useState(false)
  const colors = config.colors

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
          style={{
            backgroundColor: colors.primary,
            boxShadow: `0 4px 20px ${colors.primary}40`,
          }}
          aria-label="Retour en haut"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}