import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Rate limiting (health checks need higher rate: 120/min)
  const ip = getClientIp(request)
  const rl = rateLimit(ip, { maxRequests: 120, windowSeconds: 60 })
  if (!rl.success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}