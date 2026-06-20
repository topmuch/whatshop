'use client'

import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
}

/**
 * Sélecteur de quantité simple -/+. Cibles tactiles ≥ 40px (h-10 w-10).
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
}: QuantitySelectorProps) {
  const atMin = value <= min
  const atMax = typeof max === 'number' && value >= max

  const decrement = () => {
    if (atMin) return
    onChange(Math.max(min, value - 1))
  }
  const increment = () => {
    if (atMax) return
    onChange(value + 1)
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={decrement}
        disabled={atMin}
        aria-label="Diminuer la quantité"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className="w-12 text-center text-base font-semibold tabular-nums text-gray-900"
        aria-live="polite"
        aria-label={`Quantité ${value}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={atMax}
        aria-label="Augmenter la quantité"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
