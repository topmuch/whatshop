import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getResellerProfile, createResellerProfile, updateResellerProfile, getResellerClients } from '@/lib/permissions'

// GET /api/reseller — Get reseller profile + clients list
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    if (user.role !== 'RESELLER' && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux revendeurs' }, { status: 403 })
    }

    const profile = await getResellerProfile(user.id)
    const clients = await getResellerClients(user.id)

    return NextResponse.json({
      profile,
      clients: clients.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        role: c.role,
        createdAt: c.createdAt.toISOString(),
        subscription: c.subscription ? {
          planType: c.subscription.planType,
          status: c.subscription.status,
          maxShops: c.subscription.maxShops,
        } : null,
        shops: c.shops,
        shopCount: c._count.shops,
        orderCount: c._count.orders,
      })),
    })
  } catch (error) {
    console.error('Reseller GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/reseller — Update reseller white-label settings
export async function PUT(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    if (user.role !== 'RESELLER' && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux revendeurs' }, { status: 403 })
    }

    const body = await request.json()
    const { companyName, logoUrl, primaryColor, commission } = body

    // Validate color format
    if (primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
      return NextResponse.json({ error: 'Format de couleur invalide (ex: #EC4899)' }, { status: 400 })
    }

    // Validate commission range
    if (commission !== undefined && (commission < 0 || commission > 50)) {
      return NextResponse.json({ error: 'La commission doit être entre 0% et 50%' }, { status: 400 })
    }

    const existing = await getResellerProfile(user.id)

    if (!existing) {
      const profile = await createResellerProfile(user.id, {
        companyName: companyName?.trim() || undefined,
        logoUrl: logoUrl || undefined,
        primaryColor: primaryColor || undefined,
        commission: commission ?? undefined,
      })
      return NextResponse.json(profile)
    }

    const profile = await updateResellerProfile(user.id, {
      companyName: companyName !== undefined ? companyName?.trim() || undefined : undefined,
      logoUrl: logoUrl !== undefined ? logoUrl || undefined : undefined,
      primaryColor: primaryColor !== undefined ? primaryColor || undefined : undefined,
      commission: commission !== undefined ? commission : undefined,
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Reseller PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}