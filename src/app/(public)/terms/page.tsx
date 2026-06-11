'use client'

import { PublicLayout } from '@/components/pages/public-layout'
import { TermsPage } from '@/components/pages/terms-page'

export default function Terms() {
  return (
    <PublicLayout currentView="terms">
      <TermsPage />
    </PublicLayout>
  )
}