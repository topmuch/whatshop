import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    const orders = await db.order.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search ? {
          OR: [
            { id: { contains: search } },
            { customerName: { contains: search } },
            { shop: { name: { contains: search } } },
          ],
        } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        shop: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id,
        total: o.total,
        status: o.status,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerAddress: o.customerAddress,
        items: o.items,
        createdAt: o.createdAt.toISOString(),
        shop: { id: o.shop.id, name: o.shop.name },
      })),
    })
  } catch (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/admin/orders — Admin updates order status
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID et statut requis' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
      include: { shop: { select: { id: true, name: true } } },
    })

    return NextResponse.json({
      id: order.id,
      total: order.total,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      items: order.items,
      createdAt: order.createdAt.toISOString(),
      shop: { id: order.shop.id, name: order.shop.name },
    })
  } catch (error) {
    console.error('Admin orders PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
