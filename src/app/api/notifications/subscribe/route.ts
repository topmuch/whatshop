import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { user, response: authError } = await requireAuth(request);
    if (authError || !user) return authError!;

    const body = await request.json();
    const { endpoint, keys } = body as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Subscription invalide: endpoint, p256dh et auth sont requis" },
        { status: 400 }
      );
    }

    // Upsert: update existing or create new subscription
    const existing = await db.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existing) {
      await db.pushSubscription.update({
        where: { id: existing.id },
        data: {
          userId: user.id,
          p256dh: keys.p256dh,
          auth: keys.auth,
          enabled: true,
        },
      });
    } else {
      await db.pushSubscription.create({
        data: {
          userId: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Push Subscribe] Error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, response: authError } = await requireAuth(request);
    if (authError || !user) return authError!;

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        { error: "Le paramètre endpoint est requis" },
        { status: 400 }
      );
    }

    const deleted = await db.pushSubscription.deleteMany({
      where: {
        userId: user.id,
        endpoint,
      },
    });

    return NextResponse.json({ success: true, deleted: deleted.count });
  } catch (error) {
    console.error("[Push Unsubscribe] Error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}