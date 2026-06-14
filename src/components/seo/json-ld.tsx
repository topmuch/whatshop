'use client'

import { useEffect } from 'react'
import type { Shop, Product, Category } from '@/lib/store'

interface JsonLdProps {
  shop: Shop
  products?: Product[]
  categories?: Category[]
}

/** Recursively remove keys with undefined or null values from an object */
function stripNullish<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      const filtered = value
        .map((item) => (typeof item === 'object' && item !== null ? stripNullish(item as Record<string, unknown>) : item))
        .filter((item) => {
          if (typeof item === 'object' && item !== null) return Object.keys(item as Record<string, unknown>).length > 0
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

/** Helper to update or create a <meta> tag by attribute name/value */
function updateOrCreateMeta(attrName: string, attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
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

export default function JsonLd({ shop, products = [], categories = [] }: JsonLdProps) {
  useEffect(() => {
    const schemaType = getSchemaType(shop.sector)

    // --- Build base JSON-LD ---
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
      openingHours: shop.businessHours || undefined,
      priceRange: '$$',
      image: shop.banner || shop.logo || undefined,
      logo: shop.logo || undefined,
    }

    // --- Offer catalog (e-commerce sectors) ---
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

    // --- Restaurant menu ---
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

    const cleaned = stripNullish(base)
    const jsonLdScript = document.createElement('script')
    jsonLdScript.type = 'application/ld+json'
    jsonLdScript.id = 'boutiko-jsonld'
    jsonLdScript.textContent = JSON.stringify(cleaned)

    // Remove any previously injected JSON-LD
    const existing = document.getElementById('boutiko-jsonld')
    if (existing) existing.remove()
    document.head.appendChild(jsonLdScript)

    // --- Document title ---
    const title = shop.seoTitle || `${shop.name} | Boutiko`
    document.title = title

    // --- Meta description ---
    const descText = (
      shop.seoDescription ||
      `Découvrez ${shop.name} sur Boutiko. ${shop.description || ''}`
    ).slice(0, 160)
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', descText)

    // --- Open Graph tags ---
    const ogDesc = (
      shop.seoDescription ||
      `${shop.name} - ${shop.description || 'Boutique en ligne'}`
    ).slice(0, 160)

    updateOrCreateMeta('property', 'og:title', title)
    updateOrCreateMeta('property', 'og:description', ogDesc)
    updateOrCreateMeta('property', 'og:url', `https://boutiko.pro/${shop.slug}`)
    if (shop.banner || shop.logo) {
      updateOrCreateMeta('property', 'og:image', shop.banner || shop.logo!)
    }
    updateOrCreateMeta('property', 'og:type', 'website')
    updateOrCreateMeta('property', 'og:locale', 'fr_FR')
    updateOrCreateMeta('property', 'og:site_name', 'Boutiko')

    // --- Twitter tags ---
    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image')
    updateOrCreateMeta('name', 'twitter:title', title)
    if (shop.banner || shop.logo) {
      updateOrCreateMeta('name', 'twitter:image', shop.banner || shop.logo!)
    }

    // --- Canonical link ---
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `https://boutiko.pro/${shop.slug}`)

    // --- Cleanup on unmount ---
    return () => {
      const el = document.getElementById('boutiko-jsonld')
      if (el) el.remove()
    }
  }, [shop, products, categories])

  // This component renders nothing visible — it only injects head tags
  return null
}