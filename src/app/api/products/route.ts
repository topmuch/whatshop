import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
  return {
    ...p,
    images: parseImages(p.images),
  }
}

// GET /api/products?shopId=xxx
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

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shopId, name, description, price, image, images, stock, categoryId, isAvailable } = body

    if (!shopId || !name || price === undefined) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Check plan limits
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (shop?.plan === 'FREE') {
      const productCount = await db.product.count({ where: { shopId } })
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
        shopId,
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

// PUT /api/products
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, price, image, images, stock, categoryId, isAvailable } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
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

// DELETE /api/products?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Products DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
