import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

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

// GET /api/products/[productId]/related — produits similaires (même catégorie, hors produit courant)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  // Rate limiting
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.default)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const { productId } = await params
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { shopId: true, categoryId: true },
    })
    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    const related = await db.product.findMany({
      where: {
        shopId: product.shopId,
        isAvailable: true,
        id: { not: productId },
        ...(product.categoryId ? { categoryId: product.categoryId } : {}),
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        oldPrice: true,
        image: true,
        images: true,
        stock: true,
        isBestSeller: true,
      },
    })

    const formatted = related.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
      images: parseImages(p.images),
      stock: p.stock,
      isBestSeller: p.isBestSeller,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Related products GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
