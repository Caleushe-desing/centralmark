import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStoreSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await requireStoreSession();
    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      include: { mall: true },
    });
    if (!store) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    const { passwordHash: _, ...safe } = store;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireStoreSession();
    const formData = await request.formData();

    const name = (formData.get("name") as string)?.trim();
    if (!name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    let logoUrl: string | undefined;
    const logo = formData.get("logo") as File | null;
    if (logo && logo.size > 0) {
      const bytes = await logo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = logo.name.split(".").pop() ?? "png";
      const filename = `logo-${session.storeId}.${ext}`;
      const fs = await import("fs/promises");
      const path = await import("path");
      const dir = path.join(process.cwd(), "public", "uploads", "logos");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), buffer);
      logoUrl = `/uploads/logos/${filename}`;
    }

    const store = await prisma.store.update({
      where: { id: session.storeId },
      data: { name, ...(logoUrl ? { logoUrl } : {}) },
      include: { mall: true },
    });

    const { passwordHash: _, ...safe } = store;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
}
