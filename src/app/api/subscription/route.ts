import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getOrCreateSubscription, upgradeSubscription, PLAN_CONFIGS, PlanType } from '@/lib/permissions'
import { db } from '@/lib/db'

const PLAN_ORDER: PlanType[] = ['STARTER', 'PRO', 'BUSINESS']

// GET /api/subscription — Get current user subscription info + pending request
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const subscription = await getOrCreateSubscription(user.id)
    const shopCount = await db.shop.count({ where: { ownerId: user.id } })

    const planConfig = PLAN_CONFIGS[subscription.planType]

    // Check for pending upgrade request
    const pendingRequest = await db.upgradeRequest.findFirst({
      where: { userId: user.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      ...subscription,
      currentShopCount: shopCount,
      pendingUpgrade: pendingRequest
        ? {
            id: pendingRequest.id,
            requestedPlan: pendingRequest.requestedPlan,
            requestedLabel: PLAN_CONFIGS[pendingRequest.requestedPlan]?.label || pendingRequest.requestedPlan,
            requestedPrice: PLAN_CONFIGS[pendingRequest.requestedPlan]?.price || 0,
            createdAt: pendingRequest.createdAt,
          }
        : null,
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

// PUT /api/subscription — Request plan upgrade (creates pending request for admin)
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

    // Check upgrade direction
    const currentSub = await getOrCreateSubscription(user.id)
    const currentIndex = PLAN_ORDER.indexOf(currentSub.planType)
    const newIndex = PLAN_ORDER.indexOf(planType)

    if (newIndex <= currentIndex) {
      return NextResponse.json({
        error: newIndex < currentIndex
          ? 'Impossible de rétrograder. Contactez le support.'
          : 'Vous êtes déjà sur ce plan.',
      }, { status: 400 })
    }

    // Check if there's already a pending request
    const existingPending = await db.upgradeRequest.findFirst({
      where: { userId: user.id, status: 'PENDING' },
    })
    if (existingPending) {
      return NextResponse.json({
        error: 'Vous avez déjà une demande en attente de validation.',
      }, { status: 409 })
    }

    // Create the upgrade request (pending admin validation)
    const upgradeReq = await db.upgradeRequest.create({
      data: {
        userId: user.id,
        requestedPlan: planType,
      },
    })

    return NextResponse.json({
      message: 'Demande de mise à niveau envoyée. Un administrateur va valider votre demande.',
      request: {
        id: upgradeReq.id,
        requestedPlan: upgradeReq.requestedPlan,
        status: upgradeReq.status,
        createdAt: upgradeReq.createdAt,
      },
    })
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