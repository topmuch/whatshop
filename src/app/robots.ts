import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/onboarding', '/pricing', '/about', '/contact', '/faq', '/register'],
        disallow: ['/dashboard/*', '/api/*', '/admin/*', '/_next/'],
      },
    ],
    sitemap: 'https://boutiko.pro/sitemap.xml',
  }
}