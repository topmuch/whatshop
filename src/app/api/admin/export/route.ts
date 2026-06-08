import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.cookies.get('whatsshop-user')?.value
    if (!userEmail) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { email: userEmail } })
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const shops = await db.shop.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { name: true, email: true },
        },
      },
    })

    // Build CSV content
    const headers = [
      'Boutique',
      'Vendeur',
      'Telephone',
      'Email',
      'StatutAbonnement',
      'Plan',
      'DateCreation',
    ]

    const rows = shops.map(s => [
      escapeCSV(s.name),
      escapeCSV(s.owner.name),
      escapeCSV(s.phone || s.whatsapp),
      escapeCSV(s.owner.email),
      escapeCSV(s.subscriptionStatus || 'TRIAL'),
      escapeCSV(s.plan),
      escapeCSV(s.createdAt.toISOString().split('T')[0]),
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="shops-export.csv"',
      },
    })
  } catch (error) {
    console.error('Admin export error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
