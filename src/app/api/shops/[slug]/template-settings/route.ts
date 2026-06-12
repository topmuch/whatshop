import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

// ─── HELPERS ──────────────────────────────────────────────────────────────────────

/** Parse a JSON string field into a JS value. Returns defaultValue on failure. */
function parseJsonField<T>(raw: unknown, defaultValue: T): T {
  if (!raw) return defaultValue
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return defaultValue
    }
  }
  // Already parsed (shouldn't happen from Prisma but handle gracefully)
  return raw as T
}

/** Fields that are safe to update on the Shop model. */
const ALLOWED_FIELDS = [
  'heroTitle',
  'heroSubtitle',
  'heroTagline',
  'heroImageUrl',
  'productsTitle',
  'productsTagline',
  'categoriesTitle',
  'categoriesTagline',
  'testimonialsTitle',
  'testimonialsTagline',
  'trustBadges',
  'footerLinks',
] as const

type AllowedField = (typeof ALLOWED_FIELDS)[number]

// ─── GET /api/shops/[slug]/template-settings ─────────────────────────────────────
// Public — no auth needed. Return template customization fields for a shop.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: {
        heroTitle: true,
        heroSubtitle: true,
        heroTagline: true,
        heroImageUrl: true,
        productsTitle: true,
        productsTagline: true,
        categoriesTitle: true,
        categoriesTagline: true,
        testimonialsTitle: true,
        testimonialsTagline: true,
        trustBadges: true,
        footerLinks: true,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      heroTitle: shop.heroTitle,
      heroSubtitle: shop.heroSubtitle,
      heroTagline: shop.heroTagline,
      heroImageUrl: shop.heroImageUrl,
      productsTitle: shop.productsTitle,
      productsTagline: shop.productsTagline,
      categoriesTitle: shop.categoriesTitle,
      categoriesTagline: shop.categoriesTagline,
      testimonialsTitle: shop.testimonialsTitle,
      testimonialsTagline: shop.testimonialsTagline,
      trustBadges: parseJsonField(shop.trustBadges, []),
      footerLinks: parseJsonField(shop.footerLinks, []),
    })
  } catch (error) {
    console.error('Template settings GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── PUT /api/shops/[slug]/template-settings ─────────────────────────────────────
// Auth required — shop owner only. Update template customization fields.
export async function PUT(
  request: NextRequest,
  _context: { params: Promise<{ slug: string }> }
) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()

    // Validate and build update data — only include allowed fields
    const data: Record<string, unknown> = {}

    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        if (key === 'trustBadges') {
          // Validate trustBadges as JSON array
          if (!Array.isArray(body[key])) {
            return NextResponse.json(
              { error: 'trustBadges doit être un tableau' },
              { status: 400 }
            )
          }
          // Validate each badge has required fields
          for (let i = 0; i < body[key].length; i++) {
            const badge = body[key][i]
            if (!badge.emoji || !badge.title || typeof badge.order !== 'number') {
              return NextResponse.json(
                { error: `Badge invalide à l'index ${i}: champs emoji, title et order requis` },
                { status: 400 }
              )
            }
          }
          data[key] = JSON.stringify(body[key])
        } else if (key === 'footerLinks') {
          // Validate footerLinks as JSON array
          if (!Array.isArray(body[key])) {
            return NextResponse.json(
              { error: 'footerLinks doit être un tableau' },
              { status: 400 }
            )
          }
          // Validate each link has required fields
          for (let i = 0; i < body[key].length; i++) {
            const link = body[key][i]
            if (!link.section || !link.label || !link.url) {
              return NextResponse.json(
                { error: `Lien invalide à l'index ${i}: champs section, label et url requis` },
                { status: 400 }
              )
            }
          }
          data[key] = JSON.stringify(body[key])
        } else {
          // Simple string fields
          data[key] = body[key] || null
        }
      }
    }

    // If nothing to update, return current settings
    if (Object.keys(data).length === 0) {
      const currentShop = await db.shop.findUnique({
        where: { id: user.shop.id },
        select: {
          heroTitle: true, heroSubtitle: true, heroTagline: true, heroImageUrl: true,
          productsTitle: true, productsTagline: true,
          categoriesTitle: true, categoriesTagline: true,
          testimonialsTitle: true, testimonialsTagline: true,
          trustBadges: true, footerLinks: true,
        },
      })
      if (!currentShop) {
        return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
      }
      return NextResponse.json({
        heroTitle: currentShop.heroTitle,
        heroSubtitle: currentShop.heroSubtitle,
        heroTagline: currentShop.heroTagline,
        heroImageUrl: currentShop.heroImageUrl,
        productsTitle: currentShop.productsTitle,
        productsTagline: currentShop.productsTagline,
        categoriesTitle: currentShop.categoriesTitle,
        categoriesTagline: currentShop.categoriesTagline,
        testimonialsTitle: currentShop.testimonialsTitle,
        testimonialsTagline: currentShop.testimonialsTagline,
        trustBadges: parseJsonField(currentShop.trustBadges, []),
        footerLinks: parseJsonField(currentShop.footerLinks, []),
      })
    }

    const updatedShop = await db.shop.update({
      where: { id: user.shop.id },
      data,
      select: {
        heroTitle: true, heroSubtitle: true, heroTagline: true, heroImageUrl: true,
        productsTitle: true, productsTagline: true,
        categoriesTitle: true, categoriesTagline: true,
        testimonialsTitle: true, testimonialsTagline: true,
        trustBadges: true, footerLinks: true,
      },
    })

    return NextResponse.json({
      heroTitle: updatedShop.heroTitle,
      heroSubtitle: updatedShop.heroSubtitle,
      heroTagline: updatedShop.heroTagline,
      heroImageUrl: updatedShop.heroImageUrl,
      productsTitle: updatedShop.productsTitle,
      productsTagline: updatedShop.productsTagline,
      categoriesTitle: updatedShop.categoriesTitle,
      categoriesTagline: updatedShop.categoriesTagline,
      testimonialsTitle: updatedShop.testimonialsTitle,
      testimonialsTagline: updatedShop.testimonialsTagline,
      trustBadges: parseJsonField(updatedShop.trustBadges, []),
      footerLinks: parseJsonField(updatedShop.footerLinks, []),
    })
  } catch (error) {
    console.error('Template settings PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
