import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, destroySession, mapShopToAuthShop } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ user: null, shop: null, shops: [] })
    }

    // Re-fetch with subscription and reseller data
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        shops: true,
        subscription: true,
        resellerProfile: true,
      },
    })

    if (!fullUser) {
      return NextResponse.json({ user: null, shop: null, shops: [] })
    }

    const primaryShop = fullUser.shops.length > 0 ? fullUser.shops[0] : null

    return NextResponse.json({
      user: { id: fullUser.id, email: fullUser.email, name: fullUser.name, role: fullUser.role },
      shops: fullUser.shops.map(s => mapShopToAuthShop(s as unknown as Record<string, unknown>)),
      shop: primaryShop ? mapShopToAuthShop(primaryShop as unknown as Record<string, unknown>) : null,
      subscription: fullUser.subscription ? {
        id: fullUser.subscription.id,
        planType: fullUser.subscription.planType,
        status: fullUser.subscription.status,
        maxShops: fullUser.subscription.maxShops,
        startDate: fullUser.subscription.startDate.toISOString(),
        endDate: fullUser.subscription.endDate?.toISOString() ?? null,
      } : null,
      reseller: fullUser.resellerProfile ? {
        id: fullUser.resellerProfile.id,
        companyName: fullUser.resellerProfile.companyName,
        logoUrl: fullUser.resellerProfile.logoUrl,
        primaryColor: fullUser.resellerProfile.primaryColor,
        commission: fullUser.resellerProfile.commission,
        isActive: fullUser.resellerProfile.isActive,
      } : null,
      godModeOriginalUserId: user.godModeOriginalUserId || null,
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null, shop: null, shops: [] })
  }
}

export async function DELETE() {
  await destroySession()
  return NextResponse.json({ success: true })
}