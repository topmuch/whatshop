import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ─── PUT /api/products/[productId]/images/reorder ─────────────────────────────
// Auth required — owner only. Body: { orderedIds: string[] }.
// Update the `order` field of each image accordingly.
export async function PUT(
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
    const { orderedIds } = body

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds doit être un tableau' }, { status: 400 })
    }

    // Validate each id belongs to this product (avoid cross-product tampering)
    const existingImages = await db.productImage.findMany({
      where: { productId },
      select: { id: true },
    })
    const existingIds = new Set(existingImages.map((img) => img.id))
    for (const id of orderedIds) {
      if (typeof id !== 'string' || !existingIds.has(id)) {
        return NextResponse.json(
          { error: 'Identifiant d\'image invalide' },
          { status: 400 }
        )
      }
    }

    // Update each image's order using a transaction
    await db.$transaction(
      orderedIds.map((id, index) =>
        db.productImage.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    const reorderedImages = await db.productImage.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(reorderedImages)
  } catch (error) {
    console.error('Product images reorder error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
