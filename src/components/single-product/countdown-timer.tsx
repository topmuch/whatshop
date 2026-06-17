'use client'

import { useEffect, useState } from 'react'
import { Clock, Flame } from 'lucide-react'
import { resolveCountdown, formatCountdown, formatCountdownCompact, type TimeRemaining } from '@/lib/countdown-utils'

interface CountdownTimerProps {
  enabled: boolean
  endHour: number
  endMinute: number
  isoEnd?: string
  accent?: string
  /** Compact = affichage inline pour sticky CTA mobile */
  compact?: boolean
}

export function CountdownTimer({
  enabled,
  endHour,
  endMinute,
  isoEnd,
  accent = '#EF4444',
  compact = false,
}: CountdownTimerProps) {
  const [time, setTime] = useState<TimeRemaining | null>(null)

  useEffect(() => {
    if (!enabled) return
    const tick = () => setTime(resolveCountdown({ endHour, endMinute, isoEnd }))
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [enabled, endHour, endMinute, isoEnd])

  if (!enabled || !time || time.isExpired) return null

  if (compact) {
    return (
      <span className="flex items-center gap-1 text-xs font-bold tabular-nums text-red-600">
        <Flame className="h-3 w-3" />
        {formatCountdownCompact(time)}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3" role="timer" aria-live="polite">
      <Clock className="h-5 w-5 text-red-600" />
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-red-500">
          Offre se termine dans
        </span>
        <span className="text-2xl font-black tabular-nums text-red-600 sm:text-3xl">
          {formatCountdown(time)}
        </span>
      </div>
    </div>
  )
}
