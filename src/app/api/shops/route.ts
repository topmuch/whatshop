import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shops?id=xxx or /api/shops?slug=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')

    if (id) {
      const shop = await db.shop.findUnique({ where: { id } })
      if (!shop) return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 })
      return NextResponse.json(shop)
    }

    if (slug) {
      const shop = await db.shop.findUnique({ where: { slug } })
      if (!shop) return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 })
      return NextResponse.json(shop)
    }

    return NextResponse.json({ error: 'ID ou slug requis' }, { status: 400 })
  } catch (error) {
    console.error('Shops GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/shops
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, whatsapp, address, phone, logo, banner, template, heroImages, promoBanners } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description || null
    if (whatsapp !== undefined) data.whatsapp = whatsapp
    if (address !== undefined) data.address = address || null
    if (phone !== undefined) data.phone = phone || null
    if (logo !== undefined) data.logo = logo || null
    if (banner !== undefined) data.banner = banner || null
    if (template !== undefined) data.template = template || 'classic'
    if (heroImages !== undefined) data.heroImages = heroImages
    if (promoBanners !== undefined) data.promoBanners = promoBanners

    const shop = await db.shop.update({
      where: { id },
      data,
    })

    return NextResponse.json(shop)
  } catch (error) {
    console.error('Shops PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/shops (create shop)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, whatsapp, ownerId, template } = body

    if (!name || !slug || !whatsapp || !ownerId) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Check slug uniqueness
    const existing = await db.shop.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 })
    }

    const shop = await db.shop.create({
      data: {
        name,
        slug,
        description: description || null,
        whatsapp,
        ownerId,
        template: template || 'classic',
      },
    })

    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    console.error('Shops POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
