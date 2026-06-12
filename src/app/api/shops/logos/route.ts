import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Rate limiting: 30 req/min
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.shopLogos)
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

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