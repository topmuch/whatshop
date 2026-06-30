import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shops/pwa-install-stats?shopId=xxx
// Returns PWA install statistics for a shop

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 })
    }

    // Fetch total count from shop
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: { pwaInstallCount: true, pwaEnabled: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // Fetch platform breakdown
    const events = await db.pWAInstallEvent.groupBy({
      by: ['platform'],
      where: { shopId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    })

    // Fetch last 7 days daily counts
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentEvents = await db.pWAInstallEvent.findMany({
      where: {
        shopId,
        installedAt: { gte: sevenDaysAgo },
      },
      select: { installedAt: true, platform: true },
      orderBy: { installedAt: 'asc' },
    })

    // Build daily breakdown
    const dailyCounts: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dailyCounts[key] = 0
    }
    for (const ev of recentEvents) {
      const key = ev.installedAt.toISOString().split('T')[0]
      if (key in dailyCounts) {
        dailyCounts[key]++
      }
    }

    const total = shop.pwaInstallCount || 0

    return NextResponse.json({
      total,
      enabled: shop.pwaEnabled,
      platforms: events.map((e) => ({
        platform: e.platform,
        count: e._count.id,
        percent: total > 0 ? Math.round((e._count.id / total) * 100) : 0,
      })),
      daily: dailyCounts,
    })
  } catch (error) {
    console.error('PWA install stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des statistiques' },
      { status: 500 },
    )
  }
}