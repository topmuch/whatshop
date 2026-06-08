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
