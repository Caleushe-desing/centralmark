import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { requireStoreSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { assertStoreAiRateLimit, StoreAiRateLimitError } from "@/lib/ai/rate-limit/store-ai-limiter";
import { aiRateLimitResponse } from "@/lib/ai/rate-limit/http";
import {
  craftDallePromptFromBrief,
  generateImageWithDalle,
} from "@/lib/ai/image-generator";
import { extractBrandsFromBrief } from "@/lib/ai/extract-brands";
import { parseOfferBrief } from "@/lib/ai/parse-brief";
import { suggestOfferCaption, suggestOfferHashtags } from "@/lib/ai/suggest-caption";
import { suggestImageTextLayers } from "@/lib/ai/suggest-image-layers";

export async function POST(request: NextRequest) {
  try {
    const session = await requireStoreSession();
    const body = await request.json();

    const aiBrief = (body.aiBrief as string)?.trim();
    const creationMode =
      (body.creationMode as string) === "complete" ? "complete" : "editor";

    if (!aiBrief) {
      return NextResponse.json(
        { error: "Describe tu publicación" },
        { status: 400 }
      );
    }

    assertStoreAiRateLimit(session.storeId, "premium");

    const parsed = await parseOfferBrief(aiBrief);
    const productName = parsed.productName;
    const discountPercent = parsed.discountPercent;
    const priceText = parsed.priceText ?? null;

    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      include: { mall: true },
    });
    if (!store) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }

    const dallePrompt = await craftDallePromptFromBrief(
      {
        aiBrief,
        productName,
        discountPercent,
        priceText,
        storeName: store.name,
        storeCategory: store.category,
      },
      creationMode
    );

    const brands = extractBrandsFromBrief(aiBrief);
    const imageBuffer = await generateImageWithDalle(dallePrompt, creationMode, { brands });

    if (!imageBuffer) {
      return NextResponse.json(
        {
          error:
            "No se pudo generar la imagen. Revisa tu saldo en OpenAI o intenta de nuevo en unos segundos.",
          dallePrompt,
        },
        { status: 503 }
      );
    }

    const previewDir = path.join(process.cwd(), "public", "generated", "previews");
    await fs.mkdir(previewDir, { recursive: true });
    const filename = `preview-${session.storeId}-${Date.now()}.png`;
    const resized = await sharp(imageBuffer).resize(1080, 1080, { fit: "cover" }).png().toBuffer();
    await fs.writeFile(path.join(previewDir, filename), resized);

    const previewUrl = `/generated/previews/${filename}`;
    const previewDataUrl = `data:image/png;base64,${resized.toString("base64")}`;

    const suggestedCaption = await suggestOfferCaption({
      aiBrief,
      productName,
      discountPercent,
      priceText,
      storeName: store.name,
      mallName: store.mall.name,
    });

    const suggestedHashtags = await suggestOfferHashtags({
      aiBrief,
      productName,
      storeName: store.name,
    });

    const textLayers =
      creationMode === "complete"
        ? await suggestImageTextLayers({
            aiBrief,
            productName,
            discountPercent,
            priceText,
          })
        : undefined;

    return NextResponse.json({
      previewUrl,
      previewDataUrl,
      dallePrompt,
      productName,
      discountPercent,
      priceText,
      creationMode,
      suggestedCaption,
      suggestedHashtags,
      textLayers,
      deprecated: true,
      message: "Usa POST /api/campaign/generate (Design Engine) en su lugar.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (e instanceof StoreAiRateLimitError) {
      return aiRateLimitResponse(e);
    }
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
