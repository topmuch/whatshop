import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const slug = String(body.slug || '').trim().toLowerCase()

    if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
      return NextResponse.json(
        { available: false, error: 'Slug invalide' },
        { status: 400 }
      )
    }

    // Reserved slugs
    const reserved = [
      'login', 'register', 'dashboard', 'admin', 'api', 'onboarding',
      'about', 'pricing', 'contact', 'faq', 'privacy', 'terms',
      'reseller', 'revendeur', 'connexion', 'inscription',
      'a-propos', 'tarifs', 'contactez-nous', 'confidentialite', 'conditions', 'aide',
    ]
    if (reserved.includes(slug)) {
      return NextResponse.json({ available: false })
    }

    const existing = await db.shop.findUnique({ where: { slug } })
    return NextResponse.json({ available: !existing })
  } catch {
    return NextResponse.json(
      { available: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}