import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/shops/[slug]/categories — public, returns all shop categories
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const categories = await db.category.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Shop categories error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}