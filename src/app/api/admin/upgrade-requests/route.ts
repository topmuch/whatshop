import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { upgradeSubscription, PLAN_CONFIGS } from '@/lib/permissions'
import { db } from '@/lib/db'
import { hasMinimumRole } from '@/lib/permissions'

// GET /api/admin/upgrade-requests — List all upgrade requests
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user || !hasMinimumRole(user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const where = status ? { status } : {}

    const requests = await db.upgradeRequest.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        reviewer: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Enrich with current plan info
    const enriched = await Promise.all(
      requests.map(async (req) => {
        const sub = await db.subscription.findUnique({ where: { userId: req.userId } })
        const shopCount = await db.shop.count({ where: { ownerId: req.userId } })
        return {
          ...req,
          currentPlan: sub?.planType || 'STARTER',
          currentPlanLabel: sub ? PLAN_CONFIGS[sub.planType]?.label || sub.planType : 'Starter',
          requestedPlanLabel: PLAN_CONFIGS[req.requestedPlan]?.label || req.requestedPlan,
          requestedPlanPrice: PLAN_CONFIGS[req.requestedPlan]?.price || 0,
          shopCount,
        }
      })
    )

    // Count pending for badge
    const pendingCount = await db.upgradeRequest.count({ where: { status: 'PENDING' } })

    return NextResponse.json({ requests: enriched, pendingCount })
  } catch (error) {
    console.error('Upgrade requests GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/admin/upgrade-requests — Approve or reject an upgrade request
export async function PATCH(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user || !hasMinimumRole(user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const body = await request.json()
    const { requestId, action, reason } = body as {
      requestId: string
      action: 'APPROVE' | 'REJECT'
      reason?: string
    }

    if (!requestId || !action) {
      return NextResponse.json({ error: 'requestId et action requis' }, { status: 400 })
    }

    const upgradeReq = await db.upgradeRequest.findUnique({
      where: { id: requestId },
    })

    if (!upgradeReq) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
    }

    if (upgradeReq.status !== 'PENDING') {
      return NextResponse.json({ error: 'Cette demande a déjà été traitée' }, { status: 400 })
    }

    if (action === 'APPROVE') {
      // Apply the upgrade
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30)
      await upgradeSubscription(upgradeReq.userId, upgradeReq.requestedPlan, endDate)

      // Mark request as approved
      await db.upgradeRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: user.id,
          reviewedAt: new Date(),
        },
      })

      return NextResponse.json({ message: 'Demande approuvée et forfait mis à jour' })
    }

    if (action === 'REJECT') {
      await db.upgradeRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          reviewedBy: user.id,
          reviewedAt: new Date(),
          rejectionReason: reason || null,
        },
      })

      return NextResponse.json({ message: 'Demande refusée' })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (error) {
    console.error('Upgrade requests PATCH error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}