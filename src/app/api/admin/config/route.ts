import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

const CONFIG_FIELDS = [
  'saasName', 'primaryColor', 'logoUrl', 'defaultWhatsappMessage',
  'starterPrice', 'standardPrice', 'proPrice', 'businessPrice', 'adminWhatsAppNumber',
  'supportEmail', 'senderName', 'autoWelcomeEmail',
  'notifyNewSeller', 'notifyNewOrder', 'notifyDomainRequest',
  'notifySupportTicket', 'weeklyReport', 'lowStockAlerts',
  'smtpHost', 'smtpPort', 'smtpUser', 'smtpPass',
  'emailFrom', 'emailFromName', 'smtpConfigured',
  'waveApiKey', 'waveWebhookSecret',
] as const

function configToJson(config: any) {
  return {
    id: config.id,
    saasName: config.saasName,
    primaryColor: config.primaryColor,
    logoUrl: config.logoUrl,
    defaultWhatsappMessage: config.defaultWhatsappMessage,
    starterPrice: config.starterPrice,
    standardPrice: config.standardPrice,
    proPrice: config.proPrice,
    businessPrice: config.businessPrice,
    adminWhatsAppNumber: config.adminWhatsAppNumber,
    supportEmail: config.supportEmail,
    senderName: config.senderName,
    smtpHost: config.smtpHost,
    smtpPort: config.smtpPort,
    smtpUser: config.smtpUser,
    smtpPass: config.smtpPass,
    emailFrom: config.emailFrom,
    emailFromName: config.emailFromName,
    smtpConfigured: config.smtpConfigured,
    waveApiKey: config.waveApiKey,
    waveWebhookSecret: config.waveWebhookSecret,
    autoWelcomeEmail: config.autoWelcomeEmail,
    notifyNewSeller: config.notifyNewSeller,
    notifyNewOrder: config.notifyNewOrder,
    notifyDomainRequest: config.notifyDomainRequest,
    notifySupportTicket: config.notifySupportTicket,
    weeklyReport: config.weeklyReport,
    lowStockAlerts: config.lowStockAlerts,
    updatedAt: config.updatedAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

    let config = await db.saaSConfig.findFirst()

    if (!config) {
      config = await db.saaSConfig.create({ data: {} })
    }

    return NextResponse.json(configToJson(config))
  } catch (error) {
    console.error('Admin config get error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

async function updateConfig(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if (!admin) return adminUnauthorized()

  const body = await request.json()

  let config = await db.saaSConfig.findFirst()

  const data: Record<string, unknown> = {}
  for (const field of CONFIG_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field]
    }
  }

  if (!config) {
    config = await db.saaSConfig.create({ data })
  } else {
    config = await db.saaSConfig.update({ where: { id: config.id }, data })
  }

  return NextResponse.json(configToJson(config))
}

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