import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://boutiko.pro'

/**
 * Facebook Catalog XML feed endpoint.
 *
 * GET /api/catalog/[shopId]/route.xml
 *
 * Generates a Facebook Commerce Manager compatible XML product feed.
 * Cached for 1 hour (revalidate).
 *
 * Facebook catalog field mapping:
 * - id → product.id
 * - title → product.name
 * - description → product.shortDescription || product.description
 * - link → boutique URL
 * - image_link → first image from product.images or product.image
 * - price → product.price XOF
 * - availability → based on product.isAvailable && product.stock
 * - brand → shop.name
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
      return new NextResponse('<?xml version="1.0"?><error><message>Boutique introuvable</message></error>', {
        status: 404,
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    // Build XML
    const xmlItems = shop.products.map((product) => {
      const images: string[] = product.images ? JSON.parse(product.images) : []
      const mainImage = images[0] || product.image || ''

      const description = product.shortDescription || product.description || product.name
      const shopUrl = `${BASE_URL}/boutique/${shop.slug}`
      const productUrl = product.slug ? `${shopUrl}?product=${product.slug}` : shopUrl
      const availability = product.isAvailable && (product.stock === null || product.stock === undefined || product.stock > 0)
        ? 'in stock'
        : 'out of stock'

      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
      <g:price>${product.price.toFixed(2)} XOF</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(shop.name)}</g:brand>
      ${product.category ? `<g:google_product_category>${escapeXml(product.category.name)}</g:google_product_category>` : ''}
    </item>`
    }).join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(shop.name)}</title>
    <link>${escapeXml(`${BASE_URL}/boutique/${shop.slug}`)}</link>
    <description>Catalogue produits - ${escapeXml(shop.name)}</description>
${xmlItems}
  </channel>
</rss>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // Allow Facebook to fetch the feed
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Cache for 1 hour
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('[Catalog XML] Error:', error)
    return new NextResponse('<?xml version="1.0"?><error><message>Erreur interne</message></error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Enable static revalidation (ISR-like caching)
export const revalidate = 3600