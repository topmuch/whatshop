import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdmin, adminUnauthorized } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) return adminUnauthorized()

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
