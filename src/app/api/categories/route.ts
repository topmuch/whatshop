import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shopId, name, description } = body

    if (!shopId || !name) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const category = await db.category.create({
      data: {
        shopId,
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

// PUT /api/categories
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
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

// DELETE /api/categories?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Categories DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
