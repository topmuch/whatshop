import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, hashPassword } from '@/lib/auth'
import { getOrCreateSubscription, PLAN_CONFIGS } from '@/lib/permissions'
import { PlanType } from '@prisma/client'

// GET /api/reseller/clients — List all clients for this reseller
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    if (user.role !== 'RESELLER' && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux revendeurs' }, { status: 403 })
    }

    const clients = await db.user.findMany({
      where: { resellerId: user.id },
      include: {
        subscription: true,
        shops: {
          select: { id: true, name: true, slug: true, isActive: true, plan: true },
        },
        _count: {
          select: { shops: true, orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(clients.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role,
      createdAt: c.createdAt.toISOString(),
      subscription: c.subscription ? {
        planType: c.subscription.planType,
        status: c.subscription.status,
        maxShops: c.subscription.maxShops,
      } : null,
      shops: c.shops,
      shopCount: c._count.shops,
      orderCount: c._count.orders,
    })))
  } catch (error) {
    console.error('Reseller clients GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/reseller/clients — Create a new client (seller) under this reseller
export async function POST(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    if (user.role !== 'RESELLER' && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux revendeurs' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, planType } = body as {
      name: string
      email: string
      password: string
      planType?: PlanType
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nom, email et mot de passe requis' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format d'email invalide." }, { status: 400 })
    }

    // Check email uniqueness
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
    }

    // Create user with resellerId
    const hashedPw = await hashPassword(password)
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPw,
        name: name.trim(),
        role: 'SELLER' as const,
        resellerId: user.id,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    // Create subscription with the specified plan
    const resolvedPlan = planType && Object.keys(PLAN_CONFIGS).includes(planType)
      ? planType
      : 'STARTER' as PlanType

    await db.subscription.create({
      data: {
        userId: newUser.id,
        planType: resolvedPlan,
        status: 'ACTIVE',
        maxShops: PLAN_CONFIGS[resolvedPlan].maxShops,
      },
    })

    return NextResponse.json({
      user: newUser,
      credentials: {
        email,
        password,
      },
      subscription: {
        planType: resolvedPlan,
        maxShops: PLAN_CONFIGS[resolvedPlan].maxShops,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Reseller create client error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/reseller/clients/[id] is handled via the admin users route for simplicity.
// Transfer of shop ownership requires SUPER_ADMIN or RESELLER access.
// PATCH /api/reseller/clients/[id] — Assign/change plan or transfer ownership
export async function PATCH(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    if (user.role !== 'RESELLER' && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux revendeurs' }, { status: 403 })
    }

    const body = await request.json()
    const { clientId, planType, newOwnerId } = body as {
      clientId: string
      planType?: PlanType
      newOwnerId?: string
    }

    if (!clientId) {
      return NextResponse.json({ error: 'ID client requis' }, { status: 400 })
    }

    // Verify the client belongs to this reseller
    const client = await db.user.findFirst({
      where: { id: clientId, resellerId: user.id },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    // Update plan if requested
    if (planType && Object.keys(PLAN_CONFIGS).includes(planType)) {
      await db.subscription.upsert({
        where: { userId: client.id },
        create: {
          userId: client.id,
          planType,
          status: 'ACTIVE',
          maxShops: PLAN_CONFIGS[planType].maxShops,
        },
        update: {
          planType,
          status: 'ACTIVE',
          maxShops: PLAN_CONFIGS[planType].maxShops,
        },
      })
    }

    // Transfer shop ownership if requested
    if (newOwnerId) {
      const targetUser = await db.user.findUnique({ where: { id: newOwnerId } })
      if (!targetUser) {
        return NextResponse.json({ error: 'Nouveau propriétaire introuvable' }, { status: 404 })
      }

      await db.shop.updateMany({
        where: { ownerId: client.id },
        data: { ownerId: newOwnerId },
      })
    }

    return NextResponse.json({ success: true, message: 'Client mis à jour' })
  } catch (error) {
    console.error('Reseller update client error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}