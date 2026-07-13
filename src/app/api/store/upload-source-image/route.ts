import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { requireStoreSession } from "@/lib/auth/session";

const MAX_BYTES = 12 * 1024 * 1024;

/**
 * POST /api/store/upload-source-image
 * Sube foto de producto SIN llamadas a IA (sin costo OpenAI).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireStoreSession();
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Selecciona una imagen" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen no puede superar 12 MB" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
    }

    const buffer = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(1080, 1080, { fit: "cover" })
      .png()
      .toBuffer();

    const dir = path.join(process.cwd(), "public", "uploads", "sources");
    await fs.mkdir(dir, { recursive: true });
    const filename = `source-${session.storeId}-${Date.now()}.png`;
    await fs.writeFile(path.join(dir, filename), buffer);

    return NextResponse.json({
      imageUrl: `/uploads/sources/${filename}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
