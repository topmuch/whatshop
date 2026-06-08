import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    // Create user (plain text password for demo - use bcrypt in production)
    const user = await db.user.create({
      data: { email, password, name },
    })

    // Set session cookie
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 })

    response.cookies.set('whatsshop-user', user.email, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
