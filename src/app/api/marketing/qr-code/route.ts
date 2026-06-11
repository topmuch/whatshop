import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateQRCodeDataURL, generateQRSVG } from '@/lib/qr-generator'

interface QRCodeRequestBody {
  shopId: string
  size?: number
  color?: string
  format?: 'png' | 'svg'
  logoUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('whatsshop-user')?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    let user: { id: string; role: string } | null = null
    try {
      user = JSON.parse(sessionCookie)
    } catch {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    if (!user?.id) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    const body: QRCodeRequestBody = await request.json()
    const { shopId, size = 600, color, format = 'png', logoUrl } = body

    if (!shopId) {
      return NextResponse.json({ error: 'shopId requis' }, { status: 400 })
    }

    const validSize = Math.min(Math.max(Number(size) || 600, 100), 2000)

    // Verify user owns the shop
    const shop = await db.shop.findFirst({
      where: {
        id: shopId,
        ownerId: user.id,
      },
      select: {
        id: true,
        slug: true,
        primaryColor: true,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable ou non autorisée' }, { status: 404 })
    }

    // Build the QR code target URL
    const origin = request.headers.get('x-forwarded-host')
      ? `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('x-forwarded-host')}`
      : 'https://whatshop.shop'

    const shopUrl = `${origin}/${shop.slug}`

    const qrColor = color || shop.primaryColor || '#000000'

    let qrData: string

    if (format === 'svg') {
      qrData = await generateQRSVG(shopUrl, {
        color: qrColor,
        errorCorrectionLevel: logoUrl ? 'H' : 'M',
      })
    } else {
      qrData = await generateQRCodeDataURL(shopUrl, {
        size: validSize,
        color: qrColor,
        errorCorrectionLevel: logoUrl ? 'H' : 'M',
      })
    }

    // Save MarketingAsset record
    await db.marketingAsset.create({
      data: {
        shopId: shop.id,
        type: 'QR_CODE',
        template: format,
        config: JSON.stringify({
          size: validSize,
          color: qrColor,
          format,
          shopUrl,
          hasLogo: !!logoUrl,
        }),
      },
    })

    return NextResponse.json({
      qrData,
      format,
      shopUrl,
    })
  } catch (error) {
    console.error('Marketing QR code generation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du QR code' },
      { status: 500 }
    )
  }
}