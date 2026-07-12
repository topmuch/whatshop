import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { getSessionOptions, type SessionData } from '@/lib/auth'

// Routes that have their own page.tsx — let Next.js handle them directly
const APP_ROUTES = new Set([
  'login', 'connexion',
  'inscription', 'register',
  'onboarding',
  'dashboard',
  'reseller', 'revendeur',
  'admin',
  'about', 'a-propos',
  'tarifs', 'pricing',
  'contact', 'contactez-nous',
  'faq', 'aide',
  'privacy', 'confidentialite',
  'terms', 'conditions',
  'offline',
  'boutique',
  'go',
  'menu',
  // Reserved for product URL pattern
  'p',
  'custom-domain',
  // Static resources
  'og-default.png', 'og-boutiko.png', 'favicon', 'manifest.json',
  'sw.js', 'workbox', 'sitemap.xml', 'robots.txt',
])

// Routes that require authentication
const PROTECTED_ROUTES = new Set([
  'dashboard',
  'admin',
  'reseller',
  'revendeur',
  'onboarding',
])

// Auth routes — redirect authenticated users away
const AUTH_ROUTES = new Set([
  'login',
  'connexion',
  'inscription',
  'register',
])

// Facebook browser cookie names
const FB_COOKIE_NAMES = ['_fbp', '_fbc']

/**
 * Enrich a NextResponse with visitor IP/UA cookies for Facebook CAPI matching
 * and forward Facebook browser cookies as headers to API routes.
 */
function withVisitorCookies(request: NextRequest, response: NextResponse): NextResponse {
  const ip = request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || ''
  const ua = request.headers.get('user-agent') || ''

  // Set 1-hour cookies for CAPI matching
  if (ip) {
    response.cookies.set('x-visitor-ip', ip, { maxAge: 3600, path: '/', httpOnly: true, sameSite: 'lax' })
  }
  if (ua) {
    response.cookies.set('x-visitor-ua', ua, { maxAge: 3600, path: '/', httpOnly: true, sameSite: 'lax' })
  }

  // Forward Facebook cookies as headers for CAPI
  for (const name of FB_COOKIE_NAMES) {
    const val = request.cookies.get(name)?.value
    if (val) response.headers.set(`x-${name}`, val)
  }

  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── CUSTOM DOMAIN ROUTING ──────────────────────────────────────────
  // If the host is not boutiko.pro (or localhost), it might be a custom domain
  const host = request.headers.get('host')?.split(':')[0] || ''
  const appHost = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
    : 'boutiko.pro'

  if (host !== appHost && host !== 'localhost' && host !== '127.0.0.1') {
    // Custom domain → rewrite to server-side resolver page
    const response = NextResponse.rewrite(
      new URL(`/custom-domain/${host}${pathname}${request.nextUrl.search}`, request.url)
    )
    response.headers.set('x-custom-domain', host)
    return withVisitorCookies(request, response)
  }

  // Skip API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/' ||
    pathname.includes('.') // static files
  ) {
    const response = NextResponse.next()
    return withVisitorCookies(request, response)
  }

  const slug = pathname.slice(1).toLowerCase()

  // ─── Route Protection (uses iron-session) ────────────────────────────
  const response = NextResponse.next()
  let isAuthenticated = false
  try {
    const session = await getIronSession<SessionData>(request, response, getSessionOptions())
    isAuthenticated = !!session.userId
  } catch {
    // Session unreadable — treat as unauthenticated
  }

  // Unauthenticated user accessing a protected route → redirect to /login
  if (!isAuthenticated && PROTECTED_ROUTES.has(slug)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user accessing /login or /register → redirect to /dashboard
  if (isAuthenticated && AUTH_ROUTES.has(slug)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Let Next.js handle known app routes (they have their own page.tsx)
  if (APP_ROUTES.has(slug)) {
    return withVisitorCookies(request, response)
  }

  // ─── SEO: Redirect product URL pattern to /boutique/ (301) ───────
  // /shop-slug/p/product-slug → /boutique/shop-slug/p/product-slug
  const productMatch = slug.match(/^([a-z0-9][a-z0-9-]*)\/p\/([a-z0-9][a-z0-9-]*)$/)
  if (productMatch) {
    const [, shopSlug, productSlug] = productMatch
    const url = request.nextUrl.clone()
    url.pathname = `/boutique/${shopSlug}/p/${productSlug}`
    return withVisitorCookies(request, NextResponse.redirect(url, 301))
  }

  // ─── SEO: Redirect shop slug to /boutique/ (301) ─────────────────
  // /shop-slug → /boutique/shop-slug
  // This ensures Google indexes the canonical URL with full server-rendered SEO
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(slug)) {
    const url = request.nextUrl.clone()
    url.pathname = `/boutique/${slug}`
    return withVisitorCookies(request, NextResponse.redirect(url, 301))
  }

  // For any other unknown path, redirect to home
  return withVisitorCookies(request, NextResponse.redirect(new URL('/', request.url), 301))
}

export const config = {
  matcher: ['/((?!api|_next|favicon\\.ico|.*\\..*).*)'],
}