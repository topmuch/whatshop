import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

type TrackEventType = 'whatsapp_click' | 'form_submit' | 'page_view' | 'product_view'

interface TrackMetadata {
  productId?: string
  path?: string
  productName?: string
}

interface TrackBody {
  shopId: string
  eventType: TrackEventType
  metadata?: TrackMetadata
}

const VALID_EVENT_TYPES: readonly TrackEventType[] = [
  'whatsapp_click',
  'form_submit',
  'page_view',
  'product_view',
] as const

// ─── RATE LIMITER ─────────────────────────────────────────────────────────────

const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60_000
  const maxRequests = 100
  const entries = rateLimitMap.get(ip) || []
  const valid = entries.filter(t => now - t < windowMs)
  if (valid.length >= maxRequests) {
    rateLimitMap.set(ip, valid)
    return true
  }
  valid.push(now)
  rateLimitMap.set(ip, valid)
  return false
}

// Prune the rate limit map every 5 minutes to prevent memory leaks
let lastPrune = Date.now()
function maybePruneRateLimitMap(): void {
  const now = Date.now()
  if (now - lastPrune > 300_000) {
    const windowMs = 60_000
    for (const [ip, entries] of rateLimitMap.entries()) {
      const valid = entries.filter(t => now - t < windowMs)
      if (valid.length === 0) {
        rateLimitMap.delete(ip)
      } else {
        rateLimitMap.set(ip, valid)
      }
    }
    lastPrune = now
  }
}

// ─── INPUT VALIDATION ──────────────────────────────────────────────────────────

function isValidBody(body: unknown): body is TrackBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (typeof b.shopId !== 'string' || b.shopId.trim().length === 0) return false
  if (typeof b.eventType !== 'string' || !VALID_EVENT_TYPES.includes(b.eventType as TrackEventType)) return false
  if (b.metadata !== undefined) {
    if (b.metadata === null || typeof b.metadata !== 'object' || Array.isArray(b.metadata)) return false
    const meta = b.metadata as Record<string, unknown>
    const allowedKeys = ['productId', 'path', 'productName']
    for (const key of Object.keys(meta)) {
      if (!allowedKeys.includes(key)) return false
      if (typeof meta[key] !== 'string') return false
    }
  }
  return true
}

// ─── POST HANDLER ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    maybePruneRateLimitMap()
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 })
    }

    // Parse & validate body
    const body: unknown = await request.json()
    if (!isValidBody(body)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const shopId = body.shopId.trim() as string
    const eventType = body.eventType as TrackEventType
    const metadata = body.metadata
    const userAgent = request.headers.get('user-agent') || null

    // Build transaction operations
    const operations: any[] = [
      // Always create the analytics event
      db.analyticsEvent.create({
        data: {
          shopId,
          eventType,
          metadata: metadata ? JSON.stringify(metadata) : null,
          userAgent,
          ipAddress: ip === 'unknown' ? null : ip,
          createdAt: new Date(),
        },
      }),
    ]

    // Increment the shop counter based on event type
    let shopUpdateData: Record<string, { increment: number }> = {}
    let productId: string | undefined

    switch (eventType) {
      case 'whatsapp_click':
        shopUpdateData = { whatsappClicks: { increment: 1 } }
        productId = metadata?.productId
        break
      case 'form_submit':
        shopUpdateData = { contactFormSubmits: { increment: 1 } }
        break
      case 'page_view':
        shopUpdateData = { pageViews: { increment: 1 } }
        break
      case 'product_view':
        productId = metadata?.productId
        break
    }

    if (Object.keys(shopUpdateData).length > 0) {
      operations.push(
        db.shop.update({
          where: { id: shopId },
          data: shopUpdateData,
        })
      )
    }

    // If there's a productId to increment, use updateMany (safe if product doesn't exist)
    if (productId) {
      if (eventType === 'whatsapp_click') {
        operations.push(
          db.product.updateMany({
            where: { id: productId },
            data: { whatsappClicks: { increment: 1 } },
          })
        )
      } else if (eventType === 'product_view') {
        operations.push(
          db.product.updateMany({
            where: { id: productId },
            data: { views: { increment: 1 } },
          })
        )
      }
    }

    // Execute all operations in a transaction
    await db.$transaction(operations)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Erreur tracking:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}