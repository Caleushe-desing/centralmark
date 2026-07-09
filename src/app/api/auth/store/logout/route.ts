import { NextResponse } from "next/server";
import { clearStoreSession } from "@/lib/auth/session";

export async function POST() {
  await clearStoreSession();
  return NextResponse.json({ ok: true });
}
