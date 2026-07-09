import { prisma } from "@/lib/db";

export interface MetaPublishCredentials {
  accessToken: string;
  pageId: string;
  igAccountId: string;
  pageName?: string;
  igUsername?: string;
  source: "store" | "env";
}

export async function getMetaCredentialsForStore(
  storeId: string
): Promise<MetaPublishCredentials | null> {
  const social = await prisma.storeSocialAccount.findUnique({
    where: { storeId },
  });

  if (
    social?.metaAccessToken &&
    social.metaPageId &&
    social.metaIgAccountId
  ) {
    return {
      accessToken: social.metaAccessToken,
      pageId: social.metaPageId,
      igAccountId: social.metaIgAccountId,
      pageName: social.metaPageName ?? undefined,
      igUsername: social.metaIgUsername ?? undefined,
      source: "store",
    };
  }

  const accessToken = process.env.META_ACCESS_TOKEN;
  const pageId = process.env.META_PAGE_ID;
  const igAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID;

  if (accessToken && pageId && igAccountId) {
    return {
      accessToken,
      pageId,
      igAccountId,
      source: "env",
    };
  }

  return null;
}

export async function getStoreSocialStatus(storeId: string) {
  const social = await prisma.storeSocialAccount.findUnique({
    where: { storeId },
  });

  return {
    meta: {
      connected: Boolean(
        social?.metaAccessToken && social.metaPageId && social.metaIgAccountId
      ),
      pageName: social?.metaPageName ?? null,
      igUsername: social?.metaIgUsername ?? null,
      connectedAt: social?.connectedAt?.toISOString() ?? null,
    },
    tiktok: {
      connected: Boolean(social?.tiktokAccessToken),
      username: social?.tiktokUsername ?? null,
      available: false,
      message: "TikTok — próximamente (requiere aprobación de TikTok for Developers)",
    },
  };
}
