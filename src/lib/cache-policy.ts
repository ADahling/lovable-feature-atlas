import { BUILD_COMMIT, BUILD_TIME } from "./build-info";

export const ATLAS_CACHE_HEADER = "X-Atlas-Cache";
export const EDGE_HTML_CACHE_FLAG = "ATLAS_EDGE_HTML_CACHE";
export const BROWSER_HTML_CACHE_CONTROL = "public, max-age=0, must-revalidate";
export const EDGE_HTML_CACHE_CONTROL = "public, max-age=300, must-revalidate";

export type AtlasCacheStatus = "HIT" | "MISS" | "BYPASS";

export type HtmlCacheDecision =
  | { eligible: true; reason: "public-html" }
  | {
      eligible: false;
      reason:
        | "disabled"
        | "method"
        | "representation"
        | "credentials"
        | "query"
        | "sensitive-path"
        | "not-allowlisted";
    };

export type AtlasHtmlCache = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
};

type ExecutionContextLike = {
  waitUntil?: (promise: Promise<unknown>) => void;
};

type ServeWithHtmlCacheOptions = {
  request: Request;
  env: unknown;
  ctx: unknown;
  fetchOrigin: () => Promise<Response>;
  cache?: AtlasHtmlCache | null;
  buildVersion?: string;
};

type MemoryCacheEntry = {
  expiresAt: number;
  response: Response;
};

const DEFAULT_BUILD_VERSION = `${BUILD_COMMIT}:${BUILD_TIME}`;
const MEMORY_HTML_CACHE_MAX_ENTRIES = 64;
const MEMORY_HTML_CACHE_TTL_MS = 5 * 60 * 1000;

const PUBLIC_HTML_PATHS = new Set([
  "/",
  "/about",
  "/constellation",
  "/digest",
  "/draw",
  "/quiz",
  "/status",
  "/vs/cursor",
  "/vs/v0",
]);

