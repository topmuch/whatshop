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
  customerCity?: string | null
  customerAddress?: string | null
  total: number
  items: { name: string; quantity: number; price: number }[]
  shopDashboardUrl: string
}

export function newOrderEmail(data: NewOrderEmailData): string {
  const itemsHtml = data.items
    .map(item => `<tr><td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; font-size:14px;">${esc(item.name)}</td><td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; font-size:14px; text-align:center;">${item.quantity}</td><td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; font-size:14px; text-align:right;">${item.price.toLocaleString('fr-FR')} FCFA</td><td style="padding:6px 8px; border-bottom:1px solid #f3f4f6; font-size:14px; text-align:right;">${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</td></tr>`)
    .join('')

  const itemsTotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0)

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
          ${data.customerCity ? `<tr><td>Ville</td><td>${esc(data.customerCity)}</td></tr>` : ''}
          ${data.customerAddress ? `<tr><td>Adresse</td><td>${esc(data.customerAddress)}</td></tr>` : ''}
          <tr><td>Total</td><td><strong>${data.total.toLocaleString('fr-FR')} FCFA</strong></td></tr>
        </table>
      </div>
      <table style="width:100%; border-collapse:collapse; margin:16px 0; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 8px; text-align:left; font-size:13px; color:#6b7280; font-weight:600;">Produit</th>
            <th style="padding:10px 8px; text-align:center; font-size:13px; color:#6b7280; font-weight:600;">Qté</th>
            <th style="padding:10px 8px; text-align:right; font-size:13px; color:#6b7280; font-weight:600;">Prix unit.</th>
            <th style="padding:10px 8px; text-align:right; font-size:13px; color:#6b7280; font-weight:600;">Sous-total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="background:#f0fdf4;">
            <td colspan="3" style="padding:10px 8px; text-align:right; font-size:14px; font-weight:700;">Total</td>
            <td style="padding:10px 8px; text-align:right; font-size:14px; font-weight:700; color:#166534;">${itemsTotal.toLocaleString('fr-FR')} FCFA</td>
          </tr>
        </tfoot>
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
  shopSlug: string
  ownerName: string
  ownerEmail: string
  total: number
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  customerCity: string | null
  customerAddress: string | null
  customerNotes: string | null
  items: { name: string; quantity: number; price: number }[]
  orderId: string
}

export function adminNewOrderEmail(data: AdminNewOrderEmailData): string {
  const itemsRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;font-size:13px;">${esc(item.name)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:right;">${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</td>
        </tr>`
    )
    .join('')

  const notesBlock = data.customerNotes?.trim()
    ? `<p style="margin-top:12px;"><strong>📝 Notes :</strong> ${esc(data.customerNotes.trim())}</p>`
    : ''

  return wrap(
    'Nouvelle commande reçue',
    `Commande #${data.orderId.slice(-6)}`,
    `
      <p>Une nouvelle commande a été passée sur la plateforme.</p>

      <div class="details">
        <table>
          <tr><td>Boutique</td><td><a href="https://boutiko.pro/${esc(data.shopSlug)}" style="color:#EC4899;text-decoration:none;">${esc(data.shopName)}</a></td></tr>
          <tr><td>Vendeur</td><td>${esc(data.ownerName)} (${esc(data.ownerEmail)})</td></tr>
          <tr><td>Montant</td><td><strong style="color:#059669;">${data.total.toLocaleString('fr-FR')} FCFA</strong></td></tr>
        </table>
      </div>

      <h3 style="margin:20px 0 8px;font-size:15px;">👤 Client</h3>
      <div class="details">
        <table>
          <tr><td>Nom</td><td>${esc(data.customerName || 'Non renseigné')}</td></tr>
          ${data.customerPhone ? `<tr><td>Téléphone</td><td><a href="tel:${esc(data.customerPhone)}">${esc(data.customerPhone)}</a></td></tr>` : ''}
          ${data.customerEmail ? `<tr><td>Email</td><td><a href="mailto:${esc(data.customerEmail)}">${esc(data.customerEmail)}</a></td></tr>` : ''}
          ${data.customerCity ? `<tr><td>Ville</td><td>${esc(data.customerCity)}</td></tr>` : ''}
          ${data.customerAddress ? `<tr><td>Adresse</td><td>${esc(data.customerAddress)}</td></tr>` : ''}
        </table>
      </div>

      <h3 style="margin:20px 0 8px;font-size:15px;">📋 Articles commandés</h3>
      <table style="width:100%;border-collapse:collapse;margin:0;">
        <tr style="background:#f9fafb;">
          <th style="padding:8px 10px;font-size:12px;font-weight:600;text-align:left;border-bottom:2px solid #e5e7eb;">Produit</th>
          <th style="padding:8px 10px;font-size:12px;font-weight:600;text-align:center;border-bottom:2px solid #e5e7eb;">Qté</th>
          <th style="padding:8px 10px;font-size:12px;font-weight:600;text-align:right;border-bottom:2px solid #e5e7eb;">Sous-total</th>
        </tr>
        ${itemsRows}
        <tr>
          <td colspan="2" style="padding:10px;font-size:14px;font-weight:700;text-align:right;border-top:2px solid #111827;">Total</td>
          <td style="padding:10px;font-size:14px;font-weight:700;text-align:right;border-top:2px solid #111827;color:#059669;">${data.total.toLocaleString('fr-FR')} FCFA</td>
        </tr>
      </table>

      ${notesBlock}

      <p style="margin-top:24px;font-size:13px;color:#6b7280;">
        <a href="https://boutiko.pro/admin" style="color:#EC4899;">Ouvrir le dashboard admin →</a>
      </p>
    `
  )
}

