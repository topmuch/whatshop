'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { templates, type TemplateId } from '@/lib/templates'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  ShoppingBag,
  Store,
  Crown,
  Gift,
  Zap,
  Loader2,
  Phone,
  MapPin,
  Briefcase,
  Camera,
  Rocket,
  CheckCircle2,
  Palette,
} from 'lucide-react'

/* ──────────────────────────── CONSTANTS ──────────────────────────── */

const sectorTemplateMap: Record<string, TemplateId> = {
  beaute: 'jameela',
  mode: 'xstore-fashion',
  electronique: 'xstore-electro',
  alimentation: 'xstore-grocery',
  artisanat: 'elegant',
  sport: 'ocean',
  bijoux: 'elegant',
  maison: 'sunset',
  auto: 'minimal',
  autre: 'classic',
}

const sectorCategoriesMap: Record<string, string[]> = {
  beaute: ['Maquillage', 'Soins', 'Parfums', 'Accessoires Beauté'],
  mode: ['Robes', 'Accessoires', 'Chaussures', 'Hauts'],
  electronique: ['Téléphones', 'Accessoires', 'Ordinateurs', 'Audio'],
  alimentation: ['Boissons', 'Snacks', 'Conserves', 'Épices'],
  artisanat: ['Sculptures', 'Tissus', 'Bijoux Artisanaux', 'Décorations'],
  sport: ['Équipements', 'Vêtements Sport', 'Accessoires', 'Nutrition'],
  bijoux: ['Bagues', 'Colliers', 'Bracelets', "Boucles d'oreilles"],
  maison: ['Décoration', 'Meubles', 'Cuisine', 'Linge de maison'],
  auto: ['Pièces détachées', 'Accessoires Auto', 'Entretien', 'Électronique Auto'],
  autre: ['Produits', 'Services', 'Divers'],
}

const sectors = [
  { id: 'beaute', label: 'Beauté & Cosmétiques', emoji: '💄', description: 'Maquillage, soins, parfums...' },
  { id: 'mode', label: 'Mode & Vêtements', emoji: '👗', description: 'Robes, costumes, accessoires...' },
  { id: 'electronique', label: 'Électronique & Tech', emoji: '📱', description: 'Téléphones, accessoires...' },
  { id: 'alimentation', label: 'Alimentation & Boissons', emoji: '🍕', description: 'Snacks, boissons, épices...' },
  { id: 'artisanat', label: 'Artisanat & Décoration', emoji: '🏺', description: 'Sculptures, tissus, art...' },
  { id: 'sport', label: 'Sport & Fitness', emoji: '⚽', description: 'Équipements, vêtements sport...' },
  { id: 'bijoux', label: 'Bijoux & Accessoires', emoji: '💎', description: 'Bagues, colliers, bracelets...' },
  { id: 'maison', label: 'Maison & Déco', emoji: '🏠', description: 'Décoration, cuisine, linge...' },
  { id: 'auto', label: 'Auto & Moto', emoji: '🚗', description: 'Pièces, accessoires auto...' },
  { id: 'autre', label: 'Autre', emoji: '📦', description: 'Autre secteur d\'activité' },
]

const plans = [
  {
    id: 'FREE',
    name: 'Gratuit',
    price: '0',
    period: '',
    description: 'Parfait pour démarrer',
    icon: Gift,
    popular: false,
    features: ['10 produits max', 'Boutique publique', 'Commandes WhatsApp', 'Design responsive', 'QR code boutique'],
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    price: '5 000',
    period: 'FCFA/mois',
    description: 'Le choix des vendeurs',
    icon: Zap,
    popular: true,
    features: ['100 produits', '8 thèmes premium', 'Statistiques', 'Support prioritaire', 'Logo personnalisé', 'IA descriptions'],
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: '15 000',
    period: 'FCFA/mois',
    description: 'Pour les pros',
    icon: Crown,
    popular: false,
    features: ['Produits illimités', 'Domaine personnalisé', 'Support 24/7', 'API & intégrations', 'Marque blanche', 'Formation offerte'],
  },
]

/* ──────────────────────────── ANIMATIONS ──────────────────────────── */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ──────────────────────────── MAIN COMPONENT ──────────────────────────── */

