'use client'

import { type ReactNode, useMemo, createContext, useContext } from 'react'
import { templates, type TemplateId, type ShopTemplate } from '@/lib/templates'

interface TemplateContextValue {
  template: ShopTemplate
  cssVars: React.CSSProperties
}

const TemplateContext = createContext<TemplateContextValue | null>(null)

export function useTemplate() {
  const ctx = useContext(TemplateContext)
  if (!ctx) throw new Error('useTemplate must be used within TemplateProvider')
  return ctx.template
}

interface TemplateProviderProps {
  templateId: string
  children: ReactNode
}

export function TemplateProvider({ templateId, children }: TemplateProviderProps) {
  const template = useMemo(
    () => templates[(templateId as TemplateId) || 'classic'] || templates.classic,
    [templateId]
  )

  const cssVars = useMemo(() => {
    const c = template.colors
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
      '--tpl-hero-overlay': c.heroOverlay,
      '--tpl-hero-badge': c.heroBadge,
      '--tpl-hero-text': c.heroText,
      '--tpl-card-rounded': template.cardStyle.rounded,
      '--tpl-card-shadow': template.cardStyle.shadow,
      '--tpl-image-rounded': template.cardStyle.imageRounded,
    } as React.CSSProperties
  }, [template])

  const contextValue = useMemo(() => ({ template, cssVars }), [template, cssVars])

  return (
    <TemplateContext.Provider value={contextValue}>
      <div style={cssVars} data-template={template.id}>
        {children}
      </div>
    </TemplateContext.Provider>
  )
}
