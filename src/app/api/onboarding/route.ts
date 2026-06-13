import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, isValidSlug } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

// Sector → Template mapping
const sectorTemplateMap: Record<string, string> = {
  // ECOMMERCE sectors
  beaute: 'cosmika-beauty',
  mode: 'cosmika-beauty',
  electronique: 'xstore-electro',
  alimentation: 'xstore-electro',
  autre: 'xstore-electro',
  // SERVICE sectors
  'beaute-service': 'cosmika-beauty',
  restaurant: 'cosmika-beauty',
  consulting: 'xstore-electro',
  artisanat: 'xstore-electro',
  sante: 'cosmika-beauty',
}

// Sector → Default categories
const sectorCategoriesMap: Record<string, string[]> = {
  beaute: ['Maquillage', 'Soins', 'Parfums', 'Accessoires Beauté'],
  mode: ['Robes', 'Accessoires', 'Chaussures', 'Hauts'],
  electronique: ['Téléphones', 'Accessoires', 'Ordinateurs', 'Audio'],
  alimentation: ['Boissons', 'Snacks', 'Conserves', 'Épices'],
  autre: ['Produits', 'Divers'],
  'beaute-service': ['Maquillage', 'Coiffure', 'Soins', 'Ongles'],
  restaurant: ['Plats du jour', 'Boissons', 'Desserts', 'Menus spéciaux'],
  consulting: ['Consultation', 'Formation', 'Audit', 'Accompagnement'],
  artisanat: ['Services', 'Réparations', 'Installations', 'Devis'],
  sante: ['Consultations', 'Coaching', 'Soins', 'Programmes'],
}

// Slug generation: convert name to URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

export async function POST(request: NextRequest) {
  try {
    const { user, response: authError } = await requireAuth(request)
    if (authError) return authError
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = await request.json()
    const {
      businessType,
      sector,
      template: templateOverride,
      name,
      whatsapp,
      description,
      logo,
      plan,
    } = body

    if (!businessType || !name || !whatsapp) {
      return NextResponse.json(
        { error: 'Informations manquantes (type d\'activité, nom, whatsapp requis)' },
        { status: 400 }
      )
    }

    if (!['ECOMMERCE', 'SERVICE'].includes(businessType)) {
      return NextResponse.json({ error: 'Type d\'activité invalide' }, { status: 400 })
    }

    // Check if user already has a shop
    const existingShop = await db.shop.findFirst({ where: { ownerId: user.id } })
    if (existingShop) {
      return NextResponse.json(
        { error: 'Vous avez déjà une boutique' },
        { status: 400 }
      )
    }

    // Auto-assign template based on sector, or use override
    const template = templateOverride || sectorTemplateMap[sector] || 'xstore-electro'

    // Generate slug from name, ensure uniqueness
    let slug = generateSlug(name)
    const slugExists = await db.shop.findUnique({ where: { slug } })
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Calculate trial end date if TRIAL plan
    const trialEndDate = plan === 'TRIAL'
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      : null

    // Create the shop
    const shop = await db.shop.create({
      data: {
        name,
        slug,
        whatsapp: whatsapp.trim(),
        description: description || null,
        logo: logo || null,
        plan: plan || 'TRIAL',
        trialEndDate,
        businessType,
        sector: sector || null,
        template,
        ownerId: user.id,
        isActive: true,
      },
    })

    // Auto-create categories based on sector
    const categories = sectorCategoriesMap[sector] || ['Produits', 'Divers']
    await db.category.createMany({
      data: categories.map((catName) => ({
        name: catName,
        shopId: shop.id,
      })),
    })

    // Fire-and-forget notification
    try {
      await createNotification(
        'NEW_SHOP',
        'Nouvelle boutique créée',
        `La boutique "${shop.name}" (${businessType}) a été créée par ${user.name}.`,
        { shopId: shop.id, shopName: shop.name, ownerId: user.id, ownerName: user.name }
      )
    } catch {
      // Notification failure must not break onboarding
    }

    return NextResponse.json(shop)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}