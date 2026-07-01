import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Dynamic Web App Manifest for multi-tenant PWA support.
 *
 * GET /api/manifest/[shopSlug]
 *
 * Returns a manifest.json tailored to each shop's branding.
 * If PWA is not enabled for the shop, returns the default Boutiko manifest.
 * Results are cached in-memory with a 1-hour TTL.
 */

// ─── Slug Validation ─────────────────────────────────────────────────────────

const SHOP_SLUG_REGEX = /^[a-z0-9-]+$/

function isValidSlug(slug: string): boolean {
  return SHOP_SLUG_REGEX.test(slug) && slug.length > 0 && slug.length <= 63
}

// ─── In-Memory Cache (1-hour TTL) ─────────────────────────────────────────────

interface CacheEntry {
  manifest: object | null // null means "use default"
  expiresAt: number
}

const manifestCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

let lastCachePrune = Date.now()

/** Retrieve a cached manifest entry, or undefined if expired/missing. */
function getCached(slug: string): CacheEntry | undefined {
  const entry = manifestCache.get(slug)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    manifestCache.delete(slug)
    return undefined
  }
  return entry
}

/** Store a manifest entry in cache with 1-hour TTL. */
function setCache(slug: string, manifest: object | null): void {
  manifestCache.set(slug, { manifest, expiresAt: Date.now() + CACHE_TTL_MS })
  // Prune stale entries every 10 minutes
  const now = Date.now()
  if (now - lastCachePrune > 10 * 60 * 1000) {
    for (const [key, val] of manifestCache.entries()) {
      if (now > val.expiresAt) manifestCache.delete(key)
    }
    lastCachePrune = now
  }
}

// ─── Default Manifest ──────────────────────────────────────────────────────────

const DEFAULT_MANIFEST = {
  name: 'Boutiko - Créez votre boutique en ligne',
  short_name: 'Boutiko',
  description: 'Boutiko permet aux vendeurs africains de créer leur boutique en ligne gratuitement.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  background_color: '#ffffff',
  theme_color: '#EC4899',
  lang: 'fr',
  dir: 'ltr' as const,
  categories: ['shopping'],
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icons/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params

  // Validate slug format
  if (!isValidSlug(shopSlug)) {
    return NextResponse.json(DEFAULT_MANIFEST, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // Check cache first
  const cached = getCached(shopSlug)
  if (cached !== undefined) {
    const manifest = cached.manifest ?? DEFAULT_MANIFEST
    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // Fetch shop data from database
  try {
    const shop = await db.shop.findUnique({
      where: { slug: shopSlug },
      select: {
        name: true,
        slug: true,
        description: true,
        logo: true,
        pwaEnabled: true,
        pwaThemeColor: true,
        pwaBackgroundColor: true,
        pwaIconUrl: true,
      },
    })

    // If shop doesn't exist or PWA not enabled, cache and return default
    if (!shop || !shop.pwaEnabled) {
      setCache(shopSlug, null)
      return NextResponse.json(DEFAULT_MANIFEST, {
        headers: {
          'Content-Type': 'application/manifest+json',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Build shop-specific manifest
    const manifest = {
      name: shop.name,
      short_name: shop.name.substring(0, 12),
      description: shop.description || `Boutique ${shop.name} sur Boutiko`,
      start_url: `/boutique/${shopSlug}?utm_source=pwa`,
      scope: `/boutique/${shopSlug}/`,
      display: 'standalone' as const,
      orientation: 'portrait-primary' as const,
      background_color: shop.pwaBackgroundColor,
      theme_color: shop.pwaThemeColor,
      lang: 'fr',
      dir: 'ltr' as const,
      categories: ['shopping'],
      icons: [
        {
          src: `/api/manifest/${shopSlug}/icon/192`,
          sizes: '192x192',
          type: 'image/svg+xml',
        },
        {
          src: `/api/manifest/${shopSlug}/icon/384`,
          sizes: '384x384',
          type: 'image/svg+xml',
        },
        {
          src: `/api/manifest/${shopSlug}/icon/512`,
          sizes: '512x512',
          type: 'image/svg+xml',
        },
      ],
    }

    // Cache the manifest
    setCache(shopSlug, manifest)

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error(`[Manifest API] Error fetching shop "${shopSlug}":`, error)
    // On error, return default manifest
    return NextResponse.json(DEFAULT_MANIFEST, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}
