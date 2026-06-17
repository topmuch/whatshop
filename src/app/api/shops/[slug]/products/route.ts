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

    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      select: { id: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

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
      orderBy: { createdAt: 'desc' },
    })

    const formatted = products.map((p) => ({
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

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
