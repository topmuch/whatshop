import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'
import { slugify } from '@/lib/slugify'

export const dynamic = 'force-dynamic'

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

// Helper: format product with parsed images
function formatProduct(p: Record<string, unknown>) {
  return { ...p, images: parseImages(p.images) }
}

const PRODUCTS_PER_PAGE = 20

// GET /api/products?shopId=xxx&page=1&limit=20 (public — no auth needed)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || String(PRODUCTS_PER_PAGE), 10), 100)
    const includeAll = searchParams.get('all') === 'true'

    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 })
    }

    // SECURITY: require auth to see hidden/unavailable products
    if (includeAll) {
      const { user, response: authErr } = await requireShopOwner(request, shopId)
      if (authErr) return authErr
      if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const where: Record<string, unknown> = { shopId }
    if (!includeAll) where.isAvailable = true
    if (categoryId) where.categoryId = categoryId
    if (search) where.name = { contains: search }

    const skip = Math.max(0, (page - 1) * limit)

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products: products.map(formatProduct),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
      },
    })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/products (auth required — owner only)
export async function POST(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { name, description, price, image, images, stock, categoryId, isAvailable } = body

    if (!name || price === undefined || price === null || isNaN(parseFloat(price))) {
      return NextResponse.json({ error: 'Champs requis manquants ou prix invalide' }, { status: 400 })
    }

    // Check plan limits
    if (user.shop.plan === 'FREE') {
      const productCount = await db.product.count({ where: { shopId: user.shop.id } })
      if (productCount >= 10) {
        return NextResponse.json(
          { error: 'Limite atteinte. Passez au plan Standard pour plus de produits.' },
          { status: 403 }
        )
      }
    }

    const parsedImages = Array.isArray(images) ? images : []

    // Generate slug
    let slug = slugify(name) || 'produit'
    const existingSlug = await db.product.findFirst({ where: { shopId: user.shop.id, slug } })
    if (existingSlug) {
      let suffix = 2
      while (await db.product.findFirst({ where: { shopId: user.shop.id, slug: `${slug}-${suffix}` } })) {
        suffix++
      }
      slug = `${slug}-${suffix}`
    }

    const product = await db.product.create({
      data: {
        shopId: user.shop.id,
        name,
        slug,
        description: description || null,
        price: parseFloat(price),
        image: image || null,
        images: JSON.stringify(parsedImages),
        stock: stock !== undefined ? parseInt(stock) : null,
        categoryId: categoryId || null,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      include: { category: { select: { id: true, name: true } } },
    })

    return NextResponse.json(formatProduct(product as unknown as Record<string, unknown>), { status: 201 })
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/products (auth required — owner only)
export async function PUT(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { id, name, description, price, image, images, stock, categoryId, isAvailable } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Validate price if provided
    if (price !== undefined && (price === null || isNaN(parseFloat(price)))) {
      return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
    }

    // Verify the product belongs to this shop
    const existingProduct = await db.product.findFirst({
      where: { id, shopId: user.shop.id },
    })
    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) {
      data.name = name
      // Update slug when name changes
      let newSlug = slugify(name) || 'produit'
      const existingSlug = await db.product.findFirst({
        where: { shopId: user.shop.id, slug: newSlug, NOT: { id } },
      })
      if (existingSlug) {
        let suffix = 2
        while (await db.product.findFirst({
          where: { shopId: user.shop.id, slug: `${newSlug}-${suffix}`, NOT: { id } },
        })) {
          suffix++
        }
        newSlug = `${newSlug}-${suffix}`
      }
      data.slug = newSlug
    }
    if (description !== undefined) data.description = description || null
    if (price !== undefined) data.price = parseFloat(price)
    if (image !== undefined) data.image = image || null
    if (images !== undefined) {
      data.images = Array.isArray(images) ? JSON.stringify(images) : '[]'
    }
    if (stock !== undefined) data.stock = stock === null || stock === '' ? null : parseInt(stock)
    if (categoryId !== undefined) data.categoryId = categoryId || null
    if (isAvailable !== undefined) data.isAvailable = isAvailable

    const product = await db.product.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } },
    })

    return NextResponse.json(formatProduct(product as unknown as Record<string, unknown>))
  } catch (error) {
    console.error('Products PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/products?id=xxx (auth required — owner only)
export async function DELETE(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Verify the product belongs to this shop
    const existingProduct = await db.product.findFirst({
      where: { id, shopId: user.shop.id },
    })
    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Products DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
