import { db } from './src/lib/db'
import { hashSync } from 'bcryptjs'

async function seed() {
  console.log('Seeding database...')

  // Create demo user
  const user = await db.user.upsert({
    where: { email: 'demo@whatsshop.com' },
    update: {},
    create: {
      email: 'demo@whatsshop.com',
      password: 'demo123',
      name: 'Aminata Diallo',
      role: 'SELLER',
    },
  })

  // Create demo shop
  const shop = await db.shop.upsert({
    where: { ownerId: user.id },
    update: {},
    create: {
      name: 'Amina Mode',
      slug: 'amina-mode',
      description: 'Vêtements et accessoires de qualité pour femmes. Livraison à Dakar et environs.',
      whatsapp: '221771234567',
      address: 'Marché Sandaga, Dakar, Sénégal',
      phone: '+221 33 987 65 43',
      plan: 'STANDARD',
      isActive: true,
      ownerId: user.id,
    },
  })

  // Create categories
  const cat1 = await db.category.create({
    data: { name: 'Robes', description: 'Robes élégantes pour toutes les occasions', shopId: shop.id },
  })
  const cat2 = await db.category.create({
    data: { name: 'Accessoires', description: 'Sacs, bijoux et accessoires', shopId: shop.id },
  })
  const cat3 = await db.category.create({
    data: { name: 'Tissus', description: 'Tissus Wax, Bazin et Kente', shopId: shop.id },
  })

  // Create products
  const products = [
    { name: 'Robe Wax Élégante', description: 'Robe en wax de qualité supérieure, coupe princesse', price: 15000, categoryId: cat1.id, stock: 5 },
    { name: 'Boubou Grand Modèle', description: 'Boubou brodé main, tissu bazin riche', price: 25000, categoryId: cat1.id, stock: 3 },
    { name: 'Tunique Kente', description: 'Tunique en tissu Kente authentique du Ghana', price: 12000, categoryId: cat1.id, stock: 8 },
    { name: 'Sac À Main Cuir', description: 'Sac à main en cuir véritable fait main', price: 20000, categoryId: cat2.id, stock: 4 },
    { name: 'Ensemble Bijoux Dorés', description: 'Collier, bracelet et boucles d\'oreilles assortis', price: 8500, categoryId: cat2.id, stock: 10 },
    { name: 'Pagne Wax Premium', description: '6 yards de wax Hollandais Vlisco', price: 5000, categoryId: cat3.id, stock: 20 },
    { name: 'Robe Cocktail', description: 'Robe cocktail moderne, parfaite pour les soirées', price: 18000, categoryId: cat1.id, stock: 2 },
    { name: 'Foulard en Soie', description: 'Foulard en soie imprimé, 100x100cm', price: 3500, categoryId: cat2.id, stock: 15 },
  ]

  for (const p of products) {
    await db.product.create({
      data: {
        ...p,
        shopId: shop.id,
        isAvailable: true,
      },
    })
  }

  // Create demo orders
  const orders = [
    {
      items: JSON.stringify([
        { name: 'Robe Wax Élégante', price: 15000, quantity: 1 },
        { name: 'Sac À Main Cuir', price: 20000, quantity: 1 },
      ]),
      total: 35000,
      customerName: 'Fatou Sow',
      customerPhone: '+221 76 543 210',
      customerAddress: 'Médina, Dakar',
      status: 'CONFIRMED',
    },
    {
      items: JSON.stringify([
        { name: 'Tunique Kente', price: 12000, quantity: 2 },
      ]),
      total: 24000,
      customerName: 'Mariam Ba',
      customerPhone: '+221 78 654 321',
      customerAddress: 'Almadies, Dakar',
      status: 'PENDING',
    },
    {
      items: JSON.stringify([
        { name: 'Boubou Grand Modèle', price: 25000, quantity: 1 },
        { name: 'Ensemble Bijoux Dorés', price: 8500, quantity: 1 },
        { name: 'Foulard en Soie', price: 3500, quantity: 2 },
      ]),
      total: 40500,
      customerName: 'Awa Diop',
      customerPhone: '+221 77 987 654',
      customerAddress: 'Plateau, Dakar',
      status: 'DELIVERED',
    },
  ]

  for (const o of orders) {
    await db.order.create({
      data: {
        ...o,
        shopId: shop.id,
      },
    })
  }

  // Record some visits
  for (let i = 0; i < 47; i++) {
    await db.visit.create({
      data: {
        shopId: shop.id,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('Seed completed!')
  console.log(`- User: demo@whatsshop.com / demo123`)
  console.log(`- Shop: ${shop.slug}`)
  console.log(`- ${products.length} products, 3 categories, 3 orders, 47 visits`)
}

seed().catch(console.error).finally(() => process.exit(0))
