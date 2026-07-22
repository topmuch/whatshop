import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CustomDomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params

  // Safety net: if a known non-custom-domain host somehow ends up here
  // (e.g. a Z.ai preview host), bounce to the homepage instead of showing
  // a misleading "Domaine non trouvé" page.
  const isSpaceZPreview =
    domain.endsWith('.space-z.ai') ||
    domain === 'space-z.ai' ||
    /^preview-[a-z0-9-]+\.space-z\.ai$/.test(domain)
  if (isSpaceZPreview) {
    redirect('/')
  }

  // Find the shop with this custom domain
  const shop = await db.shop.findFirst({
    where: {
      customDomain: domain,
      customDomainStatus: 'APPROVED',
      isActive: true,
    },
    select: { slug: true },
  })

  if (!shop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Domaine non trouvé</h1>
          <p style={{ color: '#666' }}>Ce domaine n&apos;est pas associé à une boutique Boutiko active.</p>
        </div>
      </div>
    )
  }

  // Redirect to the shop's slug page
  // Using JavaScript redirect since this is a server component
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content={`0;url=/${shop.slug}`} />
        <title>Redirection...</title>
      </head>
      <body>
        <p>Redirection vers la boutique...</p>
        <script dangerouslySetInnerHTML={{ __html: `window.location.replace('/${shop.slug}')` }} />
      </body>
    </html>
  )
}