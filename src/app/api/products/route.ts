import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

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

// GET /api/products?shopId=xxx (public — no auth needed)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 })
    }

    const where: Record<string, unknown> = { shopId }
    if (categoryId) where.categoryId = categoryId
    if (search) where.name = { contains: search }

    const products = await db.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products.map(formatProduct))
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

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
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

    const product = await db.product.create({
      data: {
        shopId: user.shop.id,
        name,
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

    // Verify the product belongs to this shop
    const existingProduct = await db.product.findFirst({
      where: { id, shopId: user.shop.id },
    })
    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description || null
    if (price !== undefined) data.price = parseFloat(price)
    if (image !== undefined) data.image = image || null
    if (images !== undefined) {
      data.images = Array.isArray(images) ? JSON.stringify(images) : '[]'
    }
    if (stock !== undefined) data.stock = parseInt(stock) || null
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
