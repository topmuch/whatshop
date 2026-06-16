'use client'

import { useState } from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  presets?: string[]
}

export default function ColorPicker({ label, value, onChange, presets = [] }: ColorPickerProps) {
  const [showPresets, setShowPresets] = useState(false)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-center gap-3">
        {/* Native color input */}
        <div className="relative">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
          />
        </div>

        {/* HEX value */}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const val = e.target.value
            if (/^#[0-9A-Fa-f]{6}$/.test(val) || val === '') {
              onChange(val)
            }
          }}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          placeholder="#000000"
        />

        {/* Presets toggle */}
        {presets.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🎨
          </button>
        )}
      </div>

      {/* Presets dropdown */}
      {showPresets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-gray-200">
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onChange(color)
                setShowPresets(false)
              }}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                value === color ? 'border-gray-900 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  )
}