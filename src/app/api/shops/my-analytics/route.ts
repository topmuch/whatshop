import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/shops/my-analytics — Analytics data for the seller dashboard
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Get all shop IDs for this user
    const shops = await db.shop.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    })
    const shopIds = shops.map(s => s.id)

    if (shopIds.length === 0) {
      return NextResponse.json({
        ordersByDay: [],
        totalOrders: 0,
        totalRevenue: 0,
        totalVisits: 0,
        topProducts: [],
        recentGrowth: 0,
      })
    }

    // ─── Orders by day (last 14 days) ───
    const now = new Date()
    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)
    fourteenDaysAgo.setHours(0, 0, 0, 0)

    const recentOrders = await db.order.findMany({
      where: {
        shopId: { in: shopIds },
        createdAt: { gte: fourteenDaysAgo },
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group by date
    const ordersByDayMap = new Map<string, { date: string; count: number; revenue: number }>()
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      ordersByDayMap.set(dateStr, { date: dateStr, count: 0, revenue: 0 })
    }

    for (const order of recentOrders) {
      const dateStr = order.createdAt.toISOString().split('T')[0]
      const entry = ordersByDayMap.get(dateStr)
      if (entry) {
        entry.count++
        entry.revenue += order.total
      }
    }

    const ordersByDay = Array.from(ordersByDayMap.values())

    // ─── Total orders & revenue (all time) ───
    const allOrders = await db.order.findMany({
      where: { shopId: { in: shopIds } },
      select: { id: true, total: true, items: true },
    })

    const totalOrders = allOrders.length
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0)

    // ─── Total visits ───
    const totalVisits = await db.visit.count({
      where: { shopId: { in: shopIds } },
    })

    // ─── Top 5 products by orders ───
    const productOrderMap = new Map<string, { name: string; orders: number; revenue: number }>()

    for (const order of allOrders) {
      let items: Array<{ name: string; price: number; quantity: number }> = []
      try {
        items = JSON.parse(order.items)
      } catch {
        continue
      }
      for (const item of items) {
        const existing = productOrderMap.get(item.name)
        if (existing) {
          existing.orders += item.quantity
          existing.revenue += item.price * item.quantity
        } else {
          productOrderMap.set(item.name, {
            name: item.name,
            orders: item.quantity,
            revenue: item.price * item.quantity,
          })
        }
      }
    }

    const topProducts = Array.from(productOrderMap.values())
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)

    // ─── Recent growth: last 7 days vs previous 7 days ───
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const fourteenDaysAgoForGrowth = new Date(now)
    fourteenDaysAgoForGrowth.setDate(fourteenDaysAgoForGrowth.getDate() - 7)
    fourteenDaysAgoForGrowth.setHours(0, 0, 0, 0)

    const [lastWeekOrders, prevWeekOrders] = await Promise.all([
      db.order.count({
        where: {
          shopId: { in: shopIds },
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      db.order.count({
        where: {
          shopId: { in: shopIds },
          createdAt: { gte: fourteenDaysAgoForGrowth, lt: sevenDaysAgo },
        },
      }),
    ])

    let recentGrowth = 0
    if (prevWeekOrders > 0) {
      recentGrowth = Math.round(((lastWeekOrders - prevWeekOrders) / prevWeekOrders) * 1000) / 10
    } else if (lastWeekOrders > 0) {
      recentGrowth = 100
    }

    return NextResponse.json({
      ordersByDay,
      totalOrders,
      totalRevenue,
      totalVisits,
      topProducts,
      recentGrowth,
    })
  } catch (error) {
    console.error('My analytics GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}