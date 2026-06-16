import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// ─── TYPES ─────────────────────────────────────────────────────────────────────

interface DailyDataPoint {
  date: string
  label: string
  whatsappClicks: number
  contactFormSubmits: number
  pageViews: number
}

interface TopProduct {
  id: string
  name: string
  whatsappClicks: number
  percentage: number
  image?: string | null
}

interface RecentMessage {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: string
}

interface AnalyticsStatsResponse {
  whatsappClicks: number
  contactFormSubmits: number
  pageViews: number
  productCount: number
  whatsappClicks7d: number
  contactFormSubmits7d: number
  whatsappClicksPrev7d: number
  contactFormSubmitsPrev7d: number
  whatsappClicksChange: number
  contactFormSubmitsChange: number
  dailyData: DailyDataPoint[]
  topProducts: TopProduct[]
  recentMessages: RecentMessage[]
  insights: string[]
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

const FRENCH_MONTHS: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Août',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
}

function formatDateLabel(dateStr: string): string {
  const day = dateStr.substring(8, 10)
  const month = dateStr.substring(5, 7)
  const monthLabel = FRENCH_MONTHS[month] || month
  return `${parseInt(day, 10)} ${monthLabel}`
}

function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// ─── GET HANDLER ───────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const auth = await requireAuth(request)
    if (auth.response) return auth.response
    const user = auth.user

    // Parse query params
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    if (!shopId || typeof shopId !== 'string' || shopId.trim().length === 0) {
      return NextResponse.json({ error: 'Paramètre shopId requis' }, { status: 400 })
    }

    // Verify shop ownership
    const shop = await db.shop.findUnique({
      where: { id: shopId.trim() },
      select: {
        id: true,
        ownerId: true,
        whatsappClicks: true,
        contactFormSubmits: true,
        pageViews: true,
        products: {
          where: { whatsappClicks: { gt: 0 } },
          select: { id: true, name: true, image: true, whatsappClicks: true },
          orderBy: { whatsappClicks: 'desc' },
          take: 5,
        },
      },
    })

    if (!shop || shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 })
    }

    // Date ranges
    const last7 = getDateRange(6)   // last 7 days including today
    const prev7 = getDateRange(13)   // previous 7 days
    const prev7End = new Date()
    prev7End.setDate(prev7End.getDate() - 7)
    prev7End.setHours(23, 59, 59, 999)

    // Fetch analytics events for the last 14 days (covers both windows)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)
    fourteenDaysAgo.setHours(0, 0, 0, 0)

    const allEvents = await db.analyticsEvent.findMany({
      where: {
        shopId: shop.id,
        eventType: { in: ['whatsapp_click', 'form_submit', 'page_view'] },
        createdAt: { gte: fourteenDaysAgo },
      },
      select: { eventType: true, createdAt: true },
    })

    // Count events in last 7 days vs previous 7 days
    const last7Start = toDateString(last7.start)
    const prev7Start = toDateString(prev7.start)
    const prev7EndStr = toDateString(prev7End)

    let whatsappClicks7d = 0
    let contactFormSubmits7d = 0
    let whatsappClicksPrev7d = 0
    let contactFormSubmitsPrev7d = 0

    // Group by date for chart data (last 7 days)
    const dailyMap = new Map<string, { whatsappClicks: number; contactFormSubmits: number; pageViews: number }>()

    for (const event of allEvents) {
      const dateStr = toDateString(new Date(event.createdAt))

      // Initialize daily entry if needed (only for last 7 days)
      if (dateStr >= last7Start && !dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { whatsappClicks: 0, contactFormSubmits: 0, pageViews: 0 })
      }

      if (event.eventType === 'whatsapp_click') {
        if (dateStr >= last7Start) {
          whatsappClicks7d++
          const entry = dailyMap.get(dateStr)
          if (entry) entry.whatsappClicks++
        } else if (dateStr >= prev7Start) {
          whatsappClicksPrev7d++
        }
      } else if (event.eventType === 'form_submit') {
        if (dateStr >= last7Start) {
          contactFormSubmits7d++
          const entry = dailyMap.get(dateStr)
          if (entry) entry.contactFormSubmits++
        } else if (dateStr >= prev7Start) {
          contactFormSubmitsPrev7d++
        }
      } else if (event.eventType === 'page_view') {
        if (dateStr >= last7Start) {
          const entry = dailyMap.get(dateStr)
          if (entry) entry.pageViews++
        }
      }
    }

    // Build daily chart data (ensure all 7 days are present)
    const dailyData: DailyDataPoint[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = toDateString(d)
      const counts = dailyMap.get(dateStr) || { whatsappClicks: 0, contactFormSubmits: 0, pageViews: 0 }
      dailyData.push({
        date: dateStr,
        label: formatDateLabel(dateStr),
        whatsappClicks: counts.whatsappClicks,
        contactFormSubmits: counts.contactFormSubmits,
        pageViews: counts.pageViews,
      })
    }

    // Top products
    const totalWhatsappClicks = shop.whatsappClicks || 0
    const topProducts: TopProduct[] = shop.products.map(p => ({
      id: p.id,
      name: p.name,
      whatsappClicks: p.whatsappClicks,
      percentage: totalWhatsappClicks > 0
        ? Math.round((p.whatsappClicks / totalWhatsappClicks) * 100)
        : 0,
      image: p.image || undefined,
    }))

    // Recent contact messages (last 10)
    const recentMessagesRaw = await db.contactMessage.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        message: true,
        status: true,
        createdAt: true,
      },
    })

    const recentMessages: RecentMessage[] = recentMessagesRaw.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      message: m.message,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    }))

    // Product count
    const productCount = await db.product.count({
      where: { shopId: shop.id },
    })

    // Insights
    const insights: string[] = []
    const whatsappClicksChange = calculateChange(whatsappClicks7d, whatsappClicksPrev7d)
    const contactFormSubmitsChange = calculateChange(contactFormSubmits7d, contactFormSubmitsPrev7d)

    // Top product insight
    if (topProducts.length > 0 && topProducts[0].whatsappClicks > 10) {
      insights.push(
        `🔥 Votre produit "${topProducts[0].name}" est très populaire ! Pensez à le mettre en avant.`
      )
    }

    // WhatsApp clicks trend
    if (whatsappClicksChange > 20) {
      insights.push(
        `📈 Vos clics WhatsApp ont augmenté de ${whatsappClicksChange}% cette semaine.`
      )
    } else if (whatsappClicksChange < -20) {
      insights.push(
        `📉 Vos clics WhatsApp ont baissé de ${Math.abs(whatsappClicksChange)}% cette semaine. Partagez davantage votre lien !`
      )
    }

    // No messages in last 3 days
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    threeDaysAgo.setHours(0, 0, 0, 0)

    if (recentMessages.length > 0) {
      const mostRecent = new Date(recentMessages[0].createdAt)
      if (mostRecent < threeDaysAgo) {
        insights.push(
          '💬 Vous n\'avez pas reçu de message depuis 3 jours. Partagez votre lien !'
        )
      }
    } else {
      // No messages at all
      insights.push(
        '💬 Vous n\'avez pas reçu de message depuis 3 jours. Partagez votre lien !'
      )
    }

    // Conversion rate
    const pageViews = shop.pageViews || 0
    const whatsappClicks = shop.whatsappClicks || 0
    if (pageViews > 0 && whatsappClicks > 0) {
      const rate = Math.round((whatsappClicks / pageViews) * 100)
      insights.push(
        `🎯 Taux de conversion WhatsApp : ${rate}% des visiteurs cliquent sur WhatsApp.`
      )
    }

    // No products
    if (productCount === 0) {
      insights.push(
        '📦 Vous n\'avez encore aucun produit. Ajoutez vos premiers articles !'
      )
    }

    // Build response
    const response: AnalyticsStatsResponse = {
      whatsappClicks,
      contactFormSubmits: shop.contactFormSubmits || 0,
      pageViews,
      productCount,
      whatsappClicks7d,
      contactFormSubmits7d,
      whatsappClicksPrev7d,
      contactFormSubmitsPrev7d,
      whatsappClicksChange,
      contactFormSubmitsChange,
      dailyData,
      topProducts,
      recentMessages,
      insights,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erreur analytics stats:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}