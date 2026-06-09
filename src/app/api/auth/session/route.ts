import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

let seeded = false

async function ensureSeeded() {
  if (seeded) return
  try {
    const count = await db.user.count()
    if (count === 0) {
      // Database is empty, create default accounts
      await db.user.create({
        data: {
          email: 'admin@whatsshop.com',
          password: 'admin123',
          name: 'Super Administrateur',
          role: 'ADMIN',
        },
      })
      const demo = await db.user.create({
        data: {
          email: 'demo@whatsshop.com',
          password: 'demo123',
          name: 'Aminata Diallo',
          role: 'SELLER',
        },
      })
      await db.shop.create({
        data: {
          name: 'Amina Mode',
          slug: 'amina-mode',
          description: 'Vêtements et accessoires de qualité pour femmes.',
          whatsapp: '221771234567',
          plan: 'STANDARD',
          isActive: true,
          ownerId: demo.id,
        },
      })
    }
    seeded = true
  } catch {
    // Ignore seed errors
    seeded = true
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded()

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
      } : null,
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null, shop: null })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('whatsshop-user', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
