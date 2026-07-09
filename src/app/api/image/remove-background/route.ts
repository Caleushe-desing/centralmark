import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireStoreSession } from "@/lib/auth/session";
import {
  isRemoveBgConfigured,
  removeProductBackground,
} from "@/lib/image/remove-background";

export async function POST(request: NextRequest) {
  try {
    await requireStoreSession();
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const context = (formData.get("context") as string) || "promo";

    if (!image?.size) {
      return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = image.name.split(".").pop() ?? "jpg";
    const filename = `${context}-${Date.now()}.${ext}`;
    const subdir = context === "catalog" ? "products" : "promo";

    const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    const imageUrl = `/uploads/${subdir}/${filename}`;

    const { buffer: noBgBuffer, outputPath: imageNoBgUrl, usedAi } =
      await removeProductBackground(buffer, filename, subdir);

    const previewDataUrl = `data:image/png;base64,${noBgBuffer.toString("base64")}`;

    return NextResponse.json({
      imageUrl,
      imageNoBgUrl,
      previewDataUrl,
      usedAi,
      hasRemoveBgApi: isRemoveBgConfigured(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
