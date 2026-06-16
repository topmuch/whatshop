/**
 * order-schemas.ts — Shared Zod validation schemas for the order checkout tunnel.
 * Used both client-side (CheckoutForm) and server-side (POST /api/orders).
 */
import { z } from 'zod'

// ─── Order Item (in cart) ────────────────────────────────────────────

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
  name: z.string().min(1, 'Nom du produit requis').max(200, 'Nom trop long'),
  price: z.number().positive('Le prix doit être positif').max(99_999_999, 'Prix invalide'),
  quantity: z.int().positive('La quantité doit être au moins 1').max(999, 'Quantité max 999'),
  image: z.string().optional(),
})

export type OrderItemInput = z.infer<typeof orderItemSchema>

// ─── Customer Info ───────────────────────────────────────────────────

export const customerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Prénom trop long'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Nom trop long'),
  phone: z
    .string()
    .min(8, 'Le téléphone doit contenir au moins 8 chiffres')
    .max(20, 'Téléphone invalide')
    .regex(/^[+]?[\d\s\-().]+$/, 'Format de téléphone invalide'),
  address: z
    .string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(500, 'Adresse trop longue'),
  city: z
    .string()
    .min(2, 'La ville est requise')
    .max(100, 'Ville invalide'),
})

export type CustomerInput = z.infer<typeof customerSchema>

// ─── Full Order Payload ──────────────────────────────────────────────

export const createOrderSchema = z
  .object({
    shopId: z.string().min(1, 'ID boutique requis'),
    items: z
      .array(orderItemSchema)
      .min(1, 'La commande doit contenir au moins un article')
      .max(50, 'Maximum 50 articles par commande'),
    shippingZoneId: z.string().optional(),
    shippingZoneName: z.string().max(100).optional(),
    shippingFee: z.number().min(0).optional(),
    subtotal: z.number().positive('Le sous-total doit être positif'),
    total: z.number().positive('Le total doit être positif'),
    customer: customerSchema,
  })
  .refine(
    (data) => {
      // Verify subtotal matches sum of items
      const computedSubtotal = data.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      return Math.abs(computedSubtotal - data.subtotal) < 0.01
    },
    {
      message: 'Le sous-total ne correspond pas à la somme des articles',
      path: ['subtotal'],
    }
  )
  .refine(
    (data) => {
      // Verify total matches subtotal + shippingFee
      const shipping = data.shippingFee ?? 0
      return Math.abs(data.subtotal + shipping - data.total) < 0.01
    },
    {
      message: 'Le total ne correspond pas au sous-total + frais de livraison',
      path: ['total'],
    }
  )

export type CreateOrderInput = z.infer<typeof createOrderSchema>

// ─── API Response Types ──────────────────────────────────────────────

export const orderItemResponseSchema = z.object({
  id: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
})

export const orderResponseSchema = z.object({
  id: z.string(),
  shopId: z.string(),
  total: z.number(),
  customerName: z.string().nullable(),
  customerPhone: z.string().nullable(),
  customerAddress: z.string().nullable(),
  customerCity: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
})

// ─── Formatted Zod Error (for client display) ────────────────────────

export function formatZodErrors(
  error: z.ZodError
): Record<string, string> {
  const formatted: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!formatted[path]) {
      formatted[path] = issue.message
    }
  }
  return formatted
}