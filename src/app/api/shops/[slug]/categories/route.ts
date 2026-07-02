import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { cacheFetch } from '@/lib/cache'

export const dynamic = 'force-dynamic'

// GET /api/shops/[slug]/categories — public, returns all shop categories
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

    // Verify shop exists
    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // Cache categories for 2 minutes
    const categories = await cacheFetch(`shop-categories:${slug}`, 120, async () => {
      return db.category.findMany({
        where: { shopId: shop.id },
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, image: true },
      })
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Shop categories error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}