const PUBLIC_HTML_PATTERNS = [
  /^\/(?:categories|features)\/[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  /^\/digest\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
];

// Keep this denylist in addition to the allowlist. It is a defense-in-depth
// guard against a future allowlist pattern becoming broader than intended.
const SENSITIVE_PATH_PREFIXES = [
  "/api",
  "/admin",
  "/auth",
  "/email",
  "/mcp",
  "/oauth",
  "/.mcp",
  "/.well-known",
  "/lovable/email",
  "/digest/confirm",
  "/digest/unsubscribe",
];

function envRecord(env: unknown): Record<string, unknown> | undefined {
  return env && typeof env === "object" ? (env as Record<string, unknown>) : undefined;
}

function canonicalPath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isPathOrChild(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isEdgeHtmlCacheEnabled(env: unknown): boolean {
  const raw = envRecord(env)?.[EDGE_HTML_CACHE_FLAG];
  // Lovable's managed production runtime does not currently forward vars from
  // wrangler.jsonc. Keep the public cache lane on by default there, while
  // preserving an explicit kill switch for incident response.
  if (raw === undefined || raw === null) return true;
  if (raw === true || raw === 1) return true;
  if (raw === false || raw === 0) return false;
  if (typeof raw !== "string") return false;
  const value = raw.trim().toLowerCase();
  return value === "1" || value === "true";
}

export function isSensitiveHtmlPath(pathname: string): boolean {
  const path = canonicalPath(pathname).toLowerCase();
  return SENSITIVE_PATH_PREFIXES.some((prefix) => isPathOrChild(path, prefix));
}

export function isAllowlistedPublicHtmlPath(pathname: string): boolean {
  const path = canonicalPath(pathname);
  return PUBLIC_HTML_PATHS.has(path) || PUBLIC_HTML_PATTERNS.some((pattern) => pattern.test(path));
}

function acceptsHtmlRepresentation(accept: string): boolean {
  let htmlQuality: number | undefined;
  let wildcardQuality: number | undefined;

  for (const entry of accept.split(",")) {
    const [rawMediaType, ...parameters] = entry.split(";");
    const mediaType = rawMediaType.trim().toLowerCase();
    if (mediaType !== "text/html" && mediaType !== "*/*") continue;

    const qualityParameter = parameters
      .map((parameter) => parameter.trim().toLowerCase())
      .find((parameter) => parameter.startsWith("q="));
    const parsedQuality = qualityParameter
      ? Number.parseFloat(qualityParameter.slice(2).trim())
      : 1;
    const quality = Number.isFinite(parsedQuality) ? Math.min(1, Math.max(0, parsedQuality)) : 0;

    if (mediaType === "text/html") {
      htmlQuality = Math.max(htmlQuality ?? 0, quality);
    } else {
      wildcardQuality = Math.max(wildcardQuality ?? 0, quality);
    }
  }

  // A specific media range takes precedence over a wildcard, including an
  // explicit q=0 rejection of HTML.
  return (htmlQuality ?? wildcardQuality ?? 0) > 0;
}

export function getHtmlCacheDecision(request: Request, env: unknown): HtmlCacheDecision {
  if (!isEdgeHtmlCacheEnabled(env)) {
    return { eligible: false, reason: "disabled" };
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return { eligible: false, reason: "method" };
  }

  const accept = request.headers.get("accept");
  if (accept && !acceptsHtmlRepresentation(accept)) {
    return { eligible: false, reason: "representation" };
  }

  if (request.headers.has("cookie") || request.headers.has("authorization")) {
    return { eligible: false, reason: "credentials" };
  }

  const url = new URL(request.url);
  if (url.search !== "") {
    return { eligible: false, reason: "query" };
  }

  if (isSensitiveHtmlPath(url.pathname)) {
    return { eligible: false, reason: "sensitive-path" };
  }

  if (!isAllowlistedPublicHtmlPath(url.pathname)) {
    return { eligible: false, reason: "not-allowlisted" };
  }

  return { eligible: true, reason: "public-html" };
}

export function isCacheableHtmlResponse(response: Response): boolean {
  if (response.status !== 200) return false;
  if (response.headers.has("set-cookie")) return false;

  const contentType = response.headers.get("content-type") ?? "";
  if (!/^text\/html(?:\s*;|$)/i.test(contentType)) return false;

  const cacheControl = (response.headers.get("cache-control") ?? "").toLowerCase();
  if (/(?:^|,)\s*(?:private|no-store)(?:\s|,|=|$)/.test(cacheControl)) return false;

  return response.headers.get("vary")?.trim() !== "*";
}

export function buildHtmlCacheKey(request: Request, buildVersion = DEFAULT_BUILD_VERSION): Request {
  const url = new URL(request.url);
  url.search = "";
  url.hash = "";
  url.searchParams.set("__atlas_html_build", buildVersion);
  return new Request(url.toString(), { method: "GET" });
}

function createMemoryHtmlCache(): AtlasHtmlCache {
  const entries = new Map<string, MemoryCacheEntry>();

  return {
    async match(request) {
      const entry = entries.get(request.url);
      if (!entry) return undefined;
      if (entry.expiresAt <= Date.now()) {
        entries.delete(request.url);
        return undefined;
      }

      // Refresh insertion order so the bound behaves like a small LRU cache.
      entries.delete(request.url);
      entries.set(request.url, entry);
      return entry.response.clone();
    },
    async put(request, response) {
      entries.delete(request.url);
      while (entries.size >= MEMORY_HTML_CACHE_MAX_ENTRIES) {
        const oldestKey = entries.keys().next().value;
        if (oldestKey === undefined) break;
        entries.delete(oldestKey);
      }
      entries.set(request.url, {
        expiresAt: Date.now() + MEMORY_HTML_CACHE_TTL_MS,
        response: response.clone(),
      });
    },
  };
}

const memoryHtmlCache = createMemoryHtmlCache();

function defaultCache(): AtlasHtmlCache {
  try {
    if (typeof caches === "undefined") return memoryHtmlCache;
    return (caches as unknown as { default?: AtlasHtmlCache }).default ?? memoryHtmlCache;
  } catch (error) {
    console.warn("[atlas-cache] Cache API unavailable", error);
    return memoryHtmlCache;
  }
}

function executionContext(ctx: unknown): ExecutionContextLike | undefined {
  return ctx && typeof ctx === "object" ? (ctx as ExecutionContextLike) : undefined;
}

function copyResponse(
  response: Response,
  status: AtlasCacheStatus | null,
  options: {
    head?: boolean;
    cacheHeaders?: "browser" | "edge";
    privateNoStore?: boolean;
  } = {},
): Response {
  const headers = new Headers(response.headers);
  if (status) headers.set(ATLAS_CACHE_HEADER, status);
  else headers.delete(ATLAS_CACHE_HEADER);

  if (options.cacheHeaders) {
    headers.set(
      "Cache-Control",
      options.cacheHeaders === "edge" ? EDGE_HTML_CACHE_CONTROL : BROWSER_HTML_CACHE_CONTROL,
    );
    headers.set("CDN-Cache-Control", EDGE_HTML_CACHE_CONTROL);
    headers.set("Cloudflare-CDN-Cache-Control", EDGE_HTML_CACHE_CONTROL);
  }

  if (options.privateNoStore) {
    headers.set("Cache-Control", "private, no-store");
    headers.delete("CDN-Cache-Control");
    headers.delete("Cloudflare-CDN-Cache-Control");
    headers.delete("Surrogate-Control");
  }

  return new Response(options.head ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function bypass(response: Response, request: Request): Response {
  const carriesCredentials = request.headers.has("cookie") || request.headers.has("authorization");
  return copyResponse(response, "BYPASS", {
    head: request.method === "HEAD",
    privateNoStore: carriesCredentials || response.headers.has("set-cookie"),
  });
}

function reportCacheFailure(operation: "match" | "put" | "waitUntil", error: unknown): void {
  console.warn(`[atlas-cache] ${operation} failed; serving origin`, error);
}

async function serveCacheableOrigin(
  request: Request,
  fetchOrigin: () => Promise<Response>,
): Promise<Response> {
  const originResponse = await fetchOrigin();
  if (!isCacheableHtmlResponse(originResponse)) {
    return bypass(originResponse, request);
  }

  // If a runtime cache backend is unavailable or fails, keep emitting CDN
  // headers so an outer edge can still cache eligible public HTML.
  return copyResponse(originResponse, "MISS", {
    cacheHeaders: "browser",
    head: request.method === "HEAD",
  });
}

export async function serveWithPublicHtmlCache({
  request,
  env,
  ctx,
  fetchOrigin,
  cache: injectedCache,
  buildVersion = DEFAULT_BUILD_VERSION,
}: ServeWithHtmlCacheOptions): Promise<Response> {
  const decision = getHtmlCacheDecision(request, env);
  if (!decision.eligible) {
    return bypass(await fetchOrigin(), request);
  }

  const cache = injectedCache === undefined ? defaultCache() : (injectedCache ?? undefined);
  if (!cache) {
    return serveCacheableOrigin(request, fetchOrigin);
  }

  const cacheKey = buildHtmlCacheKey(request, buildVersion);
  let cached: Response | undefined;
  try {
    cached = await cache.match(cacheKey);
  } catch (error) {
    reportCacheFailure("match", error);
    return serveCacheableOrigin(request, fetchOrigin);
  }

  if (cached) {
    return copyResponse(cached, "HIT", {
      cacheHeaders: "browser",
      head: request.method === "HEAD",
    });
  }

  const originResponse = await fetchOrigin();
  if (!isCacheableHtmlResponse(originResponse)) {
    return bypass(originResponse, request);
  }

  // HEAD shares the GET cache key and can consume an existing GET entry, but
  // an origin HEAD response must never populate that key with an empty body.
  if (request.method === "HEAD") {
    return copyResponse(originResponse, "MISS", { cacheHeaders: "browser", head: true });
  }

  const storedResponse = copyResponse(originResponse.clone(), null, { cacheHeaders: "edge" });
  let write: Promise<void>;
  try {
    write = cache.put(cacheKey, storedResponse).catch((error) => {
      reportCacheFailure("put", error);
    });
  } catch (error) {
    reportCacheFailure("put", error);
    return copyResponse(originResponse, "MISS", { cacheHeaders: "browser" });
  }

  const context = executionContext(ctx);
  if (context?.waitUntil) {
    try {
      context.waitUntil(write);
    } catch (error) {
      reportCacheFailure("waitUntil", error);
    }
  } else {
    await write;
  }

  return copyResponse(originResponse, "MISS", { cacheHeaders: "browser" });
}
