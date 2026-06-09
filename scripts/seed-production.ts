// ✅ PRODUCTION-SAFE SEED SCRIPT
// This script only creates the minimum required data for production.
// It does NOT create any demo shops, demo users, or demo products.

import { PrismaClient } from '@prisma/client'

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

  console.log('\n✅ Production seed completed!')
  console.log('   No demo data was created.')
  console.log('   Run `bun run scripts/seed.ts` in development to create demo data.')
}

seedProduction()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect().then(() => process.exit(0)))
