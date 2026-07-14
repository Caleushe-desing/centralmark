import { NextRequest, NextResponse } from "next/server";
import { requireWebAdminSession } from "@/lib/auth/session";
import { listLandingFields, updateLandingFields } from "@/lib/cms/site-cms";

export async function GET() {
  try {
    await requireWebAdminSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const fields = await listLandingFields();
  return NextResponse.json({ fields });
}

export async function PUT(request: NextRequest) {
  try {
    await requireWebAdminSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json();
  const updates = Array.isArray(body?.updates) ? body.updates : null;
  if (!updates) {
    return NextResponse.json({ error: "updates requerido" }, { status: 400 });
  }

  const normalized = updates
    .filter(
      (u: unknown): u is { key: string; value: string } =>
        !!u &&
        typeof u === "object" &&
        typeof (u as { key?: unknown }).key === "string" &&
        typeof (u as { value?: unknown }).value === "string"
    )
    .map((u: { key: string; value: string }) => ({
      key: u.key,
      value: u.value,
    }));

  await updateLandingFields(normalized);
  const fields = await listLandingFields();
  return NextResponse.json({ ok: true, fields });
}
