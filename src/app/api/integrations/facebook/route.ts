import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { encryptToken, validateAccessToken, testPixel } from '@/lib/facebook-capi'

// ─── GET: Fetch Facebook events for the shop ───────────────────────────────────

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuth(request)
  if (!user) return response

  const shopId = user.shop?.id
  if (!shopId) {
    return NextResponse.json({ error: 'Boutique requise' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
  const eventName = searchParams.get('eventName') || undefined

  const where: Record<string, unknown> = { shopId }
  if (eventName) where.eventName = eventName

  const [events, total] = await Promise.all([
    db.facebookEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.facebookEvent.count({ where }),
  ])

  return NextResponse.json({
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

// ─── POST: Save Facebook integration settings ─────────────────────────────────

export async function POST(request: NextRequest) {
  const { user, response } = await requireAuth(request)
  if (!user) return response

  const shopId = user.shop?.id
  if (!shopId) {
    return NextResponse.json({ error: 'Boutique requise' }, { status: 400 })
  }

  const body = await request.json()
  const { pixelId, accessToken, catalogId, catalogEnabled, trackPageViews, trackProductViews, trackWhatsAppClicks } = body as Record<string, unknown>

  // Build update data — only include provided fields
  const updateData: Record<string, unknown> = {}

  if (typeof pixelId === 'string') {
    const cleaned = pixelId.trim()
    if (cleaned && !/^\d{10,20}$/.test(cleaned)) {
      return NextResponse.json({ error: 'Facebook Pixel ID invalide (doit être numérique)' }, { status: 400 })
    }
    updateData.facebookPixelId = cleaned || null
  }

  if (typeof accessToken === 'string') {
    const cleaned = accessToken.trim()
    if (cleaned) {
      updateData.facebookAccessToken = encryptToken(cleaned)
    } else {
      updateData.facebookAccessToken = null
    }
  }

  if (typeof catalogId === 'string') {
    updateData.facebookCatalogId = catalogId.trim() || null
  }

  if (typeof catalogEnabled === 'boolean') {
    updateData.catalogEnabled = catalogEnabled
    // If enabling catalog, count the products
    if (catalogEnabled) {
      const count = await db.product.count({ where: { shopId, isAvailable: true } })
      updateData.catalogProductCount = count
      updateData.catalogLastSync = new Date()
    }
  }

  if (typeof trackPageViews === 'boolean') updateData.trackPageViews = trackPageViews
  if (typeof trackProductViews === 'boolean') updateData.trackProductViews = trackProductViews
  if (typeof trackWhatsAppClicks === 'boolean') updateData.trackWhatsAppClicks = trackWhatsAppClicks

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 })
  }

  const shop = await db.shop.update({
    where: { id: shopId },
    data: updateData,
    select: {
      facebookPixelId: true,
      facebookCatalogId: true,
      facebookConnected: true,
      facebookPageName: true,
      catalogEnabled: true,
      catalogProductCount: true,
      trackPageViews: true,
      trackProductViews: true,
      trackWhatsAppClicks: true,
    },
  })

  return NextResponse.json({ success: true, shop })
}

// ─── PUT: Test Pixel / Validate Token ─────────────────────────────────────────

export async function PUT(request: NextRequest) {
  const { user, response } = await requireAuth(request)
  if (!user) return response

  const body = await request.json()
  const { action, pixelId, accessToken } = body as Record<string, unknown>

  if (action === 'test-pixel' && typeof pixelId === 'string') {
    const result = await testPixel(pixelId.trim())
    return NextResponse.json(result)
  }

  if (action === 'validate-token' && typeof accessToken === 'string' && typeof pixelId === 'string') {
    const result = await validateAccessToken(accessToken.trim(), pixelId.trim())
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}