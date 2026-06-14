// ⚠️ DEVELOPMENT ONLY
if (process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: Demo seed script is FORBIDDEN in production environment!')
  process.exit(1)
}

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seedTestShops() {
  console.log('🎯 Seeding multi-sector test shops...')

  // ─── 1. User ───
  const existingUser = await db.user.findUnique({ where: { email: 'test@whatsshop.com' } })
  let userId: string
  if (existingUser) {
    userId = existingUser.id
  } else {
    const user = await db.user.create({
      data: { email: 'test@whatsshop.com', password: 'demo123', name: 'Test User', role: 'SELLER' },
    })
    userId = user.id
  }
  console.log('  ✓ User:', userId)

  const beautyImgs = ['serum-eclat', 'rouge-levres', 'parfum-oriental', 'huile-argan', 'coffret-soin', 'palette-maquillage', 'creme-hydratante', 'mascara-volume']

  // ─── Helper: clean + create shop with products ───
  async function createShop(data: {
    slug: string
    name: string
    sector: string
    businessType: string
    description: string
    whatsapp: string
    heroTitle: string
    heroSubtitle: string
    heroTagline: string
    heroImageUrl: string
    categoryNames: string[]
    items: { name: string; description: string; price: number; catIdx: number }[]
  }) {
    const existing = await db.shop.findUnique({ where: { slug: data.slug } })
    if (existing) {
      await db.order.deleteMany({ where: { shopId: existing.id } })
      await db.visit.deleteMany({ where: { shopId: existing.id } })
      await db.product.deleteMany({ where: { shopId: existing.id } })
      await db.category.deleteMany({ where: { shopId: existing.id } })
      await db.shop.delete({ where: { id: existing.id } })
    }

    const shop = await db.shop.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        whatsapp: data.whatsapp,
        plan: 'STANDARD',
        sector: data.sector as 'beaute',
        businessType: data.businessType as 'ECOMMERCE',
        template: 'cosmika-beauty',
        isActive: true,
        ownerId: userId,
        heroTitle: data.heroTitle,
        heroSubtitle: data.heroSubtitle,
        heroTagline: data.heroTagline,
        heroImageUrl: data.heroImageUrl,
        subscriptionStatus: 'ACTIVE',
      },
    })
    console.log(`  ✓ "${data.name}" created (${data.sector})`)

    const cats = await Promise.all(
      data.categoryNames.map((name) =>
        db.category.create({
          data: { name, shopId: shop.id, image: `/products/beauty/${beautyImgs[Math.floor(Math.random() * beautyImgs.length)]}.png` },
        })
      )
    )

    for (const item of data.items) {
      const img = beautyImgs[Math.floor(Math.random() * beautyImgs.length)]
      await db.product.create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          image: `/products/beauty/${img}.png`,
          images: JSON.stringify([`/products/beauty/${img}.png`]),
          isAvailable: true,
          stock: item.price > 0 ? 20 : undefined,
          shopId: shop.id,
          categoryId: cats[item.catIdx].id,
        },
      })
    }
    console.log(`    → ${cats.length} categories, ${data.items.length} items`)

    for (let i = 0; i < 8; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      await db.visit.create({ data: { shopId: shop.id, date: d } })
    }
  }

  // ─── 2. Restaurant (SERVICE) ───
  await createShop({
    slug: 'le-teranga',
    name: 'Le Teranga',
    sector: 'restaurant',
    businessType: 'SERVICE',
    description: 'Restaurant sénégalais authentique. Plats traditionnels cuisinés avec des produits locaux frais.',
    whatsapp: '221771234567',
    heroTitle: 'SAVEURS AUTHENTIQUES',
    heroSubtitle: 'Une expérience culinaire unique au cœur de la ville',
    heroTagline: 'GOÛT & TRADITION',
    heroImageUrl: '/banners/beauty-soins.png',
    categoryNames: ['Entrées', 'Plats', 'Desserts', 'Boissons'],
    items: [
      { name: 'Thiéboudienne', description: 'Le plat national. Riz au poisson, légumes et tamarind.', price: 3500, catIdx: 1 },
      { name: 'Yassa Poulet', description: 'Poulet mariné aux oignons et citron.', price: 3000, catIdx: 1 },
      { name: 'Mafé Mouton', description: 'Sauce arachide avec viande et patates douces.', price: 4000, catIdx: 1 },
      { name: 'Accra de Poisson', description: 'Beignets croustillants, sauce pimentée.', price: 1500, catIdx: 0 },
      { name: 'Salade Tropical', description: 'Mangue, ananas, papaye, vinaigrette gingembre.', price: 2000, catIdx: 0 },
      { name: 'Fondant Chocolat', description: 'Cœur coulant au chocolat noir.', price: 2500, catIdx: 2 },
      { name: 'Bissap Glacé', description: 'Jus d\'hibiscus frais maison.', price: 500, catIdx: 3 },
      { name: 'Gingembre Frais', description: 'Jus de gingembre citronné.', price: 500, catIdx: 3 },
    ],
  })

  // ─── 3. Consulting (SERVICE, no prices) ───
  await createShop({
    slug: 'diaspo-consulting',
    name: 'Diaspo Consulting',
    sector: 'consulting',
    businessType: 'SERVICE',
    description: 'Cabinet de conseil en stratégie digitale et transformation d\'entreprise.',
    whatsapp: '221778889900',
    heroTitle: 'EXPERTISE & CONSEIL',
    heroSubtitle: 'Accompagnement professionnel pour booster votre activité',
    heroTagline: 'PERFORMANCE & RÉSULTATS',
    heroImageUrl: '/banners/beauty-soins.png',
    categoryNames: ['Consultation', 'Formation', 'Audit', 'Accompagnement'],
    items: [
      { name: 'Audit Digital Complet', description: 'Analyse de votre présence en ligne et recommandations stratégiques.', price: 0, catIdx: 2 },
      { name: 'Stratégie Réseaux Sociaux', description: 'Stratégie social media sur 3 mois avec calendrier éditorial.', price: 0, catIdx: 0 },
      { name: 'Formation SEO & Marketing', description: '2 jours intensifs. Optimisation moteurs de recherche.', price: 150000, catIdx: 1 },
      { name: 'Accompagnement Startup', description: 'Mentorat mensuel. Pitch deck, business plan, levée de fonds.', price: 0, catIdx: 3 },
      { name: 'Branding & Identité Visuelle', description: 'Création de logo, charte graphique et guidelines.', price: 0, catIdx: 0 },
      { name: 'Formation E-commerce', description: 'Lancer et gérer votre boutique en ligne.', price: 75000, catIdx: 1 },
    ],
  })

  console.log('\n✨ Multi-sector test shops ready!')
  console.log('   E-commerce Beauté:  /jameela-beauty')
  console.log('   Service Restaurant: /le-teranga')
  console.log('   Service Consulting: /diaspo-consulting')
}

seedTestShops()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect().then(() => process.exit(0)))