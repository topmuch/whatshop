'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'

export function SessionInit({ children }: { children: React.ReactNode }) {
  const { setUser, setShop, setShops, user } = useAppStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      if (!user) {
        try {
          const res = await fetch('/api/auth/session')
          if (res.ok) {
            const data = await res.json()
            if (data.user && !cancelled) {
              setUser(data.user)
              if (data.shops) setShops(data.shops)
              if (data.shop) setShop(data.shop)
            }
          }
        } catch {
          // not authenticated
        }
      }
      if (!cancelled) setReady(true)
    }
    init()
    return () => { cancelled = true }
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-800 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}