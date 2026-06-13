// ⚠️ DEVELOPMENT ONLY - This script will NOT run in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: Demo seed script is FORBIDDEN in production environment!')
  console.error('   Demo shops should never exist in production.')
  process.exit(1)
}

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seedBeautyShop() {
  console.log('🌸 Creating Jameela Beauty shop (DEV only)...')

  // 1. Create user
  const existingUser = await db.user.findUnique({ where: { email: 'jameela@whatsshop.com' } })
  let userId: string
  if (existingUser) {
    userId = existingUser.id
    console.log('  ✓ User exists:', userId)
  } else {
    const user = await db.user.create({
      data: {
        email: 'jameela@whatsshop.com',
        password: 'demo123',
        name: 'Jameela Beauty',
        role: 'SELLER',
      },
    })
    userId = user.id
    console.log('  ✓ User created:', userId)
  }

  // 2. Remove existing shop if any
  const existingShop = await db.shop.findUnique({ where: { slug: 'jameela-beauty' } })
  if (existingShop) {
    await db.order.deleteMany({ where: { shopId: existingShop.id } })
    await db.visit.deleteMany({ where: { shopId: existingShop.id } })
    await db.product.deleteMany({ where: { shopId: existingShop.id } })
    await db.category.deleteMany({ where: { shopId: existingShop.id } })
    await db.shop.delete({ where: { id: existingShop.id } })
  }

  // 3. Create shop
  const shop = await db.shop.create({
    data: {
      name: 'Jameela Beauty',
      slug: 'jameela-beauty',
      description: 'Votre destination beauté premium au Sénégal. Soins luxueux, maquillage professionnel et parfums de qualité.',
      whatsapp: '2217848582226',
      address: 'Almadies, Dakar, Sénégal',
      phone: '2217848582226',
      plan: 'STANDARD',
      sector: 'beaute',
      template: 'cosmika-beauty',
      heroTitle: 'GLAMOUR SHINE',
      heroSubtitle: 'Découvrez notre nouvelle collection de cosmétiques premium',
      heroTagline: 'ILLUMINATE DAILY',
      heroImageUrl: '/banners/beauty-soins.png',
      isActive: true,
      ownerId: userId,
      seoTitle: 'Jameela Beauty - Boutique Beauté Premium à Dakar',
      seoDescription: 'Découvrez les meilleurs soins beauté, maquillage et parfums de luxe au Sénégal.',
      coverImageUrl: '/products/beauty/coffret-soin.png',
      subscriptionStatus: 'ACTIVE',
    },
  })
  console.log('  ✓ Shop created:', shop.id)

  // 4. Create categories
  const cats = await Promise.all([
    db.category.create({ data: { name: 'Soins Visage', description: 'Sérums, crèmes et masques', shopId: shop.id, image: '/products/beauty/serum-eclat.png' } }),
    db.category.create({ data: { name: 'Maquillage', description: 'Rouges, palettes et mascaras', shopId: shop.id, image: '/products/beauty/rouge-levres.png' } }),
    db.category.create({ data: { name: 'Parfums', description: 'Parfums luxueux et brumes', shopId: shop.id, image: '/products/beauty/parfum-oriental.png' } }),
    db.category.create({ data: { name: 'Soin Corps', description: 'Huiles et crèmes corps', shopId: shop.id, image: '/products/beauty/huile-argan.png' } }),
    db.category.create({ data: { name: 'Coffrets Cadeaux', description: 'Ensembles prestige', shopId: shop.id, image: '/products/beauty/coffret-soin.png' } }),
    db.category.create({ data: { name: 'Accessoires', description: 'Pinceaux, miroirs et accessoires', shopId: shop.id, image: '/products/beauty/palette-maquillage.png' } }),
  ])
  console.log('  ✓ Categories:', cats.length)

  // 5. Products
  const products = [
    { name: 'Sérum Éclat Doré', description: 'Sérum anti-âge vitamine C et acide hyaluronique. Illumine et raffermis. 30ml.', price: 12500, image: '/products/beauty/serum-eclat.png', images: JSON.stringify(['/products/beauty/serum-eclat.png']), stock: 25, shopId: shop.id, categoryId: cats[0].id },
    { name: 'Crème Hydratante Luxe', description: 'Crème au beurre de karité et collagène. Nourrit en profondeur. 50ml.', price: 8500, image: '/products/beauty/creme-hydratante.png', images: JSON.stringify(['/products/beauty/creme-hydratante.png']), stock: 30, shopId: shop.id, categoryId: cats[0].id },
    { name: 'Masque Visage Gold', description: 'Masque peel-off à l\'or 24K. Détoxifie et illumine. Pack de 3.', price: 6500, image: '/products/beauty/masque-or.png', images: JSON.stringify(['/products/beauty/masque-or.png']), stock: 40, shopId: shop.id, categoryId: cats[0].id },
    { name: 'Fond de Teint Parfait', description: 'Fond de teint longue tenue, fini naturel. 6 teintes. 30ml.', price: 7500, image: '/products/beauty/fond-teint.png', images: JSON.stringify(['/products/beauty/fond-teint.png']), stock: 35, shopId: shop.id, categoryId: cats[0].id },
    { name: 'Rouge à Lèvres Velours', description: 'Rouge mat longue tenue. Teinte "Burgundy Dream". 3.5g.', price: 4500, image: '/products/beauty/rouge-levres.png', images: JSON.stringify(['/products/beauty/rouge-levres.png']), stock: 50, shopId: shop.id, categoryId: cats[1].id },
    { name: 'Palette Yeux Sahara', description: '12 fards tons chauds : nuds, bruns, dorés. Haute tenue.', price: 9500, image: '/products/beauty/palette-maquillage.png', images: JSON.stringify(['/products/beauty/palette-maquillage.png']), stock: 20, shopId: shop.id, categoryId: cats[1].id },
    { name: 'Mascara Volume Extrême', description: 'Mascara effet faux cils. Allonge et volumine. Waterproof 24h.', price: 5500, image: '/products/beauty/mascara-volume.png', images: JSON.stringify(['/products/beauty/mascara-volume.png']), stock: 45, shopId: shop.id, categoryId: cats[1].id },
    { name: 'Parfum Oriental Royal', description: 'Eau de parfum oud, rose et ambre. Sillage envoûtant. 100ml.', price: 18000, image: '/products/beauty/parfum-oriental.png', images: JSON.stringify(['/products/beauty/parfum-oriental.png']), stock: 15, shopId: shop.id, categoryId: cats[2].id },
    { name: 'Brume Florale de Roses', description: 'Brume aux pétales de rose et jasmin. 200ml.', price: 5500, image: '/products/beauty/brume-florale.png', images: JSON.stringify(['/products/beauty/brume-florale.png']), stock: 30, shopId: shop.id, categoryId: cats[2].id },
    { name: "Huile d'Argan Bio", description: 'Huile vierge bio pure. Nourrit peau et cheveux. 100ml.', price: 8000, image: '/products/beauty/huile-argan.png', images: JSON.stringify(['/products/beauty/huile-argan.png']), stock: 20, shopId: shop.id, categoryId: cats[3].id },
    { name: 'Crème Mains Soyeuse', description: "Crème à l'huile d'amande et beurre de cacao. 75ml.", price: 3500, image: '/products/beauty/creme-mains.png', images: JSON.stringify(['/products/beauty/creme-mains.png']), stock: 50, shopId: shop.id, categoryId: cats[3].id },
    { name: 'Coffret Soin Complet Prestige', description: 'Coffret : Sérum + Crème + Masque Gold. Packaging doré.', price: 25000, image: '/products/beauty/coffret-soin.png', images: JSON.stringify(['/products/beauty/coffret-soin.png']), stock: 10, shopId: shop.id, categoryId: cats[4].id },
  ]

  for (const p of products) {
    await db.product.create({ data: { ...p, isAvailable: true } })
  }
  console.log('  ✓ Products:', products.length)

  // 6. Visits
  for (let i = 0; i < 28; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    await db.visit.create({ data: { shopId: shop.id, date: d } })
  }
  console.log('  ✓ Visits: 28')

  // 7. Sample orders
  await db.order.create({ data: { shopId: shop.id, items: JSON.stringify([{ name: 'Sérum Éclat Doré', price: 12500, quantity: 1 }]), total: 12500, customerName: 'Aminata D.', status: 'DELIVERED' } })
  await db.order.create({ data: { shopId: shop.id, items: JSON.stringify([{ name: 'Rouge à Lèvres Velours', price: 4500, quantity: 2 }]), total: 9000, customerName: 'Fatou S.', status: 'CONFIRMED' } })
  await db.order.create({ data: { shopId: shop.id, items: JSON.stringify([{ name: 'Coffret Soin Prestige', price: 25000, quantity: 1 }]), total: 25000, customerName: 'Khady M.', status: 'PENDING' } })
  await db.order.create({ data: { shopId: shop.id, items: JSON.stringify([{ name: 'Parfum Oriental Royal', price: 18000, quantity: 1 }]), total: 18000, customerName: 'Mariama B.', status: 'DELIVERED' } })
  console.log('  ✓ Orders: 4')

  console.log('\n✨ Jameela Beauty shop ready!')
  console.log('   URL: /jameela-beauty')
  console.log('   WhatsApp: +2217848582226')
}

seedBeautyShop()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect().then(() => process.exit(0)))
