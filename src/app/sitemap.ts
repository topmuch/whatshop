import { MetadataRoute } from "next"
import { db } from "@/lib/db"

// Force dynamic rendering — the sitemap queries the DB which doesn't exist at build time
export const dynamic = "force-dynamic"

/**
 * Active-shop filter: exclude inactive shops and expired trials.
 * A trial shop is only included if trialEndDate is in the future.
 */
const ACTIVE_SHOP_WHERE = {
  isActive: true,
  OR: [{ plan: { not: "TRIAL" } }, { trialEndDate: { gt: new Date() } }],
}

const BASE_URL = "https://boutiko.pro"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/onboarding`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // ─── Shop pages ──────────────────────────────────────────────────────────
  let shopPages: MetadataRoute.Sitemap = []
  try {
    const shops = await db.shop.findMany({
      where: ACTIVE_SHOP_WHERE,
      select: { slug: true, updatedAt: true },
    })
    shopPages = shops.map((shop) => ({
      url: `${BASE_URL}/boutique/${shop.slug}`,
      lastModified: shop.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }))
  } catch {
    // DB not available yet (build time, first deploy) — serve static pages only
  }

  // ─── Product pages ───────────────────────────────────────────────────────
  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await db.product.findMany({
      where: {
        shop: ACTIVE_SHOP_WHERE,
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
      // Clean URL pattern: /boutique/<shopSlug>/p/<productSlug>
      url: p.slug
        ? `${BASE_URL}/boutique/${p.shop.slug}/p/${p.slug}`
        : `${BASE_URL}/boutique/${p.shop.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  } catch {
    // DB not available — serve static + shop pages only
  }

  return [...staticPages, ...shopPages, ...productPages]
}