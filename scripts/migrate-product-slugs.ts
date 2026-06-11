import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
}

async function migrate() {
  const products = await db.product.findMany({
    select: { id: true, name: true, shopId: true, slug: true },
  })

  const withoutSlug = products.filter(p => !p.slug)
  console.log(`Found ${withoutSlug.length} products without slug (out of ${products.length} total)`)

  for (const p of withoutSlug) {
    let slug = slugify(p.name) || 'produit'
    const existing = await db.product.findFirst({ where: { shopId: p.shopId, slug, NOT: { id: p.id } } })
    if (existing) {
      let suffix = 2
      while (await db.product.findFirst({ where: { shopId: p.shopId, slug: `${slug}-${suffix}`, NOT: { id: p.id } } })) {
        suffix++
      }
      slug = `${slug}-${suffix}`
    }
    await db.product.update({ where: { id: p.id }, data: { slug } })
  }

  console.log('Migration complete!')
  await db.$disconnect()
}

migrate().catch(e => { console.error(e); process.exit(1) })