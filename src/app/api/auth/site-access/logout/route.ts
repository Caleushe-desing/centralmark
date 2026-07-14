import { NextResponse } from "next/server";
import { clearSiteAccessSession } from "@/lib/auth/session";

export async function POST() {
  await clearSiteAccessSession();
  return NextResponse.json({ ok: true });
}
