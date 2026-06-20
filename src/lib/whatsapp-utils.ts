/**
 * Helper pour générer des liens WhatsApp pré-remplis pour le template Modern Store.
 */
import type { CartItem } from '@/lib/modern-store-types'
import { formatPrice } from '@/lib/shared'

/**
 * Génère un lien wa.me avec message pré-rempli pour un achat direct (BUY IT NOW).
 */
export function buildWhatsAppBuyNowLink(opts: {
  whatsapp: string
  shopName: string
  productName: string
  price: number
  quantity?: number
  variantName?: string | null
}): string {
  const phone = opts.whatsapp.replace(/\D/g, '')
  const variantPart = opts.variantName ? ` (${opts.variantName})` : ''
  const qty = opts.quantity ?? 1
  const lines = [
    `Bonjour ${opts.shopName} ! 👋`,
    '',
    `Je veux commander ce produit :`,
    `🛍️ ${opts.productName}${variantPart}`,
    `💰 Prix : ${formatPrice(opts.price)}`,
    opts.quantity && opts.quantity > 1 ? `📦 Quantité : ${qty}` : '',
    '',
    `Merci de me confirmer la disponibilité et la livraison.`,
  ].filter(Boolean)
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`
}

/**
 * Génère un lien wa.me avec message récapitulatif du panier complet.
 */
export function buildWhatsAppCartLink(opts: {
  whatsapp: string
  shopName: string
  items: CartItem[]
  subtotal: number
  deliveryFee?: number
  total: number
}): string {
  const phone = opts.whatsapp.replace(/\D/g, '')
  const itemLines = opts.items.map((i, idx) => {
    const variant = i.variantName ? ` (${i.variantName})` : ''
    return `${idx + 1}. ${i.name}${variant} — ${formatPrice(i.price)} × ${i.quantity} = ${formatPrice(i.price * i.quantity)}`
  })
  const lines = [
    `Bonjour ${opts.shopName} ! 👋`,
    '',
    `Je souhaite commander :`,
    ...itemLines,
    '',
    `Sous-total : ${formatPrice(opts.subtotal)}`,
    opts.deliveryFee ? `Livraison : ${formatPrice(opts.deliveryFee)}` : '',
    `Total : ${formatPrice(opts.total)}`,
    '',
    `Merci de me confirmer la commande.`,
  ].filter(Boolean)
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`
}
