import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// Helper: parse JSON images field into string[]
function parseImages(imagesRaw: unknown): string[] {
  if (!imagesRaw) return []
  if (Array.isArray(imagesRaw)) return imagesRaw
  if (typeof imagesRaw === 'string') {
    try {
      const parsed = JSON.parse(imagesRaw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

/** Max products per page when using pagination */
const MAX_LIMIT = 100

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limiting: 60 req/min
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.shopProducts)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    // Verify shop exists first (no cache needed for this check)
    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // Pagination support (optional query params for future use)
    const limitParam = parseInt(searchParams.get('limit') || '0', 10)
    const offsetParam = parseInt(searchParams.get('offset') || '0', 10)
    const limit = limitParam > 0 ? Math.min(limitParam, MAX_LIMIT) : 0
    const offset = offsetParam > 0 ? offsetParam : 0

    const products = await db.product.findMany({
      where: {
        shopId: shop.id,
        isAvailable: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Shuffle products randomly so each page load shows a different order
    for (let i = products.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[products[i], products[j]] = [products[j], products[i]]
    }

    // Apply pagination if requested
    const paginated = (limit > 0 || offset > 0)
      ? products.slice(offset, offset + (limit || products.length))
      : products

    const formatted = paginated.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
      images: parseImages(p.images),
      stock: p.stock,
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      sku: p.sku,
      promoEndDate: p.promoEndDate,
      categoryId: p.categoryId,
      categoryName: p.category?.name,
      createdAt: p.createdAt,
    }))

    // When paginated, include metadata
    if (limit > 0 || offset > 0) {
      return NextResponse.json({
        products: formatted,
        total: products.length,
        limit,
        offset,
      })
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}