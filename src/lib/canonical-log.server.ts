/**
 * Server-only logger that records how `canonicalPath()` normalized a given
 * request URL. Emits a single structured JSON line to stdout when debug mode
 * is enabled. Safe to call from request middleware, server functions, or
 * server routes.
 *
 * Debug mode is enabled when ANY of the following is true:
 *   - process.env.CANONICAL_DEBUG === "1"
 *   - the request carries header `x-canonical-debug: 1`
 *   - the request URL has query param `?canonicalDebug=1`
 */
import { canonicalPath } from "./canonical-meta";

export interface CanonicalLogEntry {
  ts: string;
  tag: "canonical-normalize";
  host: string | null;
  raw_path: string;
  query: string;
  normalized_path: string;
  changed: boolean;
  source: string;
}

function debugEnabled(request?: Request, url?: URL): boolean {
  if (process.env.CANONICAL_DEBUG === "1") return true;
  if (request?.headers.get("x-canonical-debug") === "1") return true;
  if (url?.searchParams.get("canonicalDebug") === "1") return true;
  return false;
}

/**
 * Run canonicalPath() on the request URL and, if debug mode is enabled,
 * console.log a structured JSON entry describing the normalization. Always
 * returns the normalized path so callers can use the result directly.
 */
export function logCanonicalNormalization(
  request: Request,
  source = "request-middleware",
): CanonicalLogEntry {
  let url: URL | null = null;
  try {
    url = new URL(request.url);
  } catch {
    /* malformed URL — fall through */
  }

  const rawPath = url?.pathname ?? request.url;
  const query = url?.search ?? "";
  const host = url?.host ?? null;
  const normalized = canonicalPath(rawPath);

  const entry: CanonicalLogEntry = {
    ts: new Date().toISOString(),
    tag: "canonical-normalize",
    host,
    raw_path: rawPath,
    query,
    normalized_path: normalized,
    changed: normalized !== rawPath,
    source,
  };

  if (debugEnabled(request, url ?? undefined)) {
    // Single-line JSON keeps the entry grep-able in worker / sandbox logs.
    console.log(`[canonical-normalize] ${JSON.stringify(entry)}`);
  }

  return entry;
}
