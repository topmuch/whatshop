/**
 * email.ts — SMTP Email Service (Nodemailer)
 *
 * Priority: DB (SaaSConfig) → Environment variables
 * SMTP not configured = emails silently disabled (never throws)
 */
import nodemailer from 'nodemailer'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

// ─── CONFIG CACHE ───────────────────────────────────────────────────────

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  fromName: string
  fromEmail: string
  supportEmail: string
}

let _cachedConfig: SmtpConfig | null = null
let _cachedAt = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const now = Date.now()
  if (_cachedConfig && now - _cachedAt < CACHE_TTL) return _cachedConfig

  // 1. Try DB config
  try {
    const config = await db.saaSConfig.findFirst({
      select: {
        smtpHost: true, smtpPort: true, smtpUser: true, smtpPass: true,
        emailFrom: true, emailFromName: true, supportEmail: true,
        smtpConfigured: true,
      },
    })
    if (config?.smtpConfigured && config.smtpHost && config.smtpUser && config.smtpPass) {
      _cachedConfig = {
        host: config.smtpHost,
        port: config.smtpPort || 587,
        secure: (config.smtpPort || 587) === 465,
        user: config.smtpUser,
        pass: config.smtpPass,
        fromName: config.emailFromName || 'Boutiko',
        fromEmail: config.emailFrom || config.smtpUser,
        supportEmail: config.supportEmail || config.smtpUser,
      }
      _cachedAt = now
      return _cachedConfig
    }
  } catch { /* DB not ready yet */ }

  // 2. Fallback to env vars
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return null

  _cachedConfig = {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    fromName: process.env.EMAIL_FROM_NAME || 'Boutiko',
    fromEmail: process.env.EMAIL_FROM || user,
    supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'support@boutiko.pro',
  }
  _cachedAt = now
  return _cachedConfig
}

// ─── TRANSPORT ──────────────────────────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null
let _transporterKey = ''

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  const config = await getSmtpConfig()
  if (!config) return null

  const key = `${config.host}:${config.port}:${config.user}`
  if (_transporter && _transporterKey === key) return _transporter

  _transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  })
  _transporterKey = key
  return _transporter
}

/** Invalidate config cache (called when admin saves SMTP settings) */
export function invalidateEmailCache(): void {
  _cachedConfig = null
  _cachedAt = 0
  _transporter = null
  _transporterKey = ''
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const config = await getSmtpConfig()
  if (!config) return false

  const transporter = await getTransporter()
  if (!transporter) return false

  try {
    const from = `"${config.fromName}" <${config.fromEmail}>`
    await transporter.sendMail({
      from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || config.fromEmail,
    })
    return true
  } catch (error) {
    logger.error(`Email send failed to ${options.to}: ${error instanceof Error ? error.message : error}`, 'Email')
    return false
  }
}

export async function isEmailConfigured(): Promise<boolean> {
  const config = await getSmtpConfig()
  return config !== null
}

export async function getSupportEmail(): Promise<string> {
  const config = await getSmtpConfig()
  return config?.supportEmail || 'support@boutiko.pro'
}

/**
 * Test SMTP connection. Returns { success, message }.
 */
export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getSmtpConfig()
    if (!config) return { success: false, message: 'SMTP non configuré' }

    const transporter = await getTransporter()
    if (!transporter) return { success: false, message: 'Impossible de créer le transport' }

    await transporter.verify()
    return { success: true, message: `Connexion réussie à ${config.host}:${config.port}` }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, message: `Échec : ${msg}` }
  }
}