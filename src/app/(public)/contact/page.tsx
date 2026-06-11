'use client'

import { PublicLayout } from '@/components/pages/public-layout'
import { ContactPage } from '@/components/pages/contact-page'

export default function Contact() {
  return (
    <PublicLayout currentView="contact">
      <ContactPage />
    </PublicLayout>
  )
}