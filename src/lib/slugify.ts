/**
 * Convertit un texte en slug URL-friendly.
 * Ex: "Écouteur Bluetooth Pro" → "ecouteur-bluetooth-pro"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')     // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '')          // trim hyphens
    .substring(0, 80)
}

/**
 * Génère un slug unique pour un produit dans une boutique.
 * Si le slug de base est déjà pris, ajoute un suffixe numérique.
 */
export async function generateUniqueProductSlug(
  name: string,
  shopId: string,
  existingId?: string
): Promise<string> {
  const { db } = await import('@/lib/db')
  let slug = slugify(name) || 'produit'

  // Check uniqueness
  const existing = await db.product.findFirst({
    where: {
      shopId,
      slug,
      ...(existingId ? { NOT: { id: existingId } } : {}),
    },
  })

  if (existing) {
    let suffix = 2
    while (await db.product.findFirst({
      where: {
        shopId,
        slug: `${slug}-${suffix}`,
        ...(existingId ? { NOT: { id: existingId } } : {}),
      },
    })) {
      suffix++
    }
    slug = `${slug}-${suffix}`
  }

  return slug
}