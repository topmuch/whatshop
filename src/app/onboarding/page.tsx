'use client'

import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { SessionInit } from '@/components/session-init'

export default function OnboardingPage() {
  return (
    <SessionInit>
      <OnboardingWizard />
    </SessionInit>
  )
}