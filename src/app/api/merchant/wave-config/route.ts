import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/merchant/wave-config — Récupérer la config Wave du marchand connecté
// PUT /api/merchant/wave-config — Sauvegarder la config Wave du marchand

export async function GET(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const config = await db.merchantWaveConfig.findUnique({
      where: { userId: user.id },
    })

    if (!config) {
      return NextResponse.json({
        configured: false,
        wavePhoneNumber: '',
        isActive: false,
      })
    }

    return NextResponse.json({
      configured: true,
      id: config.id,
      wavePhoneNumber: config.wavePhoneNumber,
      hasApiKey: !!config.waveApiKey,
      isActive: config.isActive,
      configuredAt: config.configuredAt,
    })
  } catch (error) {
    console.error('[Merchant Wave Config GET] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = await request.json()
    const { wavePhoneNumber, waveApiKey, isActive } = body as {
      wavePhoneNumber?: string
      waveApiKey?: string
      isActive?: boolean
    }

    if (!wavePhoneNumber) {
      return NextResponse.json({ error: 'Numéro Wave requis' }, { status: 400 })
    }

    // Normaliser le numéro (ajouter +221 si nécessaire)
    let normalizedPhone = wavePhoneNumber.trim()
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+221' + normalizedPhone.slice(1)
    } else if (normalizedPhone.startsWith('7') || normalizedPhone.startsWith('77') || normalizedPhone.startsWith('78') || normalizedPhone.startsWith('76') || normalizedPhone.startsWith('75') || normalizedPhone.startsWith('70')) {
      normalizedPhone = '+221' + normalizedPhone
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+' + normalizedPhone
    }

    // Upsert la config
    const config = await db.merchantWaveConfig.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        wavePhoneNumber: normalizedPhone,
        waveApiKey: waveApiKey || null,
        isActive: isActive !== false,
      },
      update: {
        wavePhoneNumber: normalizedPhone,
        ...(waveApiKey !== undefined ? { waveApiKey: waveApiKey || null } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Configuration Wave sauvegardée',
      configured: true,
      wavePhoneNumber: config.wavePhoneNumber,
      hasApiKey: !!config.waveApiKey,
      isActive: config.isActive,
    })
  } catch (error) {
    console.error('[Merchant Wave Config PUT] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}