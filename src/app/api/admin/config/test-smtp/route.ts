import { NextResponse } from 'next/server'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'
import { testSmtpConnection, invalidateEmailCache, sendEmail, isEmailConfigured } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin(request as any)
    if (!admin) return adminUnauthorized()

    // Clear cache to pick up latest DB config
    invalidateEmailCache()

    const body = await request.json().catch(() => ({}))
    const { mode, testEmailTo } = body as { mode?: string; testEmailTo?: string }

    // Mode: "send" = send a real test email, default = connection test only
    if (mode === 'send' && testEmailTo) {
      if (!(await isEmailConfigured())) {
        return NextResponse.json({ success: false, message: 'SMTP non configuré' })
      }

      const testHtml = `
        <div style="max-width:560px; margin:0 auto; font-family:system-ui,-apple-system,sans-serif;">
          <div style="background:linear-gradient(135deg,#10B981,#059669); padding:32px; border-radius:12px 12px 0 0; text-align:center;">
            <h1 style="color:white; margin:0; font-size:24px;">📧 Email de test — Boutiko</h1>
          </div>
          <div style="background:white; padding:32px; border:1px solid #e5e7eb; border-top:none; border-radius:0 0 12px 12px;">
            <p style="font-size:16px; color:#374151;">Bonjour,</p>
            <p style="font-size:16px; color:#374151;">Ceci est un <strong>email de test</strong> envoyé depuis la configuration SMTP de votre plateforme Boutiko.</p>
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px; margin:20px 0; text-align:center;">
              <p style="color:#166534; margin:0; font-size:18px;">✅ La configuration SMTP fonctionne correctement !</p>
            </div>
            <p style="font-size:14px; color:#6b7280;">Si vous recevez cet email, votre serveur SMTP est bien configuré et les emails transactionnels seront envoyés normalement.</p>
            <p style="font-size:14px; color:#9ca3af; margin-top:24px;">Envoyé le ${new Date().toLocaleString('fr-FR', { timeZone: 'UTC', dateStyle: 'full', timeStyle: 'short' })}</p>
          </div>
        </div>
      `

      const sent = await sendEmail({
        to: testEmailTo,
        subject: '✅ Email de test — Boutiko SMTP',
        html: testHtml,
      })

      if (sent) {
        return NextResponse.json({ success: true, message: `Email de test envoyé à ${testEmailTo}` })
      }
      return NextResponse.json({ success: false, message: "Échec de l'envoi de l'email" })
    }

    // Default: connection test only
    const result = await testSmtpConnection()
    return NextResponse.json(result)
  } catch (error) {
    console.error('SMTP test error:', error)
    return NextResponse.json(
      { success: false, message: `Erreur serveur: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    )
  }
}