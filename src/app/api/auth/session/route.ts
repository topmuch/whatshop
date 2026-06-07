import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Read user email from cookie
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
        isActive: user.shop.isActive,
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
