import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    let config = await db.saasConfig.findFirst()

    // Auto-create singleton if it doesn't exist
    if (!config) {
      config = await db.saasConfig.create({
        data: {},
      })
    }

    return NextResponse.json({
      id: config.id,
      saasName: config.saasName,
      primaryColor: config.primaryColor,
      logoUrl: config.logoUrl,
      defaultWhatsappMessage: config.defaultWhatsappMessage,
      standardPrice: config.standardPrice,
      proPrice: config.proPrice,
      adminWhatsAppNumber: config.adminWhatsAppNumber,
      updatedAt: config.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Admin config get error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const {
      saasName,
      primaryColor,
      logoUrl,
      defaultWhatsappMessage,
      standardPrice,
      proPrice,
      adminWhatsAppNumber,
    } = body

    let config = await db.saasConfig.findFirst()

    if (!config) {
      config = await db.saasConfig.create({
        data: {
          ...(saasName ? { saasName } : {}),
          ...(primaryColor ? { primaryColor } : {}),
          ...(logoUrl !== undefined ? { logoUrl } : {}),
          ...(defaultWhatsappMessage ? { defaultWhatsappMessage } : {}),
          ...(standardPrice !== undefined ? { standardPrice } : {}),
          ...(proPrice !== undefined ? { proPrice } : {}),
          ...(adminWhatsAppNumber !== undefined ? { adminWhatsAppNumber } : {}),
        },
      })
    } else {
      config = await db.saasConfig.update({
        where: { id: config.id },
        data: {
          ...(saasName ? { saasName } : {}),
          ...(primaryColor ? { primaryColor } : {}),
          ...(logoUrl !== undefined ? { logoUrl } : {}),
          ...(defaultWhatsappMessage ? { defaultWhatsappMessage } : {}),
          ...(standardPrice !== undefined ? { standardPrice } : {}),
          ...(proPrice !== undefined ? { proPrice } : {}),
          ...(adminWhatsAppNumber !== undefined ? { adminWhatsAppNumber } : {}),
        },
      })
    }

    return NextResponse.json({
      id: config.id,
      saasName: config.saasName,
      primaryColor: config.primaryColor,
      logoUrl: config.logoUrl,
      defaultWhatsappMessage: config.defaultWhatsappMessage,
      standardPrice: config.standardPrice,
      proPrice: config.proPrice,
      adminWhatsAppNumber: config.adminWhatsAppNumber,
      updatedAt: config.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Admin config update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
