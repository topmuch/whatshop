import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const [
      totalUsers,
      totalShops,
      totalProducts,
      totalOrders,
      totalVisits,
      shopsByPlanData,
      ordersByStatusData,
      recentUsers,
      recentOrders,
    ] = await Promise.all([
      db.user.count({ where: { role: 'SELLER' } }),
      db.shop.count(),
      db.product.count(),
      db.order.count(),
      db.visit.count(),
      db.shop.groupBy({ by: ['plan'], _count: true }),
      db.order.groupBy({ by: ['status'], _count: true }),
      db.user.findMany({
        where: { role: 'SELLER' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { shop: { select: { name: true, plan: true } } },
      }),
      db.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          shop: { select: { name: true } },
        },
      }),
    ])

    // Calculate total revenue
    const revenueAgg = await db.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { total: true },
    })

    // Build shops by plan map
    const shopsByPlan: Record<string, number> = {}
    for (const item of shopsByPlanData) {
      shopsByPlan[item.plan] = item._count
    }
    shopsByPlan.FREE = shopsByPlan.FREE || 0
    shopsByPlan.STANDARD = shopsByPlan.STANDARD || 0
    shopsByPlan.PREMIUM = shopsByPlan.PREMIUM || 0

    // Build orders by status map
    const ordersByStatus: Record<string, number> = {}
    for (const item of ordersByStatusData) {
      ordersByStatus[item.status] = item._count
    }
    ordersByStatus.PENDING = ordersByStatus.PENDING || 0
    ordersByStatus.CONFIRMED = ordersByStatus.CONFIRMED || 0
    ordersByStatus.DELIVERED = ordersByStatus.DELIVERED || 0
    ordersByStatus.CANCELLED = ordersByStatus.CANCELLED || 0

    return NextResponse.json({
      totalUsers,
      totalShops,
      totalProducts,
      totalOrders,
      totalRevenue: revenueAgg._sum.total || 0,
      totalVisits,
      shopsByPlan,
      ordersByStatus,
      recentUsers: recentUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        shop: u.shop ? { name: u.shop.name, plan: u.shop.plan } : null,
        createdAt: u.createdAt.toISOString(),
      })),
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        shopName: o.shop.name,
        customerName: o.customerName,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
