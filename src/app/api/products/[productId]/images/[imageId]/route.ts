import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ─── PUT /api/products/[productId]/images/[imageId] ───────────────────────────
// Auth required — owner only. Update { order? } of an image (for reorder).
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; imageId: string }> }
) {
  try {
    const { productId, imageId } = await params

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

    // Verify the image belongs to this product
    const existingImage = await db.productImage.findFirst({
      where: { id: imageId, productId },
    })
    if (!existingImage) {
      return NextResponse.json({ error: 'Image introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { order, url } = body

    const data: Record<string, unknown> = {}

    if (order !== undefined) {
      const parsedOrder = parseInt(order, 10)
      if (isNaN(parsedOrder)) {
        return NextResponse.json({ error: 'Ordre invalide' }, { status: 400 })
      }
      data.order = parsedOrder
    }

    if (url !== undefined) {
      if (typeof url !== 'string' || url.trim().length === 0) {
        return NextResponse.json({ error: 'URL invalide' }, { status: 400 })
      }
      data.url = url.trim()
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(existingImage)
    }

    const updatedImage = await db.productImage.update({
      where: { id: imageId },
      data,
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error('Product image PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── DELETE /api/products/[productId]/images/[imageId] ────────────────────────
// Auth required — owner only. Delete an image.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; imageId: string }> }
) {
  try {
    const { productId, imageId } = await params

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

    // Verify the image belongs to this product
    const existingImage = await db.productImage.findFirst({
      where: { id: imageId, productId },
    })
    if (!existingImage) {
      return NextResponse.json({ error: 'Image introuvable' }, { status: 404 })
    }

    await db.productImage.delete({ where: { id: imageId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product image DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
