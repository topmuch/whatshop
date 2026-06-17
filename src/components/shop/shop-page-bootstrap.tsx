'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { PublicShop } from './public-shop'

/**
 * Bootstraps the SPA shop view from a server-rendered /boutique/[shopSlug] page.
 *
 * Sets the shop slug in the Zustand store so that <PublicShop /> can fetch
 * the shop data from the API and render the full interactive experience.
 *
 * This approach keeps the server-rendered SEO metadata (generateMetadata + JSON-LD)
 * in the initial HTML while delegating the full UI to the existing SPA components.
 */
export function ShopPageBootstrap({
  shopSlug,
  initialProductSlug,
}: {
  shopSlug: string
  initialProductSlug?: string
}) {
  const { setShopSlug, shopSlug: currentSlug } = useAppStore()

  useEffect(() => {
    if (currentSlug !== shopSlug) {
      setShopSlug(shopSlug)
    }
  }, [shopSlug, currentSlug, setShopSlug])

  return <PublicShop initialProductSlug={initialProductSlug} />
}