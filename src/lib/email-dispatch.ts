/**
 * email-dispatch.ts — Orchestrator: wires templates + sendEmail + preferences
 *
 * This is the SINGLE entry point for sending all transactional emails.
 * It checks:
 *  1. SMTP is configured
 *  2. SaaSConfig toggles (autoWelcomeEmail, notifyNewSeller, etc.)
 *  3. Seller notificationPreferences (new order, etc.)
 *  4. Seller notificationEmail (custom address or fallback to user.email)
 */
import { db } from '@/lib/db'
import { sendEmail, isEmailConfigured, getSupportEmail } from '@/lib/email'
import { logger } from '@/lib/logger'
import {
  welcomeEmail,
  newOrderEmail,
  customerOrderConfirmationEmail,
  domainApprovedEmail,
  domainRejectedEmail,
  shopActivatedEmail,
  adminNewShopEmail,
  adminNewOrderEmail,
  type WelcomeEmailData,
  type NewOrderEmailData,
  type CustomerOrderConfirmationData,
  type DomainApprovedEmailData,
  type DomainRejectedEmailData,
  type ShopActivatedEmailData,
  type AdminNewShopEmailData,
  type AdminNewOrderEmailData,
} from '@/lib/email-templates'

// ─── SAAS CONFIG CACHE ──────────────────────────────────────────────────
// Fetch once per request cycle, cache in-memory

let _configCache: Record<string, boolean> | null = null
let _configCacheTime = 0
const CONFIG_CACHE_TTL = 30_000 // 30s

async function getSaaSConfigFlags(): Promise<Record<string, boolean>> {
  const now = Date.now()
  if (_configCache && now - _configCacheTime < CONFIG_CACHE_TTL) return _configCache

  const config = await db.saaSConfig.findFirst({
    select: {
      autoWelcomeEmail: true,
      notifyNewSeller: true,
      notifyNewOrder: true,
      notifyDomainRequest: true,
      supportEmail: true,
    },
  })

  _configCache = config ? { ...config, supportEmail: !!config.supportEmail } : {}
  _configCacheTime = now
  return _configCache
}

/**
 * Get seller's notification email address.
 */
async function getSellerEmail(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  if (!user) return null
  return user.email
}

/**
 * Check if a seller has a specific notification preference enabled.
 */
async function sellerHasPref(userId: string, prefKey: string): Promise<boolean> {
  const shop = await db.shop.findFirst({
    where: { ownerId: userId },
    select: { notificationPreferences: true },
  })
  if (!shop?.notificationPreferences) return true // default: all on
  try {
    const prefs = typeof shop.notificationPreferences === 'string'
      ? JSON.parse(shop.notificationPreferences)
      : shop.notificationPreferences
    return prefs[prefKey] !== false // default true
  } catch {
    return true
  }
}

// ─── PUBLIC DISPATCH FUNCTIONS ──────────────────────────────────────────

/**
 * Send welcome email after onboarding (if autoWelcomeEmail is enabled).
 */
export async function dispatchWelcomeEmail(data: WelcomeEmailData & { userId: string }): Promise<void> {
  if (!(await isEmailConfigured())) return
  try {
    const flags = await getSaaSConfigFlags()
    if (!flags.autoWelcomeEmail) return

    const email = await getSellerEmail(data.userId)
    if (!email) return

    const html = welcomeEmail(data)
    await sendEmail({
      to: email,
      subject: `🎉 Bienvenue sur Boutiko — ${data.shopName} est créée !`,
      html,
    })
  } catch (error) {
    logger.error('Failed to dispatch welcome email', 'EmailDispatch', error)
  }
}

/**
 * Send new order email to seller (if preference enabled).
 */
export async function dispatchNewOrderEmail(
  shopId: string,
  shopOwnerId: string,
  data: Omit<NewOrderEmailData, 'shopOwnerName' | 'shopDashboardUrl'>
): Promise<void> {
  if (!(await isEmailConfigured())) return
  try {
    const hasPref = await sellerHasPref(shopOwnerId, 'newOrders')
    if (!hasPref) return

    const [email, shop] = await Promise.all([
      getSellerEmail(shopOwnerId),
      db.shop.findUnique({ where: { id: shopId }, select: { name: true } }),
    ])
    if (!email || !shop) return

    const owner = await db.user.findUnique({ where: { id: shopOwnerId }, select: { name: true } })
    if (!owner) return

    const html = newOrderEmail({
      ...data,
      shopOwnerName: owner.name,
      shopName: shop.name,
      shopDashboardUrl: `https://boutiko.pro/dashboard`,
    })
    await sendEmail({
      to: email,
      subject: `📦 Nouvelle commande — ${data.total.toLocaleString('fr-FR')} FCFA`,
      html,
    })
  } catch (error) {
    logger.error('Failed to dispatch new order email', 'EmailDispatch', error)
  }
}

