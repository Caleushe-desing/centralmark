import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStoreSession } from "@/lib/auth/session";
import { parseStoreRubro, getStoreRubroDefinition } from "@/lib/store/rubros";

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

    const rubroRaw = (formData.get("rubro") as string)?.trim();
    const rubro = rubroRaw ? parseStoreRubro(rubroRaw) : undefined;
    const rubroDef = rubro ? getStoreRubroDefinition(rubro) : null;

    let logoUrl: string | undefined;
    let previewImageUrl: string | undefined;
    const logo = formData.get("logo") as File | null;
    const previewImage = formData.get("previewImage") as File | null;
    const hasNewPreviewImage = Boolean(previewImage && previewImage.size > 0);

    const fs = await import("fs/promises");
    const path = await import("path");

    if (logo && logo.size > 0) {
      const bytes = await logo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = logo.name.split(".").pop() ?? "png";
      const filename = `logo-${session.storeId}.${ext}`;
      const dir = path.join(process.cwd(), "public", "uploads", "logos");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), buffer);
      logoUrl = `/uploads/logos/${filename}`;
    }

    if (previewImage && previewImage.size > 0) {
      const bytes = await previewImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = previewImage.name.split(".").pop() ?? "jpg";
      const filename = `preview-${session.storeId}.${ext}`;
      const dir = path.join(process.cwd(), "public", "uploads", "previews");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), buffer);
      previewImageUrl = `/uploads/previews/${filename}`;
    }

    const removePreview = formData.get("removePreviewImage") === "true";

    const existing = await prisma.store.findUnique({ where: { id: session.storeId } });
    const rubroChanged =
      rubroDef && existing && rubroDef.id !== parseStoreRubro(existing.rubro);

    const store = await prisma.store.update({
      where: { id: session.storeId },
      data: {
        name,
        ...(rubroDef
          ? { rubro: rubroDef.id, category: rubroDef.categoryLabel }
          : {}),
        ...(logoUrl ? { logoUrl } : {}),
        ...(previewImageUrl ? { previewImageUrl } : {}),
        ...(removePreview ? { previewImageUrl: null } : {}),
        // Al cambiar rubro sin nueva foto, usar imagen por defecto del rubro
        ...(rubroChanged && !hasNewPreviewImage ? { previewImageUrl: null } : {}),
      },
      include: { mall: true },
    });

    const { passwordHash: _, ...safe } = store;
    return NextResponse.json(safe);
  } catch (err) {
    console.error("[PATCH /api/store/settings]", err);
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: "No se pudo guardar la configuración" }, { status: 500 });
  }
}
