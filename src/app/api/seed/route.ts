import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// POST /api/seed - Create default admin and demo accounts
// Called by Docker startup script to ensure accounts exist
// Protected by SEED_SECRET environment variable
export async function POST(request: NextRequest) {
  try {
    // Security: Require a secret to prevent public abuse
    const seedSecret = process.env.SEED_SECRET || 'boutiko-seed-2024'
    const authHeader = request.headers.get('authorization')
    const bodySecret = request.headers.get('x-seed-secret')
    
    // Accept secret via header or Authorization: Bearer <secret>
    const providedSecret = bodySecret || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null)
    
    if (providedSecret !== seedSecret) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const results = []

    // Create admin
    const adminPassword = await hashPassword('admin123')
    const admin = await db.user.upsert({
      where: { email: 'admin@whatsshop.com' },
      update: {},
      create: {
        email: 'admin@whatsshop.com',
        password: adminPassword,
        name: 'Super Administrateur',
        role: 'ADMIN',
      },
    })
    results.push(`admin: ${admin.email}`)

    // Create demo seller + shop
    const demoPassword = await hashPassword('demo123')
    const demo = await db.user.upsert({
      where: { email: 'demo@whatsshop.com' },
      update: {},
      create: {
        email: 'demo@whatsshop.com',
        password: demoPassword,
        name: 'Aminata Diallo',
        role: 'SELLER',
      },
    })
    results.push(`demo: ${demo.email}`)

    // Create demo shop if seller has none
    const existingShop = await db.shop.findUnique({ where: { ownerId: demo.id } })
    if (!existingShop) {
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
      results.push('shop: amina-mode')
    }

    return NextResponse.json({ seeded: true, accounts: results })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
