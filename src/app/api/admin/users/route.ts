import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

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
    const search = searchParams.get('search') || ''

    const users = await db.user.findMany({
      where: {
        role: 'SELLER',
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            plan: true,
            isActive: true,
            _count: { select: { products: true, orders: true } },
          },
        },
        _count: { select: { orders: true } },
      },
    })

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
        shop: u.shop ? {
          id: u.shop.id,
          name: u.shop.name,
          plan: u.shop.plan,
          isActive: u.shop.isActive,
          productCount: u.shop._count.products,
          orderCount: u.shop._count.orders,
        } : null,
        orderCount: u._count.orders,
      })),
    })
  } catch (error) {
    console.error('Admin users error:', error)
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
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nom, email et mot de passe requis' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        role: 'SELLER',
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Admin create user error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
