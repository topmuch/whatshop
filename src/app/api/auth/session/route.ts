import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clearSessionCookie } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value

    if (!userEmail) {
      return NextResponse.json({ user: null, shop: null })
    }

    const user = await db.user.findUnique({
      where: { email: userEmail },
      include: { shop: true },
    })

    if (!user) {
      return NextResponse.json({ user: null, shop: null })
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      shop: user.shop ? {
        id: user.shop.id,
        name: user.shop.name,
        slug: user.shop.slug,
        description: user.shop.description,
        logo: user.shop.logo,
        banner: user.shop.banner,
        whatsapp: user.shop.whatsapp,
        address: user.shop.address,
        phone: user.shop.phone,
        plan: user.shop.plan,
        template: user.shop.template || 'classic',
        isActive: user.shop.isActive,
        seoTitle: user.shop.seoTitle,
        seoDescription: user.shop.seoDescription,
        coverImageUrl: user.shop.coverImageUrl,
        customDomain: user.shop.customDomain,
        customDomainStatus: user.shop.customDomainStatus,
        subscriptionStatus: user.shop.subscriptionStatus,
        subscriptionEndDate: user.shop.subscriptionEndDate?.toISOString(),
        heroImages: user.shop.heroImages,
        promoBanners: user.shop.promoBanners,
      } : null,
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null, shop: null })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  clearSessionCookie(response)
  return response
}
