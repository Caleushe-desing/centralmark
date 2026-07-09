import { prisma } from "@/lib/db";
import {
  generateOfferContent,
  buildFallbackContent,
  type OfferInput,
} from "./agent";
import { composeOfferImage } from "./visual";
import { publishGeneratedImage } from "@/lib/ftp/upload";
import { moderateOfferText, moderateUserContent } from "./moderation";
import { buildHashtags } from "@/lib/templates";

export async function runOfferGenerationPipeline(offerId: string) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      store: { include: { mall: true } },
      product: true,
      content: true,
    },
  });

  if (!offer) throw new Error("Oferta no encontrada");

  await prisma.offer.update({
    where: { id: offerId },
    data: { status: "GENERATING" },
  });

  try {
    const productName = offer.product?.name ?? offer.productName;

    const moderation = await moderateUserContent({
      productName,
      description: offer.description ?? undefined,
      offerHashtags: offer.offerHashtags ?? undefined,
      aiBrief: offer.aiBrief ?? undefined,
    });

    if (!moderation.approved) {
      throw new Error(moderation.issues.join(" ") || "Contenido no permitido");
    }

    const corrected = moderation.fields;
    const description = corrected.description ?? offer.description;
    const aiBrief = corrected.aiBrief ?? offer.aiBrief;
    const offerHashtags = offer.offerHashtags;
    const userCaption = description?.trim();

    const input: OfferInput = {
      storeName: offer.store.name,
      storeCategory: offer.store.category,
      mallName: offer.store.mall.name,
      productName: corrected.productName ?? productName,
      discountPercent: offer.discountPercent,
      description,
      aiBrief,
      startDate: offer.startDate.toLocaleDateString("es-CL"),
      endDate: offer.endDate.toLocaleDateString("es-CL"),
    };

    let content;
    if (userCaption) {
      content = {
        captionInstagram: userCaption,
        captionFacebook: userCaption,
        hashtags: offerHashtags ?? "",
        backgroundPrompt: aiBrief ?? "",
        visualStyle: "custom",
        headline: `${offer.discountPercent}% OFF`,
        subheadline: corrected.productName ?? productName,
        cta: "¡Aprovecha!",
      };
    } else {
      try {
        content = await generateOfferContent(input);
      } catch {
        content = buildFallbackContent(input);
      }
    }

    const captionCheck = await moderateOfferText(
      `${content.captionInstagram}\n${content.captionFacebook}`
    );
    if (!captionCheck.approved) {
      throw new Error(
        captionCheck.issues.join(" ") ||
          "La IA generó contenido no permitido. Intenta con otras instrucciones."
      );
    }

    const hashtags = buildHashtags(
      offer.store.mall.fixedHashtags,
      offer.store.customHashtags,
      offerHashtags
    );

    let imagePath: string;
    if (offer.productImageUrl) {
      if (offer.productImageUrl.startsWith("/generated/")) {
        imagePath = await publishGeneratedImage(offer.productImageUrl);
      } else {
        imagePath = offer.productImageUrl;
      }
    } else {
      imagePath = await composeOfferImage({
        offerId,
        content,
        storeName: offer.store.name,
        mallName: offer.store.mall.name,
        storeCategory: offer.store.category,
        discountPercent: offer.discountPercent,
        logoUrl: offer.store.logoUrl,
        aiBrief,
        description,
      });
    }

    const data = {
      captionInstagram: content.captionInstagram,
      captionFacebook: content.captionFacebook,
      hashtags,
      imagePath,
      backgroundPrompt: content.backgroundPrompt,
      visualStyle: content.visualStyle,
      templateId: "ai-generated",
    };

    if (offer.content) {
      await prisma.generatedContent.update({ where: { offerId }, data });
    } else {
      await prisma.generatedContent.create({ data: { offerId, ...data } });
    }

    await prisma.offer.update({
      where: { id: offerId },
      data: {
        status: "PENDING",
        description,
        aiBrief,
        productName: corrected.productName ?? productName,
      },
    });

    return prisma.offer.findUnique({
      where: { id: offerId },
      include: { store: { include: { mall: true } }, content: true },
    });
  } catch (error) {
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: "FAILED" },
    });
    throw error;
  }
}
