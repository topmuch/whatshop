'use client'

import { useEffect, useMemo } from 'react'
import type { Shop, Product, Category } from '@/lib/store'

interface JsonLdProps {
  shop: Shop
  products?: Product[]
  categories?: Category[]
}

/**
 * Recursively remove keys with undefined or null values from an object.
 * Schema.org validators reject null/undefined fields.
 */
function stripNullish<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      const filtered = value
        .map((item) =>
          typeof item === 'object' && item !== null
            ? stripNullish(item as Record<string, unknown>)
            : item,
        )
        .filter((item) => {
          if (typeof item === 'object' && item !== null)
            return Object.keys(item as Record<string, unknown>).length > 0
          return item !== undefined && item !== null
        })
      if (filtered.length > 0) clean[key] = filtered
    } else if (typeof value === 'object') {
      const stripped = stripNullish(value as Record<string, unknown>)
      if (Object.keys(stripped).length > 0) clean[key] = stripped
    } else {
      clean[key] = value
    }
  }
  return clean
}

/** Map sector to schema.org @type */
function getSchemaType(sector?: string): string {
  switch (sector) {
    case 'restaurant':
      return 'Restaurant'
    case 'beaute-service':
    case 'sante':
      return 'HealthAndBeautyBusiness'
    case 'consulting':
    case 'formation':
      return 'ProfessionalService'
    case 'artisanat':
      return 'LocalBusiness'
    default:
      return 'Store'
  }
}

/**
 * SEO helper for shop pages.
 *
 * Renders JSON-LD as a <script> tag in JSX (cleaner than DOM manipulation).
 * Updates document title and meta tags via useEffect.
 *
 * NOTE: True SEO requires server-side rendering of shop pages
 * (create /boutique/[slug]/route.ts with generateMetadata).
 * This component works for client-side navigation and social previews.
 */
export default function JsonLd({ shop, products = [], categories = [] }: JsonLdProps) {
  // Build JSON-LD data as a memoized object
  const jsonLdData = useMemo(() => {
    const schemaType = getSchemaType(shop.sector)

    const base: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: shop.name,
      description: shop.seoDescription || shop.description || '',
      url: `https://boutiko.pro/${shop.slug}`,
      telephone: shop.whatsapp,
      address: shop.address
        ? { '@type': 'PostalAddress', streetAddress: shop.address }
        : undefined,
      openingHours: (shop as unknown as Record<string, unknown>).businessHours || undefined,
      priceRange: '$$',
      image: shop.banner || shop.logo || undefined,
      logo: shop.logo || undefined,
    }

    const isRestaurant = shop.sector === 'restaurant'
    const isService =
      shop.sector === 'beaute-service' ||
      shop.sector === 'sante' ||
      shop.sector === 'consulting' ||
      shop.sector === 'formation' ||
      shop.sector === 'artisanat'

    if (!isRestaurant && !isService && products.length > 0) {
      base.hasOfferCatalog = {
        '@type': 'OfferCatalog',
        name: 'Produits',
        itemListElement: products.slice(0, 20).map((p) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: p.name,
            description: p.description || '',
            image: p.image || p.images?.[0] || undefined,
          },
          price: p.price,
          priceCurrency: 'XOF',
        })),
      }
    }

    if (isRestaurant && categories.length > 0) {
      base.servesCuisine = 'Africaine'
      base.hasMenu = {
        '@type': 'Menu',
        hasMenuSection: categories.map((c) => ({
          '@type': 'MenuSection',
          name: c.name,
          hasMenuItem: products
            .filter((p) => p.categoryId === c.id)
            .map((p) => ({
              '@type': 'MenuItem',
              name: p.name,
              offers: {
                '@type': 'Offer',
                price: p.price,
                priceCurrency: 'XOF',
              },
            })),
        })),
      }
    }

    return stripNullish(base)
  }, [shop, products, categories])

  // Update document head meta tags
  useEffect(() => {
    const title = shop.seoTitle || `${shop.name} | Boutiko`
    document.title = title

    // Meta description
    const descText = (
      shop.seoDescription ||
      `Découvrez ${shop.name} sur Boutiko. ${shop.description || ''}`
    ).slice(0, 160)
    setMeta('name', 'description', descText)

    // Open Graph
    const ogDesc = (
      shop.seoDescription ||
      `${shop.name} - ${shop.description || 'Boutique en ligne'}`
    ).slice(0, 160)

    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', ogDesc)
    const ogImage = (shop as unknown as Record<string, unknown>).ogImage as string | undefined
      || shop.banner || shop.logo || undefined
    setMeta('property', 'og:url', `https://boutiko.pro/${shop.slug}`)
    if (ogImage) {
      setMeta('property', 'og:image', ogImage)
    }
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:locale', 'fr_FR')
    setMeta('property', 'og:site_name', 'Boutiko')

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    if (ogImage) {
      setMeta('name', 'twitter:image', ogImage)
    }

    // Canonical
    setLink('canonical', `https://boutiko.pro/${shop.slug}`)
  }, [shop])

  return (
    <script
      type="application/ld+json"
      id="boutiko-jsonld"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
    />
  )
}

// ─── Internal DOM helpers ─────────────────────────────────────────────────────

function setMeta(attrName: string, attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}