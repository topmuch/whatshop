import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// GET /api/shops/[slug]/public-shipping-zones
// Public endpoint — no authentication required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limiting
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.default)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const { slug } = await params

    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    })

    if (!shop) {
      return NextResponse.json({ zones: [] }, { status: 200 })
    }

    const zones = await db.shippingZone.findMany({
      where: { shopId: shop.id },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        sortOrder: true,
      },
    })

    return NextResponse.json({ zones })
  } catch (error) {
    console.error('Public shipping zones GET error:', error)
    return NextResponse.json({ zones: [] }, { status: 200 })
  }
}