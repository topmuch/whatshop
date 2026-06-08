import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const { url, shopName } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 })
    }

    // Generate QR code as PNG buffer
    const qrBuffer: Buffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 600,
      margin: 2,
      color: {
        dark: '#1a1a2e',   // Dark foreground
        light: '#FFFFFF',  // White background
      },
      errorCorrectionLevel: 'H', // High - best for scanning
    })

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
