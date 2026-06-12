import { NextRequest, NextResponse } from 'next/server'

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
  // Reserved for product URL pattern
  'p',
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/' ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  const slug = pathname.slice(1).toLowerCase()

  // ─── Route Protection ────────────────────────────────────────────
  const isAuthenticated = !!request.cookies.get('boutiko-user')?.value

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
    return NextResponse.next()
  }

  // Product URL pattern: /shop-slug/p/product-slug
  // e.g., /ma-boutique/p/écouteur-bluetooth-pro
  const productMatch = slug.match(/^([a-z0-9][a-z0-9-]*)\/p\/([a-z0-9][a-z0-9-]*)$/)
  if (productMatch) {
    const [, shopSlug, productSlug] = productMatch
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('shop', shopSlug)
    url.searchParams.set('product', productSlug)
    return NextResponse.rewrite(url)
  }

  // If the path looks like a shop slug (single segment, no slashes, alphanumeric with hyphens)
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(slug)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('shop', slug)
    return NextResponse.rewrite(url)
  }

  // For any other unknown path, rewrite to / so the SPA fallback handles it
  const url = request.nextUrl.clone()
  url.pathname = '/'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!api|_next|favicon\\.ico|.*\\..*).*)'],
}