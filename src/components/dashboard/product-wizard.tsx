'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImageIcon,
  Loader2,
  Package,
  Plus,
  Tag,
  Trash2,
  Upload,
  X,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { getBusinessLabels } from '@/lib/business-labels'
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  productWizardSchema,
  wizardToApiPayload,
  type ProductWizardInput,
} from '@/lib/product-wizard-schemas'

// ─── Types ─────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
}

interface ProductWizardProps {
  shopId: string
  categories: Category[]
  businessType?: string | null
  sector?: string | null
  onSuccess: () => void
  onCancel: () => void
}

const STEPS = [
  { id: 1, label: 'Identité', icon: Tag },
  { id: 2, label: 'Présentation', icon: ImageIcon },
  { id: 3, label: 'Prix & Stock', icon: Package },
  { id: 4, label: 'Publication', icon: Check },
] as const

const STORAGE_KEY = 'boutiko-product-wizard-draft'

// ─── Slide animation variants ──────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

// ─── Component ─────────────────────────────────────────────────────────

export function ProductWizard({
  shopId,
  categories,
  businessType,
  sector,
  onSuccess,
  onCancel,
}: ProductWizardProps) {
  const labels = getBusinessLabels(businessType, sector)
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const extraFileInputRef = useRef<HTMLInputElement>(null)
  const [extraUploadIdx, setExtraUploadIdx] = useState(-1)

  // ── Form (react-hook-form) ──
  const form = useForm<ProductWizardInput>({
    resolver: zodResolver(productWizardSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      image: '',
      description: '',
      images: [],
      price: undefined as unknown as number,
      compareAtPrice: undefined as unknown as number,
      stock: undefined as unknown as number,
      isAvailable: true,
    },
    mode: 'onChange',
  })

  const { watch, setValue, trigger, getValues, formState: { errors } } = form
  const watched = watch()

  // ── Persist draft to localStorage ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const draft = {
        name: watched.name || '',
        categoryId: watched.categoryId || '',
        image: watched.image || '',
        description: watched.description || '',
        images: watched.images || [],
        price: watched.price,
        compareAtPrice: watched.compareAtPrice,
        stock: watched.stock,
        isAvailable: watched.isAvailable,
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
      } catch {
        // localStorage full or unavailable
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [watched.name, watched.categoryId, watched.image, watched.description, watched.images, watched.price, watched.compareAtPrice, watched.stock, watched.isAvailable])

  // ── Restore draft on mount ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.name) setValue('name', draft.name)
        if (draft.categoryId) setValue('categoryId', draft.categoryId)
        if (draft.image) setValue('image', draft.image)
        if (draft.description) setValue('description', draft.description)
        if (draft.images?.length) setValue('images', draft.images)
        if (draft.price != null) setValue('price', draft.price)
        if (draft.compareAtPrice != null) setValue('compareAtPrice', draft.compareAtPrice)
        if (draft.stock != null) setValue('stock', draft.stock)
        if (draft.isAvailable != null) setValue('isAvailable', draft.isAvailable)
      }
    } catch {
      // ignore
    }
  }, [setValue])

  // ── Step-specific field names for validation ──
  const stepFields: Record<number, (keyof ProductWizardInput)[]> = {
    1: ['name', 'categoryId'],
    2: ['image', 'description', 'images'],
    3: ['price', 'compareAtPrice', 'stock'],
    4: ['isAvailable'],
  }

  const stepSchemas: Record<number, z.ZodTypeAny> = {
    1: step1Schema,
    2: step2Schema,
    3: step3Schema,
    4: step4Schema,
  }

  // ── Navigation ──
  const canGoNext = useCallback(() => {
    const fields = stepFields[step]
    const schema = stepSchemas[step]
    const partial = fields.reduce((acc, key) => {
      acc[key] = getValues(key)
      return acc
    }, {} as Record<string, unknown>)
    return schema.safeParse(partial).success
  }, [step, getValues])

  async function goNext() {
    const fields = stepFields[step]
    const valid = await trigger(fields)
    if (!valid) return

    // Extra validation for step 2: must have image
    if (step === 2 && !getValues('image')) {
      toast.error('Ajoutez au moins une image')
      return
    }

    if (step < 4) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }

  function goBack() {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  // ── Image upload ──
  async function uploadFile(file: File): Promise<string | null> {
    setUploading(true)
    setUploadProgress(10)
    try {
      // Simulate progress (actual upload is fast locally)
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 20, 90))
      }, 200)

      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erreur lors du téléchargement')
        return null
      }
      const data = await res.json()
      return data.url as string
    } catch {
      toast.error('Erreur de connexion')
      return null
    } finally {
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  async function handleMainImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    if (url) {
      setValue('image', url, { shouldValidate: true })
      toast.success('Image principale ajoutée')
    }
    e.target.value = ''
  }

  async function handleExtraImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    if (url) {
      const images = [...(watched.images || [])]
      images.push(url)
      setValue('images', images, { shouldValidate: true })
      toast.success('Photo supplémentaire ajoutée')
    }
    e.target.value = ''
  }

  function removeExtraImage(idx: number) {
    const images = [...(watched.images || [])]
    images.splice(idx, 1)
    setValue('images', images, { shouldValidate: true })
  }

  // ── Submit ──
  async function handlePublish() {
    setSubmitting(true)
    try {
      const values = getValues()
      const result = productWizardSchema.safeParse(values)
      if (!result.success) {
        toast.error('Certains champs sont invalides')
        return
      }

      const payload = wizardToApiPayload(result.data)
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Erreur lors de la création")
        return
      }

      // Clear draft
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }

      toast.success(`${labels.productLabel} créé avec succès !`)
      onSuccess()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Cancel with draft cleanup ──
  function handleCancel() {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    onCancel()
  }

  // ── Price formatting helper ──
  function handlePriceChange(field: 'price' | 'compareAtPrice' | 'stock', value: string) {
    if (field === 'stock') {
      if (value === '') {
        setValue('stock', undefined as unknown as number)
      } else {
        const num = parseInt(value, 10)
        if (!isNaN(num)) setValue('stock', num)
      }
    } else {
      if (value === '') {
        setValue(field, undefined as unknown as number)
      } else {
        const num = parseFloat(value)
        if (!isNaN(num)) setValue(field, num)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Step indicator ─── */}
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((s, idx) => {
          const Icon = s.icon
          const isCompleted = step > s.id
          const isCurrent = step === s.id
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => {
                  if (s.id < step) {
                    setDirection(-1)
                    setStep(s.id)
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'bg-primary/10 text-primary cursor-pointer'
                      : 'bg-muted text-muted-foreground'
                }`}
                disabled={s.id > step}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 bg-border" />
              )}
            </div>
          )
        })}
      </div>

      {/* ─── Progress bar ─── */}
      <Progress value={(step / 4) * 100} className="h-1.5" />

      {/* ─── Step content with animation ─── */}
      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* ─── STEP 1 : Identité ─── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    Identité du {labels.productLabel.toLowerCase()}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Donnez un nom clair et choisissez la catégorie appropriée.
                  </p>
                </div>

                <Form {...form}>
                  <div className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nom du {labels.productLabel.toLowerCase()} <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Robe Wax Colorée"
                              {...field}
                              autoFocus
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Catégorie <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une catégorie..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {categories.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              Créez d&apos;abord une catégorie dans l&apos;onglet Catégories.
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </div>
            )}

            {/* ─── STEP 2 : Présentation ─── */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Photos & Description
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Une belle photo augmente les ventes. Ajoutez ensuite une description.
                  </p>
                </div>

                {/* Main image upload */}
                <div className="space-y-2">
                  <Label>
                    Image principale <span className="text-destructive">*</span>
                  </Label>
                  {watched.image ? (
                    <div className="relative w-full max-w-xs aspect-square rounded-xl overflow-hidden border-2 border-primary/20 bg-muted">
                      <img
                        src={watched.image}
                        alt="Image principale"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setValue('image', '', { shouldValidate: true })}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs">
                        Principale
                      </Badge>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full max-w-xs aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <Progress value={uploadProgress} className="w-24 h-2" />
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-medium">
                            Cliquer pour ajouter
                          </span>
                          <span className="text-xs text-muted-foreground/60">
                            JPG, PNG, WebP — max 5 Mo
                          </span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMainImageUpload}
                  />
                  {errors.image && (
                    <p className="text-sm text-destructive">{errors.image.message}</p>
                  )}
                </div>

                {/* Extra images */}
                <div className="space-y-2">
                  <Label>Photos supplémentaires ({(watched.images || []).length}/9)</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {(watched.images || []).map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExtraImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {(watched.images || []).length < 9 && (
                      <button
                        type="button"
                        onClick={() => extraFileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors"
                        disabled={uploading}
                      >
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={extraFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleExtraImageUpload}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="wizard-desc">Description</Label>
                  <Textarea
                    id="wizard-desc"
                    placeholder="Décrivez votre produit en détail..."
                    rows={4}
                    value={watched.description || ''}
                    onChange={(e) => setValue('description', e.target.value)}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {(watched.description || '').length}/2000
                  </p>
                </div>
              </div>
            )}

            {/* ─── STEP 3 : Prix & Stock ─── */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Prix & Stock
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Définissez le prix de vente et la quantité disponible.
                  </p>
                </div>

                <Form {...form}>
                  <div className="space-y-5">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {labels.priceLabel} <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0"
                                value={field.value ?? ''}
                                onChange={(e) => handlePriceChange('price', e.target.value)}
                                autoFocus
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                FCFA
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="compareAtPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix barré (ancien prix)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Optionnel"
                                value={field.value ?? ''}
                                onChange={(e) => handlePriceChange('compareAtPrice', e.target.value)}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                FCFA
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            Affiche un prix barré pour montrer la réduction.
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantité en stock</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="Laissez vide pour stock illimité"
                              value={field.value ?? ''}
                              onChange={(e) => handlePriceChange('stock', e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">
                            Laissez vide si le produit est toujours disponible.
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </div>
            )}

            {/* ─── STEP 4 : Récapitulatif & Publication ─── */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    Récapitulatif
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vérifiez les informations avant de publier.
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
                  {/* Image preview */}
                  {watched.image && (
                    <div className="w-full max-w-[200px] aspect-square rounded-lg overflow-hidden border bg-white">
                      <img
                        src={watched.image}
                        alt={watched.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Nom</span>
                      <p className="font-medium">{watched.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Catégorie</span>
                      <p className="font-medium">
                        {categories.find((c) => c.id === watched.categoryId)?.name || 'Non définie'}
                      </p>
                    </div>
                    {watched.description && (
                      <div>
                        <span className="text-xs text-muted-foreground">Description</span>
                        <p className="text-sm whitespace-pre-wrap">{watched.description}</p>
                      </div>
                    )}
                    <div className="flex gap-6">
                      <div>
                        <span className="text-xs text-muted-foreground">Prix</span>
                        <p className="text-lg font-bold text-primary">
                          {watched.price != null ? watched.price.toLocaleString('fr-FR') : '—'} FCFA
                        </p>
                      </div>
                      {watched.compareAtPrice != null && watched.compareAtPrice > 0 && (
                        <div>
                          <span className="text-xs text-muted-foreground">Prix barré</span>
                          <p className="text-lg font-bold text-muted-foreground line-through">
                            {watched.compareAtPrice.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Stock</span>
                      <p className="font-medium">
                        {watched.stock != null ? watched.stock : 'Illimité'}
                      </p>
                    </div>
                    {(watched.images || []).length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Photos supplémentaires ({(watched.images || []).length})
                        </span>
                        <div className="flex gap-1 mt-1">
                          {(watched.images || []).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              className="w-10 h-10 rounded object-cover border"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability toggle */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    {watched.isAvailable ? (
                      <Eye className="h-5 w-5 text-green-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Rendre disponible</p>
                      <p className="text-xs text-muted-foreground">
                        {watched.isAvailable
                          ? 'Ce produit sera visible par les clients'
                          : 'Ce produit sera masqué de votre boutique'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={watched.isAvailable}
                    onCheckedChange={(v) => setValue('isAvailable', v)}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Navigation buttons ─── */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={step === 1 ? handleCancel : goBack}
          disabled={submitting}
          className="gap-2"
        >
          {step === 1 ? (
            <>Annuler</>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </>
          )}
        </Button>

        {step < 4 ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={!canGoNext()}
            className="gap-2"
          >
            Suivant
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handlePublish}
            disabled={submitting}
            className="gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Publier le {labels.productLabel.toLowerCase()}
          </Button>
        )}
      </div>
    </div>
  )
}

// Need to import z for the stepSchemas type
import { z } from 'zod'