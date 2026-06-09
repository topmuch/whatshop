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

async function updateConfig(request: NextRequest) {
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

  const data: Record<string, unknown> = {}
  if (saasName !== undefined) data.saasName = saasName
  if (primaryColor !== undefined) data.primaryColor = primaryColor
  if (logoUrl !== undefined) data.logoUrl = logoUrl
  if (defaultWhatsappMessage !== undefined) data.defaultWhatsappMessage = defaultWhatsappMessage
  if (standardPrice !== undefined) data.standardPrice = standardPrice
  if (proPrice !== undefined) data.proPrice = proPrice
  if (adminWhatsAppNumber !== undefined) data.adminWhatsAppNumber = adminWhatsAppNumber

  if (!config) {
    config = await db.saasConfig.create({ data })
  } else {
    config = await db.saasConfig.update({ where: { id: config.id }, data })
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
}

// PUT and PATCH both use the same update logic
export async function PUT(request: NextRequest) {
  try {
    return await updateConfig(request)
  } catch (error) {
    console.error('Admin config update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    return await updateConfig(request)
  } catch (error) {
    console.error('Admin config update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
