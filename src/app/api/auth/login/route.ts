import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createSession, hashPassword, mapShopToAuthShop } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// Auto-setup credentials — ONLY from environment, no fallbacks
const SETUP_EMAIL = process.env.SUPER_ADMIN_EMAIL
const SETUP_PASSWORD = process.env.SUPER_ADMIN_PASSWORD

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

    // Auto-setup: if no users exist and SETUP credentials are configured, create SUPER_ADMIN
    if (SETUP_EMAIL && SETUP_PASSWORD) {
      const userCount = await db.user.count()
      if (userCount === 0 && email === SETUP_EMAIL && password === SETUP_PASSWORD) {
        const hashedPassword = await hashPassword(SETUP_PASSWORD)
        const newAdmin = await db.user.create({
          data: {
            email: SETUP_EMAIL,
            password: hashedPassword,
            name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
            role: 'SUPER_ADMIN',
          },
          include: {
            shops: {
              select: {
                id: true, name: true, slug: true, logo: true, banner: true,
                whatsapp: true, phone: true, address: true, plan: true,
                isActive: true, template: true, primaryColor: true, secondaryColor: true,
                accentColor: true, customColors: true, templateType: true,
                isLiveMode: true, liveProductId: true, liveStartedAt: true,
              },
            },
          },
        })
        logger.info('SUPER_ADMIN auto-created on first login', 'LoginAPI', { email: newAdmin.email })

        await createSession(newAdmin.id)

        return NextResponse.json({
          user: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name, role: newAdmin.role },
          shops: [],
          shop: null,
          setup: true,
        })
      }
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    await createSession(user.id)

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      shops: user.shops,
      shop: user.shop ? mapShopToAuthShop(user.shop as unknown as Record<string, unknown>) : null,
    })
  } catch (error) {
    logger.error('Login failed', 'LoginAPI', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}