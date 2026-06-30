import { db } from '@/lib/db'
import { Metadata } from 'next'
import { ServiceWorkerRegistrar } from '@/components/pwa/service-worker-registrar'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ shopSlug: string }>
}

/* ------------------------------------------------------------------ */
/*  generateMetadata — PWA-specific tags only (merges with page meta)  */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shopSlug: string }>
}): Promise<Metadata> {
  const { shopSlug } = await params

  const shop = await db.shop.findUnique({
    where: { slug: shopSlug, isActive: true },
    select: {
      name: true,
      pwaEnabled: true,
      pwaThemeColor: true,
      pwaBackgroundColor: true,
      pwaIconUrl: true,
      logo: true,
      primaryColor: true,
    },
  })

  if (!shop || !shop.pwaEnabled) {
    return {}
  }

  return {
    manifest: `/api/manifest/${shopSlug}`,
    icons: {
      icon: [
        {
          url: `/api/manifest/${shopSlug}/icon/192`,
          sizes: '192x192',
          type: 'image/png',
        },
        {
          url: `/api/manifest/${shopSlug}/icon/512`,
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      apple: [
        {
          url: `/api/manifest/${shopSlug}/icon/192`,
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': shop.name,
      'msapplication-TileColor': shop.pwaBackgroundColor,
      'msapplication-navbutton-color': shop.pwaBackgroundColor,
    },
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: shop.pwaThemeColor },
      { media: '(prefers-color-scheme: dark)', color: shop.pwaThemeColor },
    ],
  }
}

/* ------------------------------------------------------------------ */
/*  Layout Component                                                   */
/* ------------------------------------------------------------------ */

export default async function ShopLayout({ children, params }: LayoutProps) {
  const { shopSlug } = await params

  const shop = await db.shop.findUnique({
    where: { slug: shopSlug, isActive: true },
    select: { pwaEnabled: true },
  })

  return (
    <>
      {children}
      {shop?.pwaEnabled && <ServiceWorkerRegistrar shopSlug={shopSlug} />}
    </>
  )
}