import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireShopOwner } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { dispatchNewOrderEmail, dispatchAdminNewOrderEmail } from '@/lib/email-dispatch'

// POST /api/orders (public order creation — no auth required)
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.default)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { shopId, items, total, customerName, customerPhone, customerAddress } = body

    // Validate required fields
    if (!shopId || !items || !total) {
      return NextResponse.json(
        { error: 'Champs requis manquants (shopId, items, total)' },
        { status: 400 }
      )
    }

    // Validate items is an array with at least one item
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'La commande doit contenir au moins un article' },
        { status: 400 }
      )
    }

    // Validate items structure
    for (const item of items) {
      if (!item.name || typeof item.price !== 'number' || item.price < 0 || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Format d\'article invalide (name, price, quantity requis)' },
          { status: 400 }
        )
      }
    }

    // Validate total
    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json({ error: 'Le total doit être un nombre positif' }, { status: 400 })
    }

    // Verify the shop exists and is active
    const shop = await db.shop.findUnique({ where: { id: shopId, isActive: true } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // Validate customer fields length
    if (customerName && customerName.length > 200) {
      return NextResponse.json({ error: 'Nom trop long' }, { status: 400 })
    }
    if (customerPhone && customerPhone.length > 30) {
      return NextResponse.json({ error: 'Numéro de téléphone invalide' }, { status: 400 })
    }
    if (customerAddress && customerAddress.length > 500) {
      return NextResponse.json({ error: 'Adresse trop longue' }, { status: 400 })
    }

    const order = await db.order.create({
      data: {
        shopId,
        items: JSON.stringify(items),
        total,
        customerName: customerName?.slice(0, 200) || null,
        customerPhone: customerPhone?.slice(0, 30) || null,
        customerAddress: customerAddress?.slice(0, 500) || null,
      },
    })

    // Fire-and-forget notification (admin + seller)
    try {
      await createNotification(
        'NEW_ORDER',
        'Nouvelle commande',
        `Commande de ${total.toLocaleString('fr-FR')} FCFA sur la boutique "${shop.name}".`,
        { orderId: order.id, shopId: shop.id, shopName: shop.name, total }
      )
      await createNotification(
        'NEW_ORDER',
        'Nouvelle commande reçue',
        `Vous avez reçu une commande de ${total.toLocaleString('fr-FR')} FCFA.`,
        { orderId: order.id, shopId: shop.id, shopName: shop.name, total },
        shop.ownerId,
      )

      // Fire-and-forget emails
      const parsedItems = typeof items === 'string' ? JSON.parse(items) : items
      dispatchNewOrderEmail(shop.id, shop.ownerId, {
        customerName,
        customerPhone,
        total,
        items: parsedItems,
      })
      dispatchAdminNewOrderEmail({
        shopName: shop.name,
        ownerName: shop.ownerId ? (await db.user.findUnique({ where: { id: shop.ownerId }, select: { name: true } }))?.name || '' : '',
        total,
        customerName,
      })
    } catch {
      // Notification/email failure must not break order creation
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET /api/orders?shopId=xxx&status=xxx&page=1&limit=20 (auth required)
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const where: Record<string, unknown> = { shopId: user.shop.id }
    if (status && status !== 'ALL') where.status = status

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/orders (update status) (auth required)
export async function PUT(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireShopOwner(request)
    if (errorResponse) return errorResponse
    if (!user || !user.shop) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    // Verify the order belongs to this shop
    const existingOrder = await db.order.findFirst({
      where: { id, shopId: user.shop.id },
    })
    if (!existingOrder) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Orders PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}