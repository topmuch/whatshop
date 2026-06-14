'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { templates, type TemplateId, type ShopTemplate } from '@/lib/templates'
import { getTemplateDisplayInfo } from '@/lib/template-display'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface TemplateSelectorProps {
  currentTemplate: string
  onSelect: (template: TemplateId) => void
}

function getPreviewGradient(_templateId: string, colors: ShopTemplate['colors']): string {
  if (colors.primary.startsWith('linear')) return colors.primary
  return `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`
}

function TemplatePreviewMini({ templateId }: { templateId: TemplateId }) {
  const t = templates[templateId]
  const c = t.colors

  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ borderRadius: t.cardStyle.rounded, background: c.bg }}>
      {/* Mini header bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5" style={{ background: c.headerBg }}>
        <div className="w-3 h-3 rounded-sm" style={{ background: c.primary.startsWith('linear') ? '#A855F7' : c.primary }} />
        <div className="h-1.5 rounded-full flex-1" style={{ background: c.border }} />
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: c.border }} />
      </div>

      {/* Mini hero */}
      <div className="h-8 relative" style={{ background: getPreviewGradient(templateId, c) }}>
        <div className="absolute inset-0 flex items-center px-2">
          <div className="space-y-0.5">
            <div className="h-1.5 rounded-full w-2/3" style={{ background: 'rgba(255,255,255,0.7)' }} />
            <div className="h-1 rounded-full w-1/2" style={{ background: 'rgba(255,255,255,0.5)' }} />
          </div>
        </div>
      </div>

      {/* Mini category pills */}
      <div className="flex gap-1 px-2 py-1.5">
        <div
          className="h-2.5 rounded-full px-2 w-8"
          style={{ background: c.primary.startsWith('linear') ? '#A855F7' : c.primary, borderRadius: '9999px' }}
        />
        <div className="h-2.5 rounded-full px-2 w-6" style={{ background: c.border, borderRadius: '9999px' }} />
        <div className="h-2.5 rounded-full px-2 w-5" style={{ background: c.border, borderRadius: '9999px' }} />
      </div>

      {/* Mini product grid */}
      <div className="grid grid-cols-2 gap-1.5 px-2 pb-2">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ background: c.card, borderRadius: t.cardStyle.rounded.replace(/12px/, '6px').replace(/16px/, '6px').replace(/20px/, '8px').replace(/4px/, '3px').replace(/14px/, '6px'), border: t.layout.showCardBorder ? `1px solid ${c.border}` : 'none' }}>
            <div className="aspect-square" style={{ background: `linear-gradient(135deg, ${c.primary.startsWith('linear') ? '#A855F7' : c.primary}20, ${c.accent}20)`, borderRadius: '6px 6px 0 0' }} />
            <div className="p-1 space-y-0.5">
              <div className="h-1 rounded-full w-3/4" style={{ background: c.border }} />
              <div className="h-1 rounded-full w-1/2" style={{ background: c.textMuted, opacity: 0.3 }} />
              <div className="h-1.5 rounded-sm w-1/3 mt-1" style={{ background: c.priceColor.startsWith('linear') ? '#A855F7' : c.priceColor, opacity: 0.7 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Mini cart bar */}
      <div className="absolute bottom-0 left-0 right-0 h-4 flex items-center px-2 gap-1" style={{ background: c.cartBg, borderTop: `1px solid ${c.border}` }}>
        <div className="h-2 rounded-sm w-6" style={{ border: `1px solid ${c.border}` }} />
        <div className="h-1 rounded-full w-8 ml-auto" style={{ background: c.border }} />
        <div className="h-2.5 rounded-sm w-10" style={{ background: getPreviewGradient(templateId, c), borderRadius: t.layout.buttonStyle === 'pill' ? '9999px' : '4px' }} />
      </div>
    </div>
  )
}

export function TemplateSelector({ currentTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.values(templates).map((t) => {
        const isActive = currentTemplate === t.id
        const display = getTemplateDisplayInfo(t.id)

        return (
          <motion.div
            key={t.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                isActive ? 'ring-2 shadow-lg' : 'hover:shadow-md'
              }`}
              style={isActive ? { '--tw-ring-color': display.style.primaryColor } as React.CSSProperties : undefined}
              onClick={() => onSelect(t.id)}
            >
              {/* Template preview */}
              <div className="p-3">
                <TemplatePreviewMini templateId={t.id} />
              </div>

              {/* Template info — uses marketing display name */}
              <div className="px-4 pb-4 pt-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{display.style.emoji}</span>
                    <span className="font-semibold text-sm">Template {display.displayName}</span>
                  </div>
                  {isActive ? (
                    <Badge
                      className="text-[10px] px-2 py-0.5 text-white border-0"
                      style={{ backgroundColor: display.style.primaryColor }}
                    >
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      {display.style.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-tight">{display.tagline}</p>
                <p className="text-[11px] text-muted-foreground/80 leading-tight line-clamp-2">{display.description}</p>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}