// ─── DAILY RECAP EMAIL ───────────────────────────────────────────────

export interface DailyRecapData {
  shopName: string
  shopOwnerName: string
  date: string
  newOrders: number
  totalRevenue: number
  newViews: number
  whatsappClicks: number
  socialPosts: number
  topProducts: { name: string; views: number; orders: number }[]
  lowStockProducts: { name: string; stock: number }[]
  dashboardUrl: string
}

export function dailyRecapEmail(data: DailyRecapData): string {
  const productRows = data.topProducts.length > 0
    ? `<table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <tr style="background:#f9fafb;">
          <td style="padding:8px 10px;font-size:13px;font-weight:600;color:#111827;border-bottom:1px solid #e5e7eb;">Produit</td>
          <td style="padding:8px 10px;font-size:13px;font-weight:600;color:#111827;border-bottom:1px solid #e5e7eb;text-align:center;">Vues</td>
          <td style="padding:8px 10px;font-size:13px;font-weight:600;color:#111827;border-bottom:1px solid #e5e7eb;text-align:center;">Commandes</td>
        </tr>
        ${data.topProducts.map((p, i) => `
        <tr style="${i % 2 === 0 ? '' : 'background:#f9fafb;'}">
          <td style="padding:8px 10px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${esc(p.name)}</td>
          <td style="padding:8px 10px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:center;">${p.views}</td>
          <td style="padding:8px 10px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:center;">${p.orders}</td>
        </tr>`).join('')}
      </table>`
    : '<p style="color:#6b7280;font-size:14px;">Aucune donnée produit disponible.</p>'

  const lowStockHtml = data.lowStockProducts.length > 0
    ? `<div class="warning">
        <p style="margin:0 0 8px;font-weight:600;">Produits en stock faible :</p>
        ${data.lowStockProducts.map(p => `<p style="margin:2px 0;font-size:13px;">• ${esc(p.name)} — <strong>${p.stock} en stock</strong></p>`).join('')}
      </div>`
    : ''

  const statsHtml = `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="width:50%;vertical-align:top;padding:12px;background:#f0fdf4;border-radius:8px 0 8px 0;">
          <div style="font-size:24px;font-weight:700;color:#166534;">${data.newOrders}</div>
          <div style="font-size:13px;color:#374151;">Nouvelles commandes</div>
        </td>
        <td style="width:50%;vertical-align:top;padding:12px;background:#f0fdf4;border-radius:0 8px 0 8px;">
          <div style="font-size:24px;font-weight:700;color:#166534;">${data.totalRevenue.toLocaleString('fr-FR')} FCFA</div>
          <div style="font-size:13px;color:#374151;">Chiffre d'affaires</div>
        </td>
      </tr>
      <tr>
        <td style="width:50%;vertical-align:top;padding:12px;">
          <div style="font-size:20px;font-weight:600;color:#111827;">${data.newViews}</div>
          <div style="font-size:13px;color:#6b7280;">Vues aujourd'hui</div>
        </td>
        <td style="width:50%;vertical-align:top;padding:12px;">
          <div style="font-size:20px;font-weight:600;color:#111827;">${data.whatsappClicks}</div>
          <div style="font-size:13px;color:#6b7280;">Clics WhatsApp</div>
        </td>
      </tr>
      <tr>
        <td style="width:50%;vertical-align:top;padding:12px;">
          <div style="font-size:20px;font-weight:600;color:#111827;">${data.socialPosts}</div>
          <div style="font-size:13px;color:#6b7280;">Publications RS</div>
        </td>
        <td style="width:50%;vertical-align:top;padding:12px;"></td>
      </tr>
    </table>`

  const body = `
    <p>Bonjour <strong>${esc(data.shopOwnerName)}</strong>,</p>
    <p>Voici votre récapitulatif quotidien pour <strong>${esc(data.shopName)}</strong> du ${esc(data.date)}.</p>
    ${statsHtml}
    <h2>Produits les plus consultés</h2>
    ${productRows}
    ${lowStockHtml}
    <div style="text-align:center;margin:24px 0 8px;">
      <a href="${esc(data.dashboardUrl)}" class="button">Voir mon dashboard</a>
    </div>
  `

  return wrap('Récapitulatif quotidien', data.shopName, body)
}

