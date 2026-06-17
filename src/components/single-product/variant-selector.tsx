'use client'

import { useState, useMemo } from 'react'
import { Check } from 'lucide-react'
import { groupVariantsByType, guessColorHex, type ProductVariant, type VariantSelection } from '@/lib/variant-utils'

interface VariantSelectorProps {
  variants: ProductVariant[]
  basePrice: number
  accent: string
  onSelectionChange?: (selection: VariantSelection, finalPrice: number, availableStock: number | null) => void
}

export function VariantSelector({ variants, basePrice, accent, onSelectionChange }: VariantSelectorProps) {
  const { colors, sizes } = useMemo(() => groupVariantsByType(variants), [variants])
  const [colorId, setColorId] = useState<string | null>(colors[0]?.id ?? null)
  const [sizeId, setSizeId] = useState<string | null>(null)

  // Notifie le parent à chaque changement
  useMemo(() => {
    if (onSelectionChange) {
      const selection: VariantSelection = { colorVariantId: colorId, sizeVariantId: sizeId }
      const selected = [colorId, sizeId].filter(Boolean) as string[]
      let price = basePrice
      for (const id of selected) {
        const v = variants.find((x) => x.id === id)
        if (v) price += v.priceOffset
      }
      const selectedVariants = selected.map((id) => variants.find((v) => v.id === id)).filter(Boolean) as ProductVariant[]
      const stocks = selectedVariants.map((v) => v.stock).filter((s): s is number => typeof s === 'number')
      const stock = stocks.length ? Math.min(...stocks) : null
      onSelectionChange(selection, price, stock)
    }
  }, [colorId, sizeId, basePrice, variants, onSelectionChange])

  if (colors.length === 0 && sizes.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Sélecteur de couleurs */}
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-900">
            Couleur
            {colorId && (
              <span className="ml-2 font-normal text-gray-500">
                : {colors.find((c) => c.id === colorId)?.name}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const hex = c.colorHex || guessColorHex(c.name)
              const selected = c.id === colorId
              return (
                <button
                  key={c.id}
                  onClick={() => setColorId(selected ? null : c.id)}
                  aria-label={`Couleur ${c.name}`}
                  aria-pressed={selected}
                  className="relative h-10 w-10 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: hex,
                    borderColor: selected ? accent : 'transparent',
                    boxShadow: selected ? `0 0 0 2px ${accent}` : 'none',
                  }}
                >
                  {selected && (
                    <Check
                      className="absolute inset-0 m-auto h-5 w-5"
                      style={{ color: hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#f9fafb' ? '#111' : '#fff' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sélecteur de tailles */}
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-900">Taille</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const selected = s.id === sizeId
              const outOfStock = s.stock <= 0
              return (
                <button
                  key={s.id}
                  onClick={() => !outOfStock && setSizeId(selected ? null : s.id)}
                  disabled={outOfStock}
                  aria-label={`Taille ${s.name}`}
                  aria-pressed={selected}
                  className={`min-w-[3rem] rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                    outOfStock
                      ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through'
                      : selected
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {s.name}
                  {s.priceOffset > 0 && !outOfStock && (
                    <span className="ml-1 text-xs opacity-70">+{s.priceOffset.toLocaleString('fr-FR')}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
