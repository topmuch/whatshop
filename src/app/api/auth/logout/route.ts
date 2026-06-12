import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  const isSecure = process.env.COOKIE_SECURE === 'true'

  // Clear main session cookie
  response.cookies.set('boutiko-user', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  // Clear god-mode cookies
  response.cookies.set('boutiko-god-mode', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  response.cookies.set('boutiko-god-mode-user', '', {
    httpOnly: false,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}