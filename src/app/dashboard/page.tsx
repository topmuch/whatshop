'use client'

import { SellerDashboard } from '@/components/dashboard/seller-dashboard'
import { SessionInit } from '@/components/session-init'

export default function DashboardPage() {
  return (
    <SessionInit>
      <SellerDashboard />
    </SessionInit>
  )
}