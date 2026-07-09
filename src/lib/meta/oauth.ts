import { SignJWT, jwtVerify } from "jose";

const GRAPH = "https://graph.facebook.com/v21.0";
const FB_DIALOG = "https://www.facebook.com/v21.0/dialog/oauth";

export const META_SCOPES = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_manage_metadata",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
].join(",");

export interface MetaPageOption {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  igAccountId: string | null;
  igUsername: string | null;
}

function getSecret() {
  const secret = process.env.SESSION_SECRET ?? "markmall-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export function getMetaAppConfig() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return null;
  return { appId, appSecret };
}

export function getOAuthRedirectUri(): string {
  const base =
    process.env.META_OAUTH_REDIRECT_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_PUBLIC_URL?.replace(/\/markmall\/?$/, "") ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/meta/callback`;
}

export async function createOAuthState(storeId: string): Promise<string> {
  return new SignJWT({ storeId, purpose: "meta_oauth" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(getSecret());
}

export async function verifyOAuthState(state: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(state, getSecret());
    if (payload.purpose !== "meta_oauth" || typeof payload.storeId !== "string") return null;
    return payload.storeId;
  } catch {
    return null;
  }
}

export function buildMetaLoginUrl(state: string): string {
  const config = getMetaAppConfig();
  if (!config) throw new Error("META_APP_ID y META_APP_SECRET no configurados");

  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: getOAuthRedirectUri(),
    state,
    scope: META_SCOPES,
    response_type: "code",
    auth_type: "rerequest",
  });

  return `${FB_DIALOG}?${params.toString()}`;
}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${GRAPH}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message ?? `Graph API error ${res.status}`);
  }
  return data as T;
}

export async function exchangeCodeForUserToken(code: string): Promise<string> {
  const config = getMetaAppConfig();
  if (!config) throw new Error("Meta app no configurada");

  const data = await graphGet<{ access_token: string }>("/oauth/access_token", {
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: getOAuthRedirectUri(),
    code,
  });

  return data.access_token;
}

export async function exchangeForLongLivedUserToken(shortToken: string): Promise<{
  accessToken: string;
  expiresIn: number | null;
}> {
  const config = getMetaAppConfig();
  if (!config) throw new Error("Meta app no configurada");

  const data = await graphGet<{ access_token: string; expires_in?: number }>(
    "/oauth/access_token",
    {
      grant_type: "fb_exchange_token",
      client_id: config.appId,
      client_secret: config.appSecret,
      fb_exchange_token: shortToken,
    }
  );

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in ?? null,
  };
}

type GraphPage = {
  id: string;
  name: string;
  access_token?: string;
  instagram_business_account?: { id: string; username?: string } | null;
};

const PAGE_FIELDS = "id,name,access_token,instagram_business_account{id,username}";

type GranularScope = {
  scope: string;
  target_ids?: string[];
};

type TokenDebugInfo = {
  scopes?: string[];
  granular_scopes?: GranularScope[];
};

async function inspectUserToken(userAccessToken: string): Promise<TokenDebugInfo | null> {
  const config = getMetaAppConfig();
  if (!config) return null;

  try {
    const res = await graphGet<{ data: TokenDebugInfo }>("/debug_token", {
      input_token: userAccessToken,
      access_token: `${config.appId}|${config.appSecret}`,
    });
    return res.data;
  } catch {
    return null;
  }
}

const PAGE_SCOPE_NAMES = new Set([
  "pages_show_list",
  "pages_manage_posts",
  "pages_manage_metadata",
  "pages_read_engagement",
]);

async function fetchPagesFromGranularScopes(
  userAccessToken: string,
  granularScopes: GranularScope[]
): Promise<GraphPage[]> {
  const pageIds = new Set<string>();
  const businessIds = new Set<string>();

  for (const entry of granularScopes) {
    for (const id of entry.target_ids ?? []) {
      if (PAGE_SCOPE_NAMES.has(entry.scope)) pageIds.add(id);
      if (entry.scope === "business_management") businessIds.add(id);
    }
  }

  const pages: GraphPage[] = [];

  for (const pageId of pageIds) {
    try {
      const detail = await graphGet<GraphPage>(`/${pageId}`, {
        access_token: userAccessToken,
        fields: PAGE_FIELDS,
      });
      pages.push(detail);
    } catch {
      // Page id listed in token but not accessible yet.
    }
  }

  for (const businessId of businessIds) {
    for (const edge of ["owned_pages", "client_pages"] as const) {
      try {
        const batch = await graphGet<{ data: GraphPage[] }>(`/${businessId}/${edge}`, {
          access_token: userAccessToken,
          fields: PAGE_FIELDS,
          limit: "100",
        });
        pages.push(...(batch.data ?? []));
      } catch {
        // Business listed in token but edge not available for this user/app.
      }
    }
  }

  return pages;
}

function mapGraphPages(pages: GraphPage[]): MetaPageOption[] {
  const seen = new Set<string>();
  const result: MetaPageOption[] = [];

  for (const p of pages) {
    if (!p.id || seen.has(p.id)) continue;
    seen.add(p.id);
    result.push({
      pageId: p.id,
      pageName: p.name ?? `Página ${p.id}`,
      pageAccessToken: p.access_token ?? "",
      igAccountId: p.instagram_business_account?.id ?? null,
      igUsername: p.instagram_business_account?.username ?? null,
    });
  }

  return result;
}

async function ensurePageAccessTokens(
  pages: GraphPage[],
  userAccessToken: string
): Promise<GraphPage[]> {
  const enriched: GraphPage[] = [];

  for (const page of pages) {
    if (!page.id) continue;

    if (page.access_token) {
      enriched.push(page);
      continue;
    }

    try {
      const detail = await graphGet<GraphPage>(`/${page.id}`, {
        access_token: userAccessToken,
        fields: PAGE_FIELDS,
      });
      enriched.push({ ...page, ...detail });
    } catch {
      // Page visible in Business Manager but token not granted in OAuth.
    }
  }

  return enriched;
}

async function fetchBusinessPages(userAccessToken: string): Promise<GraphPage[]> {
  const pages: GraphPage[] = [];

  const businesses = await graphGet<{
    data: Array<{ id: string; owned_pages?: { data: GraphPage[] } }>;
  }>("/me/businesses", {
    access_token: userAccessToken,
    fields: `id,owned_pages.limit(100){${PAGE_FIELDS}}`,
  });

  for (const business of businesses.data ?? []) {
    if (business.owned_pages?.data?.length) {
      pages.push(...business.owned_pages.data);
    }

    for (const edge of ["client_pages", "owned_pages"] as const) {
      try {
        const batch = await graphGet<{ data: GraphPage[] }>(`/${business.id}/${edge}`, {
          access_token: userAccessToken,
          fields: PAGE_FIELDS,
          limit: "100",
        });
        pages.push(...(batch.data ?? []));
      } catch {
        // Some businesses only expose one of these edges for the current user.
      }
    }
  }

  return pages;
}

function dedupePages(pages: GraphPage[]): GraphPage[] {
  const byId = new Map<string, GraphPage>();
  for (const page of pages) {
    if (!page.id) continue;
    byId.set(page.id, { ...byId.get(page.id), ...page });
  }
  return [...byId.values()];
}

export async function fetchMetaPages(userAccessToken: string): Promise<MetaPageOption[]> {
  const tokenInfo = await inspectUserToken(userAccessToken);

  const direct = await graphGet<{ data: GraphPage[] }>("/me/accounts", {
    access_token: userAccessToken,
    fields: PAGE_FIELDS,
    limit: "100",
  });

  const businessPages = await fetchBusinessPages(userAccessToken);
  let combined = dedupePages([...(direct.data ?? []), ...businessPages]);

  if (combined.length === 0 && tokenInfo?.granular_scopes?.length) {
    combined = dedupePages(
      await fetchPagesFromGranularScopes(userAccessToken, tokenInfo.granular_scopes)
    );
  }

  const withTokens = await ensurePageAccessTokens(combined, userAccessToken);

  if (process.env.NODE_ENV === "development") {
    console.info("[meta-oauth] token scopes:", tokenInfo?.scopes ?? []);
    console.info("[meta-oauth] granular scopes:", tokenInfo?.granular_scopes ?? []);
    console.info("[meta-oauth] pages found:", {
      direct: direct.data?.length ?? 0,
      business: businessPages.length,
      granular: combined.length,
      withTokens: withTokens.filter((p) => p.access_token).length,
    });
  }

  return mapGraphPages(withTokens).filter((p) => p.pageAccessToken);
}

export async function completeMetaOAuth(code: string): Promise<MetaPageOption[]> {
  const shortToken = await exchangeCodeForUserToken(code);
  const { accessToken } = await exchangeForLongLivedUserToken(shortToken);
  return fetchMetaPages(accessToken);
}
