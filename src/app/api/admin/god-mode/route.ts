import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'
import { enterGodMode, exitGodModeSession, getGodModeState, mapShopToAuthShop } from '@/lib/auth'
import { logger } from '@/lib/logger'

function buildUserResponse(user: { id: string; email: string; name: string; role: string; shops: unknown[]; subscription?: unknown | null; resellerProfile?: unknown | null }) {
  const shops = user.shops as Array<Record<string, unknown>>
  const primaryShop = shops.length > 0 ? shops[0] : null
  const sub = user.subscription as Record<string, unknown> | null
  const reseller = user.resellerProfile as Record<string, unknown> | null

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    shops: shops.map(s => mapShopToAuthShop(s)),
    shop: primaryShop ? mapShopToAuthShop(primaryShop) : null,
    subscription: sub ? {
      id: sub.id,
      planType: sub.planType,
      status: sub.status,
      maxShops: sub.maxShops,
      startDate: (sub.startDate as Date).toISOString(),
      endDate: sub.endDate ? (sub.endDate as Date).toISOString() : null,
    } : null,
    reseller: reseller ? {
      id: reseller.id,
      companyName: reseller.companyName,
      logoUrl: reseller.logoUrl,
      primaryColor: reseller.primaryColor,
      commission: reseller.commission,
      isActive: reseller.isActive,
    } : null,
  }
}

// POST /api/admin/god-mode — Start God Mode (impersonate a user)
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    if (admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Seul un SUPER_ADMIN peut utiliser le mode Dieu' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    const target = await db.user.findUnique({
      where: { id: userId },
      include: {
        shops: {
          select: {
            id: true, name: true, slug: true, logo: true, plan: true,
            isActive: true, template: true, primaryColor: true, ownerId: true,
          },
        },
        subscription: { select: { id: true, planType: true, status: true, maxShops: true, startDate: true, endDate: true } },
        resellerProfile: { select: { id: true, companyName: true, logoUrl: true, primaryColor: true, commission: true, isActive: true } },
      },
    })

    if (!target) {
      return NextResponse.json({ error: 'Utilisateur cible non trouvé' }, { status: 404 })
    }

    logger.warn('GOD_MODE_ACTIVATED', 'AdminAPI', {
      adminId: admin.id,
      adminEmail: admin.email,
      targetUserId: target.id,
      targetEmail: target.email,
    })

    await enterGodMode(target.id, admin.id)

    return NextResponse.json(buildUserResponse(target))
  } catch (error) {
    logger.error('God mode start error', 'AdminAPI', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/god-mode — Exit God Mode (restore admin session)
export async function DELETE(_request: NextRequest) {
  try {
    // When in god-mode, the session userId is the target (non-admin) user.
    // Read the godModeOriginalUserId from the session directly.
    const godState = await getGodModeState()
    if (!godState.godModeOriginalUserId) {
      return NextResponse.json(
        { error: 'Aucune session mode Dieu active' },
        { status: 400 }
      )
    }

    const admin = await db.user.findUnique({
      where: { id: godState.godModeOriginalUserId },
      include: {
        shops: {
          select: {
            id: true, name: true, slug: true, logo: true, plan: true,
            isActive: true, template: true, primaryColor: true, ownerId: true,
          },
        },
        subscription: { select: { id: true, planType: true, status: true, maxShops: true, startDate: true, endDate: true } },
        resellerProfile: { select: { id: true, companyName: true, logoUrl: true, primaryColor: true, commission: true, isActive: true } },
      },
    })

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Administrateur original introuvable ou plus valide' },
        { status: 403 }
      )
    }

    logger.warn('GOD_MODE_EXITED', 'AdminAPI', {
      adminId: admin.id,
      adminEmail: admin.email,
    })

    await exitGodModeSession(admin.id)

    return NextResponse.json(buildUserResponse(admin))
  } catch (error) {
    logger.error('God mode exit error', 'AdminAPI', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}