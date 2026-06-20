import type { Metadata } from 'next'
import { MenuPageClient } from './menu-page-client'

interface PageProps {
  params: Promise<{ shopSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shopSlug } = await params
  return {
    title: `Menu — ${shopSlug}`,
    description: 'Consultez notre menu et commandez facilement.',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  }
}

export default async function MenuPage({ params }: PageProps) {
  const { shopSlug } = await params
  return <MenuPageClient shopSlug={shopSlug} />
}