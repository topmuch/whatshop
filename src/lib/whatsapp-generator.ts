export function generateProductWhatsAppLink(
  shopName: string,
  whatsappNumber: string,
  product: { name: string; price: number; quantity?: number }
): string {
  const qtyText = product.quantity && product.quantity > 1
    ? ` x${product.quantity}`
    : ''
  const message = `Bonjour ${shopName} 👋, je souhaite commander :\n\n📦 Produit : ${product.name}${qtyText}\n💰 Prix : ${product.price.toLocaleString('fr-FR')} FCFA\n\nMerci de confirmer ma commande !`
  const phone = whatsappNumber.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}