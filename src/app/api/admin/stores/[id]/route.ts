import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth/session";

function generatePassword(length = 10): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) out += alphabet[bytes[i]! % alphabet.length];
  return out;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json();
  const action = String(body.action ?? "");

  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) {
    return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
  }

  if (action === "reset-password") {
    const password = generatePassword(10);
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.store.update({
      where: { id },
      data: { passwordHash },
    });
    return NextResponse.json({
      ok: true,
      credentials: { loginId: store.username, password },
    });
  }

  if (action === "rename") {
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
    const updated = await prisma.store.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json({
      store: { id: updated.id, name: updated.name, username: updated.username },
    });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await ctx.params;
  // Soft approach: delete offers/products first may cascade - Product has Cascade, Offer does not on Store
  // Check schema - Offer store relation without onDelete Cascade
  await prisma.offer.deleteMany({ where: { storeId: id } });
  await prisma.designGenerationJob.deleteMany({ where: { storeId: id } });
  await prisma.product.deleteMany({ where: { storeId: id } });
  await prisma.storeSocialAccount.deleteMany({ where: { storeId: id } }).catch(() => null);
  await prisma.proAdGeneration.deleteMany({ where: { storeId: id } }).catch(() => null);
  await prisma.store.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
