import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, setSessionCookie } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.login)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { email, password } = body
    console.log('[LOGIN DEBUG] email:', email, 'password length:', password?.length, 'ip:', ip, 'origin:', request.headers.get('origin'), 'referer:', request.headers.get('referer'))

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const user = await authenticateUser(email, password)
    console.log('[LOGIN DEBUG] authenticateUser result:', user ? user.email + ' / ' + user.role : 'NULL')

    if (!user) {
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
        sector: user.shop.sector,
        template: user.shop.template || 'classic',
        isActive: user.shop.isActive,
        heroImages: user.shop.heroImages,
        promoBanners: user.shop.promoBanners,
        brands: user.shop.brands,
      } : null,
    })

    setSessionCookie(response, user.email)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
