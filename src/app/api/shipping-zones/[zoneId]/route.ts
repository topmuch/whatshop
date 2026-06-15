import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface UpdateZoneBody {
  name?: string
  price?: number
  sortOrder?: number
}

// PUT /api/shipping-zones/[zoneId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  try {
    const { zoneId } = await params
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Find the zone and verify ownership
    const zone = await db.shippingZone.findUnique({
      where: { id: zoneId },
      include: { shop: { select: { ownerId: true } } },
    })

    if (!zone) {
      return NextResponse.json({ error: 'Zone introuvable' }, { status: 404 })
    }

    if (zone.shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body: UpdateZoneBody = await request.json()
    const updateData: UpdateZoneBody = {}

    // Validate name if provided
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
      }
      const sanitizedName = body.name.trim().replace(/<[^>]*>/g, '')
      if (sanitizedName.length < 1 || sanitizedName.length > 50) {
        return NextResponse.json(
          { error: 'Le nom doit contenir entre 1 et 50 caractères' },
          { status: 400 }
        )
      }
      updateData.name = sanitizedName
    }

    // Validate price if provided
    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || !Number.isFinite(body.price)) {
        return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
      }
      if (body.price <= 0) {
        return NextResponse.json({ error: 'Le prix doit être supérieur à 0' }, { status: 400 })
      }
      if (body.price > 100000) {
        return NextResponse.json(
          { error: 'Le prix ne peut pas dépasser 100 000 FCFA' },
          { status: 400 }
        )
      }
      updateData.price = Math.round(body.price)
    }

    // Allow sortOrder update (for drag & drop reordering)
    if (body.sortOrder !== undefined) {
      if (typeof body.sortOrder !== 'number' || !Number.isInteger(body.sortOrder) || body.sortOrder < 0) {
        return NextResponse.json({ error: 'Ordre de tri invalide' }, { status: 400 })
      }
      updateData.sortOrder = body.sortOrder
    }

    const updated = await db.shippingZone.update({
      where: { id: zoneId },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      shopId: updated.shopId,
      name: updated.name,
      price: updated.price,
      sortOrder: updated.sortOrder,
    })
  } catch (error) {
    console.error('ShippingZone PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/shipping-zones/[zoneId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  try {
    const { zoneId } = await params
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Find the zone and verify ownership
    const zone = await db.shippingZone.findUnique({
      where: { id: zoneId },
      include: { shop: { select: { ownerId: true } } },
    })

    if (!zone) {
      return NextResponse.json({ error: 'Zone introuvable' }, { status: 404 })
    }

    if (zone.shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    await db.shippingZone.delete({ where: { id: zoneId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('ShippingZone DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}