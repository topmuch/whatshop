/**
 * product-wizard-schemas.ts — Zod validation schemas for the 4-step Product Wizard.
 * Each step has its own schema; the final schema merges all steps.
 *
 * Step 1 : Identité     — name, categoryId
 * Step 2 : Présentation  — image, description
 * Step 3 : Prix & Stock — price, compareAtPrice, stock
 * Step 4 : Récapitulatif — isAvailable (review + publish)
 */
import { z } from 'zod'

// ─── Step 1 : Identité ──────────────────────────────────────────────

export const step1Schema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  categoryId: z.string().min(1, 'Sélectionnez une catégorie'),
})

export type Step1Input = z.infer<typeof step1Schema>

// ─── Step 2 : Présentation ─────────────────────────────────────────

export const step2Schema = z.object({
  image: z.string().min(1, 'Ajoutez au moins une image principale'),
  description: z
    .string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional()
    .default(''),
  images: z
    .array(z.string())
    .max(9, 'Maximum 9 photos supplémentaires')
    .optional()
    .default([]),
})

export type Step2Input = z.infer<typeof step2Schema>

// ─── Step 3 : Prix & Stock ─────────────────────────────────────────

export const step3Schema = z.object({
  price: z
    .number({ invalid_type_error: 'Entrez un prix valide' })
    .positive('Le prix doit être supérieur à 0')
    .max(99_999_999, 'Prix trop élevé'),
  compareAtPrice: z
    .number()
    .positive('Le prix barré doit être supérieur à 0')
    .max(99_999_999, 'Prix barré trop élevé')
    .optional()
    .or(z.literal(undefined))
    .or(z.literal('')),
  stock: z
    .number({ invalid_type_error: 'Entrez une quantité valide' })
    .int('La quantité doit être un nombre entier')
    .min(0, 'Le stock ne peut pas être négatif')
    .max(999_999, 'Quantité trop élevée')
    .optional()
    .or(z.literal(null))
    .or(z.literal('')),
})

export type Step3Input = z.infer<typeof step3Schema>

// ─── Step 4 : Publication ──────────────────────────────────────────

export const step4Schema = z.object({
  isAvailable: z.boolean(),
})

export type Step4Input = z.infer<typeof step4Schema>

// ─── Full Product Wizard Payload (merged) ──────────────────────────

export const productWizardSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .refine(
    (data) => {
      // compareAtPrice must be > price if both are set
      if (data.compareAtPrice && data.price) {
        return data.compareAtPrice > data.price
      }
      return true
    },
    {
      message: 'Le prix barré doit être supérieur au prix de vente',
      path: ['compareAtPrice'],
    },
  )

export type ProductWizardInput = z.infer<typeof productWizardSchema>

// ─── Helper: validate a single step ────────────────────────────────

export function validateStep<Schema extends z.ZodTypeAny>(
  schema: Schema,
  data: unknown,
): { success: true; data: z.infer<Schema> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    if (!errors[key]) {
      errors[key] = issue.message
    }
  }
  return { success: false, errors }
}

/**
 * Transform the wizard output into the payload expected by POST /api/products.
 * The API accepts: { name, description, price, image, images, stock, categoryId, isAvailable }
 */
export function wizardToApiPayload(data: ProductWizardInput): Record<string, unknown> {
  return {
    name: data.name,
    description: data.description || '',
    price: data.price,
    image: data.image,
    images: (data.images || []).filter((img) => img.trim()),
    stock: data.stock != null && data.stock !== '' ? data.stock : null,
    categoryId: data.categoryId === 'none' ? null : data.categoryId,
    isAvailable: data.isAvailable,
  }
}