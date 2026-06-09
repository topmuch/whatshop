// Production seed - creates admin account if not exists
// Used by Docker CMD on first startup
import { db } from '../src/lib/db'

async function seed() {
  console.log('🌱 Production seed: creating admin account if needed...')

  const existing = await db.user.findUnique({ where: { email: 'admin@whatsshop.com' } })
  if (!existing) {
    await db.user.create({
      data: {
        email: 'admin@whatsshop.com',
        password: 'admin123',
        name: 'Super Administrateur',
        role: 'ADMIN',
      },
    })
    console.log('✅ Admin created: admin@whatsshop.com / admin123')
  } else {
    console.log('ℹ️ Admin already exists, skipping.')
  }

  const demo = await db.user.findUnique({ where: { email: 'demo@whatsshop.com' } })
  if (!demo) {
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
    console.log('✅ Demo seller created: demo@whatsshop.com / demo123')
  } else {
    console.log('ℹ️ Demo seller already exists, skipping.')
  }
}

seed().catch(console.error).finally(() => process.exit(0))
