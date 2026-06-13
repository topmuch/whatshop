/**
 * scripts/migrate-shops-sector.ts
 *
 * Migration script for existing shops that were created BEFORE
 * the new onboarding system (no sector field set).
 *
 * Since `businessType` defaults to "ECOMMERCE" in the schema,
 * we target shops where `sector` IS NULL.
 *
 * Usage:
 *   bun run scripts/migrate-shops-sector.ts          # Dry-run (shows what would change)
 *   bun run scripts/migrate-shops-sector.ts --apply   # Actually applies the migration
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const SHOULD_APPLY = process.argv.includes('--apply')

interface ShopRow {
  id: string
  name: string
  slug: string
  template: string
  businessType: string
  sector: string | null
  createdAt: Date
}

interface MigrationAction {
  shop: ShopRow
  newBusinessType: string
  newSector: string
  newTemplate: string
  reason: string
}

function determineMigration(shop: ShopRow): MigrationAction {
  const template = shop.template || 'xstore-electro'

  if (template === 'cosmika-beauty') {
    return {
      shop,
      newBusinessType: 'ECOMMERCE',
      newSector: 'beaute',
      newTemplate: 'cosmika-beauty',
      reason: 'Template cosmika → défaut Beauté E-commerce',
    }
  }

  if (template === 'xstore-electro') {
    return {
      shop,
      newBusinessType: 'ECOMMERCE',
      newSector: 'electronique',
      newTemplate: 'xstore-electro',
      reason: 'Template electro → défaut Tech E-commerce',
    }
  }

  return {
    shop,
    newBusinessType: 'ECOMMERCE',
    newSector: 'autre',
    newTemplate: 'cosmika-beauty',
    reason: 'Template inconnu → défaut E-commerce Généraliste',
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║  Migration : Ajout sector aux boutiques existantes        ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log()

  if (!SHOULD_APPLY) {
    console.log('⚠️  MODE DRY-RUN — Aucune modification ne sera appliquée.')
    console.log('   Utilisez --apply pour exécuter la migration.')
    console.log()
  } else {
    console.log('🚀 MODE APPLICATION — Les modifications seront appliquées.')
    console.log()
  }

  // Find shops with no sector assigned
  const shopsToMigrate = await db.shop.findMany({
    where: {
      sector: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      template: true,
      businessType: true,
      sector: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  if (shopsToMigrate.length === 0) {
    console.log('✅ Toutes les boutiques ont déjà un sector. Aucune migration nécessaire.')
    await db.$disconnect()
    return
  }

  console.log(`📋 ${shopsToMigrate.length} boutique(s) à migrer :\n`)

  const actions: MigrationAction[] = shopsToMigrate.map(determineMigration)

  for (const action of actions) {
    const { shop, newBusinessType, newSector, newTemplate, reason } = action
    console.log(`  🏪 "${shop.name}" (${shop.slug})`)
    console.log(`     businessType actuel : ${shop.businessType}`)
    console.log(`     template actuel     : ${shop.template}`)
    console.log(`     → businessType     : ${newBusinessType}`)
    console.log(`     → sector           : ${newSector}`)
    console.log(`     → template         : ${newTemplate}`)
    console.log(`     Raison : ${reason}`)
    console.log()
  }

  const alreadyOk = await db.shop.count({
    where: { sector: { not: null } },
  })
  console.log(`📊 Résumé : ${actions.length} à migrer, ${alreadyOk} déjà OK`)

  if (SHOULD_APPLY) {
    console.log('\n⚡ Application de la migration...')

    let success = 0
    let errors = 0

    for (const action of actions) {
      try {
        await db.shop.update({
          where: { id: action.shop.id },
          data: {
            businessType: action.newBusinessType,
            sector: action.newSector,
            template: action.newTemplate,
          },
        })
        success++
        console.log(`  ✅ "${action.shop.name}" migré avec succès`)
      } catch (err) {
        errors++
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        console.log(`  ❌ "${action.shop.name}" : ${msg}`)
      }
    }

    console.log(`\n📊 Résultat : ${success} succès, ${errors} erreur(s)`)
  }

  await db.$disconnect()
}

main().catch((err) => {
  console.error('Erreur fatale lors de la migration :', err)
  process.exit(1)
})