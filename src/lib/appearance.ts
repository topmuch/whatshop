/**
 * Read buttonColor and logoSize from the shop's customColors JSON field.
 * This avoids adding new columns to the database schema.
 */
export function getAppearance(customColors?: string | null) {
  let colors: Record<string, string> = {}
  if (customColors) {
    try { colors = JSON.parse(customColors) } catch { /* ignore */ }
  }
  return {
    buttonColor: colors.buttonColor || '',
    logoSize: colors.logoSize || '',
  }
}