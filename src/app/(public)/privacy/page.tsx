'use client'

import { PublicLayout } from '@/components/pages/public-layout'
import { PrivacyPage } from '@/components/pages/privacy-page'

export default function Privacy() {
  return (
    <PublicLayout currentView="privacy">
      <PrivacyPage />
    </PublicLayout>
  )
}