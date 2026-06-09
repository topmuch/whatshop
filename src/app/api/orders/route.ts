import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

// GET /api/orders?shopId=xxx&status=xxx (auth required)
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { shopId: user.shop.id }
    if (status && status !== 'ALL') where.status = status

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/orders (update status) (auth required)
export async function PUT(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    // Verify the order belongs to this shop
    const existingOrder = await db.order.findFirst({
      where: { id, shopId: user.shop.id },
    })
    if (!existingOrder) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Orders PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
