import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { generateQRSVG, generateQRCodeDataURL } from '@/lib/qr-generator'

interface MenuQRRequestBody {
  shopId: string
  format?: 'svg' | 'png'
  size?: number
  color?: string
  /** 'shop' for homepage (/${slug}), 'menu' for menu page (/menu/${slug}) */
  target?: 'shop' | 'menu'
}

export async function POST(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body: MenuQRRequestBody = await request.json()
    const { shopId, format = 'svg', size = 1000, color, target = 'shop' } = body

    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 })
    }

    // Verify ownership
    const shop = await db.shop.findFirst({
      where: { id: shopId, ownerId: user.id },
      select: {
        id: true,
        slug: true,
        name: true,
        isRestaurant: true,
        primaryColor: true,
        accentColor: true,
        logo: true,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    // Build the menu URL
    const origin = request.headers.get('x-forwarded-host')
      ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('x-forwarded-host')}`
      : 'https://boutiko.pro'

    const menuUrl = target === 'menu'
      ? `${origin}/menu/${shop.slug}`
      : `${origin}/${shop.slug}`
    const qrColor = color || shop.accentColor || shop.primaryColor || '#10B981'
    const validSize = Math.min(Math.max(Number(size) || 1000, 200), 2000)

    let qrData: string
    if (format === 'svg') {
      qrData = await generateQRSVG(menuUrl, {
        color: qrColor,
        errorCorrectionLevel: 'H',
      })
    } else {
      qrData = await generateQRCodeDataURL(menuUrl, {
        size: validSize,
        color: qrColor,
        errorCorrectionLevel: 'H',
      })
    }

    // Mark shop as restaurant and save QR
    const storedQr = format === 'svg'
      ? `data:image/svg+xml;base64,${Buffer.from(qrData).toString('base64')}`
      : qrData

    await db.shop.update({
      where: { id: shop.id },
      data: {
        isRestaurant: true,
        qrCodeUrl: storedQr,
      },
    })

    return NextResponse.json({
      qrData: format === 'svg' ? storedQr : qrData,
      format,
      menuUrl,
      shopName: shop.name,
      isRestaurant: target === 'menu',
      target,
    })
  } catch (error) {
    console.error('Menu QR code generation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du QR code menu' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/menu-qr?shopId=xxx
 * Returns the stored QR code for a shop.
 */
export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 })
    }

    const shop = await db.shop.findFirst({
      where: { id: shopId, ownerId: user.id },
      select: {
        id: true,
        slug: true,
        name: true,
        isRestaurant: true,
        qrCodeUrl: true,
        accentColor: true,
        primaryColor: true,
        logo: true,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })
    }

    const origin = request.headers.get('x-forwarded-host')
      ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('x-forwarded-host')}`
      : 'https://boutiko.pro'

    return NextResponse.json({
      shopId: shop.id,
      shopName: shop.name,
      shopSlug: shop.slug,
      isRestaurant: shop.isRestaurant,
      qrCodeUrl: shop.qrCodeUrl,
      menuUrl: `${origin}/${shop.slug}`,
      accentColor: shop.accentColor || shop.primaryColor || '#10B981',
      logo: shop.logo,
    })
  } catch (error) {
    console.error('Menu QR GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}