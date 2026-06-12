import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shops/[slug]/public-shipping-zones
// Public endpoint — no authentication required
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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