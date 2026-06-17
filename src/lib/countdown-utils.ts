/**
 * Countdown utilities — calcul du temps restant avec reset quotidien.
 *
 * Le countdown représente une "offre du jour" : il se termine à une heure
 * fixe (ex: 23:59:59) et se réinitialise automatiquement à minuit pour
 * recréer de l'urgence crédible sans devoir reconfigurer chaque jour.
 */

export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  isExpired: boolean
}

/**
 * Calcule le temps restant jusqu'à la prochaine occurrence de `endHour:endMinute`
 * (heure locale). Si l'heure cible est déjà passée aujourd'hui, le countdown
 * vise demain à la même heure (reset automatique quotidien).
 *
 * @param endHour   Heure de fin (0-23)
 * @param endMinute Minute de fin (0-59)
 * @param now       Override de l'heure courante (pour tests / mock)
 */
export function getTimeRemaining(
  endHour: number,
  endMinute: number = 0,
  now: Date = new Date(),
): TimeRemaining {
  const target = new Date(now)
  target.setHours(endHour, endMinute, 0, 0)

  // Si l'heure cible est déjà passée aujourd'hui → viser demain
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }

  const diffMs = target.getTime() - now.getTime()
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
    isExpired: totalSeconds <= 0,
  }
}

/**
 * Formate un TimeRemaining en "HH:MM:SS" avec padding.
 */
export function formatCountdown(t: TimeRemaining): string {
  return `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}:${String(t.seconds).padStart(2, '0')}`
}

/**
 * Formate en version compacte pour mobile : "12h 34m 56s".
 */
export function formatCountdownCompact(t: TimeRemaining): string {
  if (t.hours > 0) return `${t.hours}h ${String(t.minutes).padStart(2, '0')}m ${String(t.seconds).padStart(2, '0')}s`
  return `${String(t.minutes).padStart(2, '0')}m ${String(t.seconds).padStart(2, '0')}s`
}

/**
 * Parse une config ISO de fin d'offre (optionnelle) ou fallback sur
 * l'heure de fin quotidienne. Retourne un objet TimeRemaining.
 */
export function resolveCountdown(
  config: { endHour?: number; endMinute?: number; isoEnd?: string } | null | undefined,
  now: Date = new Date(),
): TimeRemaining | null {
  if (!config) return null
  // Si une date ISO absolue est fournie ET dans le futur, l'utiliser
  if (config.isoEnd) {
    const target = new Date(config.isoEnd)
    if (!isNaN(target.getTime()) && target.getTime() > now.getTime()) {
      const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
      return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        totalSeconds,
        isExpired: false,
      }
    }
  }
  // Sinon : reset quotidien à endHour:endMinute
  return getTimeRemaining(config.endHour ?? 23, config.endMinute ?? 59, now)
}
