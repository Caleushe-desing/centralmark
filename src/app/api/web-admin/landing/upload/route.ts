import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { requireWebAdminSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    await requireWebAdminSession();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");
  const fieldKey = String(formData.get("fieldKey") ?? "landing");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });
  }

  const safeKey = fieldKey.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const filename = `${safeKey}-${Date.now()}.webp`;
  const dir = path.join(process.cwd(), "public", "uploads", "landing");
  await fs.mkdir(dir, { recursive: true });

  const buffer = await sharp(Buffer.from(await file.arrayBuffer()))
    .resize(1600, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  await fs.writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({
    imageUrl: `/uploads/landing/${filename}`,
  });
}
