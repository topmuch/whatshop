// ⚠️ DEMO ONLY - Creates ElectroDépôt shop with sample products
// This script can run in BOTH development AND production for demo purposes

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seedElectroShop() {
  console.log('🔌 Creating ElectroDépôt shop...')

  // 1. Create user
  const existingUser = await db.user.findUnique({ where: { email: 'electro@whatsshop.com' } })
  let userId: string
  if (existingUser) {
    userId = existingUser.id
    console.log('  ✓ User exists:', userId)
  } else {
    const user = await db.user.create({
      data: {
        email: 'electro@whatsshop.com',
        password: 'demo123',
        name: 'ElectroDépôt',
        role: 'SELLER',
      },
    })
    userId = user.id
    console.log('  ✓ User created:', userId)
  }

  // 2. Remove existing shop if any
  const existingShop = await db.shop.findUnique({ where: { slug: 'electrodepot-demo' } })
  if (existingShop) {
    await db.order.deleteMany({ where: { shopId: existingShop.id } })
    await db.visit.deleteMany({ where: { shopId: existingShop.id } })
    await db.product.deleteMany({ where: { shopId: existingShop.id } })
    await db.category.deleteMany({ where: { shopId: existingShop.id } })
    await db.shop.delete({ where: { id: existingShop.id } })
  }

  // 3. Create shop with electrodepot template
  const shop = await db.shop.create({
    data: {
      name: 'ElectroDépôt',
      slug: 'electrodepot-demo',
      description: 'Votre méga-store électronique au Sénégal. Téléphones, TV, PC, électroménager aux meilleurs prix. Livraison gratuite à Dakar.',
      whatsapp: '221770000000',
      address: 'Plateau, Dakar, Sénégal',
      phone: '221330000000',
      plan: 'STANDARD',
      sector: 'electronique',
      template: 'electrodepot',
      isActive: true,
      ownerId: userId,
      logo: '/products/electro/logo-electro.png',
      seoTitle: 'ElectroDépôt - Boutique Électronique au Sénégal',
      seoDescription: 'Téléphones, TV, PC, électroménager au meilleur prix à Dakar. Livraison gratuite.',
      subscriptionStatus: 'ACTIVE',
      // Hero slider images
      heroImages: JSON.stringify([
        '/banners/electro/slide-promo-1.png',
        '/banners/electro/slide-promo-2.png',
      ]),
      // Promo banners
      promoBanners: JSON.stringify([
        { id: '1', image: '/promo/electro/promo-livraison.png', title: 'Livraison gratuite à Dakar', link: '' },
        { id: '2', image: '/promo/electro/promo-flash-sale.png', title: 'Soldes Flash -30%', link: '' },
      ]),
    },
  })
  console.log('  ✓ Shop created:', shop.id)

  // 4. Create categories
  const cats = await Promise.all([
    db.category.create({ data: { name: 'Téléphones', description: 'Smartphones et accessoires', shopId: shop.id } }),
    db.category.create({ data: { name: 'TV & Son', description: 'Téléviseurs et enceintes', shopId: shop.id } }),
    db.category.create({ data: { name: 'Informatique', description: 'PC portables et accessoires', shopId: shop.id } }),
    db.category.create({ data: { name: 'Électroménager', description: 'Climatisation, réfrigérateurs', shopId: shop.id } }),
    db.category.create({ data: { name: 'Maison Connectée', description: 'Robot aspirateur, objets connectés', shopId: shop.id } }),
    db.category.create({ data: { name: 'Gaming', description: 'Consoles et accessoires gaming', shopId: shop.id } }),
  ])
  console.log('  ✓ Categories:', cats.length)

  // 5. Products with realistic prices in FCFA
  const products = [
    // Téléphones
    { name: 'Smartphone Pro Max 256Go', description: 'Écran AMOLED 6.7", appareil photo 108MP, batterie 5000mAh, charge rapide 65W.', price: 285000, image: '/products/electro/smartphone-pro-max.png', images: JSON.stringify(['/products/electro/smartphone-pro-max.png']), stock: 25, shopId: shop.id, categoryId: cats[0].id },
    // TV & Son
    { name: 'Smart TV 4K 55 pouces', description: 'Résolution 4K Ultra HD, HDR10+, Smart TV Android, HDMI x3, USB.', price: 320000, image: '/products/electro/smart-tv-4k.png', images: JSON.stringify(['/products/electro/smart-tv-4k.png']), stock: 15, shopId: shop.id, categoryId: cats[1].id },
    // Informatique
    { name: 'PC Portable Ultra Slim i7', description: 'Intel Core i7 12ème génération, 16Go RAM, SSD 512Go, écran 15.6" Full HD.', price: 450000, image: '/products/electro/pc-portable.png', images: JSON.stringify(['/products/electro/pc-portable.png']), stock: 10, shopId: shop.id, categoryId: cats[2].id },
    // TV & Son
    { name: 'Écouteurs Bluetooth Premium', description: 'Réduction de bruit active ANC, autonomie 40h, Bluetooth 5.3, pliable.', price: 45000, image: '/products/electro/ecouteurs-bluetooth.png', images: JSON.stringify(['/products/electro/ecouteurs-bluetooth.png']), stock: 40, shopId: shop.id, categoryId: cats[1].id },
    // Maison Connectée
    { name: 'Robot Aspirateur Intelligent', description: 'Navigation laser, 3000Pa aspiration, 180min autonomie, contrôle via app.', price: 175000, image: '/products/electro/robot-aspirateur.png', images: JSON.stringify(['/products/electro/robot-aspirateur.png']), stock: 12, shopId: shop.id, categoryId: cats[4].id },
    // TV & Son
    { name: 'Enceinte Bluetooth Portable', description: '20W puissance, étanche IPX7, 24h autonomie, basses profondes.', price: 35000, image: '/products/electro/enceinte-portable.png', images: JSON.stringify(['/products/electro/enceinte-portable.png']), stock: 30, shopId: shop.id, categoryId: cats[1].id },
    // Électroménager
    { name: 'Climatiseur Split 12000 BTU', description: 'Inverter, faible consommation, thermostat intelligent, remote control inclus.', price: 280000, image: '/products/electro/climatiseur-split.png', images: JSON.stringify(['/products/electro/climatiseur-split.png']), stock: 8, shopId: shop.id, categoryId: cats[3].id },
    // Électroménager
    { name: 'Réfrigérateur Double Porte 400L', description: 'Noir inox, froid ventilé, clayettes verre, freezer 140L, classe A+.', price: 350000, image: '/products/electro/refrigerateur-double.png', images: JSON.stringify(['/products/electro/refrigerateur-double.png']), stock: 6, shopId: shop.id, categoryId: cats[3].id },
    // Maison Connectée
    { name: 'Robot Cuisine Multifonction', description: '12 fonctions, 1000W, bol 5L, cuve anti-adhésive, 30 programmes.', price: 125000, image: '/products/electro/robot-cuisine.png', images: JSON.stringify(['/products/electro/robot-cuisine.png']), stock: 18, shopId: shop.id, categoryId: cats[4].id },
    // Téléphones
    { name: 'Chargeur Sans Fil 3-en-1', description: 'Charge rapide 15W pour téléphone + 5W AirPods + 2W Apple Watch. LED indicateur.', price: 18500, image: '/products/electro/chargeur-sans-fil.png', images: JSON.stringify(['/products/electro/chargeur-sans-fil.png']), stock: 50, shopId: shop.id, categoryId: cats[0].id },
    // Maison Connectée
    { name: 'Montre Connectée Sport Pro', description: 'GPS, cardio, SpO2, étanche 5ATM, 14 jours autonomie, écran AMOLED.', price: 65000, image: '/products/electro/montre-smart.png', images: JSON.stringify(['/products/electro/montre-smart.png']), stock: 22, shopId: shop.id, categoryId: cats[4].id },
    // Gaming
    { name: 'Console Gaming Edition Spéciale', description: '1To SSD, 2 manettes incluses, 4K 120fps, rétrocompatible, ray tracing.', price: 380000, image: '/products/electro/console-gaming.png', images: JSON.stringify(['/products/electro/console-gaming.png']), stock: 5, shopId: shop.id, categoryId: cats[5].id },
  ]

  for (const p of products) {
    await db.product.create({ data: { ...p, isAvailable: true } })
  }
  console.log('  ✓ Products:', products.length)

  // 6. Visits (30 days)
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const count = Math.floor(Math.random() * 20) + 5
    for (let j = 0; j < count; j++) {
      await db.visit.create({ data: { shopId: shop.id, date: d } })
    }
  }
  console.log('  ✓ Visits generated (30 days)')

  // 7. Sample orders
  const orders = [
    { items: [{ name: 'Smartphone Pro Max 256Go', price: 285000, quantity: 1 }], total: 285000, customer: 'Moussa D.', status: 'DELIVERED' },
    { items: [{ name: 'Smart TV 4K 55"', price: 320000, quantity: 1 }, { name: 'Écouteurs Bluetooth Premium', price: 45000, quantity: 1 }], total: 365000, customer: 'Fatou S.', status: 'CONFIRMED' },
    { items: [{ name: 'PC Portable Ultra Slim i7', price: 450000, quantity: 1 }], total: 450000, customer: 'Ibrahima M.', status: 'PENDING' },
    { items: [{ name: 'Robot Aspirateur Intelligent', price: 175000, quantity: 1 }], total: 175000, customer: 'Awa B.', status: 'DELIVERED' },
    { items: [{ name: 'Climatiseur Split 12000 BTU', price: 280000, quantity: 2 }], total: 560000, customer: 'Omar N.', status: 'CONFIRMED' },
    { items: [{ name: 'Console Gaming Edition Spéciale', price: 380000, quantity: 1 }, { name: 'Montre Connectée Sport Pro', price: 65000, quantity: 1 }], total: 445000, customer: 'Cheikh T.', status: 'DELIVERED' },
  ]
  for (const o of orders) {
    await db.order.create({ data: { shopId: shop.id, items: JSON.stringify(o.items), total: o.total, customerName: o.customer, status: o.status } })
  }
  console.log('  ✓ Orders:', orders.length)

  console.log('\n✨ ElectroDépôt shop ready!')
  console.log('   URL: /electrodepot-demo')
  console.log('   Template: electrodepot')
  console.log('   Email: electro@whatsshop.com')
  console.log('   Password: demo123')
}

seedElectroShop()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect().then(() => process.exit(0)))
