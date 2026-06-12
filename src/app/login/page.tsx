'use client'

import { AuthLogin } from '@/components/auth/auth-login'
import { SessionInit } from '@/components/session-init'

export default function LoginPage() {
  return (
    <SessionInit>
      <AuthLogin />
    </SessionInit>
  )
}