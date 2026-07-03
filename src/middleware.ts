import { NextRequest, NextResponse } from 'next/server'

/**
 * Global middleware for security and routing.
 * 
 * - Blocks access to /api/setup in production (should only run once during deploy)
 * - Blocks access to /api/seed in production
 * - Adds security headers
 */

const BLOCKED_IN_PRODUCTION = [
  '/api/setup',
  '/api/seed',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProduction = process.env.NODE_ENV === 'production'

  // Block dangerous endpoints in production
  if (isProduction) {
    for (const blocked of BLOCKED_IN_PRODUCTION) {
      if (pathname.startsWith(blocked)) {
        return NextResponse.json(
          { error: 'Endpoint non disponible en production' },
          { status: 403 }
        )
      }
    }
  }

  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Request-Id', crypto.randomUUID())

  return response
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
}