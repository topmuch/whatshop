import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, shopName } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 })
    }

    // Use a free QR code API to generate SVG
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&format=svg&color=25D366&bgcolor=FFFFFF`

    const response = await fetch(qrUrl)
    if (!response.ok) {
      return NextResponse.json({ error: 'Erreur lors de la génération du QR code' }, { status: 500 })
    }

    const svg = await response.text()

    return NextResponse.json({ svg, url, shopName: shopName || '' })
  } catch (error) {
    console.error('QR code generation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du QR code' }, { status: 500 })
  }
}
