'use client'

import { PublicLayout } from '@/components/pages/public-layout'
import { PricingPage } from '@/components/pages/pricing-page'

export default function Tarifs() {
  return (
    <PublicLayout currentView="pricing">
      <PricingPage />
    </PublicLayout>
  )
}