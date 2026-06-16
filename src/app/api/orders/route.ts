import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { dispatchNewOrderEmail, dispatchAdminNewOrderEmail } from '@/lib/email-dispatch'
import { createOrderSchema, type CreateOrderInput } from '@/lib/order-schemas'
import { requireShopOwner } from '@/lib/auth'

// POST /api/orders (public order creation — no auth required)
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.default)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez plus tard.' },
      { status: 429 }
    )
  }

  try {
    // ─── 1. Parse & Validate with Zod ─────────────────────────────────
    const rawBody = await request.json()
    const parsed = createOrderSchema.safeParse(rawBody)

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || 'global'
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      return NextResponse.json(
        { error: 'Données invalides', details: fieldErrors },
        { status: 400 }
      )
    }

    const data: CreateOrderInput = parsed.data
    const { shopId, items, customer, shippingZoneId, shippingZoneName, shippingFee, subtotal, total } = data

    // ─── 2. Verify shop exists and is active ──────────────────────────
    const shop = await db.shop.findUnique({
      where: { id: shopId, isActive: true },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        ownerId: true,
      },
    })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // ─── 3. Verify all products exist, are available, and check stock ─
    const productIds = items.map((i) => i.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds }, shopId },
      select: { id: true, name: true, price: true, stock: true, isAvailable: true },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    // Check for missing / unavailable products
    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produit "${item.name}" introuvable`, details: { productId: item.productId } },
          { status: 400 }
        )
      }
      if (!product.isAvailable) {
        return NextResponse.json(
          { error: `Le produit "${product.name}" n'est plus disponible` },
          { status: 400 }
        )
      }
    }

    // ─── 4. Check & reserve stock (atomic with transaction) ───────────
    const order = await db.$transaction(async (tx) => {
      // Re-fetch products inside transaction for accurate stock read
      const freshProducts = await tx.product.findMany({
        where: { id: { in: productIds }, shopId },
        select: { id: true, name: true, stock: true, isAvailable: true },
      })
      const freshMap = new Map(freshProducts.map((p) => [p.id, p]))

      // Validate stock for each item
      for (const item of items) {
        const product = freshMap.get(item.productId)
        if (!product || !product.isAvailable) {
          throw new Error(`STOCK_UNAVAILABLE:${item.name}`)
        }
        if (product.stock !== null && product.stock < item.quantity) {
          throw new Error(
            `STOCK_INSUFFICIENT:${item.name}:${product.stock}`
          )
        }
      }

      // Decrement stock for items that have stock tracking
      for (const item of items) {
        const product = freshMap.get(item.productId)
        if (product && product.stock !== null) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }

      // Build legacy items JSON (backward compat with existing dashboards)
      const legacyItems = items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }))

      // Create order
      const newOrder = await tx.order.create({
        data: {
          shopId,
          items: JSON.stringify(legacyItems),
          total,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          customerCity: customer.city,
        },
      })

      // Create order items (relational)
      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      })

      return newOrder
    })

    // ─── 5. Fire-and-forget notifications ────────────────────────────
    try {
      await createNotification(
        'NEW_ORDER',
        'Nouvelle commande',
        `Commande de ${total.toLocaleString('fr-FR')} FCFA sur "${shop.name}".`,
        { orderId: order.id, shopId: shop.id, shopName: shop.name, total }
      )
      await createNotification(
        'NEW_ORDER',
        'Nouvelle commande reçue',
        `Vous avez reçu une commande de ${total.toLocaleString('fr-FR')} FCFA.`,
        { orderId: order.id, shopId: shop.id, shopName: shop.name, total },
        shop.ownerId,
      )

      // Email notifications
      const orderItems = items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      }))

      dispatchNewOrderEmail(shop.id, shop.ownerId, {
        shopName: shop.name,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerPhone: customer.phone,
        customerCity: customer.city,
        customerAddress: customer.address,
        total,
        items: orderItems,
      })

      const ownerName = (
        await db.user.findUnique({
          where: { id: shop.ownerId },
          select: { name: true },
        })
      )?.name || ''

      dispatchAdminNewOrderEmail({
        shopName: shop.name,
        ownerName,
        total,
        customerName: `${customer.firstName} ${customer.lastName}`,
      })
    } catch {
      // Notification/email failure must not break order creation
    }

    return NextResponse.json(
      {
        id: order.id,
        status: order.status,
        total: order.total,
        message: 'Commande créée avec succès !',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Orders POST error:', error)

    // Handle known transaction errors
    if (error instanceof Error) {
      const msg = error.message
      if (msg.startsWith('STOCK_UNAVAILABLE:')) {
        const name = msg.split(':')[1]
        return NextResponse.json(
          { error: `Le produit "${name}" n'est plus disponible` },
          { status: 400 }
        )
      }
      if (msg.startsWith('STOCK_INSUFFICIENT:')) {
        const parts = msg.split(':')
        const name = parts[1]
        const available = parts[2]
        return NextResponse.json(
          {
            error: `Stock insuffisant pour "${name}" (disponible: ${available})`,
            details: { product: name, availableStock: Number(available) },
          },
          { status: 400 }
        )
      }
    }

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
        include: {
          orderItems: {
            select: {
              id: true,
              productName: true,
              price: true,
              quantity: true,
            },
          },
        },
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

    const existingOrder = await db.order.findFirst({
      where: { id, shopId: user.shop.id },
    })
    if (!existingOrder) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    // If cancelling, restore stock
    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      const orderItems = await db.orderItem.findMany({
        where: { orderId: id },
        select: { productId: true, quantity: true },
      })
      for (const item of orderItems) {
        if (item.productId) {
          await db.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }
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