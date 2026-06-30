import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/manifest/[shopSlug]/icon/[size]
// Generates a PWA icon (192, 384, or 512) as SVG for a shop
// SVG is supported by all modern browsers for PWA icons

const VALID_SIZES = [192, 384, 512] as const
type IconSize = (typeof VALID_SIZES)[number]

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

/** In-memory cache (7 days TTL) */
const iconCache = new Map<string, { svg: string; expires: number }>()
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

function cleanCache() {
  const now = Date.now()
  for (const [key, val] of iconCache) {
    if (val.expires < now) iconCache.delete(key)
  }
}

function buildInitialsSvg(initials: string, bgColor: string, size: number, logoUrl?: string): string {
  const radius = Math.round(size * 0.2)
  const fontSize = Math.round(size * 0.38)
  const padding = Math.round(size * 0.1)
  const innerSize = size - padding * 2

  if (logoUrl) {
    // Icon with logo image
    let resolvedUrl = logoUrl
    if (logoUrl.startsWith('/')) resolvedUrl = `https://boutiko.pro${logoUrl}`

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <clipPath id="r"><rect width="${size}" height="${size}" rx="${radius}"/></clipPath>
  </defs>
  <g clip-path="url(#r)">
    <rect width="${size}" height="${size}" fill="${bgColor}"/>
    <image xlink:href="${resolvedUrl}" x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" preserveAspectRatio="xMidYMid meet"/>
  </g>
</svg>`
  }

  // Icon with initials
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${bgColor}"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui, -apple-system, 'Segoe UI', sans-serif"
    font-size="${fontSize}" font-weight="700" fill="#ffffff">${initials}</text>
</svg>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopSlug: string; size: string }> },
) {
  try {
    const { shopSlug, size: sizeStr } = await params

    if (!SLUG_REGEX.test(shopSlug)) {
      return NextResponse.json({ error: 'Slug invalide' }, { status: 400 })
    }

    const size = parseInt(sizeStr, 10) as IconSize
    if (!VALID_SIZES.includes(size)) {
      return NextResponse.json(
        { error: 'Taille invalide. Utilisez 192, 384 ou 512.' },
        { status: 400 },
      )
    }

    // Check cache
    const cacheKey = `${shopSlug}:${size}`
    cleanCache()
    const cached = iconCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return new NextResponse(cached.svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=604800, immutable',
        },
      })
    }

    // Fetch shop data
    const shop = await db.shop.findUnique({
      where: { slug: shopSlug, isActive: true },
      select: {
        name: true,
        pwaEnabled: true,
        pwaThemeColor: true,
        pwaBackgroundColor: true,
        pwaIconUrl: true,
        logo: true,
      },
    })

    let svg: string

    if (!shop || !shop.pwaEnabled) {
      // Fallback: Boutiko "B" icon
      svg = buildInitialsSvg('B', '#EC4899', size)
    } else {
      const initials = getInitials(shop.name)
      const bgColor = shop.pwaBackgroundColor || '#ffffff'
      const themeColor = shop.pwaThemeColor || '#000000'
      const logoUrl = shop.pwaIconUrl || shop.logo || undefined

      if (logoUrl) {
        svg = buildInitialsSvg(initials, bgColor, size, logoUrl)
      } else {
        svg = buildInitialsSvg(initials, themeColor, size)
      }
    }

    iconCache.set(cacheKey, { svg, expires: Date.now() + CACHE_TTL })

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  } catch (error) {
    console.error('PWA icon generation error:', error)
    return NextResponse.json({ error: 'Failed to generate icon' }, { status: 500 })
  }
}