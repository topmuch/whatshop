import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'
import { setSessionCookie, mapShopToAuthShop } from '@/lib/auth'

// POST /api/admin/god-mode — Start God Mode (impersonate a user)
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    // Only SUPER_ADMIN can use God Mode
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

    // Look up the target user
    const target = await db.user.findUnique({
      where: { id: userId },
      include: {
        shops: true,
        subscription: true,
        resellerProfile: true,
      },
    })

    if (!target) {
      return NextResponse.json({ error: 'Utilisateur cible non trouvé' }, { status: 404 })
    }

    const primaryShop = target.shops.length > 0 ? target.shops[0] : null
    const response = NextResponse.json({
      user: { id: target.id, email: target.email, name: target.name, role: target.role },
      shops: target.shops.map(s => mapShopToAuthShop(s as unknown as Record<string, unknown>)),
      shop: primaryShop ? mapShopToAuthShop(primaryShop as unknown as Record<string, unknown>) : null,
      subscription: target.subscription ? {
        id: target.subscription.id,
        planType: target.subscription.planType,
        status: target.subscription.status,
        maxShops: target.subscription.maxShops,
        startDate: target.subscription.startDate.toISOString(),
        endDate: target.subscription.endDate?.toISOString() ?? null,
      } : null,
      reseller: target.resellerProfile ? {
        id: target.resellerProfile.id,
        companyName: target.resellerProfile.companyName,
        logoUrl: target.resellerProfile.logoUrl,
        primaryColor: target.resellerProfile.primaryColor,
        commission: target.resellerProfile.commission,
        isActive: target.resellerProfile.isActive,
      } : null,
    })

    // Store the original admin's email in a god-mode cookie
    const isSecure = process.env.COOKIE_SECURE === 'true'
    response.cookies.set('whatsshop-god-mode', admin.email, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Switch the session cookie to the target user's email
    setSessionCookie(response, target.email)

    return response
  } catch (error) {
    console.error('God mode start error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/god-mode — Exit God Mode (restore admin session)
export async function DELETE(request: NextRequest) {
  try {
    const godModeEmail = request.cookies.get('whatsshop-god-mode')?.value

    if (!godModeEmail) {
      return NextResponse.json(
        { error: 'Aucune session mode Dieu active' },
        { status: 400 }
      )
    }

    // Verify the original admin still exists and is still a SUPER_ADMIN
    const admin = await db.user.findUnique({
      where: { email: godModeEmail },
      include: {
        shops: true,
        subscription: true,
        resellerProfile: true,
      },
    })

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Administrateur original introuvable ou plus valide' },
        { status: 403 }
      )
    }

    const primaryShop = admin.shops.length > 0 ? admin.shops[0] : null
    const response = NextResponse.json({
      user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      shops: admin.shops.map(s => mapShopToAuthShop(s as unknown as Record<string, unknown>)),
      shop: primaryShop ? mapShopToAuthShop(primaryShop as unknown as Record<string, unknown>) : null,
      subscription: admin.subscription ? {
        id: admin.subscription.id,
        planType: admin.subscription.planType,
        status: admin.subscription.status,
        maxShops: admin.subscription.maxShops,
        startDate: admin.subscription.startDate.toISOString(),
        endDate: admin.subscription.endDate?.toISOString() ?? null,
      } : null,
      reseller: admin.resellerProfile ? {
        id: admin.resellerProfile.id,
        companyName: admin.resellerProfile.companyName,
        logoUrl: admin.resellerProfile.logoUrl,
        primaryColor: admin.resellerProfile.primaryColor,
        commission: admin.resellerProfile.commission,
        isActive: admin.resellerProfile.isActive,
      } : null,
    })

    // Restore the session cookie to the admin's email
    setSessionCookie(response, admin.email)

    // Clear the god-mode cookie
    const isSecure = process.env.COOKIE_SECURE === 'true'
    response.cookies.set('whatsshop-god-mode', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('God mode exit error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}