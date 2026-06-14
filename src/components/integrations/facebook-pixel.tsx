'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

interface FacebookPixelProps {
  /** Facebook Pixel ID (e.g. "123456789012345") */
  pixelId: string | undefined | null
  /** Whether to automatically track page views */
  trackPageViews?: boolean
}

// Extend the Window type for fbq
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown[]
  }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

/**
 * Facebook Pixel component.
 *
 * Injects the Facebook Pixel script and initializes tracking.
 * Must be included in the public shop layout so events fire on every page.
 *
 * - Uses next/script for optimal loading (afterInteractive)
 * - Initializes fbq() on the window object
 * - Tracks initial PageView if enabled
 * - Gracefully handles ad blockers
 */
export function FacebookPixel({ pixelId, trackPageViews = true }: FacebookPixelProps) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!pixelId || initialized.current) return
    initialized.current = true

    // Define fbq stub if not already loaded (handles ad blockers)
    if (typeof window !== 'undefined' && !window.fbq) {
      window._fbq = []
      // Minimal stub — the real fbq is loaded by the Script below
      window.fbq = function (...args: unknown[]) {
        window._fbq?.push(args)
      }
    }
  }, [pixelId])

  if (!pixelId) return null

  return (
    <>
      {/* Facebook Pixel initialization */}
      <Script
        id="facebook-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            fbq('init', '${pixelId}');
            ${trackPageViews ? "fbq('track', 'PageView');" : ''}
          `,
        }}
      />

      {/* Facebook Pixel noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt="Facebook Pixel"
        />
      </noscript>
    </>
  )
}

export default FacebookPixel