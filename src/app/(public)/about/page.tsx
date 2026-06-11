'use client'

import { PublicLayout } from '@/components/pages/public-layout'
import { AboutPage } from '@/components/pages/about-page'

export default function About() {
  return (
    <PublicLayout currentView="about">
      <AboutPage />
    </PublicLayout>
  )
}