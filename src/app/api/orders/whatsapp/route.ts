import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// POST /api/orders/whatsapp — créer une commande origine WhatsApp (sans formulaire client)
// Le message WhatsApp est généré côté client ; ici on enregistre juste la commande
// avec les infos client si fournies, sinon avec des placeholders.
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.shopLeads)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { shopId, items, total, customerName, customerPhone } = body

    if (!shopId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'shopId et items requis' }, { status: 400 })
    }

    const shop = await db.shop.findUnique({ where: { id: shopId }, select: { id: true } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const itemsJson = JSON.stringify(
      items.map((i: { productId?: string; name: string; price: number; quantity: number; variantName?: string }) => ({
        productId: i.productId,
        name: i.variantName ? `${i.name} (${i.variantName})` : i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    )

    const order = await db.order.create({
      data: {
        shopId,
        items: itemsJson,
        total: parseFloat(String(total)) || 0,
        customerName: customerName || 'Commande WhatsApp',
        customerPhone: customerPhone || null,
        status: 'PENDING',
        source: 'WHATSAPP',
        paymentMethod: 'COD',
        orderItems: {
          create: items.map((i: { productId?: string; name: string; price: number; quantity: number; variantId?: string }) => ({
            productId: i.productId || null,
            productName: i.name,
            price: i.price,
            quantity: i.quantity,
            variantId: i.variantId || null,
          })),
        },
      },
      include: { orderItems: true },
    })

    logger.info('WhatsApp order created', 'OrdersAPI', { orderId: order.id, shopId, total: order.total })

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error) {
    logger.error('WhatsApp order creation failed', 'OrdersAPI', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