export function OnboardingWizard() {
  const { user, setShop, setView } = useAppStore()
  const [step, setStep] = useState(0) // 0 = plan, 1 = info, 2 = preview
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form state
  const [selectedPlan, setSelectedPlan] = useState('FREE')
  const [shopName, setShopName] = useState('')
  const [address, setAddress] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoData, setLogoData] = useState<string | null>(null)

  const progress = ((step + 1) / 3) * 100

  // Derived data
  const assignedTemplate = useMemo(
    () => templates[sectorTemplateMap[selectedSector] || 'classic'],
    [selectedSector]
  )
  const assignedCategories = useMemo(
    () => sectorCategoriesMap[selectedSector] || ['Produits', 'Divers'],
    [selectedSector]
  )

  function goNext() {
    setDirection(1)
    setStep((s) => Math.min(s + 1, 2))
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo trop volumineux (max 2 MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setLogoPreview(reader.result as string)
      setLogoData((reader.result as string).split(',')[1]) // base64 without prefix
    }
    reader.readAsDataURL(file)
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  async function handleComplete() {
    if (!shopName || !whatsapp) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const slug = generateSlug(shopName)
      const logoUrl = logoData ? `data:image/png;base64,${logoData}` : null

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.id,
          name: shopName,
          slug,
          whatsapp,
          address,
          phone: whatsapp,
          plan: selectedPlan,
          sector: selectedSector || null,
          logo: logoUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la création')
        setLoading(false)
        return
      }

      const shop = await res.json()
      setShop({
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        logo: shop.logo,
        banner: shop.banner,
        whatsapp: shop.whatsapp,
        address: shop.address,
        phone: shop.phone,
        plan: shop.plan,
        sector: shop.sector,
        template: shop.template,
        isActive: shop.isActive,
      })

      toast.success('🎉 Votre boutique est prête !')
      setView('dashboard')
    } catch {
      toast.error('Erreur de connexion')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-background to-orange-50/40 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-md shadow-primary/20">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Bouti<span className="text-primary">ko</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Étape {step + 1} sur 3
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              Passer
            </Button>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-border/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-3">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between mt-2 mb-1">
            {['Offre', 'Votre boutique', 'Thème'].map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  i <= step ? 'text-primary' : 'text-muted-foreground/50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    i < step
                      ? 'bg-primary text-primary-foreground'
                      : i === step
                      ? 'bg-primary/15 text-primary ring-2 ring-primary/30'
                      : 'bg-muted text-muted-foreground/50'
                  }`}
                >
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-3xl relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="step-plan"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <StepPlan selectedPlan={selectedPlan} onSelect={setSelectedPlan} />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div
                key="step-info"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <StepInfo
                  shopName={shopName}
                  setShopName={setShopName}
                  address={address}
                  setAddress={setAddress}
                  whatsapp={whatsapp}
                  setWhatsapp={setWhatsapp}
                  selectedSector={selectedSector}
                  setSelectedSector={setSelectedSector}
                  logoPreview={logoPreview}
                  onLogoUpload={handleLogoUpload}
                  assignedTemplate={assignedTemplate}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step-preview"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <StepPreview
                  shopName={shopName}
                  address={address}
                  assignedTemplate={assignedTemplate}
                  assignedCategories={assignedCategories}
                  selectedSector={selectedSector}
                  selectedPlan={selectedPlan}
                  loading={loading}
                  onComplete={handleComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="border-t bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>

          {step < 2 ? (
            <Button
              onClick={goNext}
              disabled={
                (step === 0 && !selectedPlan) ||
                (step === 1 && (!shopName || !whatsapp))
              }
              className="gap-2 shadow-lg shadow-primary/20"
            >
              Continuer
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading || !shopName || !whatsapp}
              className="gap-2 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-400"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Créer ma boutique
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}

/* ──────────────────────────── STEP 1: PLAN ──────────────────────────── */

function StepPlan({
  selectedPlan,
  onSelect,
}: {
  selectedPlan: string
  onSelect: (plan: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Étape 1/3
          </div>
        </motion.div>
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={1}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          Choisissez votre{' '}
          <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
            offre
          </span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={2}
          className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto"
        >
          Commencez gratuitement et évoluez à votre rythme. Vous pouvez changer de plan à tout moment.
        </motion.p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map((plan, i) => {
          const isSelected = selectedPlan === plan.id
          return (
            <motion.div
              key={plan.id}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              custom={i + 3}
            >
              <Card
                className={`relative cursor-pointer transition-all duration-300 h-full ${
                  isSelected
                    ? 'ring-2 ring-primary shadow-xl shadow-primary/15 scale-[1.02]'
                    : 'hover:ring-1 hover:ring-primary/40 hover:shadow-lg'
                }`}
                onClick={() => onSelect(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="px-3 py-0.5 shadow-md bg-gradient-to-r from-primary to-amber-600 text-white border-0 text-[10px]">
                      Populaire
                    </Badge>
                  </div>
                )}
                <CardContent className="pt-6 pb-5 p-4 sm:p-5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <plan.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                  <div className="mt-3 mb-4">
                    <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-muted-foreground ml-1">{plan.period}</span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 4).map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs">
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            isSelected ? 'text-primary' : 'text-muted-foreground/50'
                          }`}
                        />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-3 flex items-center justify-center"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────────────── STEP 2: SHOP INFO ──────────────────────────── */

