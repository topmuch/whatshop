import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const flaggedShops = await db.shop.findMany({
      where: { isFlagged: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { products: true, orders: true } },
      },
    })

    return NextResponse.json({
      shops: flaggedShops.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        isFlagged: s.isFlagged,
        flaggedReason: s.flaggedReason,
        isActive: s.isActive,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        owner: { id: s.owner.id, name: s.owner.name, email: s.owner.email },
        productCount: s._count.products,
        orderCount: s._count.orders,
      })),
    })
  } catch (error) {
    console.error('Admin moderation error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const body = await request.json()
    const { shopId, action, reason } = body

    if (!shopId || !action) {
      return NextResponse.json({ error: 'shopId et action requis' }, { status: 400 })
    }

    if (!['flag', 'unflag'].includes(action)) {
      return NextResponse.json({ error: 'Action invalide. Valeurs acceptées: flag, unflag' }, { status: 400 })
    }

    if (action === 'flag' && !reason) {
      return NextResponse.json({ error: 'Une raison est requise pour signaler une boutique' }, { status: 400 })
    }

    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const updated = await db.shop.update({
      where: { id: shopId },
      data: {
        isFlagged: action === 'flag',
        flaggedReason: action === 'flag' ? reason : null,
      },
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      isFlagged: updated.isFlagged,
      flaggedReason: updated.flaggedReason,
    })
  } catch (error) {
    console.error('Admin moderation update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