// ─── CUSTOMER ORDER CONFIRMATION ─────────────────────────────────

export interface CustomerOrderConfirmationData {
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  shopName: string
  shopUrl: string
  shopPhone?: string | null
  shopWhatsapp?: string | null
  orderId: string
  total: number
  shippingFee: number
  customerAddress?: string | null
  customerCity?: string | null
  customerNotes?: string | null
  items: { name: string; quantity: number; price: number }[]
  createdAt: string
}

export function customerOrderConfirmationEmail(data: CustomerOrderConfirmationData): string {
  const itemsHtml = data.items
    .map(item => `<tr><td style="padding:8px 10px; border-bottom:1px solid #f3f4f6; font-size:14px;">${esc(item.name)}</td><td style="padding:8px 10px; border-bottom:1px solid #f3f4f6; font-size:14px; text-align:center;">${item.quantity}</td><td style="padding:8px 10px; border-bottom:1px solid #f3f4f6; font-size:14px; text-align:right;">${item.price.toLocaleString('fr-FR')} FCFA</td><td style="padding:8px 10px; border-bottom:1px solid #f3f4f6; font-size:14px; text-align:right;">${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</td></tr>`)
    .join('')

  const itemsTotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const orderDate = new Date(data.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return wrap(
    'Commande confirmée ! ✅',
    data.shopName,
    `
      <p>Bonjour <strong>${esc(data.customerName)}</strong>,</p>
      <p>Nous vous confirmons la bonne réception de votre commande chez <strong>${esc(data.shopName)}</strong>.</p>

      <div class="highlight">
        <p><strong>📋 Référence : ${esc(data.orderId)}</strong><br>
        Passée le ${esc(orderDate)}</p>
      </div>

      <div class="details">
        <table>
          <tr><td>Nom</td><td>${esc(data.customerName)}</td></tr>
          <tr><td>Téléphone</td><td>${esc(data.customerPhone)}</td></tr>
          ${data.customerAddress ? `<tr><td>Adresse</td><td>${esc(data.customerAddress)}</td></tr>` : ''}
          ${data.customerCity ? `<tr><td>Ville</td><td>${esc(data.customerCity)}</td></tr>` : ''}
        </table>
      </div>

      <h2>Votre commande</h2>
      <table style="width:100%; border-collapse:collapse; margin:12px 0; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px; text-align:left; font-size:13px; color:#6b7280; font-weight:600;">Produit</th>
            <th style="padding:10px; text-align:center; font-size:13px; color:#6b7280; font-weight:600;">Qté</th>
            <th style="padding:10px; text-align:right; font-size:13px; color:#6b7280; font-weight:600;">Prix unit.</th>
            <th style="padding:10px; text-align:right; font-size:13px; color:#6b7280; font-weight:600;">Sous-total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:10px; text-align:right; font-size:14px;">Sous-total articles</td>
            <td style="padding:10px; text-align:right; font-size:14px;">${itemsTotal.toLocaleString('fr-FR')} FCFA</td>
          </tr>
          ${data.shippingFee > 0 ? `
          <tr>
            <td colspan="3" style="padding:10px; text-align:right; font-size:14px;">Frais de livraison</td>
            <td style="padding:10px; text-align:right; font-size:14px;">${data.shippingFee.toLocaleString('fr-FR')} FCFA</td>
          </tr>
          ` : ''}
          <tr style="background:#f0fdf4;">
            <td colspan="3" style="padding:12px 10px; text-align:right; font-size:15px; font-weight:700;">Total</td>
            <td style="padding:12px 10px; text-align:right; font-size:15px; font-weight:700; color:#166534;">${data.total.toLocaleString('fr-FR')} FCFA</td>
          </tr>
        </tfoot>
      </table>

      ${data.customerNotes ? `
      <div class="warning">
        <p><strong>📝 Vos notes :</strong> ${esc(data.customerNotes)}</p>
      </div>
      ` : ''}

      <div class="highlight">
        <p><strong>📞 Besoin d'aide ?</strong> Contactez le vendeur directement :</p>
        <p>${data.shopWhatsapp ? `<a href="https://wa.me/${data.shopWhatsapp.replace(/[^\\d+]/g, '').replace(/^\\+/, '')}" style="color:#166534; font-weight:600;">WhatsApp</a>` : ''}
        ${data.shopPhone ? ` — ${esc(data.shopPhone)}` : ''}</p>
      </div>

      <p>Merci pour votre confiance ! Le vendeur vous contactera très bientôt pour finaliser votre livraison.</p>

      <p style="text-align:center; margin-top:20px;">
        <a href="${esc(data.shopUrl)}" class="button">Visiter la boutique</a>
      </p>
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