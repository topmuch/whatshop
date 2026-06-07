'use client'

import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface WhatsAppFabProps {
  onClick: () => void
}

export function WhatsAppFab({ onClick }: WhatsAppFabProps) {
  const { cart } = useAppStore()
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#128C7E] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:ring-offset-2"
      aria-label="Ouvrir le panier"
    >
      {/* Pulse ring when cart has items */}
      {itemCount > 0 && (
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40 opacity-75" />
      )}

      <MessageCircle className="size-6 relative z-10" />

      {/* Badge */}
      {itemCount > 0 && (
        <Badge className="absolute -top-1 -right-1 z-10 flex size-5 items-center justify-center rounded-full bg-destructive p-0 text-[10px] font-bold text-white border-2 border-background">
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </motion.button>
  )
}
