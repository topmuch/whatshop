'use client'

import { useEffect, useState } from 'react'
import { resolveCountdown, type TimeRemaining } from '@/lib/countdown-utils'

interface CountdownTimerProps {
  endDate?: string | null
  accent?: string
  /** Compact = affichage inline "2j 05h 30m 15s" pour sticky CTA */
  compact?: boolean
}

const UNITS_LABELS: { label: string; short: string }[] = [
  { label: 'Jours', short: 'j' },
  { label: 'Heures', short: 'h' },
  { label: 'Min', short: 'm' },
  { label: 'Sec', short: 's' },
]

export function CountdownTimer({
  endDate,
  accent = '#EF4444',
  compact = false,
}: CountdownTimerProps) {
  const [time, setTime] = useState<TimeRemaining | null>(null)

  useEffect(() => {
    if (!endDate) return
    const tick = () => setTime(resolveCountdown({ isoEnd: endDate }))
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [endDate])

  if (!endDate || !time || time.isExpired) return null

  // ─── Compact variant: "2j 05h 30m 15s" ───
  if (compact) {
    const parts: string[] = []
    if (time.days > 0) parts.push(`${time.days}j`)
    parts.push(`${String(time.hours).padStart(2, '0')}h`)
    parts.push(`${String(time.minutes).padStart(2, '0')}m`)
    parts.push(`${String(time.seconds).padStart(2, '0')}s`)
    return (
      <span
        className="flex items-center gap-1 text-xs font-bold tabular-nums"
        style={{ color: accent }}
      >
        {parts.join(' ')}
      </span>
    )
  }

  // ─── Full variant: 4 boxes ───
  const units = [
    { value: time.days, label: UNITS_LABELS[0].label },
    { value: time.hours, label: UNITS_LABELS[1].label },
    { value: time.minutes, label: UNITS_LABELS[2].label },
    { value: time.seconds, label: UNITS_LABELS[3].label },
  ]

  return (
    <div
      className="flex items-center gap-1.5"
      role="timer"
      aria-live="polite"
      aria-label={`Plus que ${time.days} jours ${time.hours} heures ${time.minutes} minutes et ${time.seconds} secondes`}
    >
      {units.map((u, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="flex min-w-[2.5rem] flex-col items-center justify-center rounded-lg bg-gray-900 px-1.5 py-1.5">
            <span className="text-base font-black tabular-nums leading-none text-white sm:text-lg">
              {String(u.value).padStart(2, '0')}
            </span>
          </div>
          <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-gray-500">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  )
}
