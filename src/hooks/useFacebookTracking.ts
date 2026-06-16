'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

interface FacebookEventPayload {
  productId?: string
  productName?: string
  price?: number
  currency?: string
  contentName?: string
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

/**
 * Hook for Facebook tracking — combines Pixel (client-side) + CAPI (server-side).
 *
 * Usage:
 * ```tsx
 * const { trackViewContent, trackContact, trackLead, trackPageView } = useFacebookTracking()
 * ```
 *
 * Each function:
 *  1. Calls fbq() for the Pixel (client-side, fire-and-forget)
 *  2. Calls /api/track/facebook for CAPI (server-side, fire-and-forget)
 *
 * The CAPI endpoint handles:
 *  - Fetching the encrypted access token
 *  - Hashing user data (email, phone)
 *  - Sending to Facebook Graph API with retry
 *  - Saving the event in DB for dashboard display
 */
export function useFacebookTracking(shopIdOverride?: string) {
  const publicShop = useAppStore((s) => s.publicShop)
  const shopIdRef = useRef(shopIdOverride)

  // Use override or fall back to public shop
  const shopId = shopIdOverride || publicShop?.id
  const pixelId = publicShop?.facebookPixelId
  const trackingEnabled = !!publicShop?.facebookPixelId

  // Keep ref updated via useEffect
  useEffect(() => {
    if (shopIdOverride) {
      shopIdRef.current = shopIdOverride
    }
  }, [shopIdOverride])

  // ── Pixel helper: safely call fbq ──

  const callFbq = useCallback((...args: unknown[]) => {
    if (typeof window === 'undefined') return
    try {
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
      if (fbq && typeof fbq === 'function') {
        fbq(...args)
      }
    } catch {
      // Pixel blocked by ad blocker — silently ignore
    }
  }, [])

  // ── CAPI helper: send to server endpoint ──

  const sendToCAPI = useCallback(
    (eventName: string, eventData: FacebookEventPayload, eventId: string) => {
      if (!shopId) return

      // Fire-and-forget — never block the UI
      fetch('/api/track/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          eventName,
          eventData,
          eventId,
        }),
      }).catch(() => {
        // Silently fail — tracking should never break the UX
      })
    },
    [shopId],
  )

  // ── Track Page View ──

  const trackPageView = useCallback(
    (path?: string) => {
      if (!trackingEnabled) return
      const eventId = `pv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

      // Pixel
      callFbq('track', 'PageView')

      // CAPI
      sendToCAPI('PageView', { currency: 'XOF' }, eventId)
    },
    [trackingEnabled, callFbq, sendToCAPI],
  )

  // ── Track View Content (product) ──

  const trackViewContent = useCallback(
    (productId: string, productName: string, price?: number, currency: string = 'XOF') => {
      if (!trackingEnabled) return
      const eventId = `vc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

      // Pixel
      callFbq('track', 'ViewContent', {
        content_name: productName,
        content_ids: [productId],
        content_type: 'product',
        value: price,
        currency,
      })

      // CAPI
      sendToCAPI('ViewContent', {
        productId,
        productName,
        price,
        currency,
      }, eventId)
    },
    [trackingEnabled, callFbq, sendToCAPI],
  )

  // ── Track Contact (WhatsApp click) ──

  const trackContact = useCallback(
    (method: 'whatsapp' | 'form' = 'whatsapp', value?: number) => {
      if (!trackingEnabled) return
      const eventId = `ct_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

      // Pixel
      callFbq('track', 'Contact', {
        content_name: method === 'whatsapp' ? 'WhatsApp CTA' : 'Contact Form',
        value,
        currency: 'XOF',
      })

      // CAPI
      sendToCAPI('Contact', {
        contentName: method === 'whatsapp' ? 'WhatsApp CTA' : 'Contact Form',
        price: value,
        currency: 'XOF',
      }, eventId)
    },
    [trackingEnabled, callFbq, sendToCAPI],
  )

  // ── Track Lead (form submit) ──

  const trackLead = useCallback(
    (method: string = 'form_submit', value?: number) => {
      if (!trackingEnabled) return
      const eventId = `ld_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

      // Pixel
      callFbq('track', 'Lead', {
        content_name: method,
        value,
        currency: 'XOF',
      })

      // CAPI
      sendToCAPI('Lead', {
        contentName: method,
        price: value,
        currency: 'XOF',
      }, eventId)
    },
    [trackingEnabled, callFbq, sendToCAPI],
  )

  return {
    trackPageView,
    trackViewContent,
    trackContact,
    trackLead,
    isPixelActive: trackingEnabled,
  }
}