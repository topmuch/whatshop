'use client'

import { useEffect, useState } from 'react'
import { resolveCountdown, type TimeRemaining } from '@/lib/countdown-utils'

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
    const parts: string[] = []
    if (time.days > 0) parts.push(`${time.days}j`)
    parts.push(`${String(time.hours).padStart(2, '0')}h`)
    parts.push(`${String(time.minutes).padStart(2, '0')}m`)
    parts.push(`${String(time.seconds).padStart(2, '0')}s`)
    return (
      <span className="flex items-center gap-1 text-xs font-bold tabular-nums text-red-600">
        {parts.join(' ')}
      </span>
    )
  }

  const units = [
    { label: 'Jours', value: time.days },
    { label: 'Heures', value: time.hours },
    { label: 'Min', value: time.minutes },
    { label: 'Sec', value: time.seconds },
  ]

  return (
    <div className="w-full" role="timer" aria-live="polite">
      {/* Headline */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: accent }}
        >
          Offre de lancement
        </span>
        <p className="text-sm font-medium text-gray-600">
          Le prix de lancement se termine dans
        </p>
      </div>
      {/* 4 unités */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((u, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-2xl bg-gray-900 py-3 sm:py-4"
          >
            <span className="text-2xl font-black tabular-nums text-white sm:text-4xl">
              {String(u.value).padStart(2, '0')}
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
