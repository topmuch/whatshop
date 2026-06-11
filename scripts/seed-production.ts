// ✅ PRODUCTION-SAFE SEED SCRIPT
// This script creates the minimum required data for production:
//   - SaaSConfig
//   - SUPER_ADMIN user (configurable via env vars)
//
// Environment variables:
//   SUPER_ADMIN_EMAIL    — default: admin@boutiko.pro
//   SUPER_ADMIN_PASSWORD — default: Admin123!  (min 6 chars)
//   SUPER_ADMIN_NAME     — default: Super Admin

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function seedProduction() {
  console.log('🚀 Seeding production database...')

  // 1. Create default SaaSConfig (if not exists)
  const existingConfig = await db.saasConfig.findFirst()
  if (!existingConfig) {
    await db.saasConfig.create({
      data: {
        saasName: 'Boutiko',
        primaryColor: '#EC4899',
        defaultWhatsappMessage: 'Bonjour, je souhaite commander le produit: {productName} - {productPrice} FCFA depuis votre boutique Boutiko.',
        standardPrice: 5000,
        proPrice: 10000,
      },
    })
    console.log('  ✓ SaaSConfig created')
  } else {
    console.log('  ✓ SaaSConfig already exists, skipping')
  }

  // 2. Create SUPER_ADMIN user (if none exists)
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@boutiko.pro'
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!'
  const adminName = process.env.SUPER_ADMIN_NAME || 'Super Admin'

  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    if (adminPassword.length < 6) {
      console.error('  ✗ SUPER_ADMIN_PASSWORD must be at least 6 characters')
      process.exit(1)
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await db.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'SUPER_ADMIN',
      },
    })
    console.log(`  ✓ SUPER_ADMIN created: ${adminEmail}`)
  } else {
    console.log(`  ✓ SUPER_ADMIN already exists (${adminEmail}), skipping`)
  }

  console.log('\n✅ Production seed completed!')
}

seedProduction()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect().then(() => process.exit(0)))
