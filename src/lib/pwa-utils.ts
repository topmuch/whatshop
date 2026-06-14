/* ============================================================
   PWA Utility Functions
   For use in client-side components only
   ============================================================ */

/**
 * Check if the app is running in standalone/PWA mode
 */
export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone: boolean }).standalone === true;
}

/**
 * Get the current connection quality
 */
export type ConnectionQuality = "fast" | "slow" | "offline" | "unknown";

export function getConnectionQuality(): ConnectionQuality {
  if (typeof navigator === "undefined" || !navigator.onLine) return "offline";

  const conn = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (!conn) return "unknown";

  if (conn.saveData) return "slow";

  switch (conn.effectiveType) {
    case "4g":
      return "fast";
    case "3g":
      return "slow";
    case "2g":
    case "slow-2g":
      return "slow";
    default:
      return "unknown";
  }
}

/**
 * Request notification permission with user-friendly flow
 * Returns true if permission was granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (!("Notification" in window)) {
    console.warn("Ce navigateur ne supporte pas les notifications");
    return false;
  }

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (typeof window === "undefined") return null;

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.warn("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured");
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();

  if (existing) return existing;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
  });

  // Send subscription to server
  await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  return subscription;
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  if (typeof window === "undefined") return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return;

  await subscription.unsubscribe();

  await fetch(`/api/notifications/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
    method: "DELETE",
  });
}

/**
 * Trigger a haptic feedback vibration (mobile)
 */
export function hapticFeedback(intensity: "light" | "medium" | "heavy" = "light"): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  const patterns = {
    light: 10,
    medium: [10, 50, 10],
    heavy: [20, 40, 20, 40, 20],
  };

  navigator.vibrate(patterns[intensity]);
}

/**
 * Convert VAPID public key from base64 URL to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Get the size of the offline sync queue from the service worker
 */
export async function getOfflineQueueSize(): Promise<number> {
  if (typeof navigator === "undefined") return 0;

  try {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active;
    if (!worker) return 0;

    const messageChannel = new MessageChannel();
    const response = new Promise<{ queueSize: number }>((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
    });

    worker.postMessage({ type: "GET_OFFLINE_QUEUE_SIZE" }, [messageChannel.port2]);

    const result = await response;
    return result.queueSize;
  } catch {
    return 0;
  }
}

/**
 * Check if the current device supports PWA installation
 */
export function canInstallPWA(): boolean {
  if (typeof window === "undefined") return false;
  return !isStandaloneMode();
}

/**
 * Check if the device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
}