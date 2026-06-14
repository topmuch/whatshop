import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

// ─── IRON SESSION ─────────────────────────────────────────────────────────────

export interface SessionData {
  userId?: string
  godModeOriginalUserId?: string
}

const SESSION_SECRET = process.env.SESSION_SECRET
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error(
    'SESSION_SECRET environment variable is required and must be at least 32 characters. ' +
    'Generate one with: openssl rand -base64 48'
  )
}

export const sessionOptions = {
  password: SESSION_SECRET,
  cookieName: 'boutiko-session' as const,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  },
}

/**
 * Get the iron-session for route handlers (uses cookies() from next/headers).
 */
async function getSessionForHandler(): Promise<ReturnType<typeof getIronSession<SessionData>>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

/**
 * Get the iron-session for middleware (uses request + response).
 */
export async function getSessionForMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<ReturnType<typeof getIronSession<SessionData>>> {
  return getIronSession<SessionData>(request, response, sessionOptions)
}

/**
 * Create a new session for a user (used on login).
 */
export async function createSession(userId: string) {
  const session = await getSessionForHandler()
  session.userId = userId
  session.godModeOriginalUserId = undefined
  await session.save()
}

/**
 * Destroy the current session (used on logout).
 */
export async function destroySession() {
  const session = await getSessionForHandler()
  session.destroy()
}

/**
 * Enter god mode: switch session to target user, remember admin.
 */
export async function enterGodMode(targetUserId: string, adminUserId: string) {
  const session = await getSessionForHandler()
  session.userId = targetUserId
  session.godModeOriginalUserId = adminUserId
  await session.save()
}

/**
 * Exit god mode: restore session to admin user.
 */
export async function exitGodModeSession(adminUserId: string) {
  const session = await getSessionForHandler()
  session.userId = adminUserId
  session.godModeOriginalUserId = undefined
  await session.save()
}

/**
 * Read the current god-mode state from the session.
 */
export async function getGodModeState(): Promise<{ isAdmin: boolean; godModeOriginalUserId?: string }> {
  const session = await getSessionForHandler()
  if (!session.godModeOriginalUserId) return { isAdmin: false }
  return { isAdmin: true, godModeOriginalUserId: session.godModeOriginalUserId }
}

// ─── TYPES ─────────────────────────────────────────────────────────────────────

/** Minimal shop shape returned from DB (used in auth responses). */
export interface AuthShop {
  id: string
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  banner?: string | null
  whatsapp: string
  address?: string | null
  phone?: string | null
  plan: string
  businessType?: string | null
  sector?: string | null
  template: string
  isActive: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  coverImageUrl?: string | null
  customDomain?: string | null
  customDomainStatus?: string | null
  subscriptionStatus?: string | null
  subscriptionEndDate?: string | null
  heroImages?: string
  promoBanners?: string
  brands?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  customColors?: string
  heroTitle?: string
  heroSubtitle?: string
  heroTagline?: string
  heroImageUrl?: string
  productsTitle?: string
  productsTagline?: string
  categoriesTitle?: string
  categoriesTagline?: string
  testimonialsTitle?: string
  testimonialsTagline?: string
  trustBadges?: string
  footerLinks?: string
  facebookPixelId?: string
  facebookCatalogId?: string
  facebookConnected?: boolean
  facebookPageId?: string
  facebookPageName?: string
  catalogEnabled?: boolean
  catalogProductCount?: number
  trackPageViews?: boolean
  trackProductViews?: boolean
  trackWhatsAppClicks?: boolean
}

/** User type returned from auth functions — includes `shops` array + `shop` (first/primary). */
export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  shops: AuthShop[]
  shop: AuthShop | null   // backward compat: primary shop (shops[0])
  godModeOriginalUserId?: string
}

// ─── PASSWORD UTILITIES ───────────────────────────────────────────────────────

/**
 * Hash a plaintext password using bcrypt.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}

/**
 * Check if a password is stored as plaintext (legacy) vs bcrypt hash.
 * bcrypt hashes always start with $2b$ or $2a$.
 */
export function isHashed(password: string): boolean {
  return password.startsWith('$2b$') || password.startsWith('$2a$')
}

// ─── AUTHENTICATION ────────────────────────────────────────────────────────────

/**
 * Authenticate a user by email and plain password.
 * Returns the user object (with shops array) on success, null on failure.
 * Also migrates plaintext passwords to bcrypt hashes on successful login.
 */
export async function authenticateUser(
  email: string,
  plainPassword: string
): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { email },
    include: { shops: true },
  })

  if (!user) return null

  // Check password
  let isMatch: boolean
  if (isHashed(user.password)) {
    isMatch = await verifyPassword(plainPassword, user.password)
  } else {
    // Legacy plain-text password — check directly, then migrate
    isMatch = user.password === plainPassword
    if (isMatch) {
      const hashed = await hashPassword(plainPassword)
      await db.user.update({
        where: { id: user.id },
        data: { password: hashed },
      })
    }
  }

  if (!isMatch) return null

  return mapUserWithShops(user)
}

/**
 * Get the authenticated user from the iron-session.
 * Returns the user object (with shops array + primary shop) on success, null on failure.
 */
