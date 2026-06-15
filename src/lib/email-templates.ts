/**
 * email-templates.ts — HTML Email Templates for Boutiko
 *
 * All templates return ready-to-send HTML strings.
 * Design: clean, mobile-responsive, Boutiko-branded.
 */

const BASE_STYLES = `
  body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width: 560px; margin: 0 auto; padding: 20px 16px; }
  .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #000000, #1a1a2e); padding: 28px 24px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
  .body { padding: 28px 24px; }
  .body h2 { color: #111827; font-size: 18px; margin: 0 0 12px; }
  .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
  .highlight { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
  .highlight p { margin: 0; color: #166534; }
  .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
  .warning p { margin: 0; color: #92400e; }
  .error { background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
  .error p { margin: 0; color: #991b1b; }
  .button { display: inline-block; background: #000000; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
  .button-outline { display: inline-block; border: 2px solid #000000; color: #000000 !important; text-decoration: none; padding: 10px 26px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
  .details { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .details table { width: 100%; border-collapse: collapse; }
  .details td { padding: 6px 0; font-size: 14px; color: #374151; }
  .details td:first-child { font-weight: 600; color: #111827; width: 40%; }
  .footer { padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb; }
  .footer p { color: #9ca3af; font-size: 12px; margin: 0 0 4px; }
  .footer a { color: #6b7280; text-decoration: underline; }
`

function wrap(headerTitle: string, headerSubtitle: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${BASE_STYLES}</style></head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>${headerTitle}</h1>
        ${headerSubtitle ? `<p>${headerSubtitle}</p>` : ''}
      </div>
      <div class="body">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p>Boutiko — Créez votre boutique en ligne en Afrique</p>
        <p><a href="https://boutiko.pro">boutiko.pro</a></p>
        <p>Cet email vous a été envoyé car vous êtes inscrit(e) sur Boutiko.</p>
      </div>
    </div>
  </div>
</body></html>`
}

// ─── TEMPLATES ───────────────────────────────────────────────────────────

export interface WelcomeEmailData {
  userName: string
  shopName: string
  shopSlug: string
  shopUrl: string
  plan: string
  isPaidPlan: boolean
}

export function welcomeEmail(data: WelcomeEmailData): string {
  return wrap(
    'Bienvenue sur Boutiko ! 🎉',
    'Votre boutique est prête',
    `
      <p>Bonjour <strong>${esc(data.userName)}</strong>,</p>
      <p>Félicitations ! Votre boutique <strong>${esc(data.shopName)}</strong> est maintenant créée sur Boutiko.</p>
      ${data.isPaidPlan ? `
        <div class="warning">
          <p><strong>Plan Pro demandé.</strong> Votre demande est en cours de traitement. Votre site sera activé sous 1H après validation par notre équipe.</p>
        </div>
      ` : `
        <div class="highlight">
          <p><strong>Votre boutique est active !</strong> Vous avez 7 jours d'essai gratuit.</p>
        </div>
      `}
      <div class="details">
        <table>
          <tr><td>Boutique</td><td>${esc(data.shopName)}</td></tr>
          <tr><td>Plan</td><td>${esc(data.plan)}</td></tr>
          <tr><td>URL</td><td><a href="${esc(data.shopUrl)}">${esc(data.shopUrl)}</a></td></tr>
        </table>
      </div>
      <p style="text-align:center; margin-top:24px;">
        <a href="${esc(data.shopUrl)}" class="button">Voir ma boutique</a>
      </p>
      <p>Pour commencer, connectez-vous à votre tableau de bord pour ajouter vos produits.</p>
      <p style="text-align:center; margin-top:8px;">
        <a href="https://boutiko.pro" class="button-outline">Accéder au tableau de bord</a>
      </p>
    `
  )
}

export interface NewOrderEmailData {
  shopOwnerName: string
  shopName: string
  customerName: string | null
  customerPhone: string | null
  total: number
  items: { name: string; quantity: number; price: number }[]
  shopDashboardUrl: string
}

export function newOrderEmail(data: NewOrderEmailData): string {
  const itemsHtml = data.items
    .map(item => `<tr><td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; font-size:14px;">${esc(item.name)}</td><td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; font-size:14px; text-align:center;">${item.quantity}</td><td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; font-size:14px; text-align:right;">${item.price.toLocaleString('fr-FR')} FCFA</td></tr>`)
    .join('')

  return wrap(
    'Nouvelle commande ! 📦',
    data.shopName,
    `
      <p>Bonjour <strong>${esc(data.shopOwnerName)}</strong>,</p>
      <p>Vous avez reçu une nouvelle commande sur <strong>${esc(data.shopName)}</strong> :</p>
      <div class="details">
        <table>
          <tr><td>Client</td><td>${esc(data.customerName || 'Non renseigné')}</td></tr>
          <tr><td>Téléphone</td><td>${esc(data.customerPhone || 'Non renseigné')}</td></tr>
          <tr><td>Total</td><td><strong>${data.total.toLocaleString('fr-FR')} FCFA</strong></td></tr>
        </table>
      </div>
      <table style="width:100%; border-collapse:collapse; margin:16px 0; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 8px; text-align:left; font-size:13px; color:#6b7280; font-weight:600;">Produit</th>
            <th style="padding:10px 8px; text-align:center; font-size:13px; color:#6b7280; font-weight:600;">Qté</th>
            <th style="padding:10px 8px; text-align:right; font-size:13px; color:#6b7280; font-weight:600;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="text-align:center; margin-top:20px;">
        <a href="${esc(data.shopDashboardUrl)}" class="button">Voir les commandes</a>
      </p>
    `
  )
}

