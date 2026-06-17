import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const shop = await db.shop.findUnique({
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
        // SEO fields (safe for public — needed by client-side JSON-LD)
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        ogImage: true,
        coverImageUrl: true,
        // Live mode (safe for public)
        isLiveMode: true,
        liveProductId: true,
        // Internal fields removed from public API:
        // facebookPixelId, facebookCatalogId, catalogEnabled,
        // catalogProductCount, trackPageViews, trackProductViews, trackWhatsAppClicks
      },
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