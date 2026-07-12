import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tarifs', '/about', '/contact', '/contactez-nous', '/faq', '/boutique/'],
        disallow: [
          '/dashboard/*',
          '/api/*',
          '/admin/*',
          '/reseller*',
          '/_next/',
          '/go/*',
          '/login',
          '/connexion',
          '/inscription',
          '/register',
          '/onboarding',
          '/menu/*',
        ],
      },
    ],
    sitemap: 'https://boutiko.pro/sitemap.xml',
  }
}