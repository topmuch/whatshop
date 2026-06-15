/**
 * email.ts — SMTP Email Service (Nodemailer)
 *
 * Uses SMTP configuration from environment variables.
 * Email sending failures are logged but never throw — they run as fire-and-forget.
 */
import nodemailer from 'nodemailer'
import { logger } from '@/lib/logger'

// ─── LAZY CONFIG (no module-level env reads) ────────────────────────────

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  fromName: string
  fromEmail: string
}

let _smtpConfig: SmtpConfig | null = null
let _transporter: nodemailer.Transporter | null = null

function getSmtpConfig(): SmtpConfig | null {
  if (_smtpConfig !== null) return _smtpConfig

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    // SMTP not configured — email is disabled
    return null
  }

  _smtpConfig = {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    fromName: process.env.EMAIL_FROM_NAME || 'Boutiko',
    fromEmail: process.env.EMAIL_FROM || user,
  }

  return _smtpConfig
}

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter

  const config = getSmtpConfig()
  if (!config) return null

  _transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    // Connection timeout for slow networks (Africa)
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  })

  return _transporter
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

/**
 * Send an email via SMTP. Returns true if sent, false if SMTP is not configured or failed.
 * Never throws — failures are logged.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const config = getSmtpConfig()
  if (!config) {
    logger.info('Email not sent: SMTP not configured', 'Email')
    return false
  }

  const transporter = getTransporter()
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

/**
 * Check if SMTP is properly configured.
 */
export function isEmailConfigured(): boolean {
  return getSmtpConfig() !== null
}

/**
 * Get the support email from SaaSConfig or env var.
 */
export function getSupportEmail(): string {
  return process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'support@boutiko.pro'
}