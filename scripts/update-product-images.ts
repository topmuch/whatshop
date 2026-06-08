import { db } from './src/lib/db'

// Map product names to their image paths
const IMAGE_MAP: Record<string, string> = {
  'Robe Wax Élégante': '/products/robe-wax-elegante.png',
  'Boubou Grand Modèle': '/products/boubou-grand-modele.png',
  'Tunique Kente': '/products/tunique-kente.png',
  'Sac À Main Cuir': '/products/sac-main-cuir.png',
  'Ensemble Bijoux Dorés': '/products/ensemble-bijoux-dores.png',
  'Pagne Wax Premium': '/products/pagne-wax-premium.png',
  'Robe Cocktail': '/products/robe-cocktail.png',
  'Foulard en Soie': '/products/foulard-soie.png',
  'Robe Wax Colorée': '/products/robe-wax-coloree.png',
  'Ensemble Coiffure': '/products/ensemble-coiffure.png',
  'Collier Perles Africaines': '/products/collier-perles-africaines.png',
  'Sac Tissu Kente': '/products/sac-tissu-kente.png',
}

async function updateImages() {
  console.log('Updating product images...')

  const products = await db.product.findMany({
    where: { image: null },
  })

  let updated = 0
  for (const product of products) {
    const imagePath = IMAGE_MAP[product.name]
    if (imagePath) {
      await db.product.update({
        where: { id: product.id },
        data: { image: imagePath },
      })
      console.log(`  ✓ ${product.name} → ${imagePath}`)
      updated++
    } else {
      console.log(`  ⚠ ${product.name} → no image mapping found`)
    }
  }

  console.log(`\nDone! Updated ${updated} products with images.`)
}

updateImages().catch(console.error).finally(() => process.exit(0))
