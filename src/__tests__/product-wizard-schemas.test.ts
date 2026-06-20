/**
 * product-wizard-schemas.test.ts
 * Unit tests for Zod validation schemas of the Product Wizard.
 *
 * Run: npx vitest run src/__tests__/product-wizard-schemas.test.ts
 */
import { describe, it, expect } from 'vitest'
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  productWizardSchema,
  wizardToApiPayload,
  validateStep,
} from '@/lib/product-wizard-schemas'

// ─── Helpers ────────────────────────────────────────────────────────

const validFullPayload = {
  name: 'Robe Wax Colorée',
  categoryId: 'cat-1',
  image: '/api/uploads/products/abc.jpg',
  description: 'Une belle robe en wax africain.',
  images: ['/api/uploads/products/extra1.jpg'],
  price: 15000,
  compareAtPrice: 20000,
  stock: 25,
  isAvailable: true,
}

// ─── Step 1: Identité ───────────────────────────────────────────────

describe('Step 1 — Identité (name, categoryId)', () => {
  it('rejects a product without a name', () => {
    const result = step1Schema.safeParse({ name: '', categoryId: 'cat-1' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Le nom doit contenir au moins 2 caractères')
    }
  })

  it('rejects a name that is too short (1 char)', () => {
    const result = step1Schema.safeParse({ name: 'A', categoryId: 'cat-1' })
    expect(result.success).toBe(false)
  })

  it('rejects a name that exceeds 200 characters', () => {
    const result = step1Schema.safeParse({
      name: 'X'.repeat(201),
      categoryId: 'cat-1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Le nom ne peut pas dépasser 200 caractères')
    }
  })

  it('rejects when categoryId is empty', () => {
    const result = step1Schema.safeParse({ name: 'Robe', categoryId: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Sélectionnez une catégorie')
    }
  })

  it('accepts a valid step 1 input', () => {
    const result = step1Schema.safeParse({ name: 'Robe Wax', categoryId: 'cat-1' })
    expect(result.success).toBe(true)
  })
})

// ─── Step 2: Présentation ──────────────────────────────────────────

describe('Step 2 — Présentation (image, description, images)', () => {
  it('rejects when no main image is provided', () => {
    const result = step2Schema.safeParse({ image: '', description: 'Nice', images: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Ajoutez au moins une image principale')
    }
  })

  it('rejects more than 9 extra images', () => {
    const images = Array(10).fill('/api/uploads/products/img.jpg')
    const result = step2Schema.safeParse({
      image: '/api/uploads/products/main.jpg',
      description: '',
      images,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Maximum 9 photos supplémentaires')
    }
  })

  it('accepts a valid step 2 input', () => {
    const result = step2Schema.safeParse({
      image: '/api/uploads/products/main.jpg',
      description: 'Beautiful product',
      images: ['/api/uploads/products/extra1.jpg'],
    })
    expect(result.success).toBe(true)
  })
})

// ─── Step 3: Prix & Stock ──────────────────────────────────────────

describe('Step 3 — Prix & Stock (price, compareAtPrice, stock)', () => {
  it('rejects a negative price', () => {
    const result = step3Schema.safeParse({
      price: -5000,
      compareAtPrice: undefined,
      stock: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Le prix doit être supérieur à 0')
    }
  })

  it('rejects a zero price', () => {
    const result = step3Schema.safeParse({
      price: 0,
      compareAtPrice: undefined,
      stock: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Le prix doit être supérieur à 0')
    }
  })

  it('rejects a negative stock', () => {
    const result = step3Schema.safeParse({
      price: 5000,
      compareAtPrice: undefined,
      stock: -3,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Le stock ne peut pas être négatif')
    }
  })

  it('accepts price with no stock (unlimited)', () => {
    const result = step3Schema.safeParse({
      price: 15000,
      compareAtPrice: undefined,
      stock: null,
    })
    expect(result.success).toBe(true)
  })

  it('accepts a valid step 3 input', () => {
    const result = step3Schema.safeParse({
      price: 15000,
      compareAtPrice: 20000,
      stock: 25,
    })
    expect(result.success).toBe(true)
  })
})

// ─── Step 4: Publication ───────────────────────────────────────────

describe('Step 4 — Publication (isAvailable)', () => {
  it('accepts isAvailable = true', () => {
    const result = step4Schema.safeParse({ isAvailable: true })
    expect(result.success).toBe(true)
  })

  it('accepts isAvailable = false', () => {
    const result = step4Schema.safeParse({ isAvailable: false })
    expect(result.success).toBe(true)
  })
})

// ─── Full Schema (all 4 steps merged) ──────────────────────────────

describe('Full ProductWizardSchema (merged)', () => {
  it('rejects an incomplete payload (missing name)', () => {
    const result = productWizardSchema.safeParse({
      ...validFullPayload,
      name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a negative price in the full schema', () => {
    const result = productWizardSchema.safeParse({
      ...validFullPayload,
      price: -100,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const priceErrors = result.error.issues.filter(
        (i) => i.path.includes('price'),
      )
      expect(priceErrors.length).toBeGreaterThan(0)
    }
  })

  it('rejects when compareAtPrice is lower than price', () => {
    const result = productWizardSchema.safeParse({
      ...validFullPayload,
      price: 20000,
      compareAtPrice: 10000,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(
        'Le prix barré doit être supérieur au prix de vente',
      )
    }
  })

  it('accepts a complete valid payload and returns the final object', () => {
    const result = productWizardSchema.safeParse(validFullPayload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Robe Wax Colorée')
      expect(result.data.price).toBe(15000)
      expect(result.data.stock).toBe(25)
      expect(result.data.isAvailable).toBe(true)
      expect(result.data.categoryId).toBe('cat-1')
      expect(result.data.images).toHaveLength(1)
    }
  })
})

// ─── wizardToApiPayload ────────────────────────────────────────────

describe('wizardToApiPayload', () => {
  it('transforms wizard data into API-compatible payload', () => {
    const payload = wizardToApiPayload(validFullPayload)
    expect(payload.name).toBe('Robe Wax Colorée')
    expect(payload.price).toBe(15000)
    expect(payload.image).toBe('/api/uploads/products/abc.jpg')
    expect(payload.images).toEqual(['/api/uploads/products/extra1.jpg'])
    expect(payload.stock).toBe(25)
    expect(payload.isAvailable).toBe(true)
    expect(payload.categoryId).toBe('cat-1')
  })

  it('sets categoryId to null when value is "none"', () => {
    const payload = wizardToApiPayload({ ...validFullPayload, categoryId: 'none' })
    expect(payload.categoryId).toBeNull()
  })

  it('filters empty images', () => {
    const payload = wizardToApiPayload({
      ...validFullPayload,
      images: ['/api/a.jpg', '', '  ', '/api/b.jpg'],
    })
    expect(payload.images).toEqual(['/api/a.jpg', '/api/b.jpg'])
  })

  it('sets stock to null when empty string', () => {
    const payload = wizardToApiPayload({ ...validFullPayload, stock: '' })
    expect(payload.stock).toBeNull()
  })
})

// ─── validateStep helper ───────────────────────────────────────────

describe('validateStep helper', () => {
  it('returns success=true for valid step 1 data', () => {
    const result = validateStep(step1Schema, { name: 'Test', categoryId: 'cat-1' })
    expect(result.success).toBe(true)
  })

  it('returns success=false with error map for invalid data', () => {
    const result = validateStep(step1Schema, { name: '', categoryId: '' })
    expect(result.success).toBe(false)
    if (result.success === false) {
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    }
  })
})