import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// GET /api/shops/my-export?type=products|orders
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Get all shop IDs for this user
    const shops = await db.shop.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    })
    const shopIds = shops.map(s => s.id)

    if (type === 'products') {
      return exportProducts(shopIds)
    } else if (type === 'orders') {
      return exportOrders(shopIds)
    }

    return NextResponse.json({ error: 'Type invalide. Utilisez ?type=products ou ?type=orders' }, { status: 400 })
  } catch (error) {
    console.error('My export GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

async function exportProducts(shopIds: string[]) {
  const products = await db.product.findMany({
    where: { shopId: { in: shopIds } },
    include: {
      category: {
        select: { name: true },
      },
      shop: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const headers = ['Nom', 'Prix (FCFA)', 'Catégorie', 'Stock', 'Disponible', 'Date création']
  const rows = products.map(p => [
    escapeCSV(p.name),
    escapeCSV(Math.round(p.price).toString()),
    escapeCSV(p.category?.name || ''),
    escapeCSV(p.stock?.toString() || '0'),
    escapeCSV(p.isAvailable ? 'Oui' : 'Non'),
    escapeCSV(p.createdAt.toISOString().split('T')[0]),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="produits-export.csv"',
    },
  })
}

async function exportOrders(shopIds: string[]) {
  const orders = await db.order.findMany({
    where: { shopId: { in: shopIds } },
    include: {
      shop: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const statusMap: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
  }

  const headers = ['ID', 'Client', 'Téléphone', 'Produits', 'Total (FCFA)', 'Statut', 'Date']
  const rows = orders.map(o => {
    // Parse items to build product names list
    let productNames = ''
    try {
      const items = JSON.parse(o.items) as Array<{ name: string; quantity: number }>
      productNames = items.map(i => `${i.name} x${i.quantity}`).join('; ')
    } catch {
      productNames = o.items
    }

    return [
      escapeCSV(o.id),
      escapeCSV(o.customerName || ''),
      escapeCSV(o.customerPhone || ''),
      escapeCSV(productNames),
      escapeCSV(Math.round(o.total).toString()),
      escapeCSV(statusMap[o.status] || o.status),
      escapeCSV(o.createdAt.toISOString().split('T')[0]),
    ]
  })

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="commandes-export.csv"',
    },
  })
}