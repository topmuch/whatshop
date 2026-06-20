import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const VALID_VARIANT_TYPES = ['COLOR', 'SIZE'] as const
type VariantType = (typeof VALID_VARIANT_TYPES)[number]

function isValidVariantType(value: unknown): value is VariantType {
  return typeof value === 'string' && (VALID_VARIANT_TYPES as readonly string[]).includes(value)
}

// ─── PUT /api/products/[productId]/variants/[variantId] ───────────────────────
// Auth required — owner only. Update a variant.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
) {
  try {
    const { productId, variantId } = await params

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

    // Verify the variant belongs to this product
    const existingVariant = await db.productVariant.findFirst({
      where: { id: variantId, productId },
    })
    if (!existingVariant) {
      return NextResponse.json({ error: 'Variante introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { type, name, priceOffset, stock, colorHex } = body

    const data: Record<string, unknown> = {}

    if (type !== undefined) {
      if (!isValidVariantType(type)) {
        return NextResponse.json(
          { error: 'Type de variante invalide (COLOR ou SIZE)' },
          { status: 400 }
        )
      }
      data.type = type
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Nom de variante requis' }, { status: 400 })
      }
      data.name = name.trim()
    }

    if (priceOffset !== undefined) {
      const parsed = parseInt(priceOffset, 10)
      if (isNaN(parsed)) {
        return NextResponse.json({ error: 'priceOffset invalide' }, { status: 400 })
      }
      data.priceOffset = parsed
    }

    if (stock !== undefined) {
      const parsed = parseInt(stock, 10)
      if (isNaN(parsed)) {
        return NextResponse.json({ error: 'stock invalide' }, { status: 400 })
      }
      data.stock = parsed
    }

    // NOTE: colorHex is accepted for API compatibility but is not persisted
    // (no dedicated column in the current Prisma schema).
    void colorHex

    if (Object.keys(data).length === 0) {
      return NextResponse.json(existingVariant)
    }

    const updatedVariant = await db.productVariant.update({
      where: { id: variantId },
      data,
    })

    return NextResponse.json(updatedVariant)
  } catch (error) {
    console.error('Product variant PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── DELETE /api/products/[productId]/variants/[variantId] ────────────────────
// Auth required — owner only. Delete a variant.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
) {
  try {
    const { productId, variantId } = await params

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

    // Verify the variant belongs to this product
    const existingVariant = await db.productVariant.findFirst({
      where: { id: variantId, productId },
    })
    if (!existingVariant) {
      return NextResponse.json({ error: 'Variante introuvable' }, { status: 404 })
    }

    await db.productVariant.delete({ where: { id: variantId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product variant DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
