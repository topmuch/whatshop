import { NextResponse } from 'next/server'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'
import nodemailer from 'nodemailer'
import { invalidateEmailCache } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin(request as any)
    if (!admin) return adminUnauthorized()

    const body = await request.json().catch(() => ({}))
    const { mode, testEmailTo, smtpHost, smtpPort, smtpUser, smtpPass, emailFrom, emailFromName } = body as {
      mode?: string
      testEmailTo?: string
      smtpHost?: string
      smtpPort?: number
      smtpUser?: string
      smtpPass?: string
      emailFrom?: string
      emailFromName?: string
    }

    // If SMTP fields are provided directly (from form), use them instead of DB
    const host = smtpHost
    const port = smtpPort || 587
    const user = smtpUser
    const pass = smtpPass
    const fromEmail = emailFrom || user
    const fromName = emailFromName || 'Boutiko'

    // Validate we have minimum config
    if (!host || !user || !pass) {
      return NextResponse.json({ success: false, message: 'Remplissez au minimum : Hôte SMTP, Utilisateur et Mot de passe' })
    }

    // Create a one-off transporter with the provided config (or cached one from DB)
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
    })

    // Mode: "send" = send a real test email
    if (mode === 'send' && testEmailTo) {
      const testHtml = `
        <div style="max-width:560px; margin:0 auto; font-family:system-ui,-apple-system,sans-serif;">
          <div style="background:linear-gradient(135deg,#10B981,#059669); padding:32px; border-radius:12px 12px 0 0; text-align:center;">
            <h1 style="color:white; margin:0; font-size:24px;">Email de test — Boutiko</h1>
          </div>
          <div style="background:white; padding:32px; border:1px solid #e5e7eb; border-top:none; border-radius:0 0 12px 12px;">
            <p style="font-size:16px; color:#374151;">Bonjour,</p>
            <p style="font-size:16px; color:#374151;">Ceci est un <strong>email de test</strong> envoyé depuis la configuration SMTP de votre plateforme Boutiko.</p>
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px; margin:20px 0; text-align:center;">
              <p style="color:#166534; margin:0; font-size:18px;">La configuration SMTP fonctionne correctement !</p>
            </div>
            <p style="font-size:14px; color:#6b7280;">Si vous recevez cet email, votre serveur SMTP est bien configuré et les emails transactionnels seront envoyés normalement.</p>
            <p style="font-size:14px; color:#9ca3af; margin-top:24px;">Envoyé le ${new Date().toLocaleString('fr-FR', { timeZone: 'UTC', dateStyle: 'full', timeStyle: 'short' })}</p>
          </div>
        </div>
      `

      try {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: testEmailTo,
          subject: 'Email de test — Boutiko SMTP',
          html: testHtml,
        })
        // Also invalidate cache so future sends use DB config
        invalidateEmailCache()
        return NextResponse.json({ success: true, message: `Email de test envoyé à ${testEmailTo}` })
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Erreur inconnue'
        return NextResponse.json({ success: false, message: `Envoi échoué : ${msg}` })
      }
    }

    // Default: connection test only
    try {
      await transporter.verify()
      // Invalidate cache so if user saves after this, fresh config is used
      invalidateEmailCache()
      return NextResponse.json({ success: true, message: `Connexion réussie à ${host}:${port}` })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      return NextResponse.json({ success: false, message: `Échec : ${msg}` })
    }
  } catch (error) {
    console.error('SMTP test error:', error)
    return NextResponse.json(
      { success: false, message: `Erreur serveur: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    )
  }
}