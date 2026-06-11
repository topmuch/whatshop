import { db } from '@/lib/db'
import type { Notification } from '@prisma/client'

type NotificationType =
  | 'NEW_SELLER'
  | 'NEW_ORDER'
  | 'DOMAIN_REQUEST'
  | 'SUPPORT_TICKET'
  | 'LOW_STOCK'
  | 'NEW_SHOP'
  | 'UPGRADE_REQUEST'
  | 'SUSPENDED_USER'

/**
 * Mapping of notification types to their SaaSConfig toggle fields.
 * Types not in this map are always created (no toggle).
 */
const typeToConfigField: Partial<Record<NotificationType, keyof {
  notifyNewSeller: boolean
  notifyNewOrder: boolean
  notifyDomainRequest: boolean
  notifySupportTicket: boolean
  lowStockAlerts: boolean
}>> = {
  NEW_SELLER: 'notifyNewSeller',
  NEW_ORDER: 'notifyNewOrder',
  DOMAIN_REQUEST: 'notifyDomainRequest',
  SUPPORT_TICKET: 'notifySupportTicket',
  LOW_STOCK: 'lowStockAlerts',
}

/**
 * Create an admin notification if the notification type is enabled in SaaSConfig.
 *
 * Types NEW_SHOP, UPGRADE_REQUEST, and SUSPENDED_USER are always created (no toggle).
 * Other types are checked against the corresponding SaaSConfig boolean field.
 *
 * Notification failures are silently caught so they never break the calling flow.
 */
export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<Notification | null> {
  try {
    const configField = typeToConfigField[type]

    // If this type has a config toggle, check it
    if (configField) {
      const config = await db.saasConfig.findFirst({
        select: { [configField]: true },
      })

      // If config exists and the toggle is off, skip notification
      if (config && !(config[configField] as boolean)) {
        return null
      }
    }

    const notification = await db.notification.create({
      data: {
        type,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : '{}',
      },
    })

    return notification
  } catch (error) {
    // Silently fail — notifications should never break the main flow
    console.error('[Notification] Failed to create notification:', error)
    return null
  }
}