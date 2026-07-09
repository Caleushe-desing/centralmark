import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { requireStoreSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { analyzeOfferImage } from "@/lib/ai/analyze-image";
import { enhanceOfferImage } from "@/lib/ai/enhance-image";
import { composeProductShot } from "@/lib/image/compose-product-shot";
import {
  isRemoveBgConfigured,
  removeProductBackground,
} from "@/lib/image/remove-background";
import { parseOfferBrief } from "@/lib/ai/parse-brief";
import { suggestOfferCaption, suggestOfferHashtags } from "@/lib/ai/suggest-caption";

const MAX_BYTES = 12 * 1024 * 1024;

async function prepareSquarePng(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(1080, 1080, { fit: "cover" })
    .png()
    .toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStoreSession();
    const formData = await request.formData();

    const file = formData.get("image");
    const aiBrief = ((formData.get("aiBrief") as string) || "").trim();
    const enhance = formData.get("enhance") === "true";
    const removeBg = formData.get("removeBg") === "true";

    if (enhance && removeBg) {
      return NextResponse.json(
        { error: "Elige solo una opción: quitar fondo o mejorar con IA" },
        { status: 400 }
      );
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Selecciona una imagen" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen no puede superar 12 MB" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      include: { mall: true },
    });
    if (!store) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }

    let buffer = Buffer.from(await file.arrayBuffer());
    let mimeType = file.type || "image/jpeg";

    if (!mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
    }

    let wasEnhanced = false;
    let wasRemoveBg = false;
    let removeBgUsedAi = false;

    if (removeBg) {
      const filename = `upload-${session.storeId}-${Date.now()}.jpg`;
      const { buffer: noBg, usedAi } = await removeProductBackground(
        buffer,
        filename,
        "promo"
      );
      buffer = Buffer.from(await composeProductShot(noBg));
      mimeType = "image/png";
      wasRemoveBg = true;
      removeBgUsedAi = usedAi;
    } else if (enhance) {
      const squareForEnhance = await prepareSquarePng(buffer);
      const enhanced = await enhanceOfferImage(squareForEnhance, aiBrief);
      if (enhanced) {
        buffer = Buffer.from(enhanced);
        mimeType = "image/png";
        wasEnhanced = true;
      }
    }

    const resized = removeBg || enhance ? buffer : await prepareSquarePng(buffer);
    const base64 = resized.toString("base64");

    const analysis = await analyzeOfferImage({
      imageBase64: base64,
      mimeType: "image/png",
      aiBrief: aiBrief || undefined,
      storeName: store.name,
      storeCategory: store.category,
      mallName: store.mall.name,
    });

    const parsed = aiBrief ? await parseOfferBrief(aiBrief) : null;

    const productName = analysis?.productName ?? parsed?.productName ?? "Oferta especial";
    const discountPercent =
      analysis?.discountPercent ?? parsed?.discountPercent ?? null;

    const suggestedCaption =
      analysis?.caption?.trim() ||
      (await suggestOfferCaption({
        aiBrief: aiBrief || productName,
        productName,
        discountPercent,
        storeName: store.name,
        mallName: store.mall.name,
      }));

    const suggestedHashtags =
      analysis?.hashtags?.trim() ||
      (await suggestOfferHashtags({
        aiBrief: aiBrief || productName,
        productName,
        storeName: store.name,
      }));

    const previewDir = path.join(process.cwd(), "public", "generated", "previews");
    await fs.mkdir(previewDir, { recursive: true });
    const filename = `upload-${session.storeId}-${Date.now()}.png`;
    await fs.writeFile(path.join(previewDir, filename), resized);

    return NextResponse.json({
      previewUrl: `/generated/previews/${filename}`,
      previewDataUrl: `data:image/png;base64,${base64}`,
      productName,
      discountPercent,
      caption: analysis?.caption,
      suggestedCaption,
      offerHashtags: analysis?.hashtags,
      suggestedHashtags,
      enhanced: wasEnhanced,
      removeBg: wasRemoveBg,
      removeBgUsedAi,
      hasRemoveBgApi: isRemoveBgConfigured(),
      source: "upload",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
