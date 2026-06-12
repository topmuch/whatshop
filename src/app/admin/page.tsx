'use client'

import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { SessionInit } from '@/components/session-init'

export default function AdminPage() {
  return (
    <SessionInit>
      <AdminDashboard />
    </SessionInit>
  )
}