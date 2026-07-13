import { db } from '@/lib/db'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLdServer, type ShopSeoData } from '@/components/seo/json-ld-server'
import { ShopPageBootstrap } from '@/components/shop/shop-page-bootstrap'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://boutiko.pro'
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`

interface PageProps {
  params: Promise<{ shopSlug: string; productSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shopSlug, productSlug } = await params

  const product = await db.product.findFirst({
    where: {
      slug: productSlug,
      isAvailable: true,
      shop: { slug: shopSlug, isActive: true },
    },
    select: {
      name: true,
      shortDescription: true,
      description: true,
      price: true,
      image: true,
      images: true,
      shop: {
        select: {
          name: true,
          slug: true,
          seoTitle: true,
          seoDescription: true,
          ogImage: true,
          banner: true,
          logo: true,
          coverImageUrl: true,
        },
      },
    },
  })

  if (!product) {
    return {
      title: 'Produit introuvable | Boutiko',
      description: 'Ce produit n\'existe pas ou a été retiré.',
    }
  }

  const shopTitle = product.shop.seoTitle || product.shop.name
  const title = `${product.name} — ${shopTitle} | Boutiko`

  const description = (
    product.shortDescription ||
    product.description ||
    `${product.name} disponible chez ${product.shop.name}. Commandez sur WhatsApp.`
  ).slice(0, 160)

  // Image: product image > shop OG > fallback
  let productImages: string[] = []
  if (product.images) {
    try { productImages = JSON.parse(product.images) } catch { /* ignore */ }
  }
  const ogImage =
    product.image ||
    productImages[0] ||
    product.shop.ogImage ||
    product.shop.banner ||
    product.shop.logo ||
    product.shop.coverImageUrl ||
    DEFAULT_OG_IMAGE

  const url = `${BASE_URL}/boutique/${shopSlug}/p/${productSlug}`
  const shopUrl = `${BASE_URL}/boutique/${shopSlug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Boutiko',
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }],
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
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { shopSlug, productSlug } = await params

  // Verify product exists and belongs to this shop
  const product = await db.product.findFirst({
    where: {
      slug: productSlug,
      isAvailable: true,
      shop: { slug: shopSlug, isActive: true },
    },
    select: { id: true },
  })

  if (!product) {
    return notFound()
  }

  // Fetch shop data for JSON-LD (Product schema this time)
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
    },
  })

  if (!shop) {
    return notFound()
  }

  const seoData: ShopSeoData = {
    name: shop.name!,
    slug: shop.slug!,
    description: shop.description,
    logo: shop.logo,
    banner: shop.banner,
    whatsapp: shop.whatsapp ?? '',
    address: shop.address,
    phone: shop.phone,
    sector: shop.sector,
    businessHours: shop.businessHours,
    seoTitle: shop.seoTitle,
    seoDescription: shop.seoDescription,
    ogImage: shop.ogImage,
    coverImageUrl: shop.coverImageUrl,
    contactEmail: shop.contactEmail,
  }
  const shopUrl = `${BASE_URL}/boutique/${shopSlug}`

  return (
    <>
      {/* Shop-level JSON-LD for breadcrumb context */}
      <JsonLdServer shop={seoData} />
      {/* Product-specific breadcrumb for navigation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Accueil',
                item: BASE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: shop.name,
                item: shopUrl,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: productSlug,
                item: `${shopUrl}/p/${productSlug}`,
              },
            ],
          }),
        }}
      />
      <ShopPageBootstrap shopSlug={shopSlug} initialProductSlug={productSlug} />
    </>
  )
}