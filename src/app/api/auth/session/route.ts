import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clearSessionCookie, mapShopToAuthShop } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value

    if (!userEmail) {
      return NextResponse.json({ user: null, shop: null, shops: [] })
    }

    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: {
        shops: true,
        subscription: true,
        resellerProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ user: null, shop: null, shops: [] })
    }

    const primaryShop = user.shops.length > 0 ? user.shops[0] : null

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      shops: user.shops.map(s => mapShopToAuthShop(s as unknown as Record<string, unknown>)),
      shop: primaryShop ? mapShopToAuthShop(primaryShop as unknown as Record<string, unknown>) : null,
      subscription: user.subscription ? {
        id: user.subscription.id,
        planType: user.subscription.planType,
        status: user.subscription.status,
        maxShops: user.subscription.maxShops,
        startDate: user.subscription.startDate.toISOString(),
        endDate: user.subscription.endDate?.toISOString() ?? null,
      } : null,
      reseller: user.resellerProfile ? {
        id: user.resellerProfile.id,
        companyName: user.resellerProfile.companyName,
        logoUrl: user.resellerProfile.logoUrl,
        primaryColor: user.resellerProfile.primaryColor,
        commission: user.resellerProfile.commission,
        isActive: user.resellerProfile.isActive,
      } : null,
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null, shop: null, shops: [] })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  clearSessionCookie(response)

  // Also clear god-mode cookies so a super admin fully logs out
  const isSecure = process.env.COOKIE_SECURE === 'true'
  response.cookies.set('whatsshop-god-mode', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  response.cookies.set('whatsshop-god-mode-user', '', {
    httpOnly: false,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}