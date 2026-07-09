import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStoreSession } from "@/lib/auth/session";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireStoreSession();
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { id, storeId: session.storeId },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
}