export async function getAuthUser(_request?: NextRequest): Promise<AuthUser | null> {
  const session = await getSessionForHandler()

  if (!session.userId) return null

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { shops: true },
  })

  if (!user) return null

  const mapped = mapUserWithShops(user)
  if (session.godModeOriginalUserId) {
    mapped.godModeOriginalUserId = session.godModeOriginalUserId
  }
  return mapped
}

/**
 * Require authentication — returns user or a 401 response.
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }
  return { user, response: null }
}

/**
 * Require a specific shop ownership — returns user+shop or error response.
 * Uses the primary shop (shops[0]) unless a specific shopId is provided.
 */
export async function requireShopOwner(request: NextRequest, shopId?: string) {
  const user = await getAuthUser(request)
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }
  if (!user.shop) {
    return { user: null, response: NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 }) }
  }
  if (shopId && user.shop.id !== shopId) {
    // Also check if the requested shopId belongs to this user (multi-shop)
    const ownedShop = user.shops.find(s => s.id === shopId)
    if (!ownedShop) {
      return { user: null, response: NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 }) }
    }
    return { user, shop: ownedShop, response: null }
  }
  return { user, shop: user.shop, response: null }
}

// ─── SLUG VALIDATION ──────────────────────────────────────────────────────────

/**
 * Validate a shop slug format.
 * Must be lowercase alphanumeric with hyphens, no reserved words, 3-50 chars.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 50) return false
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) return false
  const reserved = [
    'api', 'admin', 'dashboard', 'login', 'register', 'onboarding',
    'pricing', 'contact', 'about', 'privacy', 'terms', 'faq', 'assets',
    'static', 'images', 'uploads', '_next', 'favicon', 'robots', 'sitemap',
    'shop', 'shops', 'order', 'orders', 'product', 'products', 'category',
    'categories', 'settings', 'seed', 'live', 'support', 'auth', 'ai',
    'reseller', 'revendeur',
  ]
  return !reserved.includes(slug.toLowerCase())
}

// ─── DEPRECATED: Legacy cookie helpers (kept for backward compat, no-ops) ───
// These are no longer needed with iron-session but kept so imports don't break.
// They will be removed in a future cleanup.

/**
 * @deprecated Use createSession(userId) instead.
 */
export function setSessionCookie(_response: NextResponse, _email: string) {
  // No-op: session is managed by iron-session
}

/**
 * @deprecated Use destroySession() instead.
 */
export function clearSessionCookie(_response: NextResponse) {
  // No-op: session is managed by iron-session
}

// ─── INTERNAL HELPERS ─────────────────────────────────────────────────────────

/**
 * Map a Prisma user (with shops array) to AuthUser shape with `shop` (primary) computed.
 */
function mapUserWithShops(user: { id: string; email: string; name: string; role: string; shops: unknown[] }): AuthUser {
  const shops = user.shops as AuthShop[]
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    shops,
    shop: shops.length > 0 ? shops[0] : null,
  }
}

/**
 * Map a single shop from Prisma to the AuthShop shape.
 */
export function mapShopToAuthShop(shop: Record<string, unknown>): AuthShop {
  return {
    id: shop.id as string,
    name: shop.name as string,
    slug: shop.slug as string,
    description: (shop.description as string) ?? null,
    logo: (shop.logo as string) ?? null,
    banner: (shop.banner as string) ?? null,
    whatsapp: shop.whatsapp as string,
    address: (shop.address as string) ?? null,
    phone: (shop.phone as string) ?? null,
    plan: shop.plan as string,
    businessType: (shop.businessType as string) ?? null,
    sector: (shop.sector as string) ?? null,
    template: (shop.template as string) ?? 'xstore-electro',
    isActive: shop.isActive as boolean,
    seoTitle: (shop.seoTitle as string) ?? null,
    seoDescription: (shop.seoDescription as string) ?? null,
    coverImageUrl: (shop.coverImageUrl as string) ?? null,
    customDomain: (shop.customDomain as string) ?? null,
    customDomainStatus: (shop.customDomainStatus as string) ?? null,
    subscriptionStatus: (shop.subscriptionStatus as string) ?? null,
    subscriptionEndDate: shop.subscriptionEndDate ? new Date(shop.subscriptionEndDate as string).toISOString() : null,
    heroImages: (shop.heroImages as string) ?? '[]',
    promoBanners: (shop.promoBanners as string) ?? '[]',
    brands: (shop.brands as string) ?? '[]',
    accentColor: (shop.accentColor as string) ?? null,
    primaryColor: (shop.primaryColor as string) ?? '#EC4899',
    secondaryColor: (shop.secondaryColor as string) ?? null,
    customColors: (shop.customColors as string) ?? '{}',
    facebookPixelId: (shop.facebookPixelId as string) ?? undefined,
    facebookCatalogId: (shop.facebookCatalogId as string) ?? undefined,
    facebookConnected: shop.facebookConnected ?? false,
    facebookPageId: (shop.facebookPageId as string) ?? undefined,
    facebookPageName: (shop.facebookPageName as string) ?? undefined,
    catalogEnabled: shop.catalogEnabled ?? false,
    catalogProductCount: shop.catalogProductCount ?? 0,
    trackPageViews: shop.trackPageViews ?? true,
    trackProductViews: shop.trackProductViews ?? true,
    trackWhatsAppClicks: shop.trackWhatsAppClicks ?? true,
  }
}