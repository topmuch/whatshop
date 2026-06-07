'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { templates, type TemplateId } from '@/lib/templates'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface TemplateSelectorProps {
  currentTemplate: string
  onSelect: (template: TemplateId) => void
}

export function TemplateSelector({ currentTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.values(templates).map((t) => {
        const isActive = currentTemplate === t.id
        return (
          <motion.div
            key={t.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 overflow-hidden ${
                isActive
                  ? 'ring-2 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              style={isActive ? { '--tw-ring-color': t.colors.primary } as React.CSSProperties : undefined}
              onClick={() => {
                onSelect(t.id)
                toast.success(`Thème ${t.name} appliqué !`)
              }}
            >
              {/* Color preview strip */}
              <div
                className="h-3"
                style={{
                  background: t.colors.primary.startsWith('linear')
                    ? t.colors.primary
                    : `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.accent})`,
                }}
              />

              <div className="p-4 space-y-3">
                {/* Color circles */}
                <div className="flex items-center gap-2">
                  {[t.colors.primary, t.colors.accent, t.colors.bg, t.colors.card].map((color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border border-border/50 flex-shrink-0"
                      style={{
                        backgroundColor: color.startsWith('linear') ? t.colors.primary : color,
                      }}
                      title={['Primary', 'Accent', 'Background', 'Card'][i]}
                    />
                  ))}
                </div>

                {/* Template info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{t.emoji}</span>
                    <span className="font-semibold text-sm">{t.name}</span>
                    {isActive && (
                      <Badge
                        className="text-[10px] px-1.5 py-0"
                        style={{
                          backgroundColor: t.colors.primary.startsWith('linear') ? t.colors.primary : t.colors.primary,
                          color: t.colors.primaryFg,
                          border: 'none',
                        }}
                      >
                        Actif
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {t.description}
                  </p>
                </div>

                {/* Mini card preview */}
                <div
                  className="rounded-lg border p-2 space-y-2"
                  style={{
                    backgroundColor: t.colors.card,
                    borderColor: t.colors.border,
                    borderRadius: t.cardStyle.rounded,
                  }}
                >
                  <div
                    className="h-8 rounded-sm"
                    style={{
                      background: `linear-gradient(135deg, ${t.colors.primary.startsWith('linear') ? '#A855F7' : t.colors.primary}40, ${t.colors.accent}40)`,
                    }}
                  />
                  <div className="space-y-1.5">
                    <div
                      className="h-2 rounded-full w-3/4"
                      style={{ backgroundColor: t.colors.border }}
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full w-1/2"
                        style={{ backgroundColor: t.colors.textMuted }}
                      />
                      <div
                        className="h-2 rounded-full w-1/4"
                        style={{ backgroundColor: t.colors.primary.startsWith('linear') ? '#A855F7' : t.colors.primary, opacity: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