export interface DomainApprovedEmailData {
  shopOwnerName: string
  domain: string
  shopName: string
  dnsInstructions?: string | null
}

export function domainApprovedEmail(data: DomainApprovedEmailData): string {
  return wrap(
    'Domaine approuvé ! ✅',
    data.domain,
    `
      <p>Bonjour <strong>${esc(data.shopOwnerName)}</strong>,</p>
      <p>Votre demande de domaine personnalisé pour <strong>${esc(data.shopName)}</strong> a été approuvée.</p>
      <div class="highlight">
        <p><strong>Votre domaine :</strong> ${esc(data.domain)}</p>
      </div>
      ${data.dnsInstructions ? `
        <div class="details">
          <p style="font-weight:600; margin-bottom:8px;">Instructions DNS :</p>
          <p>${esc(data.dnsInstructions)}</p>
        </div>
      ` : `
        <div class="details">
          <p style="font-weight:600; margin-bottom:8px;">Configuration requise :</p>
          <p>Configurez un enregistrement CNAME pointant vers <code>boutiko.pro</code> pour que votre domaine soit actif.</p>
        </div>
      `}
      <p>La propagation DNS peut prendre jusqu'à 48h.</p>
    `
  )
}

export interface DomainRejectedEmailData {
  shopOwnerName: string
  domain: string
  shopName: string
  reason: string
}

export function domainRejectedEmail(data: DomainRejectedEmailData): string {
  return wrap(
    'Domaine refusé',
    data.domain,
    `
      <p>Bonjour <strong>${esc(data.shopOwnerName)}</strong>,</p>
      <p>Votre demande de domaine <strong>${esc(data.domain)}</strong> pour <strong>${esc(data.shopName)}</strong> n'a pas pu être approuvée.</p>
      <div class="error">
        <p><strong>Raison :</strong> ${esc(data.reason)}</p>
      </div>
      <p>Vous pouvez soumettre une nouvelle demande depuis les paramètres de votre boutique.</p>
      <p style="text-align:center; margin-top:16px;">
        <a href="https://boutiko.pro" class="button-outline">Modifier ma demande</a>
      </p>
    `
  )
}

export interface ShopActivatedEmailData {
  userName: string
  shopName: string
  shopUrl: string
  plan: string
}

export function shopActivatedEmail(data: ShopActivatedEmailData): string {
  return wrap(
    'Votre site est maintenant actif ! 🎉',
    data.shopName,
    `
      <p>Bonjour <strong>${esc(data.userName)}</strong>,</p>
      <p>Votre boutique <strong>${esc(data.shopName)}</strong> a été validée et est maintenant <strong>active</strong> !</p>
      <div class="highlight">
        <p><strong>Plan :</strong> ${esc(data.plan)}</p>
      </div>
      <p style="text-align:center; margin-top:20px;">
        <a href="${esc(data.shopUrl)}" class="button">Voir ma boutique</a>
      </p>
      <p>Vous pouvez maintenant ajouter vos produits et commencer à vendre.</p>
    `
  )
}

export interface AdminNewShopEmailData {
  shopName: string
  ownerName: string
  ownerEmail: string
  plan: string
  sector: string | null
  businessType: string
}

export function adminNewShopEmail(data: AdminNewShopEmailData): string {
  return wrap(
    'Nouvelle boutique créée',
    'Notification admin',
    `
      <p>Une nouvelle boutique a été créée sur Boutiko :</p>
      <div class="details">
        <table>
          <tr><td>Boutique</td><td>${esc(data.shopName)}</td></tr>
          <tr><td>Propriétaire</td><td>${esc(data.ownerName)}</td></tr>
          <tr><td>Email</td><td>${esc(data.ownerEmail)}</td></tr>
          <tr><td>Plan</td><td>${esc(data.plan)}</td></tr>
          <tr><td>Secteur</td><td>${esc(data.sector || 'Non défini')}</td></tr>
          <tr><td>Type</td><td>${esc(data.businessType)}</td></tr>
        </table>
      </div>
      <p style="text-align:center; margin-top:16px;">
        <a href="https://boutiko.pro" class="button-outline">Tableau de bord admin</a>
      </p>
    `
  )
}

export interface AdminNewOrderEmailData {
  shopName: string
  ownerName: string
  total: number
  customerName: string | null
}

export function adminNewOrderEmail(data: AdminNewOrderEmailData): string {
  return wrap(
    'Nouvelle commande',
    'Notification admin',
    `
      <p>Une nouvelle commande a été passée :</p>
      <div class="details">
        <table>
          <tr><td>Boutique</td><td>${esc(data.shopName)}</td></tr>
          <tr><td>Vendeur</td><td>${esc(data.ownerName)}</td></tr>
          <tr><td>Client</td><td>${esc(data.customerName || 'Non renseigné')}</td></tr>
          <tr><td>Montant</td><td><strong>${data.total.toLocaleString('fr-FR')} FCFA</strong></td></tr>
        </table>
      </div>
    `
  )
}

// ─── HELPERS ────────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}