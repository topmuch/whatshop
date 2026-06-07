import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const shop = await db.shop.findUnique({ where: { slug, isActive: true } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 })
    }

    await db.visit.create({ data: { shopId: shop.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Visit tracking error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
