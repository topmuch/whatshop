/**
 * WhatsApp link generator for Boutiko.
 *
 * Builds wa.me links with pre-filled messages for product inquiries.
 * Used in catalog feeds (Facebook/Instagram checkout_url) and UI buttons.
 */

export interface WhatsAppLinkParams {
  /** Phone number in any format: "+225 07 07 07 07" or "2250707070700" */
  phoneNumber: string
  /** Product name to include in the message */
  productName: string
  /** Product price in local currency (FCFA) */
  productPrice?: number
  /** URL to the product page on Boutiko */
  productUrl?: string
  /** Where the customer came from */
  source?: 'facebook' | 'instagram' | 'website'
}

/**
 * Generate a wa.me link with a pre-filled WhatsApp message.
 *
 * Example output:
 * https://wa.me/22507070707?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20%3A%20%22Nike%20Air%20Max%22%20%C3%A0%2025%20000%20FCFA
 */
export function generateWhatsAppLink(params: WhatsAppLinkParams): string {
  const { phoneNumber, productName, productPrice, productUrl, source } = params

  // Strip non-digits
  const cleanPhone = phoneNumber.replace(/\D/g, '')

  // Build the message
  let message = `Bonjour, je suis intéressé(e) par : "${productName}"`

  if (productPrice != null && productPrice > 0) {
    message += ` à ${Math.round(productPrice).toLocaleString('fr-FR')} FCFA`
  }

  if (source === 'facebook' || source === 'instagram') {
    message += `\n\n(Vu sur ${source === 'instagram' ? 'Instagram' : 'Facebook'})`
  }

  if (productUrl) {
    message += `\n\nLien : ${productUrl}`
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}