'use client'

import { type ReactNode, useMemo } from 'react'
import { templates, type TemplateId } from '@/lib/templates'

interface TemplateProviderProps {
  templateId: string
  children: ReactNode
}

export function TemplateProvider({ templateId, children }: TemplateProviderProps) {
  const t = useMemo(() => templates[(templateId as TemplateId) || 'classic'] || templates.classic, [templateId])

  const cssVars = useMemo(() => {
    const c = t.colors
    return {
      '--tpl-bg': c.bg,
      '--tpl-card': c.card,
      '--tpl-card-hover': c.cardHover,
      '--tpl-text': c.text,
      '--tpl-text-muted': c.textMuted,
      '--tpl-border': c.border,
      '--tpl-primary': c.primary,
      '--tpl-primary-fg': c.primaryFg,
      '--tpl-accent': c.accent,
      '--tpl-price': c.priceColor,
      '--tpl-cta-bg': c.ctaBg,
      '--tpl-cta-fg': c.ctaFg,
      '--tpl-header-bg': c.headerBg,
      '--tpl-cart-bg': c.cartBg,
      '--tpl-filter-active': c.filterActive,
      '--tpl-filter-active-fg': c.filterActiveFg,
      '--tpl-badge-new': c.badgeNew,
      '--tpl-badge-promo': c.badgePromo,
      '--tpl-card-rounded': t.cardStyle.rounded,
      '--tpl-card-shadow': t.cardStyle.shadow,
      '--tpl-image-rounded': t.cardStyle.imageRounded,
    } as React.CSSProperties
  }, [t])

  return (
    <div style={cssVars} className="min-h-screen" data-template={t.id}>
      {children}
    </div>
  )
}
