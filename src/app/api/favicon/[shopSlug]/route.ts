import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/favicon/[shopSlug]
// Generates a 32×32 SVG favicon for a shop using its logo or initials

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

/** In-memory cache (24h TTL) */
const cache = new Map<string, { svg: string; expires: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

function buildFaviconSvg(initials: string, bgColor: string, size = 32, logoUrl?: string): string {
  const radius = Math.round(size * 0.2)
  const fontSize = Math.round(size * 0.42)
  const padding = Math.round(size * 0.12)
  const innerSize = size - padding * 2

  if (logoUrl) {
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
  { params }: { params: Promise<{ shopSlug: string }> },
) {
  try {
    const { shopSlug } = await params

    if (!SLUG_REGEX.test(shopSlug)) {
      return NextResponse.json({ error: 'Slug invalide' }, { status: 400 })
    }

    // Check cache
    const now = Date.now()
    const cached = cache.get(shopSlug)
    if (cached && cached.expires > now) {
      return new NextResponse(cached.svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400, immutable',
        },
      })
    }

    // Fetch shop data
    const shop = await db.shop.findUnique({
      where: { slug: shopSlug, isActive: true },
      select: {
        name: true,
        logo: true,
        primaryColor: true,
        accentColor: true,
        pwaIconUrl: true,
      },
    })

    let svg: string

    if (!shop) {
      // Fallback: Boutiko "B" icon
      svg = buildFaviconSvg('B', '#EC4899')
    } else {
      const initials = getInitials(shop.name)
      const bgColor = shop.primaryColor || shop.accentColor || '#EC4899'
      const logoUrl = shop.pwaIconUrl || shop.logo || undefined

      if (logoUrl) {
        svg = buildFaviconSvg(initials, bgColor, 32, logoUrl)
      } else {
        svg = buildFaviconSvg(initials, bgColor)
      }
    }

    // Cache result
    cache.set(shopSlug, { svg, expires: now + CACHE_TTL })

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    })
  } catch (error) {
    console.error('Favicon generation error:', error)
    return NextResponse.json({ error: 'Failed to generate favicon' }, { status: 500 })
  }
}