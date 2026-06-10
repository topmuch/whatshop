import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getOrCreateSubscription, upgradeSubscription, PLAN_CONFIGS, PlanType } from '@/lib/permissions'
import { db } from '@/lib/db'

const PLAN_ORDER: PlanType[] = ['STARTER', 'PRO', 'BUSINESS']

// GET /api/subscription — Get current user subscription info
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const subscription = await getOrCreateSubscription(user.id)
    const shopCount = await db.shop.count({ where: { ownerId: user.id } })

    const planConfig = PLAN_CONFIGS[subscription.planType]

    return NextResponse.json({
      ...subscription,
      currentShopCount: shopCount,
      planConfig: {
        label: planConfig.label,
        price: planConfig.price,
        maxShops: planConfig.maxShops,
        customDomain: planConfig.customDomain,
        features: planConfig.features,
      },
      allPlans: Object.values(PLAN_CONFIGS).map(p => ({
        type: p.type,
        label: p.label,
        price: p.price,
        maxShops: p.maxShops,
        customDomain: p.customDomain,
        features: p.features,
      })),
    })
  } catch (error) {
    console.error('Subscription GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/subscription — Self-service upgrade plan (any authenticated user)
export async function PUT(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = await request.json()
    const { planType } = body as { planType: PlanType }

    if (!planType || !Object.keys(PLAN_CONFIGS).includes(planType)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Check upgrade direction: user can only upgrade (or stay same), not downgrade
    const currentSub = await getOrCreateSubscription(user.id)
    const currentIndex = PLAN_ORDER.indexOf(currentSub.planType)
    const newIndex = PLAN_ORDER.indexOf(planType)

    if (newIndex < currentIndex) {
      return NextResponse.json({
        error: 'Impossible de rétrograder. Contactez le support pour changer vers un plan inférieur.',
      }, { status: 400 })
    }

    // Set end date to 30 days from now
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    const subscription = await upgradeSubscription(user.id, planType, endDate)

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Subscription PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/subscription — Upgrade plan (admin/reseller only in practice)
export async function PATCH(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Only SUPER_ADMIN or ADMIN can upgrade plans directly
    // RESELLER uses /api/reseller/clients PATCH for their clients
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, planType, endDate } = body as {
      userId: string
      planType: PlanType
      endDate?: string
    }

    if (!userId || !planType) {
      return NextResponse.json({ error: 'userId et planType requis' }, { status: 400 })
    }

    if (!Object.keys(PLAN_CONFIGS).includes(planType)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const parsedEndDate = endDate ? new Date(endDate) : undefined
    const subscription = await upgradeSubscription(userId, planType, parsedEndDate)

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Subscription PATCH error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}