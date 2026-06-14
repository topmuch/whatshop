'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ReactNode } from 'react'

export interface StatCardProps {
  /** Icon element rendered in the right side circle */
  icon: ReactNode
  /** Label text above the value */
  label: string
  /** Main value displayed prominently */
  value: number | string
  /** Optional trend text (e.g. "+12%") — shows with up/down arrow */
  sub?: string
  /** Optional badge text (e.g. "Premium") */
  badge?: string
  /** Additional class for the badge */
  badgeColor?: string
  /** Background class for the icon container */
  iconBg?: string
  /** Text color class for the icon */
  iconColor?: string
  /** Optional border accent class on the card */
  borderAccent?: string
  /** Optional background class on the card (e.g. gradient) */
  cardBg?: string
}

/**
 * Shared stat card used in dashboard overview and analytics.
 * Supports colored backgrounds, badges, and trend indicators.
 */
export function StatCard({
  icon,
  label,
  value,
  sub,
  badge,
  badgeColor,
  iconBg,
  iconColor,
  borderAccent,
  cardBg,
}: StatCardProps) {
  const isDark = !!cardBg

  return (
    <Card className={`overflow-hidden ${cardBg || ''} ${borderAccent || ''}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p
              className={`text-xs sm:text-sm ${
                isDark ? 'text-white/80' : 'text-muted-foreground'
              }`}
            >
              {label}
            </p>
            <p
              className={`text-lg sm:text-2xl font-bold mt-1 truncate ${
                isDark ? 'text-white' : ''
              }`}
            >
              {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
            </p>
            {sub && (
              <p
                className={`text-xs mt-1 flex items-center gap-1 ${
                  sub.startsWith('+') || sub.startsWith('0')
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400'
                }`}
              >
                {sub.startsWith('+') || sub.startsWith('0') ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {sub}
              </p>
            )}
            {badge && (
              <Badge variant="secondary" className={`mt-2 ${badgeColor}`}>
                {badge}
              </Badge>
            )}
          </div>
          <div
            className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0 ${
              isDark
                ? 'bg-white/20 text-white'
                : `${iconBg || 'bg-primary/10'} ${iconColor || 'text-primary'}`
            }`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}