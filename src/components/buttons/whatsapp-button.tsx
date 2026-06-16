'use client'

import { generateWhatsAppLink, type WhatsAppLinkParams } from '@/lib/whatsapp-link'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface WhatsAppButtonProps extends WhatsAppLinkParams {
  productId?: string
  shopId: string
  className?: string
  label?: string
  /** If true, opens in the same tab instead of new tab */
  sameTab?: boolean
}

/**
 * Reusable WhatsApp order button with click tracking.
 *
 * Fires a background tracking call to /api/track/whatsapp,
 * then opens the wa.me link with a pre-filled message.
 */
export default function WhatsAppButton({
  productId,
  shopId,
  source = 'website',
  className = '',
  label = 'Commander sur WhatsApp',
  sameTab = false,
  ...linkParams
}: WhatsAppButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)

    // Track click in background (fire-and-forget)
    if (shopId) {
      fetch('/api/track/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, productId, source, productName: linkParams.productName }),
      }).catch(() => {})
    }

    // Open WhatsApp
    const link = generateWhatsAppLink({ ...linkParams, source })
    if (sameTab) {
      window.location.href = link
    } else {
      window.open(link, '_blank', 'noopener')
    }

    // Small delay so user sees the loading state
    setTimeout(() => setLoading(false), 300)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold rounded-lg transition-colors hover:bg-green-600 active:scale-[0.97] disabled:opacity-60 min-h-[44px] px-5 py-3 text-sm ${className}`}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <MessageCircle className="size-4" />
      )}
      <span>{label}</span>
    </button>
  )
}