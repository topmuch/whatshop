import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

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
  const admin = await verifyAdmin(request)
  if (!admin) return adminUnauthorized()

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
