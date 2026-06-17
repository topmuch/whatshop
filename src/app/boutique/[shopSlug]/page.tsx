import { db } from '@/lib/db'
import { Metadata, notFound } from 'next'
import { JsonLdServer, type ShopSeoData } from '@/components/seo/json-ld-server'
import { ShopPageBootstrap } from '@/components/shop/shop-page-bootstrap'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://boutiko.pro'

/** Default OG image when the shop has none. */
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`

// ─── generateMetadata ─────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ shopSlug: string }>
  searchParams: Promise<{ product?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shopSlug } = await params

  const shop = await db.shop.findUnique({
    where: { slug: shopSlug, isActive: true },
    select: {
      name: true,
      slug: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      ogImage: true,
      banner: true,
      logo: true,
      coverImageUrl: true,
      whatsapp: true,
    },
  })

  if (!shop) {
    return {
      title: 'Boutique introuvable | Boutiko',
      description: 'Cette boutique n\'existe pas ou a été désactivée.',
    }
  }

  // ─── Title ─────────────────────────────────────────────────────────────
  const title = shop.seoTitle || `${shop.name} | Boutiko`

  // ─── Description (max 160 chars for SEO) ───────────────────────────────
  const description = (
    shop.seoDescription ||
    shop.description ||
    `Découvrez ${shop.name} sur Boutiko. Commandez facilement sur WhatsApp.`
  ).slice(0, 160)

  // ─── OG Image (fallback chain: ogImage → banner → logo → coverImageUrl → default) ──
  const ogImage =
    shop.ogImage || shop.banner || shop.logo || shop.coverImageUrl || DEFAULT_OG_IMAGE

  // ─── URL ───────────────────────────────────────────────────────────────
  const url = `${BASE_URL}/boutique/${shop.slug}`

  // ─── Keywords ──────────────────────────────────────────────────────────
  const keywords = shop.seoKeywords
    ? shop.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [shop.name, 'Boutiko', 'boutique en ligne', 'WhatsApp']

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Boutiko',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: shop.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  }
}

// ─── Page Component ───────────────────────────────────────────────────────

export default async function BoutiquePage({ params, searchParams }: PageProps) {
  const { shopSlug } = await params
  const { product: productParam } = await searchParams

  // Fetch shop data for JSON-LD (including products and categories)
  const shop = await db.shop.findUnique({
    where: { slug: shopSlug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logo: true,
      banner: true,
      whatsapp: true,
      address: true,
      phone: true,
      sector: true,
      businessHours: true,
      seoTitle: true,
      seoDescription: true,
      ogImage: true,
      coverImageUrl: true,
      contactEmail: true,
      products: {
        where: { isAvailable: true },
        select: {
          name: true,
          slug: true,
          description: true,
          price: true,
          image: true,
          images: true,
          isAvailable: true,
          categoryId: true,
        },
        take: 20,
      },
      categories: {
        select: { id: true, name: true },
      },
    },
  })

  if (!shop) {
    notFound()
  }

  // Build SEO data for JSON-LD (transform Prisma types)
  const seoData: ShopSeoData = {
    name: shop.name,
    slug: shop.slug,
    description: shop.description,
    logo: shop.logo,
    banner: shop.banner,
    whatsapp: shop.whatsapp,
    address: shop.address,
    phone: shop.phone,
    sector: shop.sector,
    businessHours: shop.businessHours,
    seoTitle: shop.seoTitle,
    seoDescription: shop.seoDescription,
    ogImage: shop.ogImage,
    coverImageUrl: shop.coverImageUrl,
    contactEmail: shop.contactEmail,
    products: shop.products.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      image: p.image,
      images: p.images,
      isAvailable: p.isAvailable,
      categoryId: p.categoryId,
    })),
    categories: shop.categories,
  }

  return (
    <>
      <JsonLdServer shop={seoData} />
      <ShopPageBootstrap
        shopSlug={shopSlug}
        initialProductSlug={productParam}
      />
    </>
  )
}