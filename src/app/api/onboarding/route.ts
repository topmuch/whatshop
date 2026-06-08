import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Sector → Template mapping
const sectorTemplateMap: Record<string, string> = {
  beaute: 'jameela',
  mode: 'africa',
  electronique: 'neon',
  alimentation: 'classic',
  artisanat: 'elegant',
  sport: 'ocean',
  bijoux: 'elegant',
  maison: 'sunset',
  auto: 'minimal',
  autre: 'classic',
}

// Sector → Default categories
const sectorCategoriesMap: Record<string, string[]> = {
  beaute: ['Maquillage', 'Soins', 'Parfums', 'Accessoires Beauté'],
  mode: ['Robes', 'Accessoires', 'Chaussures', 'Hauts'],
  electronique: ['Téléphones', 'Accessoires', 'Ordinateurs', 'Audio'],
  alimentation: ['Boissons', 'Snacks', 'Conserves', 'Épices'],
  artisanat: ['Sculptures', 'Tissus', 'Bijoux Artisanaux', 'Décorations'],
  sport: ['Équipements', 'Vêtements Sport', 'Accessoires', 'Nutrition'],
  bijoux: ['Bagues', 'Colliers', 'Bracelets', 'Boucles d\'oreilles'],
  maison: ['Décoration', 'Meubles', 'Cuisine', 'Linge de maison'],
  auto: ['Pièces détachées', 'Accessoires Auto', 'Entretien', 'Électronique Auto'],
  autre: ['Produits', 'Services', 'Divers'],
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, slug, whatsapp, address, phone, plan, sector, logo } = body

    if (!userId || !name || !whatsapp) {
      return NextResponse.json(
        { error: 'Informations manquantes (nom, whatsapp requis)' },
        { status: 400 }
      )
    }

    // Check if user already has a shop
    const existingShop = await db.shop.findUnique({ where: { ownerId: userId } })
    if (existingShop) {
      return NextResponse.json(
        { error: 'Vous avez déjà une boutique' },
        { status: 400 }
      )
    }

    // Auto-assign template based on sector
    const template = sectorTemplateMap[sector] || 'classic'

    // Create the shop
    const shop = await db.shop.create({
      data: {
        name,
        slug,
        whatsapp,
        address: address || null,
        phone: phone || null,
        plan: plan || 'FREE',
        sector: sector || null,
        template,
        logo: logo || null,
        ownerId: userId,
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

    return NextResponse.json(shop)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