function StepInfo({
  shopName,
  setShopName,
  address,
  setAddress,
  whatsapp,
  setWhatsapp,
  selectedSector,
  setSelectedSector,
  logoPreview,
  onLogoUpload,
  assignedTemplate,
}: {
  shopName: string
  setShopName: (v: string) => void
  address: string
  setAddress: (v: string) => void
  whatsapp: string
  setWhatsapp: (v: string) => void
  selectedSector: string
  setSelectedSector: (v: string) => void
  logoPreview: string | null
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  assignedTemplate: { id: string; name: string; emoji: string; description: string; colors: { primary: string; accent: string } }
}) {
  const previewSlug = shopName
    ? shopName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    : 'votre-boutique'

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Store className="w-4 h-4" />
            Étape 2/3
          </div>
        </motion.div>
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={1}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          Configurez votre{' '}
          <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
            boutique
          </span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={2}
          className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto"
        >
          Renseignez les informations de votre boutique. Un thème adapté sera choisi automatiquement.
        </motion.p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={3}
        className="space-y-5"
      >
        <Card className="p-5 sm:p-6">
          <div className="space-y-5">
            {/* Logo upload */}
            <div className="flex items-center gap-5">
              <div className="relative group cursor-pointer" onClick={() => {
                const input = document.getElementById('logo-upload') as HTMLInputElement
                input?.click()
              }}>
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed transition-all ${
                    logoPreview
                      ? 'border-primary/50'
                      : 'border-muted-foreground/25 group-hover:border-primary/50 group-hover:bg-primary/5'
                  }`}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground/50 group-hover:text-primary/60" />
                  )}
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onLogoUpload}
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-1.5">
                  Logo (optionnel)
                </p>
              </div>

              <div className="flex-1 space-y-4">
                {/* Shop name */}
                <div className="space-y-2">
                  <Label htmlFor="shop-name" className="text-sm font-medium">
                    Nom de la boutique <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      id="shop-name"
                      placeholder="Ex: Boutique Amina"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                  {shopName && (
                    <p className="text-xs text-muted-foreground">
                      Votre URL : <span className="text-primary font-medium">boutiko.com/{previewSlug}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Numéro WhatsApp <span className="text-destructive">*</span>
                </span>
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+221 77 123 45 67"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Adresse / Ville
                </span>
              </Label>
              <Input
                id="address"
                placeholder="Ex: Dakar, Sénégal"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Sector */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Secteur d&apos;activité <span className="text-destructive">*</span>
                </span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Chaque secteur est associé à un thème adapté à votre activité
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {sectors.map((sector) => {
                  const isSelected = selectedSector === sector.id
                  const templateId = sectorTemplateMap[sector.id] || 'classic'
                  const tpl = templates[templateId]
                  return (
                    <motion.button
                      key={sector.id}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSector(sector.id)}
                      className={`relative p-3 rounded-xl border-2 text-center transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? 'shadow-lg'
                          : 'border-border/50 hover:border-primary/30 hover:bg-muted/50'
                      }`}
                      style={{
                        borderColor: isSelected ? tpl.colors.primary : undefined,
                        background: isSelected ? `${tpl.colors.primary}08` : undefined,
                        boxShadow: isSelected ? `0 4px 14px ${tpl.colors.primary}20` : undefined,
                      }}
                    >
                      {/* Color accent bar at top */}
                      <div
                        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-200"
                        style={{
                          backgroundColor: tpl.colors.primary,
                          opacity: isSelected ? 1 : 0,
                        }}
                      />
                      <span className="text-xl sm:text-2xl block">{sector.emoji}</span>
                      <span className={`text-[10px] sm:text-xs font-medium mt-1 block leading-tight transition-colors duration-200 ${
                        isSelected ? '' : 'text-foreground/80'
                      }`} style={{ color: isSelected ? tpl.colors.primary : undefined }}>
                        {sector.label.split(' & ')[0]}
                      </span>
                      {/* Theme name badge */}
                      {isSelected && (
                        <div className="mt-1.5 flex items-center justify-center gap-1">
                          <span className="text-xs">{tpl.emoji}</span>
                          <span
                            className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${tpl.colors.primary}18`,
                              color: tpl.colors.primary,
                            }}
                          >
                            {tpl.name}
                          </span>
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
              {/* Selected theme preview */}
              {selectedSector && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/30"
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg text-lg shrink-0"
                    style={{ backgroundColor: `${assignedTemplate.colors.primary}15` }}
                  >
                    {assignedTemplate.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Thème {assignedTemplate.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{assignedTemplate.description}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 shrink-0">
                    <div
                      className="w-4 h-4 rounded-full border border-border/40"
                      style={{ backgroundColor: assignedTemplate.colors.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-border/40"
                      style={{ backgroundColor: assignedTemplate.colors.accent }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

/* ──────────────────────────── STEP 3: PREVIEW ──────────────────────────── */

function StepPreview({
  shopName,
  address,
  assignedTemplate,
  assignedCategories,
  selectedSector,
  selectedPlan,
  loading,
  onComplete,
}: {
  shopName: string
  address: string
  assignedTemplate: { id: string; name: string; emoji: string; colors: { primary: string; bg: string; text: string; card: string } }
  assignedCategories: string[]
  selectedSector: string
  selectedPlan: string
  loading: boolean
  onComplete: () => void
}) {
  const sectorInfo = sectors.find((s) => s.id === selectedSector)
  const planInfo = plans.find((p) => p.id === selectedPlan)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Palette className="w-4 h-4" />
            Étape 3/3
          </div>
        </motion.div>
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={1}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          Votre boutique est{' '}
          <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
            presque prête
          </span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={2}
          className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto"
        >
          Voici un aperçu de la configuration que nous avons préparée pour vous.
        </motion.p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Shop preview card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={3}
        >
          <Card className="overflow-hidden h-full">
            {/* Preview header */}
            <div
              className="px-5 py-6 text-white relative"
              style={{
                background: `linear-gradient(135deg, ${assignedTemplate.colors.primary}, ${assignedTemplate.colors.primary}dd)`,
              }}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg font-bold ring-2 ring-white/30">
                  {shopName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{shopName || 'Ma Boutique'}</p>
                  <p className="text-white/70 text-xs">
                    {address || 'Votre ville'} · {sectorInfo?.label || 'Votre secteur'}
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Catégories pré-configurées
              </p>
              <div className="flex flex-wrap gap-1.5">
                {assignedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium text-white"
                    style={{ backgroundColor: assignedTemplate.colors.primary }}
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Template info */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{assignedTemplate.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold">Thème {assignedTemplate.name}</p>
                      <p className="text-[10px] text-muted-foreground">Assigné automatiquement</p>
                    </div>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full shadow-inner border border-white/30"
                    style={{ backgroundColor: assignedTemplate.colors.primary }}
                  />
                </div>
              </div>

              {/* Mock product cards */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg overflow-hidden border border-border/40"
                    style={{ backgroundColor: assignedTemplate.colors.card || assignedTemplate.colors.bg }}
                  >
                    <div
                      className="aspect-square flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${assignedTemplate.colors.primary}10` }}
                    >
                      📦
                    </div>
                    <div className="p-1.5">
                      <div className="h-2 w-3/4 rounded bg-muted/60 mb-1" />
                      <div className="h-2 w-1/2 rounded" style={{ backgroundColor: `${assignedTemplate.colors.primary}40` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Summary card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={4}
          className="space-y-4"
        >
          <Card className="p-5">
            <h3 className="font-semibold text-base mb-4">Résumé</h3>
            <div className="space-y-3.5">
              {/* Shop name */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Store className="w-3.5 h-3.5" />
                  Nom
                </span>
                <span className="text-sm font-medium">{shopName}</span>
              </div>

              {/* Sector */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  Secteur
                </span>
                <span className="text-sm font-medium">
                  {sectorInfo?.emoji} {sectorInfo?.label || 'Non défini'}
                </span>
              </div>

              {/* Template */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" />
                  Thème
                </span>
                <Badge variant="secondary" className="text-xs gap-1">
                  {assignedTemplate.emoji} {assignedTemplate.name}
                </Badge>
              </div>

              {/* Plan */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  {planInfo && <planInfo.icon className="w-3.5 h-3.5" />}
                  Offre
                </span>
                <span className="text-sm font-medium">
                  {planInfo?.name} ({planInfo?.price === '0' ? 'Gratuit' : `${planInfo?.price} ${planInfo?.period}`})
                </span>
              </div>

              {/* Categories */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-muted-foreground flex items-center gap-2 shrink-0">
                  📂 Catégories
                </span>
                <span className="text-xs text-right text-muted-foreground leading-relaxed">
                  {assignedCategories.join(', ')}
                </span>
              </div>
            </div>
          </Card>

          {/* What happens next card */}
          <Card className="p-5 bg-primary/5 border-primary/10">
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" />
              Et ensuite ?
            </h3>
            <ul className="space-y-2.5">
              {[
                'Votre boutique est créée instantanément',
                `Le thème "${assignedTemplate.name}" est activé`,
                `${assignedCategories.length} catégories sont pré-configurées`,
                'Vous pouvez ajouter vos produits immédiatement',
                'Partagez votre lien sur WhatsApp !',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
