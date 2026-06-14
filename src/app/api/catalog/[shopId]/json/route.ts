import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://boutiko.pro'

/**
 * Facebook Catalog JSON feed endpoint (alternative to XML).
 *
 * GET /api/catalog/[shopId]/json
 *
 * Returns a JSON array of products compatible with
 * Facebook Commerce Manager and other platforms.
 * Cached for 1 hour.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> },
) {
  try {
    const { shopId } = await params

    // Fetch shop with products
    const shop = await db.shop.findUnique({
      where: { id: shopId, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        products: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            description: true,
            price: true,
            image: true,
            images: true,
            stock: true,
            isAvailable: true,
            category: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const shopUrl = `${BASE_URL}/boutique/${shop.slug}`

    const catalog = {
      name: shop.name,
      url: shopUrl,
      products: shop.products.map((product) => {
        const images: string[] = product.images ? JSON.parse(product.images) : []
        const mainImage = images[0] || product.image || ''
        const description = product.shortDescription || product.description || product.name
        const productUrl = product.slug ? `${shopUrl}?product=${product.slug}` : shopUrl
        const availability = product.isAvailable && (product.stock === null || product.stock === undefined || product.stock > 0)
          ? 'in stock'
          : 'out of stock'

        return {
          id: product.id,
          title: product.name,
          description,
          link: productUrl,
          image_link: mainImage,
          price: `${product.price.toFixed(2)} XOF`,
          availability,
          condition: 'new',
          brand: shop.name,
          google_product_category: product.category?.name || '',
        }
      }),
    }

    return NextResponse.json(catalog, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('[Catalog JSON] Error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// Enable static revalidation
export const revalidate = 3600