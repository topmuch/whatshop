import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/**
 * GET /api/menu/[shopSlug]
 * Optimized endpoint for the restaurant menu page.
 * Returns shop info + categories + products in a single call.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  // Rate limiting
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.default)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const { shopSlug } = await params

    // Fetch shop with categories and available products
    const shop = await db.shop.findUnique({
      where: { slug: shopSlug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        whatsapp: true,
        address: true,
        phone: true,
        businessHours: true,
        primaryColor: true,
        accentColor: true,
        isRestaurant: true,
        categories: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            products: {
              where: { isAvailable: true },
              select: {
                id: true,
                name: true,
                slug: true,
                shortDescription: true,
                price: true,
                image: true,
                stock: true,
                isAvailable: true,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        },
        // Also get products without category
        products: {
          where: {
            isAvailable: true,
            categoryId: null,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            shortDescription: true,
            price: true,
            image: true,
            stock: true,
            isAvailable: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // Build menu structure: categories with products, plus uncategorized products
    const menuCategories = shop.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      image: cat.image,
      products: cat.products,
    }))

    // If there are uncategorized products, add them as "Autres"
    if (shop.products.length > 0) {
      menuCategories.push({
        id: '__uncategorized__',
        name: 'Autres',
        description: null,
        image: null,
        products: shop.products,
      })
    }

    return NextResponse.json({
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        logo: shop.logo,
        whatsapp: shop.whatsapp,
        address: shop.address,
        phone: shop.phone,
        businessHours: shop.businessHours,
        primaryColor: shop.primaryColor,
        accentColor: shop.accentColor,
        isRestaurant: shop.isRestaurant,
      },
      categories: menuCategories,
    })
  } catch (error) {
    console.error('Menu API error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}