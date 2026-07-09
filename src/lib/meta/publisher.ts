import fs from "fs/promises";
import path from "path";
import type { MetaPublishCredentials } from "./credentials";

export interface PublishResult {
  platform: "INSTAGRAM" | "FACEBOOK";
  success: boolean;
  externalPostId?: string;
  errorMessage?: string;
}

function getPublicImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const baseUrl = process.env.APP_PUBLIC_URL;
  if (!baseUrl) {
    throw new Error(
      "APP_PUBLIC_URL debe estar configurada para publicar en Instagram (ej: https://mizo.cl/markmall)"
    );
  }
  return `${baseUrl.replace(/\/$/, "")}${imagePath}`;
}

async function loadImageBuffer(imagePath: string): Promise<Buffer> {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    const res = await fetch(imagePath);
    if (!res.ok) {
      throw new Error("No se pudo descargar la imagen");
    }
    return Buffer.from(await res.arrayBuffer());
  }

  const fullPath = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
  return fs.readFile(fullPath);
}

/** Sube la imagen a Facebook (no publicada) y devuelve URL en CDN de Meta para Instagram */
async function getMetaHostedImageUrl(
  imageBuffer: Buffer,
  accessToken: string,
  pageId: string
): Promise<string> {
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("source", blob, "offer.jpg");
  formData.append("published", "false");
  formData.append("access_token", accessToken);

  const uploadRes = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}/photos`,
    { method: "POST", body: formData }
  );

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.id) {
    throw new Error(
      uploadData.error?.message ?? "No se pudo subir imagen a Facebook para Instagram"
    );
  }

  const photoRes = await fetch(
    `https://graph.facebook.com/v21.0/${uploadData.id}?fields=images&access_token=${accessToken}`
  );
  const photoData = await photoRes.json();
  const imageUrl = photoData.images?.[0]?.source as string | undefined;

  if (!imageUrl) {
    throw new Error("Facebook no devolvió URL de imagen para Instagram");
  }

  return imageUrl;
}

async function waitForInstagramContainer(
  creationId: string,
  accessToken: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  for (let i = 0; i < 12; i++) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${creationId}?fields=status_code,status&access_token=${accessToken}`
    );
    const data = await res.json();

    if (data.status_code === "FINISHED") {
      return { ok: true };
    }
    if (data.status_code === "ERROR") {
      return {
        ok: false,
        error: data.status ?? "Error procesando imagen en Instagram",
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  return { ok: false, error: "Instagram tardó demasiado en procesar la imagen" };
}

async function publishToInstagram(
  imagePath: string,
  caption: string,
  creds: MetaPublishCredentials,
  imageBuffer?: Buffer
): Promise<PublishResult> {
  const accessToken = creds.accessToken;
  const igAccountId = creds.igAccountId;
  const pageId = creds.pageId;

  if (!accessToken || !igAccountId) {
    return {
      platform: "INSTAGRAM",
      success: false,
      errorMessage: "Instagram no conectado para esta tienda",
    };
  }

  try {
    const buffer = imageBuffer ?? (await loadImageBuffer(imagePath));
    const imageUrl = pageId
      ? await getMetaHostedImageUrl(buffer, accessToken, pageId)
      : getPublicImageUrl(imagePath);

    const containerRes = await fetch(
      `https://graph.facebook.com/v21.0/${igAccountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        }),
      }
    );

    const containerData = await containerRes.json();
    if (!containerRes.ok) {
      return {
        platform: "INSTAGRAM",
        success: false,
        errorMessage: containerData.error?.message ?? "Error creando contenedor de media",
      };
    }

    const creationId = containerData.id;

    const ready = await waitForInstagramContainer(creationId, accessToken);
    if (!ready.ok) {
      return {
        platform: "INSTAGRAM",
        success: false,
        errorMessage: ready.error,
      };
    }

    const publishRes = await fetch(
      `https://graph.facebook.com/v21.0/${igAccountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishRes.json();
    if (!publishRes.ok) {
      return {
        platform: "INSTAGRAM",
        success: false,
        errorMessage: publishData.error?.message ?? "Error publicando en Instagram",
      };
    }

    return {
      platform: "INSTAGRAM",
      success: true,
      externalPostId: publishData.id,
    };
  } catch (error) {
    return {
      platform: "INSTAGRAM",
      success: false,
      errorMessage: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

async function publishToFacebook(
  imagePath: string,
  message: string,
  creds: MetaPublishCredentials,
  imageBuffer?: Buffer
): Promise<PublishResult> {
  const accessToken = creds.accessToken;
  const pageId = creds.pageId;

  if (!accessToken || !pageId) {
    return {
      platform: "FACEBOOK",
      success: false,
      errorMessage: "Facebook no conectado para esta tienda",
    };
  }

  try {
    const imageBufferResolved = imageBuffer ?? (await loadImageBuffer(imagePath));

    const blob = new Blob([new Uint8Array(imageBufferResolved)], { type: "image/png" });

    const formData = new FormData();
    formData.append("source", blob, "offer.png");
    formData.append("message", message);
    formData.append("access_token", accessToken);

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/photos`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    if (!res.ok) {
      return {
        platform: "FACEBOOK",
        success: false,
        errorMessage: data.error?.message ?? "Error publicando en Facebook",
      };
    }

    return {
      platform: "FACEBOOK",
      success: true,
      externalPostId: data.id ?? data.post_id,
    };
  } catch (error) {
    return {
      platform: "FACEBOOK",
      success: false,
      errorMessage: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function publishOfferToSocial(params: {
  imagePath: string;
  captionInstagram: string;
  captionFacebook: string;
  hashtags: string;
  meta: MetaPublishCredentials;
}): Promise<PublishResult[]> {
  const igCaption = `${params.captionInstagram}\n\n${params.hashtags}`;
  const fbMessage = `${params.captionFacebook}\n\n${params.hashtags}`;

  const imageBuffer = await loadImageBuffer(params.imagePath);

  const [instagram, facebook] = await Promise.all([
    publishToInstagram(params.imagePath, igCaption, params.meta, imageBuffer),
    publishToFacebook(params.imagePath, fbMessage, params.meta, imageBuffer),
  ]);

  return [instagram, facebook];
}

export function getMetaConfigStatus() {
  const app = Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
  return {
    hasOpenAI: Boolean(process.env.OPENAI_API_KEY),
    hasMetaApp: app,
    hasMetaToken: Boolean(process.env.META_ACCESS_TOKEN),
    hasInstagram: Boolean(process.env.META_INSTAGRAM_ACCOUNT_ID),
    hasFacebook: Boolean(process.env.META_PAGE_ID),
    hasPublicUrl: Boolean(process.env.APP_PUBLIC_URL),
    supportsStoreOAuth: app,
  };
}
