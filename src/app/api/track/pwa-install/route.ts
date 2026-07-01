import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Track PWA installations for multi-tenant shops.
 *
 * POST /api/track/pwa-install
 * Body: { shopSlug: string, platform: 'IOS' | 'ANDROID' | 'DESKTOP', userAgent?: string }
 *
 * Records each PWA install event and increments the shop's install counter.
 * Rate limited to 1 request per hour per IP + shopSlug combination.
 */

// ─── Validation ────────────────────────────────────────────────────────────────

const SHOP_SLUG_REGEX = /^[a-z0-9-]+$/
const VALID_PLATFORMS = ['IOS', 'ANDROID', 'DESKTOP'] as const
type ValidPlatform = (typeof VALID_PLATFORMS)[number]

interface TrackPWAInstallBody {
  shopSlug: string
  platform: string
  userAgent?: string
}

function isValidSlug(slug: string): boolean {
  return SHOP_SLUG_REGEX.test(slug) && slug.length > 0 && slug.length <= 63
}

function isValidPlatform(platform: string): platform is ValidPlatform {
  return (VALID_PLATFORMS as readonly string[]).includes(platform)
}

// ─── Rate Limiter (1 request per hour per IP+slug) ───────────────────────────

interface RateLimitEntry {
  timestamps: number[]
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 1

let lastPrune = Date.now()

/**
 * Check if the request is rate limited.
 * Key is `ip:shopSlug` — max 1 request per hour per IP per shop.
 */
function isRateLimited(ip: string, shopSlug: string): boolean {
  const now = Date.now()
  const key = `${ip}:${shopSlug}`

  const entry = rateLimitMap.get(key)
  if (!entry) {
    rateLimitMap.set(key, { timestamps: [now] })
    return false
  }

  // Filter out expired timestamps
  const validTimestamps = entry.timestamps.filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  )

  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(key, { timestamps: validTimestamps })
    return true
  }

  validTimestamps.push(now)
  rateLimitMap.set(key, { timestamps: validTimestamps })

  // Prune stale entries every 5 minutes
  if (now - lastPrune > 5 * 60 * 1000) {
    for (const [k, v] of rateLimitMap.entries()) {
      const fresh = v.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
      if (!fresh.length) {
        rateLimitMap.delete(k)
      } else {
        rateLimitMap.set(k, { timestamps: fresh })
      }
    }
    lastPrune = now
  }

  return false
}

// ─── Helper: Get Client IP ────────────────────────────────────────────────────

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)

    // Parse and validate request body
    let body: TrackPWAInstallBody
    try {
      body = (await request.json()) as TrackPWAInstallBody
    } catch {
      return NextResponse.json(
        { error: 'Corps de requête invalide' },
        { status: 400 }
      )
    }

    const { shopSlug, platform, userAgent } = body

    // Validate shopSlug
    if (!shopSlug || !isValidSlug(shopSlug)) {
      return NextResponse.json(
        { error: 'Slug de boutique invalide' },
        { status: 400 }
      )
    }

    // Validate platform
    if (!platform || !isValidPlatform(platform)) {
      return NextResponse.json(
        { error: 'Plateforme invalide. Valeurs acceptées: IOS, ANDROID, DESKTOP' },
        { status: 400 }
      )
    }

    // Rate limiting
    if (isRateLimited(ip, shopSlug)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez dans une heure.' },
        { status: 429 }
      )
    }

    // Fetch the shop by slug
    const shop = await db.shop.findUnique({
      where: { slug: shopSlug },
      select: {
        id: true,
        pwaEnabled: true,
        pwaInstallCount: true,
      },
    })

    if (!shop || !shop.pwaEnabled) {
      return NextResponse.json(
        { error: 'Boutique introuvable ou PWA non activé' },
        { status: 404 }
      )
    }

    // Use the provided userAgent or fall back to request header
    const trackedUserAgent = userAgent || request.headers.get('user-agent') || null

    // Create install event and increment counter in a single transaction
    const [, updatedShop] = await db.$transaction([
      // Create the install event record
      db.pWAInstallEvent.create({
        data: {
          shopId: shop.id,
          platform,
          userAgent: trackedUserAgent,
        },
      }),
      // Increment the install count on the shop
      db.shop.update({
        where: { id: shop.id },
        data: { pwaInstallCount: { increment: 1 } },
        select: { pwaInstallCount: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      installCount: updatedShop.pwaInstallCount,
    })
  } catch (error) {
    console.error('[PWA Install Tracking] Error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
