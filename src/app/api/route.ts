import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const userCount = await db.user.count();
    const shopCount = await db.shop.count();
    return NextResponse.json({ status: "ok", users: userCount, shops: shopCount });
  } catch (error) {
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
