'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { Upload, Phone, ImageIcon, Loader2, Sparkles, Check } from 'lucide-react'
import { toast } from 'sonner'
import { generateSlug } from '@/lib/utils'

const COUNTRY_CODES = [
  { code: '+225', label: "Côte d'Ivoire" },
  { code: '+228', label: 'Togo' },
  { code: '+229', label: 'Bénin' },
  { code: '+226', label: 'Burkina Faso' },
  { code: '+221', label: 'Sénégal' },
  { code: '+223', label: 'Mali' },
  { code: '+237', label: 'Cameroun' },
  { code: '+243', label: 'RDC' },
  { code: '+233', label: 'Ghana' },
  { code: '+33', label: 'France' },
  { code: '+1', label: 'USA/Canada' },
  { code: '+44', label: 'Royaume-Uni' },
] as const

interface Step4Props {
  name: string
  whatsapp: string
  countryCode: string
  description: string
  logo: string | null
  onNameChange: (v: string) => void
  onWhatsappChange: (v: string) => void
  onCountryCodeChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onLogoChange: (url: string | null) => void
  isValid: boolean
}

export function Step4Customization({
  name,
  whatsapp,
  countryCode,
  description,
  logo,
  onNameChange,
  onWhatsappChange,
  onCountryCodeChange,
  onDescriptionChange,
  onLogoChange,
  isValid,
}: Step4Props) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const slug = useMemo(() => generateSlug(name), [name])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 Mo")
        return
      }

      setIsUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: fd,
        })

        if (!res.ok) throw new Error('Erreur lors du téléchargement')

        const data = await res.json()
        onLogoChange(data.url)
        toast.success('Logo ajouté !')
      } catch {
        toast.error('Impossible de télécharger le logo')
      } finally {
        setIsUploading(false)
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onLogoChange],
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
      {/* ── Left: Form (3 cols on desktop) ── */}
      <div className="lg:col-span-3 space-y-5">
        {/* Shop Name */}
        <div className="space-y-2">
          <Label htmlFor="shop-name" className="text-sm font-semibold text-gray-700">
            Nom de votre activité <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="shop-name"
            type="text"
            placeholder="Ex: Beauty Glow, Tech Store..."
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-12 rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500/20"
          />
          {slug && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
              <span className="text-gray-400">Votre URL :</span>
              <span className="font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md">
                boutiko.pro/{slug}
              </span>
            </p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp-number" className="text-sm font-semibold text-gray-700">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Numéro WhatsApp <span className="text-rose-500">*</span>
            </span>
          </Label>
          <div className="flex items-center">
            <select
              value={countryCode}
              onChange={(e) => onCountryCodeChange(e.target.value)}
              className="inline-flex items-center justify-center h-12 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-sm font-medium text-gray-600 appearance-none pr-7 cursor-pointer focus:outline-none focus:border-rose-500"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.label}
                </option>
              ))}
            </select>
            <Input
              id="whatsapp-number"
              type="tel"
              placeholder="07 07 07 07"
              value={whatsapp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9\s]/g, '')
                onWhatsappChange(val)
              }}
              className="h-12 rounded-l-none rounded-r-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500/20"
              minLength={8}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Vos clients pourront vous contacter directement via WhatsApp
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="shop-description" className="text-sm font-semibold text-gray-700">
            Description courte
            <span className="text-xs font-normal text-muted-foreground ml-2">
              (optionnel)
            </span>
          </Label>
          <Textarea
            id="shop-description"
            placeholder="Ex: Les meilleurs cosmétiques d'Afrique"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={2}
            className="rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500/20 resize-none"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Logo
            </span>
            <span className="text-xs font-normal text-muted-foreground ml-2">
              (optionnel)
            </span>
          </Label>

          <div className="flex items-center gap-4">
            {logo ? (
              <div className="relative">
                <ImageWithFallback
                  src={logo}
                  alt="Logo de votre activité"
                  width={72}
                  height={72}
                  className="rounded-xl object-cover border border-gray-200"
                  fallbackIcon="image"
                />
                <button
                  type="button"
                  onClick={() => onLogoChange(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors shadow-sm"
                  aria-label="Supprimer le logo"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="w-[72px] h-[72px] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Télécharger un logo"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-xl border-gray-300 hover:border-rose-300 hover:text-rose-600"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 w-4 h-4" />
                    Télécharger
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG — Max 5 Mo</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Live Preview (2 cols on desktop) ── */}
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Aperçu en direct
          </p>

          <Card className="overflow-hidden border-2">
            <CardContent className="p-0">
              {/* Dark header bar */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {logo ? (
                      <ImageWithFallback
                        src={logo}
                        alt={name || 'Logo'}
                        width={44}
                        height={44}
                        className="rounded-lg object-cover"
                        fallbackIcon="image"
                      />
                    ) : (
                      <Sparkles className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-sm truncate">
                      {name || 'Votre boutique'}
                    </h4>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      boutiko.pro/{slug || 'votre-boutique'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description area */}
              <div className="p-5 space-y-4">
                {description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-300 italic">
                    Votre description apparaîtra ici...
                  </p>
                )}

                {/* Validation status */}
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        name.trim().length > 0
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span
                      className={
                        name.trim().length > 0 ? 'text-green-700 font-medium' : 'text-gray-400'
                      }
                    >
                      Nom de l&apos;activité
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        whatsapp.trim().length >= 8
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span
                      className={
                        whatsapp.trim().length >= 8
                          ? 'text-green-700 font-medium'
                          : 'text-gray-400'
                      }
                    >
                      Numéro WhatsApp
                    </span>
                  </div>
                </div>

                {/* Ready indicator */}
                {isValid && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 mt-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-green-700">
                      Prêt à continuer !
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}