/**
 * Send order confirmation email to the CUSTOMER.
 */
export async function dispatchCustomerOrderConfirmationEmail(
  data: CustomerOrderConfirmationData,
): Promise<void> {
  if (!(await isEmailConfigured())) return
  try {
    if (!data.customerEmail) return

    const html = customerOrderConfirmationEmail(data)
    await sendEmail({
      to: data.customerEmail,
      subject: `✅ Commande confirmée — ${data.shopName}`,
      html,
    })
  } catch (error) {
    logger.error('Failed to dispatch customer order confirmation email', 'EmailDispatch', error)
  }
}

/**
 * Send new order email to ALL superadmins.
 * This is NOT gated by the notifyNewOrder toggle — admins always receive order emails.
 */
export async function dispatchAdminNewOrderEmail(data: AdminNewOrderEmailData): Promise<void> {
  if (!(await isEmailConfigured())) return
  try {
    const html = adminNewOrderEmail(data)

    // Collect all recipient emails: superadmins + supportEmail
    const recipients = new Set<string>()

    // Get all SUPER_ADMIN users
    const superAdmins = await db.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { email: true },
    })
    superAdmins.forEach((u) => recipients.add(u.email))

    // Also add support email as fallback
    const supportEmail = await getSupportEmail()
    recipients.add(supportEmail)

    const toList = Array.from(recipients).filter(Boolean)
    if (toList.length === 0) return

    await sendEmail({
      to: toList,
      subject: `🛒 Nouvelle commande — ${data.total.toLocaleString('fr-FR')} FCFA — ${data.shopName}`,
      html,
    })
  } catch (error) {
    logger.error('Failed to dispatch admin order email', 'EmailDispatch', error)
  }
}

/**
 * Send domain approval email to seller.
 */
export async function dispatchDomainApprovedEmail(data: DomainApprovedEmailData & { ownerId: string }): Promise<void> {
  if (!(await isEmailConfigured())) return
  try {
    const email = await getSellerEmail(data.ownerId)
    if (!email) return

    const html = domainApprovedEmail(data)
    await sendEmail({
      to: email,
      subject: `✅ Domaine approuvé — ${data.domain}`,
      html,
    })
  } catch (error) {
    logger.error('Failed to dispatch domain approved email', 'EmailDispatch', error)
  }
}

/**
 * Send domain rejection email to seller.
 */
export async function dispatchDomainRejectedEmail(data: DomainRejectedEmailData & { ownerId: string }): Promise<void> {
  if (!(await isEmailConfigured())) return
  try {
    const email = await getSellerEmail(data.ownerId)
    if (!email) return

    const html = domainRejectedEmail(data)
    await sendEmail({
      to: email,
      subject: `Domaine refusé — ${data.domain}`,
      html,
    })
  } catch (error) {
    logger.error('Failed to dispatch domain rejected email', 'EmailDispatch', error)
  }
}

/**
 * Send shop activation email to seller (when admin activates a PRO shop).
 */
export async function dispatchShopActivatedEmail(data: ShopActivatedEmailData & { userId: string }): Promise<void> {
  if (!(await isEmailConfigured())) return
  try {
    const email = await getSellerEmail(data.userId)
    if (!email) return

    const html = shopActivatedEmail(data)
    await sendEmail({
      to: email,
      subject: `🎉 Votre site ${data.shopName} est maintenant actif !`,
      html,
    })
  } catch (error) {
    logger.error('Failed to dispatch shop activated email', 'EmailDispatch', error)
  }
}

/**
 * Send new shop notification email to admin (if notifyNewSeller is enabled).
 */
export async function dispatchAdminNewShopEmail(data: AdminNewShopEmailData): Promise<void> {
  if (!(await isEmailConfigured())) return
  try {
    const flags = await getSaaSConfigFlags()
    if (!flags.notifyNewSeller) return

    const supportEmail = await getSupportEmail()
    const html = adminNewShopEmail(data)
    await sendEmail({
      to: supportEmail,
      subject: `🛍️ Nouvelle boutique — ${data.shopName}`,
      html,
    })
  } catch (error) {
    logger.error('Failed to dispatch admin new shop email', 'EmailDispatch', error)
  }
}