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
      select: { id: true },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const categories = await db.category.findMany({
      where: { shopId: shop.id },
      include: {
        _count: {
          select: { products: { where: { isAvailable: true } } },
        },
      },
      orderBy: { name: 'asc' },
    })

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      productCount: c._count.products,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
