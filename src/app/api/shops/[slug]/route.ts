import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { cacheFetch, cacheInvalidate } from '@/lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limiting
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.default)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const { slug } = await params

    const shop = await cacheFetch(`shop-detail:${slug}`, 120, async () => {
      return db.shop.findUnique({
        where: { slug, isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logo: true,
          banner: true,
          whatsapp: true,
          address: true,
          phone: true,
          plan: true,
          sector: true,
          businessType: true,
          template: true,
          accentColor: true,
          isActive: true,
          heroImages: true,
          promoBanners: true,
          brands: true,
          primaryColor: true,
          secondaryColor: true,
          heroTitle: true,
          heroSubtitle: true,
          heroTagline: true,
          heroImageUrl: true,
          consultantPhotoUrl: true,
          aboutText: true,
          contactEmail: true,
          businessHours: true,
          googleMapsUrl: true,
          productsTitle: true,
          productsTagline: true,
          categoriesTitle: true,
          categoriesTagline: true,
          testimonialsTitle: true,
          testimonialsTagline: true,
          trustBadges: true,
          footerLinks: true,
          seoTitle: true,
          seoDescription: true,
          seoKeywords: true,
          ogImage: true,
          coverImageUrl: true,
          isLiveMode: true,
          liveProductId: true,
          liveUrl: true,
          ownerId: true,
          templateType: true,
          singleProductConfig: true,
          modernStoreConfig: true,
        },
      })
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    return NextResponse.json(shop)
  } catch (error) {
    console.error('Error fetching shop:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
