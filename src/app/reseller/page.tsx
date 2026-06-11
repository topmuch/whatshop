'use client'

import { ResellerDashboard } from '@/components/dashboard/dashboard-reseller'
import { SessionInit } from '@/components/session-init'

export default function ResellerPage() {
  return (
    <SessionInit>
      <ResellerDashboard />
    </SessionInit>
  )
}