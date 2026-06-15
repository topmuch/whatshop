import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface ShippingZoneResponse {
  id: string
  shopId: string
  name: string
  price: number
  sortOrder: number
}

interface GetZonesResponse {
  zones: ShippingZoneResponse[]
}

interface CreateZoneBody {
  name: string
  price: number
}

// Helper: resolve slug → shopId via DB
async function resolveShopId(slug: string): Promise<string | null> {
  const shop = await db.shop.findUnique({
    where: { slug },
    select: { id: true },
  })
  return shop?.id ?? null
}

// GET /api/shops/[slug]/shipping-zones
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const shopId = await resolveShopId(slug)
    if (!shopId) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const { user, response: errorResponse } = await requireShopOwner(request, shopId)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const zones = await db.shippingZone.findMany({
      where: { shopId },
      orderBy: { sortOrder: 'asc' },
    })

    const response: GetZonesResponse = {
      zones: zones.map((z) => ({
        id: z.id,
        shopId: z.shopId,
        name: z.name,
        price: z.price,
        sortOrder: z.sortOrder,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('ShippingZones GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/shops/[slug]/shipping-zones
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const shopId = await resolveShopId(slug)
    if (!shopId) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const { user, response: errorResponse } = await requireShopOwner(request, shopId)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body: CreateZoneBody = await request.json()
    const { name, price } = body

    // Validate name
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Nom de la zone requis' }, { status: 400 })
    }

    const sanitizedName = name.trim().replace(/<[^>]*>/g, '')
    if (sanitizedName.length < 1 || sanitizedName.length > 50) {
      return NextResponse.json(
        { error: 'Le nom doit contenir entre 1 et 50 caractères' },
        { status: 400 }
      )
    }

    // Validate price
    if (typeof price !== 'number' || !Number.isFinite(price)) {
      return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
    }
    if (price <= 0) {
      return NextResponse.json({ error: 'Le prix doit être supérieur à 0' }, { status: 400 })
    }
    if (price > 100000) {
      return NextResponse.json(
        { error: 'Le prix ne peut pas dépasser 100 000 FCFA' },
        { status: 400 }
      )
    }

    // Check max zones per shop (20)
    const zoneCount = await db.shippingZone.count({ where: { shopId } })
    if (zoneCount >= 20) {
      return NextResponse.json(
        { error: 'Limite de 20 zones de livraison atteinte' },
        { status: 400 }
      )
    }

    // Determine the next sortOrder
    const maxSortOrder = await db.shippingZone.findFirst({
      where: { shopId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })
    const nextSortOrder = (maxSortOrder?.sortOrder ?? -1) + 1

    const roundedPrice = Math.round(price)

    const zone = await db.shippingZone.create({
      data: {
        shopId,
        name: sanitizedName,
        price: roundedPrice,
        sortOrder: nextSortOrder,
      },
    })

    const response: ShippingZoneResponse = {
      id: zone.id,
      shopId: zone.shopId,
      name: zone.name,
      price: zone.price,
      sortOrder: zone.sortOrder,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('ShippingZones POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}