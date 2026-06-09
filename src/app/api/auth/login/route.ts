import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

let seeded = false

async function ensureSeeded() {
  if (seeded) return
  try {
    // Always ensure admin exists (even if other users exist)
    const admin = await db.user.findUnique({ where: { email: 'admin@whatsshop.com' } })
    if (!admin) {
      console.log('🌱 Creating admin account...')
      await db.user.create({
        data: {
          email: 'admin@whatsshop.com',
          password: 'admin123',
          name: 'Super Administrateur',
          role: 'ADMIN',
        },
      })
      console.log('✅ Admin created: admin@whatsshop.com / admin123')
    }

    // Ensure demo seller + shop exist
    const demo = await db.user.findUnique({ where: { email: 'demo@whatsshop.com' } })
    if (!demo) {
      console.log('🌱 Creating demo seller...')
      const seller = await db.user.create({
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
          ownerId: seller.id,
        },
      })
      console.log('✅ Demo created: demo@whatsshop.com / demo123')
    }
    seeded = true
  } catch (err) {
    console.error('⚠️ Seed error:', err)
    seeded = true
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { shop: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    if (user.password !== password) {
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
        template: user.shop.template || 'classic',
        isActive: user.shop.isActive,
      } : null,
    })

    response.cookies.set('whatsshop-user', user.email, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
