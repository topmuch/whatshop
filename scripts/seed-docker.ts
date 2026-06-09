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

  // ElectroDépôt demo shop
  const electroUser = await db.user.findUnique({ where: { email: 'electro@whatsshop.com' } })
  if (!electroUser) {
    const electroSeller = await db.user.create({
      data: {
        email: 'electro@whatsshop.com',
        password: 'demo123',
        name: 'ElectroDépôt',
        role: 'SELLER',
      },
    })

    // Create categories
    const cats = await Promise.all([
      db.category.create({ data: { name: 'Téléphones', description: 'Smartphones et accessoires', shopId: electroSeller.id } }),
      db.category.create({ data: { name: 'TV & Son', description: 'Téléviseurs et enceintes', shopId: electroSeller.id } }),
      db.category.create({ data: { name: 'Informatique', description: 'PC portables et accessoires', shopId: electroSeller.id } }),
      db.category.create({ data: { name: 'Électroménager', description: 'Climatisation, réfrigérateurs', shopId: electroSeller.id } }),
      db.category.create({ data: { name: 'Maison Connectée', description: 'Robot aspirateur, objets connectés', shopId: electroSeller.id } }),
      db.category.create({ data: { name: 'Gaming', description: 'Consoles et accessoires gaming', shopId: electroSeller.id } }),
    ])

    // Create shop
    const electroShop = await db.shop.create({
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
        ownerId: electroSeller.id,
        logo: '/products/electro/logo-electro.png',
        seoTitle: 'ElectroDépôt - Boutique Électronique au Sénégal',
        seoDescription: 'Téléphones, TV, PC, électroménager au meilleur prix à Dakar. Livraison gratuite.',
        subscriptionStatus: 'ACTIVE',
        heroImages: JSON.stringify([
          '/banners/electro/slide-promo-1.png',
          '/banners/electro/slide-promo-2.png',
        ]),
        promoBanners: JSON.stringify([
          { id: '1', image: '/promo/electro/promo-livraison.png', title: 'Livraison gratuite à Dakar', link: '' },
          { id: '2', image: '/promo/electro/promo-flash-sale.png', title: 'Soldes Flash -30%', link: '' },
        ]),
      },
    })

    // Products
    const products = [
      { name: 'Smartphone Pro Max 256Go', description: 'Écran AMOLED 6.7", appareil photo 108MP, batterie 5000mAh, charge rapide 65W.', price: 285000, image: '/products/electro/smartphone-pro-max.png', images: JSON.stringify(['/products/electro/smartphone-pro-max.png']), stock: 25, shopId: electroShop.id, categoryId: cats[0].id },
      { name: 'Smart TV 4K 55 pouces', description: 'Résolution 4K Ultra HD, HDR10+, Smart TV Android, HDMI x3, USB.', price: 320000, image: '/products/electro/smart-tv-4k.png', images: JSON.stringify(['/products/electro/smart-tv-4k.png']), stock: 15, shopId: electroShop.id, categoryId: cats[1].id },
      { name: 'PC Portable Ultra Slim i7', description: 'Intel Core i7 12ème génération, 16Go RAM, SSD 512Go, écran 15.6" Full HD.', price: 450000, image: '/products/electro/pc-portable.png', images: JSON.stringify(['/products/electro/pc-portable.png']), stock: 10, shopId: electroShop.id, categoryId: cats[2].id },
      { name: 'Écouteurs Bluetooth Premium', description: 'Réduction de bruit active ANC, autonomie 40h, Bluetooth 5.3, pliable.', price: 45000, image: '/products/electro/ecouteurs-bluetooth.png', images: JSON.stringify(['/products/electro/ecouteurs-bluetooth.png']), stock: 40, shopId: electroShop.id, categoryId: cats[1].id },
      { name: 'Robot Aspirateur Intelligent', description: 'Navigation laser, 3000Pa aspiration, 180min autonomie, contrôle via app.', price: 175000, image: '/products/electro/robot-aspirateur.png', images: JSON.stringify(['/products/electro/robot-aspirateur.png']), stock: 12, shopId: electroShop.id, categoryId: cats[4].id },
      { name: 'Enceinte Bluetooth Portable', description: '20W puissance, étanche IPX7, 24h autonomie, basses profondes.', price: 35000, image: '/products/electro/enceinte-portable.png', images: JSON.stringify(['/products/electro/enceinte-portable.png']), stock: 30, shopId: electroShop.id, categoryId: cats[1].id },
      { name: 'Climatiseur Split 12000 BTU', description: 'Inverter, faible consommation, thermostat intelligent, remote control inclus.', price: 280000, image: '/products/electro/climatiseur-split.png', images: JSON.stringify(['/products/electro/climatiseur-split.png']), stock: 8, shopId: electroShop.id, categoryId: cats[3].id },
      { name: 'Réfrigérateur Double Porte 400L', description: 'Noir inox, froid ventilé, clayettes verre, freezer 140L, classe A+.', price: 350000, image: '/products/electro/refrigerateur-double.png', images: JSON.stringify(['/products/electro/refrigerateur-double.png']), stock: 6, shopId: electroShop.id, categoryId: cats[3].id },
      { name: 'Robot Cuisine Multifonction', description: '12 fonctions, 1000W, bol 5L, cuve anti-adhésive, 30 programmes.', price: 125000, image: '/products/electro/robot-cuisine.png', images: JSON.stringify(['/products/electro/robot-cuisine.png']), stock: 18, shopId: electroShop.id, categoryId: cats[4].id },
      { name: 'Chargeur Sans Fil 3-en-1', description: 'Charge rapide 15W téléphone + 5W AirPods + 2W Apple Watch. LED indicateur.', price: 18500, image: '/products/electro/chargeur-sans-fil.png', images: JSON.stringify(['/products/electro/chargeur-sans-fil.png']), stock: 50, shopId: electroShop.id, categoryId: cats[0].id },
      { name: 'Montre Connectée Sport Pro', description: 'GPS, cardio, SpO2, étanche 5ATM, 14 jours autonomie, écran AMOLED.', price: 65000, image: '/products/electro/montre-smart.png', images: JSON.stringify(['/products/electro/montre-smart.png']), stock: 22, shopId: electroShop.id, categoryId: cats[4].id },
      { name: 'Console Gaming Edition Spéciale', description: '1To SSD, 2 manettes incluses, 4K 120fps, rétrocompatible, ray tracing.', price: 380000, image: '/products/electro/console-gaming.png', images: JSON.stringify(['/products/electro/console-gaming.png']), stock: 5, shopId: electroShop.id, categoryId: cats[5].id },
    ]
    for (const p of products) {
      await db.product.create({ data: { ...p, isAvailable: true } })
    }

    console.log('✅ ElectroDépôt demo shop created: electro@whatsshop.com / demo123')
    console.log('   URL: /electrodepot-demo')
  } else {
    console.log('ℹ️ ElectroDépôt shop already exists, skipping.')
  }
}

seed().catch(console.error).finally(() => process.exit(0))
