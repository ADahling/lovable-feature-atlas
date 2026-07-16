/**
 * Shared cached fetch for JSON-LD / live-site tests.
 *
 * Reduces workflow flakiness and runtime by:
 *   1. In-memory memoization per Vitest worker process.
 *   2. Disk cache under /tmp/lovable-live-cache keyed by SHA-1 of the URL,
 *      shared across worker processes within a single CI job.
 *   3. Retry + timeout on network errors (fresh fetches only).
 *
 * Returned value mimics the subset of `Response` these tests use:
 *   { status, statusText, headers, text() }
 *
 * Env vars:
 *   LIVE_FETCH_CACHE_DIR   override cache dir (default /tmp/lovable-live-cache)
 *   LIVE_FETCH_CACHE_TTL   TTL in seconds (default 900 = 15 min)
 *   LIVE_FETCH_NO_CACHE=1  disable read/write, always fetch fresh
 *   LIVE_FETCH_TIMEOUT_MS  per-attempt timeout (default 15000)
 *   LIVE_FETCH_ATTEMPTS    total attempts including first (default 3)
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CACHE_DIR = process.env.LIVE_FETCH_CACHE_DIR ?? "/tmp/lovable-live-cache";
const TTL_MS = Number(process.env.LIVE_FETCH_CACHE_TTL ?? 900) * 1000;
const DISABLED = process.env.LIVE_FETCH_NO_CACHE === "1";
const TIMEOUT_MS = Number(process.env.LIVE_FETCH_TIMEOUT_MS ?? 15_000);
const ATTEMPTS = Number(process.env.LIVE_FETCH_ATTEMPTS ?? 3);

interface CacheEntry {
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  fetchedAt: number;
}

const memory = new Map<string, CacheEntry>();

function keyFor(url: string): string {
  return createHash("sha1").update(url).digest("hex");
}

function diskPath(url: string): string {
  return join(CACHE_DIR, `${keyFor(url)}.json`);
}

function readDisk(url: string): CacheEntry | null {
  if (DISABLED) return null;
  const path = diskPath(url);
  try {
    const stat = statSync(path);
    if (Date.now() - stat.mtimeMs > TTL_MS) return null;
    const entry = JSON.parse(readFileSync(path, "utf8")) as CacheEntry;
    if (Date.now() - entry.fetchedAt > TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeDisk(entry: CacheEntry): void {
  if (DISABLED) return;
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(diskPath(entry.url), JSON.stringify(entry));
  } catch {
    // best-effort cache; ignore
  }
}

async function fetchFresh(url: string, init?: RequestInit): Promise<CacheEntry> {
  let lastErr: unknown;
  for (let i = 1; i <= ATTEMPTS; i++) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        ...init,
        signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
      });
      const body = await res.text();
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headers[k] = v;
      });
      const entry: CacheEntry = {
        url,
        status: res.status,
        statusText: res.statusText,
        headers,
        body,
        fetchedAt: Date.now(),
      };
      // Only cache success-ish responses; 5xx should be retried later.
      if (res.status < 500) writeDisk(entry);
      return entry;
    } catch (err) {
      lastErr = err;
      if (i === ATTEMPTS) break;
      await new Promise((r) => setTimeout(r, 400 * 2 ** (i - 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export interface CachedResponse {
  status: number;
  statusText: string;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
  fromCache: boolean;
}

function toResponse(entry: CacheEntry, fromCache: boolean): CachedResponse {
  return {
    status: entry.status,
    statusText: entry.statusText,
    headers: {
      get: (name: string) => entry.headers[name.toLowerCase()] ?? entry.headers[name] ?? null,
    },
    text: async () => entry.body,
    fromCache,
  };
}

/** Cached GET. Returns a Response-like object. */
export async function cachedFetch(url: string, init?: RequestInit): Promise<CachedResponse> {
  if (!DISABLED) {
    const mem = memory.get(url);
    if (mem && Date.now() - mem.fetchedAt <= TTL_MS) return toResponse(mem, true);
    const disk = readDisk(url);
    if (disk) {
      memory.set(url, disk);
      return toResponse(disk, true);
    }
  }
  const entry = await fetchFresh(url, init);
  memory.set(url, entry);
  return toResponse(entry, false);
}
