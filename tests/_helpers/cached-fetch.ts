/**
 * Shared cached fetch for JSON-LD / live-site tests.
 *
 * Reduces workflow flakiness and runtime by:
 *   1. In-memory memoization per Vitest worker process.
 *   2. Disk cache under /tmp/lovable-live-cache keyed by SHA-1 of the URL,
 *      shared across worker processes within a single CI job.
 *   3. In-flight request deduplication so parallel tests hitting the same URL
 *      share a single network round trip.
 *   4. Retry with exponential backoff + jitter, honoring Retry-After on
 *      429 / 503, and treating 5xx / 408 / 429 as retryable.
 *   5. Stale-while-error fallback: if every retry fails, an expired disk
 *      entry is returned rather than throwing.
 *
 * Returned value mimics the subset of `Response` these tests use:
 *   { status, statusText, headers, text() }
 *
 * Env vars:
 *   LIVE_FETCH_CACHE_DIR    override cache dir (default /tmp/lovable-live-cache)
 *   LIVE_FETCH_CACHE_TTL    fresh TTL in seconds (default 1800 = 30 min)
 *   LIVE_FETCH_STALE_TTL    stale fallback TTL in seconds (default 86400 = 24h)
 *   LIVE_FETCH_NO_CACHE=1   disable read/write, always fetch fresh
 *   LIVE_FETCH_TIMEOUT_MS   per-attempt timeout (default 20000)
 *   LIVE_FETCH_ATTEMPTS     total attempts including first (default 5)
 *   LIVE_FETCH_BACKOFF_MS   base backoff (default 500)
 *   LIVE_FETCH_MAX_BACKOFF  cap for a single backoff (default 8000)
 *   LIVE_FETCH_DEBUG=1      log attempts to stderr
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CACHE_DIR = process.env.LIVE_FETCH_CACHE_DIR ?? "/tmp/lovable-live-cache";
const TTL_MS = Number(process.env.LIVE_FETCH_CACHE_TTL ?? 1800) * 1000;
const STALE_TTL_MS = Number(process.env.LIVE_FETCH_STALE_TTL ?? 86_400) * 1000;
const DISABLED = process.env.LIVE_FETCH_NO_CACHE === "1";
const TIMEOUT_MS = Number(process.env.LIVE_FETCH_TIMEOUT_MS ?? 20_000);
const ATTEMPTS = Math.max(1, Number(process.env.LIVE_FETCH_ATTEMPTS ?? 5));
const BACKOFF_MS = Number(process.env.LIVE_FETCH_BACKOFF_MS ?? 500);
const MAX_BACKOFF_MS = Number(process.env.LIVE_FETCH_MAX_BACKOFF ?? 8_000);
const DEBUG = process.env.LIVE_FETCH_DEBUG === "1";

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504, 522, 524]);

interface CacheEntry {
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  fetchedAt: number;
}

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

function keyFor(url: string): string {
  return createHash("sha1").update(url).digest("hex");
}

function diskPath(url: string): string {
  return join(CACHE_DIR, `${keyFor(url)}.json`);
}

function readDiskRaw(url: string): { entry: CacheEntry; ageMs: number } | null {
  if (DISABLED) return null;
  const path = diskPath(url);
  try {
    const stat = statSync(path);
    const entry = JSON.parse(readFileSync(path, "utf8")) as CacheEntry;
    const ageMs = Date.now() - (entry.fetchedAt ?? stat.mtimeMs);
    return { entry, ageMs };
  } catch {
    return null;
  }
}

function readDisk(url: string): CacheEntry | null {
  const raw = readDiskRaw(url);
  if (!raw) return null;
  return raw.ageMs <= TTL_MS ? raw.entry : null;
}

function readStale(url: string): CacheEntry | null {
  const raw = readDiskRaw(url);
  if (!raw) return null;
  return raw.ageMs <= STALE_TTL_MS ? raw.entry : null;
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

function log(msg: string): void {
  if (DEBUG) process.stderr.write(`[cachedFetch] ${msg}\n`);
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const dateMs = Date.parse(value);
  if (Number.isFinite(dateMs)) return Math.max(0, dateMs - Date.now());
  return null;
}

function backoffFor(attempt: number, retryAfterMs: number | null): number {
  if (retryAfterMs != null) return Math.min(retryAfterMs, MAX_BACKOFF_MS);
  const base = Math.min(BACKOFF_MS * 2 ** (attempt - 1), MAX_BACKOFF_MS);
  // full jitter (AWS): random in [0, base]
  return Math.floor(Math.random() * base);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchFresh(url: string, init?: RequestInit): Promise<CacheEntry> {
  let lastErr: unknown;
  let lastEntry: CacheEntry | null = null;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        ...init,
        signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
      });
      const body = await res.text();
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headers[k.toLowerCase()] = v;
      });
      const entry: CacheEntry = {
        url,
        status: res.status,
        statusText: res.statusText,
        headers,
        body,
        fetchedAt: Date.now(),
      };

      if (RETRYABLE_STATUS.has(res.status) && attempt < ATTEMPTS) {
        lastEntry = entry;
        const wait = backoffFor(attempt, parseRetryAfter(res.headers.get("retry-after")));
        log(`${url} status ${res.status}, retry ${attempt}/${ATTEMPTS - 1} in ${wait}ms`);
        await sleep(wait);
        continue;
      }

      // Cache only cleanly-successful responses.
      if (res.status >= 200 && res.status < 400) writeDisk(entry);
      return entry;
    } catch (err) {
      lastErr = err;
      if (attempt === ATTEMPTS) break;
      const wait = backoffFor(attempt, null);
      log(`${url} error "${(err as Error)?.message ?? err}", retry ${attempt}/${ATTEMPTS - 1} in ${wait}ms`);
      await sleep(wait);
    }
  }

  // All attempts failed. Prefer stale-cache over throwing so a network blip
  // in the sandbox doesn't sink the whole suite.
  const stale = readStale(url);
  if (stale) {
    log(`${url} exhausted retries, serving stale entry (age ${(Date.now() - stale.fetchedAt) / 1000}s)`);
    return stale;
  }
  if (lastEntry) {
    log(`${url} exhausted retries, returning last retryable response (${lastEntry.status})`);
    return lastEntry;
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

  // Deduplicate concurrent fetches for the same URL within this worker.
  const key = `${url}::${init?.method ?? "GET"}`;
  let pending = inflight.get(key);
  if (!pending) {
    pending = fetchFresh(url, init).finally(() => {
      inflight.delete(key);
    });
    inflight.set(key, pending);
  }
  const entry = await pending;
  memory.set(url, entry);
  return toResponse(entry, false);
}
