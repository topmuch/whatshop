/**
 * GET /api/social/posts?shopId=xxx — List social posts for a shop
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, response: authError } = await requireAuth(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 })
    }

    // Verify shop ownership
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: { id: true, ownerId: true },
    })
    if (!shop || shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const posts = await db.socialPost.findMany({
      where: { shopId },
      include: {
        product: { select: { id: true, name: true, image: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Social posts list error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}