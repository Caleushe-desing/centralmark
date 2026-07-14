import { NextResponse } from "next/server";
import { clearWebAdminSession } from "@/lib/auth/session";

export async function POST() {
  await clearWebAdminSession();
  return NextResponse.json({ ok: true });
}
