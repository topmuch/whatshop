import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, setSessionCookie, hashPassword, mapShopToAuthShop } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// Default superadmin credentials (used only for first-time setup)
const DEFAULT_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@boutiko.com'
const DEFAULT_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!'

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

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    // Auto-setup: if no users exist and credentials match defaults, create SUPER_ADMIN
    const userCount = await db.user.count()
    if (userCount === 0 && email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD)
      const newAdmin = await db.user.create({
        data: {
          email: DEFAULT_ADMIN_EMAIL,
          password: hashedPassword,
          name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
          role: 'SUPER_ADMIN',
        },
        include: { shops: true },
      })
      console.log('[SETUP] First login — SUPER_ADMIN auto-created:', newAdmin.email)

      const response = NextResponse.json({
        user: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name, role: newAdmin.role },
        shops: [],
        shop: null,
        setup: true,
      })
      setSessionCookie(response, newAdmin.email)
      return response
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      shops: user.shops,
      shop: user.shop ? mapShopToAuthShop(user.shop as unknown as Record<string, unknown>) : null,
    })

    setSessionCookie(response, user.email)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}