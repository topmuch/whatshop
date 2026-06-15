'use client'

import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { generateSlug } from '@/lib/utils'
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Sparkles,
  Phone,
  ImageIcon,
  Loader2,
  ShoppingCart,
  ConciergeBell,
} from 'lucide-react'

/* ──────────────────────── TYPES ──────────────────────── */

type BusinessType = 'ECOMMERCE' | 'SERVICE'
type Sector =
  | 'beaute'
  | 'mode'
  | 'electronique'
  | 'alimentation'
  | 'autre'
  | 'beaute-service'
  | 'restaurant'
  | 'consulting'
  | 'artisanat'
  | 'sante'
type TemplateId = 'cosmika-beauty' | 'xstore-electro'
type Plan = 'TRIAL' | 'PRO'

interface OnboardingFormData {
  businessType: BusinessType | null
  sector: Sector | null
  template: TemplateId | null
  name: string
  whatsapp: string
  countryCode: string
  description: string
  logo: string | null
  plan: Plan | null
}

/* ──────────────────────── CONSTANTS ──────────────────────── */

const ECOMMERCE_SECTORS: { id: Sector; emoji: string; name: string; subtitle: string }[] = [
  { id: 'beaute', emoji: '💄', name: 'Beauté', subtitle: 'Maquillage, soins, parfums' },
  { id: 'mode', emoji: '👗', name: 'Mode', subtitle: 'Vêtements, accessoires, chaussures' },
  { id: 'electronique', emoji: '📱', name: 'Tech', subtitle: 'Téléphones, accessoires, audio' },
  { id: 'alimentation', emoji: '🍔', name: 'Alimentation', subtitle: 'Boissons, snacks, épices' },
  { id: 'autre', emoji: '🛍️', name: 'Autre', subtitle: 'Autres produits' },
]

const SERVICE_SECTORS: { id: Sector; emoji: string; name: string; subtitle: string }[] = [
  { id: 'beaute-service', emoji: '💇', name: 'Beauté', subtitle: 'Salon, coiffure, esthétique' },
  { id: 'restaurant', emoji: '🍽️', name: 'Restaurant', subtitle: 'Restaurant, bar, traiteur' },
  { id: 'consulting', emoji: '💼', name: 'Consulting', subtitle: 'Conseil, formation, coaching' },
  { id: 'artisanat', emoji: '🔧', name: 'Artisan/BTP', subtitle: 'Plomberie, électricité, menuiserie' },
  { id: 'sante', emoji: '🏥', name: 'Santé', subtitle: 'Pharmacie, clinique, bien-être' },
]

const SECTOR_TEMPLATE_MAP: Partial<Record<Sector, TemplateId>> = {
  beaute: 'cosmika-beauty',
  mode: 'cosmika-beauty',
  electronique: 'xstore-electro',
  alimentation: 'xstore-electro',
  autre: 'xstore-electro',
  'beaute-service': 'cosmika-beauty',
  restaurant: 'cosmika-beauty',
  consulting: 'cosmika-beauty',
  artisanat: 'cosmika-beauty',
  sante: 'cosmika-beauty',
}

interface TemplateInfo {
  id: TemplateId
  emoji: string
  name: string
  features: { ecommerce: string[]; service: string[] }
}

const TEMPLATES: TemplateInfo[] = [
  {
    id: 'cosmika-beauty',
    emoji: '✨',
    name: 'Élégance',
    features: {
      ecommerce: ['Panier WhatsApp intégré', 'Gestion des stocks en temps réel', 'Design élégant & moderne'],
      service: ['Bouton Demander un devis', 'Formulaire de réservation', 'Design élégant & moderne'],
    },
  },
  {
    id: 'xstore-electro',
    emoji: '⚡',
    name: 'Moderne',
    features: {
      ecommerce: ['Catalogue produits avancé', 'Gestion des stocks en temps réel', 'Design tech & épuré'],
      service: ['Bouton Demander un devis', 'Formulaire de réservation', 'Design tech & épuré'],
    },
  },
]

