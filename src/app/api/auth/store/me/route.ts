import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getStoreSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    include: { mall: true, _count: { select: { products: true, offers: true } } },
  });

  if (!store) {
    return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
  }

  const { passwordHash: _, ...safe } = store;
  return NextResponse.json(safe);
}
