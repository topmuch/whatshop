import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const shops = await db.shop.findMany({
      where: {
        ...(status ? { subscriptionStatus: status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      shops: shops.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        plan: s.plan,
        isActive: s.isActive,
        subscriptionStatus: s.subscriptionStatus,
        subscriptionEndDate: s.subscriptionEndDate?.toISOString() ?? null,
        owner: { id: s.owner.id, name: s.owner.name, email: s.owner.email },
        createdAt: s.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Admin subscriptions error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { shopId, action } = body

    if (!shopId || !action) {
      return NextResponse.json({ error: 'shopId et action requis' }, { status: 400 })
    }

    const validActions = ['activate', 'suspend', 'cancel', 'extend']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Action invalide. Utilisez: activate, suspend, cancel, extend' }, { status: 400 })
    }

    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    let updateData: Record<string, unknown> = {}

    switch (action) {
      case 'activate': {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30)
        updateData = {
          subscriptionStatus: 'ACTIVE',
          subscriptionEndDate: endDate,
          isActive: true,
        }
        break
      }
      case 'suspend': {
        updateData = {
          subscriptionStatus: 'SUSPENDED',
          isActive: false,
        }
        break
      }
      case 'cancel': {
        updateData = {
          subscriptionStatus: 'CANCELLED',
        }
        break
      }
      case 'extend': {
        const baseDate = shop.subscriptionEndDate
          ? new Date(shop.subscriptionEndDate)
          : new Date()
        // If the existing end date is in the past, use now as the base
        if (baseDate < new Date()) {
          baseDate.setTime(new Date().getTime())
        }
        baseDate.setDate(baseDate.getDate() + 30)
        updateData = {
          subscriptionEndDate: baseDate,
          subscriptionStatus: 'ACTIVE',
          isActive: true,
        }
        break
      }
    }

    const updated = await db.shop.update({
      where: { id: shopId },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      subscriptionStatus: updated.subscriptionStatus,
      subscriptionEndDate: updated.subscriptionEndDate?.toISOString() ?? null,
      isActive: updated.isActive,
    })
  } catch (error) {
    console.error('Admin subscription update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
