'use client'

import { useCallback, useEffect, useRef } from 'react'

type EventType = 'whatsapp_click' | 'form_submit' | 'page_view' | 'product_view'

interface TrackingMetadata {
  productId?: string
  path?: string
  productName?: string
}

// Simple in-memory dedup to avoid tracking the same event twice in rapid succession
const dedupMap = new Map<string, number>()
const DEDUP_WINDOW_MS = 5_000

function shouldDedup(eventType: string, shopId: string, metadata?: TrackingMetadata): boolean {
  const key = `${eventType}:${shopId}:${metadata?.productId || ''}`
  const now = Date.now()
  const last = dedupMap.get(key)
  if (last && now - last < DEDUP_WINDOW_MS) return true
  dedupMap.set(key, now)

  // Prune old entries when map grows
  if (dedupMap.size > 500) {
    for (const [k, t] of dedupMap) {
      if (now - t > DEDUP_WINDOW_MS) dedupMap.delete(k)
    }
  }

  return false
}

/**
 * Hook for tracking analytics events from client components.
 * Fires non-blocking requests to /api/track.
 */
export function useTracking(shopId: string | undefined) {
  const shopIdRef = useRef(shopId)

  useEffect(() => {
    shopIdRef.current = shopId
  }, [shopId])

  const track = useCallback(
    (eventType: EventType, metadata?: TrackingMetadata) => {
      const sid = shopIdRef.current
      if (!sid) return

      if (shouldDedup(eventType, sid, metadata)) return

      // Fire-and-forget — do not block the UX
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: sid, eventType, metadata: metadata ?? undefined }),
      }).catch(() => {
        // Silently fail — tracking should never break the UX
      })
    },
    [],
  )

  const trackWhatsAppClick = useCallback(
    (productId?: string, productName?: string) => {
      track('whatsapp_click', { productId, productName })
    },
    [track],
  )

  const trackFormSubmit = useCallback(() => {
    track('form_submit')
  }, [track])

  const trackPageView = useCallback(
    (path?: string) => {
      track('page_view', { path })
    },
    [track],
  )

  const trackProductView = useCallback(
    (productId: string, productName?: string) => {
      track('product_view', { productId, productName })
    },
    [track],
  )

  return {
    trackWhatsAppClick,
    trackFormSubmit,
    trackPageView,
    trackProductView,
  }
}