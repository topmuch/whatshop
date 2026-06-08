import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan') || ''
    const search = searchParams.get('search') || ''

    const shops = await db.shop.findMany({
      where: {
        ...(plan ? { plan } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { slug: { contains: search } },
            { owner: { name: { contains: search } } },
          ],
        } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true, orders: true, visits: true } },
      },
    })

    return NextResponse.json({
      shops: shops.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        plan: s.plan,
        isActive: s.isActive,
        createdAt: s.createdAt.toISOString(),
        owner: { id: s.owner.id, name: s.owner.name, email: s.owner.email },
        productCount: s._count.products,
        orderCount: s._count.orders,
        visitCount: s._count.visits,
      })),
    })
  } catch (error) {
    console.error('Admin shops error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, whatsapp, ownerId } = body

    if (!name || !slug || !whatsapp || !ownerId) {
      return NextResponse.json({ error: 'Nom, slug, whatsapp et ownerId requis' }, { status: 400 })
    }

    const owner = await db.user.findUnique({ where: { id: ownerId } })
    if (!owner) {
      return NextResponse.json({ error: 'Propriétaire introuvable' }, { status: 404 })
    }

    const existingSlug = await db.shop.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 409 })
    }

    const existingOwnerShop = await db.shop.findUnique({ where: { ownerId } })
    if (existingOwnerShop) {
      return NextResponse.json({ error: 'Cet utilisateur a déjà une boutique' }, { status: 409 })
    }

    const shop = await db.shop.create({
      data: {
        name,
        slug,
        whatsapp,
        ownerId,
      },
    })

    return NextResponse.json({
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        plan: shop.plan,
        isActive: shop.isActive,
        createdAt: shop.createdAt.toISOString(),
        ownerId: shop.ownerId,
      },
    })
  } catch (error) {
    console.error('Admin create shop error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
