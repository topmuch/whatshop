import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateWhatsAppLink } from '@/lib/whatsapp-link'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://boutiko.pro'

/**
 * Facebook Catalog XML feed — with WhatsApp checkout_url.
 * GET /api/catalog/[shopId]
 *
 * Generates a Facebook Commerce Manager compatible XML product feed.
 * Each item includes a checkout_url that redirects to WhatsApp with a
 * pre-filled order message.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> },
) {
  // Rate limiting
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.default)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const { shopId } = await params

    const shop = await db.shop.findUnique({
      where: { id: shopId, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        whatsapp: true,
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
            category: { select: { name: true } },
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

    const shopUrl = `${BASE_URL}/${shop.slug}`

    const xmlItems = shop.products.map((product) => {
      const images: string[] = product.images ? JSON.parse(product.images) : []
      const mainImage = images[0] || product.image || ''
      const description = product.shortDescription || product.description || product.name
      const productUrl = product.slug ? `${shopUrl}/p/${product.slug}` : shopUrl
      const availability = product.isAvailable && (product.stock === null || product.stock === undefined || product.stock > 0)
        ? 'in stock'
        : 'out of stock'

      // WhatsApp checkout link — the core conversion path
      const checkoutUrl = generateWhatsAppLink({
        phoneNumber: shop.whatsapp,
        productName: product.name,
        productPrice: product.price,
        productUrl,
        source: 'facebook',
      })

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
      ${product.category ? `<g:product_type>${escapeXml(product.category.name)}</g:product_type>` : ''}
      <g:checkout_url>${escapeXml(checkoutUrl)}</g:checkout_url>
    </item>`
    }).join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(shop.name)}</title>
    <link>${escapeXml(shopUrl)}</link>
    <description>Catalogue produits - ${escapeXml(shop.name)}</description>
${xmlItems}
  </channel>
</rss>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
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

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export const revalidate = 3600