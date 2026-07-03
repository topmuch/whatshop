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

/** Direct DB columns managed by this endpoint */
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

/** Fields stored inside the customColors JSON column */
const CUSTOM_COLORS_FIELDS = ['buttonColor', 'logoSize'] as const

type AllowedField = (typeof ALLOWED_FIELDS)[number]

/** Build the response object from raw DB rows */
function buildResponse(shop: {
  heroTitle: string | null
  heroSubtitle: string | null
  heroTagline: string | null
  heroImageUrl: string | null
  productsTitle: string | null
  productsTagline: string | null
  categoriesTitle: string | null
  categoriesTagline: string | null
  testimonialsTitle: string | null
  testimonialsTagline: string | null
  trustBadges: string | null
  footerLinks: string | null
  customColors: string | null
}) {
  const colors = parseJsonField<Record<string, string>>(shop.customColors, {})
  return {
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
    buttonColor: colors.buttonColor || '',
    logoSize: colors.logoSize || '',
  }
}

const SELECT_FIELDS = {
  heroTitle: true, heroSubtitle: true, heroTagline: true, heroImageUrl: true,
  productsTitle: true, productsTagline: true,
  categoriesTitle: true, categoriesTagline: true,
  testimonialsTitle: true, testimonialsTagline: true,
  trustBadges: true, footerLinks: true,
  customColors: true,
} as const

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
      select: SELECT_FIELDS,
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    return NextResponse.json(buildResponse(shop))
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
          if (!Array.isArray(body[key])) {
            return NextResponse.json({ error: 'trustBadges doit être un tableau' }, { status: 400 })
          }
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
          if (!Array.isArray(body[key])) {
            return NextResponse.json({ error: 'footerLinks doit être un tableau' }, { status: 400 })
          }
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
          data[key] = body[key] || null
        }
      }
    }

    // Handle buttonColor / logoSize → merge into customColors JSON
    const hasCustomField = CUSTOM_COLORS_FIELDS.some(f => body[f] !== undefined)
    if (hasCustomField) {
      const currentShop = await db.shop.findUnique({
        where: { id: user.shop.id },
        select: { customColors: true },
      })
      const currentColors = parseJsonField<Record<string, string>>(currentShop?.customColors, {})

      for (const field of CUSTOM_COLORS_FIELDS) {
        if (body[field] !== undefined) {
          if (body[field]) {
            currentColors[field] = body[field]
          } else {
            delete currentColors[field]
          }
        }
      }

      data.customColors = JSON.stringify(currentColors)
    }

    // If nothing to update, return current settings
    if (Object.keys(data).length === 0) {
      const currentShop = await db.shop.findUnique({
        where: { id: user.shop.id },
        select: SELECT_FIELDS,
      })
      if (!currentShop) {
        return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
      }
      return NextResponse.json(buildResponse(currentShop))
    }

    const updatedShop = await db.shop.update({
      where: { id: user.shop.id },
      data,
      select: SELECT_FIELDS,
    })

    return NextResponse.json(buildResponse(updatedShop))
  } catch (error) {
    console.error('Template settings PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}