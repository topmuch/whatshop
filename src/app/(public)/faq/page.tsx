'use client'

import { PublicLayout } from '@/components/pages/public-layout'
import { FAQPage } from '@/components/pages/faq-page'

export default function FAQ() {
  return (
    <PublicLayout currentView="faq">
      <FAQPage />
    </PublicLayout>
  )
}