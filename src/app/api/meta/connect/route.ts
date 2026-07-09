import { NextResponse } from "next/server";
import { requireStoreSession } from "@/lib/auth/session";
import {
  buildMetaLoginUrl,
  createOAuthState,
  getMetaAppConfig,
} from "@/lib/meta/oauth";

export async function GET() {
  let session;
  try {
    session = await requireStoreSession();
  } catch {
    return NextResponse.json({ error: "Inicia sesión en tu tienda" }, { status: 401 });
  }

  if (!getMetaAppConfig()) {
    return NextResponse.json(
      {
        error:
          "La app Meta no está configurada en el servidor (META_APP_ID / META_APP_SECRET).",
      },
      { status: 503 }
    );
  }

  const state = await createOAuthState(session.storeId);
  const url = buildMetaLoginUrl(state);

  return NextResponse.redirect(url);
}
