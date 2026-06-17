import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const MAX_IMAGES_PER_PRODUCT = 10

// ─── GET /api/products/[productId]/images ─────────────────────────────────────
// Public — list product images ordered by `order` asc.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    const images = await db.productImage.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Product images GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── POST /api/products/[productId]/images ────────────────────────────────────
// Auth required — owner only. Create a new image { url, order? }.
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

    // Enforce max images limit
    const imageCount = await db.productImage.count({ where: { productId } })
    if (imageCount >= MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { error: `Maximum de ${MAX_IMAGES_PER_PRODUCT} images par produit atteint` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { url, order } = body

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 })
    }

    // Compute order if not provided (last + 1)
    let finalOrder: number
    if (order !== undefined) {
      finalOrder = parseInt(order, 10)
      if (isNaN(finalOrder)) {
        return NextResponse.json({ error: 'Ordre invalide' }, { status: 400 })
      }
    } else {
      const lastImage = await db.productImage.findFirst({
        where: { productId },
        orderBy: { order: 'desc' },
        select: { order: true },
      })
      finalOrder = lastImage ? lastImage.order + 1 : 0
    }

    const image = await db.productImage.create({
      data: {
        productId,
        url: url.trim(),
        order: finalOrder,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Product images POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
