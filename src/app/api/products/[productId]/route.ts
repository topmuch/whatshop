import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function parseImages(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  }
  return []
}

// GET /api/products/[productId] — public product details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params
    const p = await db.product.findUnique({
      where: { id: productId },
      include: {
        productImages: { orderBy: { order: 'asc' } },
        productVariants: { orderBy: { name: 'asc' } },
        category: { select: { id: true, name: true } },
      },
    })
    if (!p || !p.isAvailable) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }
    return NextResponse.json({
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
      images: p.productImages.length > 0 ? p.productImages.map((i) => i.url) : parseImages(p.images),
      stock: p.stock,
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      sku: p.sku,
      promoEndDate: p.promoEndDate,
      categoryId: p.categoryId,
      categoryName: p.category?.name,
      variants: p.productVariants.map((v) => ({
        id: v.id,
        type: v.type,
        name: v.name,
        value: v.value,
        priceOffset: v.priceOffset,
        stock: v.stock,
      })),
    })
  } catch (error) {
    console.error('Product detail GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
