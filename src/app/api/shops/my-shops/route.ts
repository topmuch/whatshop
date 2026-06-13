import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/shops/my-shops — List all shops for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const shops = await db.shop.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        banner: true,
        whatsapp: true,
        plan: true,
        businessType: true,
        template: true,
        isActive: true,
        sector: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
            visits: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ shops })
  } catch (error) {
    console.error('My shops GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}