const TOTAL_STEPS = 5

/* ──────────────────────── HELPERS ──────────────────────── */

const COUNTRY_CODES = [
  { code: '+225', label: 'Côte d\'Ivoire' },
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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
}

/* ──────────────────────── COMPONENT ──────────────────────── */

export function OnboardingWizard() {
  const { user, setShop, setPublicShop, setShops, setView } = useAppStore()

  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [form, setForm] = useState<OnboardingFormData>(() => {
    if (typeof window === 'undefined') {
      return {
        businessType: null,
        sector: null,
        template: null,
        name: '',
        whatsapp: '',
        countryCode: '+225',
        description: '',
        logo: null,
        plan: null,
      }
    }
    try {
      const saved = localStorage.getItem('boutiko-onboarding')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          businessType: parsed.businessType ?? null,
          sector: parsed.sector ?? null,
          template: parsed.template ?? null,
          name: parsed.name ?? '',
          whatsapp: parsed.whatsapp ?? '',
          countryCode: parsed.countryCode ?? '+225',
          description: parsed.description ?? '',
          logo: parsed.logo ?? null,
          plan: parsed.plan ?? null,
        }
      }
    } catch {
      // Ignore parse errors
    }
    return {
      businessType: null,
      sector: null,
      template: null,
      name: '',
      whatsapp: '',
      countryCode: '+225',
      description: '',
      logo: null,
      plan: null,
    }
  })

  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') return 1
    try {
      const saved = localStorage.getItem('boutiko-onboarding')
      if (saved) {
        const parsed = JSON.parse(saved)
        const s = parsed.step
        if (typeof s === 'number' && s >= 1 && s <= TOTAL_STEPS) return s
      }
    } catch {
      // Ignore parse errors
    }
    return 1
  })

  /* ──────── localStorage persistence ──────── */

  useEffect(() => {
    try {
      localStorage.setItem('boutiko-onboarding', JSON.stringify({ step, form }))
    } catch {
      // Ignore storage errors
    }
  }, [step, form])

  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ──────── Navigation ──────── */

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }, [step])

  /* ──────── Step 1: Business Type ──────── */

  const canProceedStep1 = form.businessType !== null

  /* ──────── Step 2: Sector ──────── */

  const sectors = form.businessType === 'SERVICE' ? SERVICE_SECTORS : ECOMMERCE_SECTORS
  const canProceedStep2 = form.sector !== null

  /* ──────── Step 3: Template ──────── */

  const availableTemplates = TEMPLATES.filter((t) => {
    if (form.sector && SECTOR_TEMPLATE_MAP[form.sector] === t.id) return true
    return false
  })

  const canProceedStep3 = form.template !== null

  /* ──────── Step 4: Customization ──────── */

  const slug = generateSlug(form.name)
  const canProceedStep4 = form.name.trim().length > 0 && form.whatsapp.trim().length >= 8

  /* ──────── Step 5: Plan ──────── */

  const templateEmoji = TEMPLATES.find((t) => t.id === form.template)?.emoji ?? '🏪'

  /* ──────── File Upload ──────── */

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo')
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
      setForm((prev) => ({ ...prev, logo: data.url }))
      toast.success('Logo ajouté !')
    } catch {
      toast.error('Impossible de télécharger le logo')
    } finally {
      setIsUploading(false)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  /* ──────── Submit ──────── */

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault()
      if (!form.plan || !form.businessType || !form.sector || !form.template || !form.name) return

      setIsSubmitting(true)

      try {
        const payload = {
          businessType: form.businessType,
          sector: form.sector,
          template: form.template,
          name: form.name.trim(),
          whatsapp: `${form.countryCode}${form.whatsapp.trim()}`,
          description: form.description.trim() || undefined,
          logo: form.logo || undefined,
          plan: form.plan,
        }

        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Erreur lors de la création')
        }

        const shopData = await res.json()
        const shop = shopData.shop || shopData

        setShop(shop)
        setPublicShop(shop)

        try {
          const sessionRes = await fetch('/api/auth/session')
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            if (sessionData.user?.shops) {
              setShops(sessionData.user.shops)
            }
          }
        } catch {
          // Non-critical: shops list will be refreshed later
        }

        // Clear onboarding data from localStorage
        try { localStorage.removeItem('boutiko-onboarding') } catch { /* ignore */ }

        // Show appropriate success message
        if (form.plan === 'PRO') {
          toast.success('Votre demande est transmise à nos services pour traitement sous 1H. Vous recevrez une notification une fois votre site activé. 🚀', {
            duration: 8000,
          })
        } else {
          toast.success('Votre boutique a été créée avec succès ! 🎉')
        }

        // Redirect to dashboard
        setView('dashboard')
        window.history.replaceState(null, '', '/dashboard')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, setShop, setPublicShop, setShops, setView],
  )

  /* ──────── Progress Bar ──────── */

  function ProgressBar() {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-rose-600">
            Étape {step} sur {TOTAL_STEPS}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((step / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                i < step ? 'bg-rose-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  /* ──────── Step Renderers ──────── */

  function renderStep1() {
    return (
      <motion.div
        key="step1"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4"
          >
            <Sparkles className="w-8 h-8 text-rose-600" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Bonjour{user?.name ? `, ${user.name.split(' ')[0]}` : ''} ! Que voulez-vous faire avec
            Boutiko ?
          </h2>
          <p className="text-muted-foreground">Choisissez votre type d&apos;activité</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                form.businessType === 'ECOMMERCE'
                  ? 'ring-2 ring-rose-600 shadow-lg bg-rose-50/50'
                  : 'hover:border-rose-300'
              }`}
              onClick={() => {
                setForm((prev) => ({ ...prev, businessType: 'ECOMMERCE' }))
              }}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="text-5xl mb-1">🛒</div>
                <ShoppingCart
                  className={`w-6 h-6 ${
                    form.businessType === 'ECOMMERCE' ? 'text-rose-600' : 'text-muted-foreground'
                  }`}
                />
                <h3 className="text-lg font-bold text-gray-900">VENDRE DES PRODUITS</h3>
                <p className="text-sm text-muted-foreground">
                  Boutique en ligne avec prix, stock, WhatsApp
                </p>
                {form.businessType === 'ECOMMERCE' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-rose-600 text-sm font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Sélectionné
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                form.businessType === 'SERVICE'
                  ? 'ring-2 ring-rose-600 shadow-lg bg-rose-50/50'
                  : 'hover:border-rose-300'
              }`}
              onClick={() => {
                setForm((prev) => ({ ...prev, businessType: 'SERVICE' }))
              }}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="text-5xl mb-1">🛎️</div>
                <ConciergeBell
                  className={`w-6 h-6 ${
                    form.businessType === 'SERVICE' ? 'text-rose-600' : 'text-muted-foreground'
                  }`}
                />
                <h3 className="text-lg font-bold text-gray-900">PROPOSER DES SERVICES</h3>
                <p className="text-sm text-muted-foreground">
                  Présentation d&apos;activité, devis, réservation
                </p>
                {form.businessType === 'SERVICE' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-rose-600 text-sm font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Sélectionné
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={goNext}
            disabled={!canProceedStep1}
            className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl px-8 font-semibold"
            size="lg"
          >
            Suivant
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  function renderStep2() {
    return (
      <motion.div
        key="step2"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Quel est votre domaine ?
          </h2>
          <p className="text-muted-foreground">
            Sélectionnez le secteur qui correspond le mieux à votre activité
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {sectors.map((sector, index) => (
            <motion.div
              key={sector.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                  form.sector === sector.id
                    ? 'ring-2 ring-rose-600 shadow-lg bg-rose-50/50'
                    : 'hover:border-rose-300'
                }`}
                onClick={() => {
                  const selectedTemplate = SECTOR_TEMPLATE_MAP[sector.id]
                  setForm((prev) => ({
                    ...prev,
                    sector: sector.id,
                    template: selectedTemplate ?? null,
                  }))
                }}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center gap-2">
                  <span className="text-3xl sm:text-4xl">{sector.emoji}</span>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">{sector.name}</h3>
                  <p className="text-xs text-muted-foreground leading-tight">{sector.subtitle}</p>
                  {form.sector === sector.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-1"
                    >
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            className="rounded-xl px-6"
            size="lg"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Button>
          <Button
            onClick={goNext}
            disabled={!canProceedStep2}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl px-8 font-semibold"
            size="lg"
          >
            Suivant
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  function renderStep3() {
    const isService = form.businessType === 'SERVICE'

    return (
      <motion.div
        key="step3"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Voici les designs disponibles pour votre activité
          </h2>
          <p className="text-muted-foreground">
            {isService
              ? 'Un design professionnel adapté aux services'
              : 'Un design optimisé pour la vente en ligne'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {availableTemplates.map((tpl, index) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`transition-all duration-200 hover:shadow-xl ${
                  form.template === tpl.id
                    ? 'ring-2 ring-rose-600 shadow-lg bg-rose-50/50'
                    : 'hover:border-rose-300'
                }`}
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{tpl.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {isService ? `${tpl.name} - Services` : tpl.name}
                      </h3>
                      {form.template === tpl.id && (
                        <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                          Sélectionné
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {(isService ? tpl.features.service : tpl.features.ecommerce).map(
                      (feature, fi) => (
                        <li key={fi} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ),
                    )}
                  </ul>

                  <Button
                    onClick={() => {
                      setForm((prev) => ({ ...prev, template: tpl.id }))
                    }}
                    variant={form.template === tpl.id ? 'default' : 'outline'}
                    className={`w-full rounded-xl font-semibold ${
                      form.template === tpl.id
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700'
                        : 'hover:border-rose-300 hover:text-rose-600'
                    }`}
                  >
                    {form.template === tpl.id ? (
                      <>
                        <Check className="mr-2 w-4 h-4" />
                        Sélectionné
                      </>
                    ) : (
                      'Sélectionner'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {availableTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun template disponible pour ce secteur.
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            className="rounded-xl px-6"
            size="lg"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Button>
          <Button
            onClick={goNext}
            disabled={!canProceedStep3}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl px-8 font-semibold"
            size="lg"
          >
            Suivant
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  function renderStep4() {
    return (
      <motion.div
        key="step4"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Personnalisez votre site en 2 minutes
          </h2>
          <p className="text-muted-foreground">
            Ces informations seront utilisées pour créer votre boutique
          </p>
        </div>

        <div className="space-y-5">
          {/* Shop Name */}
          <div className="space-y-2">
            <Label htmlFor="shop-name" className="text-sm font-semibold text-gray-700">
              Nom de votre activité <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="shop-name"
              type="text"
              placeholder="Ex: Beauty Glow, Tech Store..."
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
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
            <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Numéro WhatsApp <span className="text-rose-500">*</span>
              </span>
            </Label>
            <div className="flex items-center">
              <select
                value={form.countryCode}
                onChange={(e) => setForm((prev) => ({ ...prev, countryCode: e.target.value }))}
                className="h-12 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-sm font-medium text-gray-600 appearance-none pr-7 cursor-pointer focus:outline-none focus:border-rose-500"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} {c.label}
                  </option>
                ))}
              </select>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="07 07 07 07"
                value={form.whatsapp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9\s]/g, '')
                  setForm((prev) => ({ ...prev, whatsapp: val }))
                }}
                className="h-12 rounded-l-none rounded-r-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500/20"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Vos clients pourront vous contacter directement via WhatsApp
            </p>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              <span className="inline-flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Logo
              </span>
              <span className="text-xs font-normal text-muted-foreground ml-2">(optionnel)</span>
            </Label>

            <div className="flex items-center gap-4">
              {form.logo ? (
                <div className="relative">
                  <ImageWithFallback
                    src={form.logo}
                    alt="Logo de votre activité"
                    width={72}
                    height={72}
                    className="rounded-xl object-cover border border-gray-200"
                    fallbackIcon="image"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logo: null }))}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description courte
              <span className="text-xs font-normal text-muted-foreground ml-2">(optionnel)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Ex: Les meilleurs cosmétiques d'Afrique"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="rounded-xl border-gray-300 focus:border-rose-500 focus:ring-rose-500/20 resize-none"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            className="rounded-xl px-6"
            size="lg"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Button>
          <Button
            onClick={goNext}
            disabled={!canProceedStep4}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl px-8 font-semibold"
            size="lg"
          >
            Suivant
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  function renderStep5() {
    return (
      <motion.div
        key="step5"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4"
          >
            <Sparkles className="w-8 h-8 text-rose-600" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Votre site est prêt ! Choisissez votre formule
          </h2>
          <p className="text-muted-foreground">
            Sélectionnez le plan qui vous convient
          </p>
        </div>

        {/* Preview Card */}
        <Card className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-3xl">
                {form.logo ? (
                  <ImageWithFallback
                    src={form.logo}
                    alt={form.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                    fallbackIcon="image"
                  />
                ) : (
                  templateEmoji
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{form.name || 'Votre boutique'}</h3>
                <p className="text-sm text-gray-300 font-mono truncate">
                  boutiko.pro/{slug || 'votre-boutique'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-300">
                  {TEMPLATES.find((t) => t.id === form.template)?.name ?? 'Template'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Trial Plan */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-xl h-full ${
                form.plan === 'TRIAL'
                  ? 'ring-2 ring-rose-600 shadow-lg bg-rose-50/50'
                  : 'hover:border-rose-300'
              }`}
              onClick={() => setForm((prev) => ({ ...prev, plan: 'TRIAL' }))}
            >
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🟢</span>
                  <h3 className="font-bold text-lg text-gray-900">ESSAI GRATUIT</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">0</span>
                  <span className="text-muted-foreground ml-1">FCFA</span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {[
                    '7 jours d\'essai',
                    '1 boutique',
                    `${TEMPLATES.find((t) => t.id === form.template)?.name ?? 'Template'} inclus`,
                    'Domaine boutiko.pro',
                    'Logo Boutiko',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    setForm((prev) => ({ ...prev, plan: 'TRIAL' }))
                  }}
                  className={`w-full mt-5 rounded-xl font-semibold ${
                    form.plan === 'TRIAL'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600'
                  }`}
                  size="lg"
                >
                  Commencer gratuit →
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card
              className={`cursor-pointer transition-all duration-200 hover:shadow-xl h-full relative ${
                form.plan === 'PRO'
                  ? 'ring-2 ring-gray-900 shadow-lg bg-gray-50'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => setForm((prev) => ({ ...prev, plan: 'PRO' }))}
            >
              {form.plan !== 'PRO' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Recommandé
                  </span>
                </div>
              )}
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔵</span>
                  <h3 className="font-bold text-lg text-gray-900">PRO</h3>
                  <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">
                    Recommandé
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">5 000</span>
                  <span className="text-muted-foreground ml-1">FCFA/mois</span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {[
                    'Domaine personnalisé',
                    'Boutiques illimitées',
                    'Live TikTok intégré',
                    'Kit Marketing complet',
                    'Sans logo Boutiko',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-gray-900 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    setForm((prev) => ({ ...prev, plan: 'PRO' }))
                  }}
                  className={`w-full mt-5 rounded-xl font-semibold ${
                    form.plan === 'PRO'
                      ? 'bg-gray-900 text-white hover:bg-gray-800 ring-2 ring-gray-900'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  size="lg"
                >
                  Choisir Pro →
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            className="rounded-xl px-6"
            size="lg"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Button>
          <Button
            onClick={() => handleSubmit()}
            disabled={!form.plan || isSubmitting}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl px-8 font-semibold"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                Créer mon site
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    )
  }

  /* ──────── Main Render ──────── */

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <main className="max-w-2xl mx-auto px-4 py-12">
        <ProgressBar />

        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </AnimatePresence>
      </main>
    </div>
  )
}