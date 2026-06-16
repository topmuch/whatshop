import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { verifyDomainDns } from '@/lib/dns-verify'

export async function POST(request: NextRequest) {
  try {
    const { user, response: errorResponse } = await requireAuth(request)
    if (errorResponse) return errorResponse
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { domain } = await request.json()
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domaine requis' }, { status: 400 })
    }

    const result = await verifyDomainDns(domain.trim())
    return NextResponse.json(result)
  } catch (error) {
    console.error('DNS verify error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}