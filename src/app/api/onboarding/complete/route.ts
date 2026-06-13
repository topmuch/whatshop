import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { getDefaultCategories, getTemplateForSector } from '@/lib/sector-config'

// ─── SLUG GENERATION ─────────────────────────────────────────────────────

/**
 * Generate a URL-friendly slug from a shop name.
 * - Lowercase
 * - Remove accents via NFD normalisation
 * - Replace non-alphanumeric sequences with a single hyphen
 * - Trim leading/trailing hyphens
 * - Max 50 characters
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

// ─── POST HANDLER ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──
    const { user, response: authError } = await requireAuth(request)
    if (authError) return authError
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // ── Parse body ──
    const body = await request.json()
    const { businessType, sector, name, whatsapp, description, logo, plan } = body as {
      businessType?: string
      sector?: string
      name?: string
      whatsapp?: string
      description?: string
      logo?: string
      plan?: string
    }

    // ── Validation ──
    if (!name || !whatsapp) {
      return NextResponse.json(
        { error: 'Informations manquantes (nom et whatsapp requis)' },
        { status: 400 },
      )
    }

    if (!businessType || !['ECOMMERCE', 'SERVICE'].includes(businessType)) {
      return NextResponse.json(
        { error: "Type d'activité invalide (ECOMMERCE ou SERVICE requis)" },
        { status: 400 },
      )
    }

    // ── Duplicate shop check ──
    const existingShop = await db.shop.findFirst({ where: { ownerId: user.id } })
    if (existingShop) {
      return NextResponse.json(
        { error: 'Vous avez déjà une boutique' },
        { status: 400 },
      )
    }

    // ── Slug generation (ensure uniqueness) ──
    let slug = generateSlug(name)
    const slugExists = await db.shop.findUnique({ where: { slug } })
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // ── Template from sector-config ──
    const template = getTemplateForSector(sector)

    // ── Trial end date ──
    const trialEndDate = plan === 'TRIAL'
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : null

    // ── Create shop ──
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

    // ── Auto-create default categories from sector-config ──
    const categories = getDefaultCategories(sector)
    await db.category.createMany({
      data: categories.map((catName) => ({
        name: catName,
        shopId: shop.id,
      })),
    })

    // ── Fire-and-forget notification ──
    try {
      await createNotification(
        'NEW_SHOP',
        'Nouvelle boutique créée',
        `La boutique "${shop.name}" (${businessType}) a été créée par ${user.name}.`,
        { shopId: shop.id, shopName: shop.name, ownerId: user.id, ownerName: user.name },
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