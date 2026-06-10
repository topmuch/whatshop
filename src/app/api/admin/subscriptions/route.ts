import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

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
      subscriptions: shops.map(s => ({
        shopId: s.id,
        shopName: s.name,
        shopSlug: s.slug,
        ownerName: s.owner.name,
        ownerEmail: s.owner.email,
        plan: s.plan,
        status: s.subscriptionStatus || 'NONE',
        endDate: s.subscriptionEndDate?.toISOString() ?? null,
        isActive: s.isActive,
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
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

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
