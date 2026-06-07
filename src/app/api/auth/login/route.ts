import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { shop: true },
    })

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const response = NextResponse.json({
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

    // Set session cookie
    response.cookies.set('whatsshop-user', user.email, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
