import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const shops = await db.shop.findMany({
      where: {
        isActive: true,
      },
      select: {
        name: true,
        slug: true,
        logo: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(shops)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}