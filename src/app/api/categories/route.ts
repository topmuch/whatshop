import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

// GET /api/categories?shopId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 })
    }

    const categories = await db.category.findMany({
      where: { shopId },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        productCount: c._count.products,
        createdAt: c.createdAt,
      }))
    )
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/categories (auth required)
export async function POST(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    }

    const category = await db.category.create({
      data: {
        shopId: user.shop.id,
        name,
        description: description || null,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Categories POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/categories (auth required)
export async function PUT(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { id, name, description } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Verify the category belongs to this shop
    const existingCat = await db.category.findFirst({
      where: { id, shopId: user.shop.id },
    })
    if (!existingCat) {
      return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 })
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description || null : undefined,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Categories PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/categories?id=xxx (auth required)
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

    // Verify the category belongs to this shop
    const existingCat = await db.category.findFirst({
      where: { id, shopId: user.shop.id },
    })
    if (!existingCat) {
      return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 })
    }

    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Categories DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
