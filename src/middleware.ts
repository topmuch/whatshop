import { NextRequest, NextResponse } from 'next/server'

// Known public page paths that should be handled by the SPA
const PUBLIC_PAGES = [
  'about', 'a-propos', 'pricing', 'tarifs', 'contact', 'contactez-nous',
  'privacy', 'confidentialite', 'terms', 'conditions', 'faq', 'aide',
]

export function middleware(request: NextRequest) {
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

  // Check if this is a known public page path
  if (PUBLIC_PAGES.includes(slug)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('page', slug)
    return NextResponse.rewrite(url)
  }

  // If the path looks like a shop slug (single segment, no slashes, alphanumeric with hyphens)
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(slug)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('shop', slug)
    return NextResponse.rewrite(url)
  }

  // For any other path, rewrite to / so the SPA can handle it
  const url = request.nextUrl.clone()
  url.pathname = '/'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!api|_next|favicon\\.ico|.*\\..*).*)'],
}
