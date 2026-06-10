import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getConsolidatedStats, getOrCreateSubscription, PLAN_CONFIGS } from '@/lib/permissions'

// GET /api/shops/my-stats — Consolidated stats across all user shops
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const [stats, subscription] = await Promise.all([
      getConsolidatedStats(user.id),
      getOrCreateSubscription(user.id),
    ])

    const planConfig = PLAN_CONFIGS[subscription.planType]

    return NextResponse.json({
      ...stats,
      subscription: {
        planType: subscription.planType,
        planLabel: planConfig.label,
        status: subscription.status,
        maxShops: subscription.maxShops,
        canCreateShop: stats.shopCount < subscription.maxShops && (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL'),
      },
    })
  } catch (error) {
    console.error('My stats GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}