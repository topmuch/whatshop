import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { buildCAIPayload, sendFacebookEvent, decryptToken, hashData } from '@/lib/facebook-capi'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

type FacebookEventName = 'PageView' | 'ViewContent' | 'Contact' | 'Lead'

interface FacebookTrackBody {
  shopId: string
  eventName: string
  eventData?: {
    productId?: string
    productName?: string
    price?: number
    currency?: string
    contentName?: string
    contentCategory?: string
  }
  eventId: string
}

const VALID_EVENT_NAMES: readonly string[] = ['PageView', 'ViewContent', 'Contact', 'Lead'] as const

// ─── RATE LIMITER ─────────────────────────────────────────────────────────────

const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60_000
  const maxRequests = 100
  const entries = rateLimitMap.get(ip) || []
  const valid = entries.filter((t) => now - t < windowMs)
  if (valid.length >= maxRequests) {
    rateLimitMap.set(ip, valid)
    return true
  }
  valid.push(now)
  rateLimitMap.set(ip, valid)
  return false
}

// Prune every 5 minutes
let lastPrune = Date.now()
function maybePrune(): void {
  const now = Date.now()
  if (now - lastPrune > 300_000) {
    const windowMs = 60_000
    for (const [ip, entries] of rateLimitMap.entries()) {
      const valid = entries.filter((t) => now - t < windowMs)
      if (valid.length === 0) rateLimitMap.delete(ip)
      else rateLimitMap.set(ip, valid)
    }
    lastPrune = now
  }
}

// ─── INPUT VALIDATION ──────────────────────────────────────────────────────────

function isValidBody(body: unknown): body is FacebookTrackBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (typeof b.shopId !== 'string' || b.shopId.trim().length === 0) return false
  if (typeof b.eventName !== 'string' || !VALID_EVENT_NAMES.includes(b.eventName)) return false
  if (typeof b.eventId !== 'string' || b.eventId.trim().length === 0) return false
  return true
}

// ─── POST HANDLER ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    maybePrune()
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
    }

    // Parse & validate
    const body: unknown = await request.json()
    if (!isValidBody(body)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const { shopId, eventName, eventData = {}, eventId } = body

    // Fetch shop with Facebook config
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: {
        facebookPixelId: true,
        facebookAccessToken: true,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // Determine source: CAPI only (pixel already fired client-side)
    let source: 'PIXEL' | 'CAPI' | 'BOTH' = 'CAPI'

    // Check for deduplication — if event already exists, skip CAPI
    const existing = await db.facebookEvent.findUnique({
      where: { eventId },
    })

    if (existing) {
      // Event was already recorded (dedup) — just return success
      return NextResponse.json({ success: true, deduplicated: true })
    }

    // Send to Facebook CAPI if token is configured
    let fbSuccess = false
    if (shop.facebookPixelId && shop.facebookAccessToken) {
      try {
        const accessToken = decryptToken(shop.facebookAccessToken)
        const userAgent = request.headers.get('user-agent') || undefined
        const fbp = request.headers.get('x-fbp') || undefined
        const fbc = request.headers.get('x-fbc') || undefined

        const payload = buildCAIPayload(
          shop.facebookPixelId,
          accessToken,
          eventName,
          eventData,
          { ip: ip === 'unknown' ? undefined : ip, userAgent, fbp, fbc },
          eventId,
        )

        fbSuccess = await sendFacebookEvent(shop.facebookPixelId, payload)
        source = fbSuccess ? 'CAPI' : 'PIXEL'
      } catch (error) {
        console.error('[FB CAPI] Error sending event:', error)
        source = 'PIXEL' // Fallback: pixel already fired client-side
      }
    } else {
      source = 'PIXEL' // No CAPI token, pixel-only
    }

    // Save event to DB
    await db.facebookEvent.create({
      data: {
        shopId,
        eventName,
        eventData: JSON.stringify(eventData),
        eventId,
        source,
      },
    })

    return NextResponse.json({ success: true, fbSuccess, source })
  } catch (error) {
    console.error('[FB CAPI] Error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}