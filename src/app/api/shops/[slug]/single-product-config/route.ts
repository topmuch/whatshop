import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'
import {
  parseSingleProductConfig,
  type SingleProductConfig,
} from '@/lib/single-product-types'

export const dynamic = 'force-dynamic'

const VALID_TEMPLATE_TYPES = ['STANDARD', 'SINGLE_PRODUCT'] as const
type TemplateType = (typeof VALID_TEMPLATE_TYPES)[number]

function isValidTemplateType(value: unknown): value is TemplateType {
  return typeof value === 'string' && (VALID_TEMPLATE_TYPES as readonly string[]).includes(value)
}

// ─── GET /api/shops/[slug]/single-product-config ──────────────────────────────
// Public — return the parsed config + templateType for a shop.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: { templateType: true, singleProductConfig: true },
    })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const config = parseSingleProductConfig(shop.singleProductConfig)

    return NextResponse.json({
      templateType: shop.templateType,
      config,
    })
  } catch (error) {
    console.error('Single product config GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── PUT /api/shops/[slug]/single-product-config ──────────────────────────────
// Auth required — owner only.
// Body: { templateType?, config?: SingleProductConfig }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { user, response: errorResponse, shop } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    if (shop.slug !== slug) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { templateType, config } = body

    const data: Record<string, unknown> = {}

    if (templateType !== undefined) {
      if (!isValidTemplateType(templateType)) {
        return NextResponse.json(
          { error: 'templateType invalide (STANDARD ou SINGLE_PRODUCT)' },
          { status: 400 }
        )
      }
      data.templateType = templateType
    }

    if (config !== undefined) {
      if (config === null || typeof config !== 'object' || Array.isArray(config)) {
        return NextResponse.json(
          { error: 'config doit être un objet SingleProductConfig' },
          { status: 400 }
        )
      }
      data.singleProductConfig = JSON.stringify(config as SingleProductConfig)
    }

    if (Object.keys(data).length === 0) {
      const current = await db.shop.findUnique({
        where: { id: shop.id },
        select: { templateType: true, singleProductConfig: true },
      })
      return NextResponse.json({
        templateType: current?.templateType ?? 'STANDARD',
        config: parseSingleProductConfig(current?.singleProductConfig),
      })
    }

    const updated = await db.shop.update({
      where: { id: shop.id },
      data,
      select: { templateType: true, singleProductConfig: true },
    })

    return NextResponse.json({
      templateType: updated.templateType,
      config: parseSingleProductConfig(updated.singleProductConfig),
    })
  } catch (error) {
    console.error('Single product config PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
