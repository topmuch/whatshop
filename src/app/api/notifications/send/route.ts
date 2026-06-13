import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import webpush from "web-push";

interface NotificationPayload {
  userId?: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  type?: "NEW_ORDER" | "WHATSAPP_MESSAGE" | "LIVE_REMINDER" | "GENERAL";
}

export async function POST(request: NextRequest) {
  try {
    const { user, response: authError } = await requireAuth(request);
    if (authError || !user) return authError!;

    // Only admins can send push notifications
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const payload: NotificationPayload = await request.json();

    if (!payload.title || !payload.body) {
      return NextResponse.json(
        { error: "Le titre et le contenu sont requis" },
        { status: 400 }
      );
    }

    // Check for VAPID keys in environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "Les clés VAPID ne sont pas configurées. Définissez NEXT_PUBLIC_VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY dans votre .env" },
        { status: 500 }
      );
    }

    webpush.setVapidDetails(
      "mailto:contact@boutiko.pro",
      vapidPublicKey,
      vapidPrivateKey
    );

    // Get target subscriptions
    const whereClause = payload.userId
      ? { userId: payload.userId, enabled: true }
      : { enabled: true };

    const subscriptions = await db.pushSubscription.findMany({
      where: whereClause,
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "Aucun abonnement actif trouvé",
      });
    }

    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: "/pwa-icons/icon-192x192.png",
      badge: "/pwa-icons/icon-72x72.png",
      url: payload.url || "/dashboard",
      tag: payload.tag || `boutiko-${payload.type || "general"}-${Date.now()}`,
    };

    let sentCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(notificationPayload),
          {
            TTL: 24 * 60 * 60, // 24 hours
            urgency: payload.type === "LIVE_REMINDER" ? "high" : "normal",
          }
        );
        sentCount++;
      } catch (error: unknown) {
        const webPushError = error as { statusCode?: number; body?: string };
        // If subscription is invalid/expired, disable it
        if (
          webPushError.statusCode === 404 ||
          webPushError.statusCode === 410
        ) {
          failedEndpoints.push(sub.endpoint);
        }
        console.error(
          `[Push Send] Failed for endpoint ${sub.endpoint.slice(0, 50)}...:`,
          webPushError.statusCode
        );
      }
    }

    // Clean up invalid subscriptions
    if (failedEndpoints.length > 0) {
      await db.pushSubscription.updateMany({
        where: { endpoint: { in: failedEndpoints } },
        data: { enabled: false },
      });
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedEndpoints.length,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("[Push Send] Error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}