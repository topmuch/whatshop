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
            { id: { contains: search, mode: 'insensitive' } },
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
