/**
 * POST /api/social/recap — Daily email recap (called by external cron at 20h)
 *
 * Security: Requires CRON_SECRET header to prevent unauthorized calls.
 * Call example: curl -X POST -H "X-Cron-Secret: YOUR_SECRET" https://boutiko.pro/api/social/recap
 *
 * For each active shop with seller who has notificationPreferences.weeklyReport enabled,
 * sends a daily recap email with: orders, revenue, views, WhatsApp clicks, social posts,
 * top products, and low stock alerts.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail, isEmailConfigured } from '@/lib/email'
import { dailyRecapEmail } from '@/lib/email-templates'
import { logger } from '@/lib/logger'

const CRON_SECRET = process.env.CRON_SECRET || 'boutiko-cron-2024'

function getCronSecret(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  return request.headers.get('x-cron-secret') || (authHeader ? authHeader.replace('Bearer ', '') : null)
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const secret = getCronSecret(request)
    if (!secret || secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await isEmailConfigured())) {
      return NextResponse.json({ error: 'SMTP not configured', sent: 0 })
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://boutiko.pro'
    const dateStr = todayStart.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    // Get all active shops with their owners
    const shops = await db.shop.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
        notificationPreferences: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    })

    let sentCount = 0
    let skippedCount = 0
    const errors: string[] = []

    for (const shop of shops) {
      try {
        // Check if seller wants daily recap (weeklyReport toggle = daily recap for now)
        let wantsRecap = true
        if (shop.notificationPreferences) {
          const prefs = typeof shop.notificationPreferences === 'string'
            ? JSON.parse(shop.notificationPreferences) : shop.notificationPreferences
          wantsRecap = prefs.notifyWeeklyReport !== false
        }
        if (!wantsRecap) {
          skippedCount++
          continue
        }

        // Gather today's stats
        const [orders, todayAnalytics, socialPosts, topProducts, lowStockProducts] = await Promise.all([
          // Today's orders
          db.order.findMany({
            where: { shopId: shop.id, createdAt: { gte: todayStart, lte: todayEnd } },
            select: { total: true, items: true },
          }),
          // Today's analytics events
          db.analyticsEvent.findMany({
            where: { shopId: shop.id, createdAt: { gte: todayStart, lte: todayEnd } },
            select: { eventType: true },
          }),
          // Today's social posts
          db.socialPost.count({
            where: { shopId: shop.id, createdAt: { gte: todayStart, lte: todayEnd } },
          }),
          // Top 5 products by views
          db.product.findMany({
            where: { shopId: shop.id, isAvailable: true },
            select: { name: true, views: true },
            orderBy: { views: 'desc' },
            take: 5,
          }),
          // Low stock products
          db.product.findMany({
            where: {
              shopId: shop.id,
              isAvailable: true,
              stock: { not: null, lte: 5 },
            },
            select: { name: true, stock: true },
            orderBy: { stock: 'asc' },
            take: 10,
          }),
        ])

        // Calculate totals
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
        const newViews = todayAnalytics.filter(e => e.eventType === 'page_view' || e.eventType === 'product_view').length
        const totalWhatsappClicks = todayAnalytics.filter(e => e.eventType === 'whatsapp_click').length

        // Count orders per product for top products
        const orderItems = orders.flatMap(o => {
          try {
            const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items
            return Array.isArray(items) ? items : []
          } catch { return [] }
        })

        const topProductsWithOrders = topProducts.map(p => {
          const productOrders = orderItems.filter(
            (item: { name?: string }) => item.name === p.name
          ).length
          return { name: p.name, views: p.views, orders: productOrders }
        })

        const html = dailyRecapEmail({
          shopName: shop.name,
          shopOwnerName: shop.owner.name,
          date: dateStr,
          newOrders: orders.length,
          totalRevenue,
          newViews,
          whatsappClicks: totalWhatsappClicks,
          socialPosts,
          topProducts: topProductsWithOrders,
          lowStockProducts: lowStockProducts.map(p => ({ name: p.name, stock: p.stock! })),
          dashboardUrl: `${baseUrl}/dashboard`,
        })

        const sent = await sendEmail({
          to: shop.owner.email,
          subject: `Récap du jour — ${shop.name} (${orders.length} commandes)`,
          html,
        })

        if (sent) sentCount++
        else errors.push(`Email failed for shop ${shop.name}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`${shop.name}: ${msg}`)
        logger.error(`Daily recap error for shop ${shop.name}: ${msg}`, 'DailyRecap')
      }
    }

    return NextResponse.json({
      success: true,
      totalShops: shops.length,
      sent: sentCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    logger.error(`Daily recap error: ${error instanceof Error ? error.message : error}`, 'DailyRecap')
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}