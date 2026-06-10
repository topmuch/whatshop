import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, isValidSlug } from '@/lib/auth'
import { checkShopLimit, getOrCreateSubscription } from '@/lib/permissions'

// GET /api/shops?id=xxx or /api/shops?slug=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')

    if (id) {
      const shop = await db.shop.findUnique({
        where: { id },
        select: {
          id: true, name: true, slug: true, description: true, logo: true,
          banner: true, whatsapp: true, address: true, phone: true,
          plan: true, template: true, isActive: true,
          heroImages: true, promoBanners: true, brands: true,
          sector: true, createdAt: true,
        },
      })
      if (!shop) return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 })
      return NextResponse.json(shop)
    }

    if (slug) {
      const shop = await db.shop.findUnique({
        where: { slug },
        select: {
          id: true, name: true, slug: true, description: true, logo: true,
          banner: true, whatsapp: true, address: true, phone: true,
          plan: true, template: true, isActive: true,
          heroImages: true, promoBanners: true, brands: true,
          sector: true, createdAt: true,
        },
      })
      if (!shop) return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 })
      return NextResponse.json(shop)
    }

    return NextResponse.json({ error: 'ID ou slug requis' }, { status: 400 })
  } catch (error) {
    console.error('Shops GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/shops (auth required — owner only)
export async function PUT(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { id, name, description, whatsapp, address, phone, logo, banner, template, heroImages, promoBanners, brands } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Verify shop belongs to this user
    const shop = await db.shop.findFirst({ where: { id, ownerId: user.id } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined && name !== null) {
      const trimmed = (typeof name === 'string' ? name : '').trim()
      if (trimmed) data.name = trimmed
    }
    if (description !== undefined) data.description = description || null
    if (whatsapp !== undefined) data.whatsapp = whatsapp?.trim() || ''
    if (address !== undefined) data.address = address || null
    if (phone !== undefined) data.phone = phone || null
    if (logo !== undefined) data.logo = logo || null
    if (banner !== undefined) data.banner = banner || null
    if (template !== undefined) data.template = template || 'classic'
    if (heroImages !== undefined) data.heroImages = heroImages
    if (promoBanners !== undefined) data.promoBanners = promoBanners
    if (brands !== undefined) data.brands = brands

    const updatedShop = await db.shop.update({
      where: { id },
      data,
      select: {
        id: true, name: true, slug: true, description: true, logo: true,
        banner: true, whatsapp: true, address: true, phone: true,
        plan: true, template: true, isActive: true, sector: true,
        heroImages: true, promoBanners: true, brands: true,
      },
    })

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error('Shops PUT error:', error)
    const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/shops (auth required — creates shop for current user)
// Vérifie l'abonnement actif et la limite de boutiques avant de créer.
export async function POST(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { name, slug, description, whatsapp, template } = body

    if (!name || !slug || !whatsapp) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Validate slug format
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'Slug invalide. Utilisez 3-50 caractères alphanumériques minuscules et tirets.' },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existing = await db.shop.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 })
    }

    // ─── VÉRIFICATION ABONNEMENT ─────────────────────────────────────────────
    // Ensure user has a subscription record (auto-create STARTER/TRIAL if not)
    await getOrCreateSubscription(user.id)

    // Check shop limit
    const limitCheck = await checkShopLimit(user.id)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.message,
          currentCount: limitCheck.currentCount,
          maxAllowed: limitCheck.maxAllowed,
          planType: limitCheck.planType,
        },
        { status: 403 }
      )
    }
    // ─── FIN VÉRIFICATION ────────────────────────────────────────────────────

    const shop = await db.shop.create({
      data: {
        name: name.trim(),
        slug: slug.toLowerCase().trim(),
        description: description || null,
        whatsapp: whatsapp.trim(),
        ownerId: user.id,
        template: template || 'classic',
      },
    })

    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    console.error('Shops POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}