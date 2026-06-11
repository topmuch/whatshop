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

  // Let Next.js handle known app routes (they have their own page.tsx)
  if (APP_ROUTES.has(slug)) {
    return NextResponse.next()
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