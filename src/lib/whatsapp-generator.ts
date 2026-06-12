export interface ShippingZoneInfo {
  name: string
  price: number
}

export function generateProductWhatsAppLink(
  shopName: string,
  whatsappNumber: string,
  product: { name: string; price: number; quantity?: number },
  shippingZone?: ShippingZoneInfo | null
): string {
  const qty = product.quantity && product.quantity > 1 ? product.quantity : 1
  const qtyText = qty > 1 ? ` x${qty}` : ''
  const itemTotal = product.price * qty
  let message: string

  if (shippingZone) {
    const grandTotal = itemTotal + shippingZone.price
    message = `Bonjour ${shopName} 👋, je souhaite commander :\n\n📦 Produit : ${product.name}${qtyText}\n💰 Prix : ${itemTotal.toLocaleString('fr-FR')} FCFA\n📍 Zone de livraison : ${shippingZone.name}\n🚚 Frais de livraison : ${shippingZone.price.toLocaleString('fr-FR')} FCFA\n━━━━━━━━━━━━━━\n💵 Total : ${grandTotal.toLocaleString('fr-FR')} FCFA\n\nMerci de confirmer ma commande !`
  } else {
    message = `Bonjour ${shopName} 👋, je souhaite commander :\n\n📦 Produit : ${product.name}${qtyText}\n💰 Prix : ${itemTotal.toLocaleString('fr-FR')} FCFA\n\nMerci de confirmer ma commande !`
  }

  const phone = whatsappNumber.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}