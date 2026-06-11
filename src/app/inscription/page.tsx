'use client'

import { AuthRegister } from '@/components/auth/auth-register'
import { SessionInit } from '@/components/session-init'

export default function RegisterPage() {
  return (
    <SessionInit>
      <AuthRegister />
    </SessionInit>
  )
}