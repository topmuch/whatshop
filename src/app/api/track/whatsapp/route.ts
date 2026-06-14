import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * Track WhatsApp clicks from any source (website, Facebook, Instagram).
 * POST /api/track/whatsapp
 *
 * Designed to respond in < 100ms. All writes are fire-and-forget.
 * Rate limited to 100 req/min per IP.
 */

interface TrackBody {
  shopId: string
  productId?: string
  productName?: string
  source?: 'facebook' | 'instagram' | 'website'
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

const rlMap = new Map<string, number[]>()
let lastPrune = Date.now()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entries = (rlMap.get(ip) || []).filter((t) => now - t < 60_000)
  if (entries.length >= 100) { rlMap.set(ip, entries); return true }
  entries.push(now)
  rlMap.set(ip, entries)
  // Prune every 5 min
  if (now - lastPrune > 300_000) {
    for (const [k, v] of rlMap.entries()) {
      const valid = v.filter((t) => now - t < 60_000)
      if (!valid.length) rlMap.delete(k); else rlMap.set(k, valid)
    }
    lastPrune = now
  }
  return false
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(ip)) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })

    const { user, response } = await requireAuth(request)
    if (!user) return response

    const body = (await request.json()) as Partial<TrackBody>
    const shopId = user.shop?.id
    if (!shopId) return NextResponse.json({ error: 'Boutique requise' }, { status: 400 })

    const { productId, source } = body

    // Fire all DB writes in a single transaction — fast, atomic
    const ops: any[] = [
      db.shop.update({ where: { id: shopId }, data: { whatsappClicks: { increment: 1 } } }),
      db.analyticsEvent.create({
        data: {
          shopId,
          eventType: 'whatsapp_click',
          metadata: JSON.stringify({ productId, source: source || 'website', productName: body.productName }),
          userAgent: request.headers.get('user-agent') || null,
          ipAddress: ip === 'unknown' ? null : ip,
        },
      }),
    ]

    if (productId) {
      ops.push(db.product.updateMany({ where: { id: productId }, data: { whatsappClicks: { increment: 1 } } }))
    }

    // Execute without awaiting the client
    db.$transaction(ops).catch((err) => console.error('[Track WhatsApp] DB error:', err))

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}