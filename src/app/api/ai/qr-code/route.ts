import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { requireAuth } from '@/lib/auth'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const { user, response: authError } = await requireAuth(request)
    if (authError) return authError
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Rate limiting
    const ip = getClientIp(request)
    const rl = rateLimit(ip, RATE_LIMITS.ai)
    if (!rl.success) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 })
    }
    const { url, shopName } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 })
    }

    // Generate QR code as PNG buffer
    let qrBuffer: Buffer
    try {
      qrBuffer = await QRCode.toBuffer(url, {
        type: 'png',
        width: 600,
        margin: 2,
        color: {
          dark: '#1a1a2e',   // Dark foreground
          light: '#FFFFFF',  // White background
        },
        errorCorrectionLevel: 'H', // High - best for scanning
      })
    } catch (qrError) {
      console.error('QR code generation failed:', qrError)
      return NextResponse.json({ error: 'Échec de la génération du QR code. Vérifiez l\'URL fournie.' }, { status: 422 })
    }

    // Convert buffer to base64 data URL
    const base64 = qrBuffer.toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    return NextResponse.json({
      dataUrl,
      url,
      shopName: shopName || '',
    })
  } catch (error) {
    console.error('QR code generation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du QR code' }, { status: 500 })
  }
}
