import { MetadataRoute } from "next"
import { db } from "@/lib/db"

// Force dynamic rendering — the sitemap queries the DB which doesn't exist at build time
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://boutiko.pro"

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/onboarding`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  let shopPages: MetadataRoute.Sitemap = []
  try {
    const now = new Date()
    const shops = await db.shop.findMany({
      where: {
        isActive: true,
        OR: [
          { plan: { not: "TRIAL" } },
          { trialEndDate: { gt: now } },
        ],
      },
      select: { slug: true, updatedAt: true },
    })
    shopPages = shops.map((shop) => ({
      url: `${baseUrl}/${shop.slug}`,
      lastModified: shop.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }))
  } catch {
    // DB not available yet (build time, first deploy) — serve static pages only
  }

  let productPages: MetadataRoute.Sitemap = []
  try {
    const now = new Date()
    const products = await db.product.findMany({
      where: {
        shop: {
          isActive: true,
          OR: [
            { plan: { not: "TRIAL" } },
            { trialEndDate: { gt: now } },
          ],
        },
        isAvailable: true,
      },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
        shop: { select: { slug: true } },
      },
      take: 5000, // safety limit
    })
    productPages = products.map((p) => ({
      url: `${baseUrl}/${p.shop.slug}?product=${p.slug || p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  } catch {
    // DB not available — serve static + shop pages only
  }

  return [...staticPages, ...shopPages, ...productPages]
}