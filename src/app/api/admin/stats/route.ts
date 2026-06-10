import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'
import { PlanType } from '@prisma/client'

// SaaS pricing (FCFA) — matches SaaSConfig defaults
const PLAN_PRICES: Record<PlanType, number> = {
  STARTER: 5000,
  PRO: 8000,
  BUSINESS: 20000,
}

/**
 * GET /api/admin/stats
 * Returns comprehensive admin dashboard stats including:
 * - Platform overview (users, shops, products, orders, revenue, visits)
 * - Subscription metrics (MRR, counts by status, growth, revenue by plan)
 * - Moderation (flagged shops, suspended users)
 * - Reseller stats (total, active)
 * - Domain management (pending requests)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    // ── Parallel queries: core platform stats ──────────────────────────────────
    const [
      totalUsers,
      totalShops,
      totalProducts,
      totalOrders,
      totalVisits,
      ordersByStatusData,
      recentUsers,
      recentOrders,
      // Subscription counts by status
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
      // Active subscriptions with planType (for MRR & revenueByPlan)
      activeSubsWithPlan,
      // Moderation
      suspendedUsers,
      flaggedShops,
      // Reseller stats
      totalResellers,
      activeResellers,
      // Domain management
      pendingDomains,
    ] = await Promise.all([
      // Core platform stats
      db.user.count({ where: { role: 'SELLER' } }),
      db.shop.count(),
      db.product.count(),
      db.order.count(),
      db.visit.count(),
      db.order.groupBy({ by: ['status'], _count: true }),
      db.user.findMany({
        where: { role: 'SELLER' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          shops: { select: { name: true, plan: true } },
          subscription: { select: { planType: true, status: true } },
        },
      }),
      db.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          shop: { select: { name: true } },
        },
      }),
      // Subscription counts by status
      db.subscription.count({ where: { status: 'ACTIVE' } }),
      db.subscription.count({ where: { status: 'TRIAL' } }),
      db.subscription.count({ where: { status: 'EXPIRED' } }),
      // All active subscriptions with planType for MRR calculation
      db.subscription.findMany({
        where: { status: 'ACTIVE' },
        select: { planType: true },
      }),
      // Moderation
      db.user.count({ where: { isSuspended: true } }),
      db.shop.count({ where: { isFlagged: true } }),
      // Reseller stats
      db.user.count({ where: { role: 'RESELLER' } }),
      db.reseller.count({ where: { isActive: true } }),
      // Domain management
      db.domainRequest.count({ where: { status: 'PENDING' } }),
    ])

    // ── Total revenue (non-cancelled orders) ──────────────────────────────────
    const revenueAgg = await db.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { total: true },
    })

    // ── shopsByPlan based on Subscription.planType ─────────────────────────────
    // Each user has one subscription; we count shops per subscription planType
    const shopOwners = await db.user.findMany({
      where: {
        role: 'SELLER',
        subscription: { isNot: null },
      },
      select: {
        id: true,
        subscription: { select: { planType: true } },
        _count: { select: { shops: true } },
      },
    })

    const shopsByPlan: Record<string, number> = {
      STARTER: 0,
      PRO: 0,
      BUSINESS: 0,
    }
    for (const owner of shopOwners) {
      const planType = owner.subscription?.planType ?? 'STARTER'
      shopsByPlan[planType] = (shopsByPlan[planType] ?? 0) + owner._count.shops
    }

    // Also count shops whose owners have NO subscription (legacy FREE)
    const sellersWithoutSub = await db.user.count({
      where: {
        role: 'SELLER',
        subscription: null,
      },
    })
    const legacyFreeShops = await db.shop.count({
      where: {
        owner: { role: 'SELLER', subscription: null },
      },
    })
    if (legacyFreeShops > 0) {
      shopsByPlan['FREE'] = legacyFreeShops
    }

    // ── ordersByStatus map ─────────────────────────────────────────────────────
    const ordersByStatus: Record<string, number> = {}
    for (const item of ordersByStatusData) {
      ordersByStatus[item.status] = item._count
    }
    ordersByStatus.PENDING = ordersByStatus.PENDING || 0
    ordersByStatus.CONFIRMED = ordersByStatus.CONFIRMED || 0
    ordersByStatus.DELIVERED = ordersByStatus.DELIVERED || 0
    ordersByStatus.CANCELLED = ordersByStatus.CANCELLED || 0

    // ── MRR: sum of all ACTIVE subscription prices ─────────────────────────────
    let mrr = 0
    const revenueByPlan: Record<string, number> = {
      STARTER: 0,
      PRO: 0,
      BUSINESS: 0,
    }
    for (const sub of activeSubsWithPlan) {
      const price = PLAN_PRICES[sub.planType] ?? 0
      mrr += price
      revenueByPlan[sub.planType] = (revenueByPlan[sub.planType] ?? 0) + price
    }

    // ── subscriptionGrowth: last 6 months ─────────────────────────────────────
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // Query all subscriptions created in the last 6 months
    const recentSubscriptions = await db.subscription.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Build month-by-month counts using French locale
    const monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
    ]

    const subscriptionGrowth: Array<{ month: string; newSubscriptions: number }> = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()
      const label = `${monthNames[month]} ${year}`

      const count = recentSubscriptions.filter((sub) => {
        const d = new Date(sub.createdAt)
        return d.getFullYear() === year && d.getMonth() === month
      }).length

      subscriptionGrowth.push({ month: label, newSubscriptions: count })
    }

    // ── Churn rate: expired subscriptions / total subscriptions ever created ───
    const totalSubscriptionsEver = await db.subscription.count()
    const churnRate =
      totalSubscriptionsEver > 0
        ? Math.round(((expiredSubscriptions / totalSubscriptionsEver) * 100) * 100) / 100
        : 0

    return NextResponse.json({
      // Core platform stats (existing)
      totalUsers,
      totalShops,
      totalProducts,
      totalOrders,
      totalRevenue: revenueAgg._sum.total || 0,
      totalVisits,
      shopsByPlan,
      ordersByStatus,
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        plan: u.subscription?.planType ?? null,
        shop: u.shops?.[0] ? { name: u.shops[0].name, plan: u.shops[0].plan } : null,
        createdAt: u.createdAt.toISOString(),
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        shopName: o.shop.name,
        customerName: o.customerName,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),

      // Subscription & revenue metrics (new)
      mrr,
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
      churnRate,
      subscriptionGrowth,
      revenueByPlan,

      // Moderation (new)
      suspendedUsers,
      flaggedShops,

      // Reseller stats (new)
      totalResellers,
      activeResellers,

      // Domain management (new)
      pendingDomains,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
