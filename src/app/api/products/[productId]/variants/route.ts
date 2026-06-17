import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const VALID_VARIANT_TYPES = ['COLOR', 'SIZE'] as const
type VariantType = (typeof VALID_VARIANT_TYPES)[number]

function isValidVariantType(value: unknown): value is VariantType {
  return typeof value === 'string' && (VALID_VARIANT_TYPES as readonly string[]).includes(value)
}

// ─── GET /api/products/[productId]/variants ───────────────────────────────────
// Public — list variants for a product.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    const variants = await db.productVariant.findMany({
      where: { productId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(variants)
  } catch (error) {
    console.error('Product variants GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── POST /api/products/[productId]/variants ──────────────────────────────────
// Auth required — owner only. Create a variant.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    const { user, response: errorResponse, shop } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Verify the product belongs to the owner's shop
    const product = await db.product.findFirst({
      where: { id: productId, shopId: shop.id },
      select: { id: true },
    })
    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { type, name, priceOffset, stock, colorHex } = body

    if (!isValidVariantType(type)) {
      return NextResponse.json(
        { error: 'Type de variante invalide (COLOR ou SIZE)' },
        { status: 400 }
      )
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nom de variante requis' }, { status: 400 })
    }

    const parsedPriceOffset =
      priceOffset !== undefined && priceOffset !== null ? parseInt(priceOffset, 10) : 0
    if (isNaN(parsedPriceOffset)) {
      return NextResponse.json({ error: 'priceOffset invalide' }, { status: 400 })
    }

    const parsedStock =
      stock !== undefined && stock !== null ? parseInt(stock, 10) : 0
    if (isNaN(parsedStock)) {
      return NextResponse.json({ error: 'stock invalide' }, { status: 400 })
    }

    // NOTE: colorHex is accepted for API compatibility with the front-end type
    // (see src/lib/variant-utils.ts) but is not persisted — the current Prisma
    // schema does not expose a dedicated column for it.
    void colorHex

    const variant = await db.productVariant.create({
      data: {
        productId,
        type,
        name: name.trim(),
        priceOffset: parsedPriceOffset,
        stock: parsedStock,
      },
    })

    return NextResponse.json(variant, { status: 201 })
  } catch (error) {
    console.error('Product variants POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
