import { fetchAndParse } from "./scraper";
import type { FeatureDataset, FeatureRecord } from "./features-schema";

export interface AtlasEnv {
  FEATURE_ATLAS_KV: KVNamespace;
  ATLAS_VERSION: string;
  REFRESH_TOKEN?: string;
}

export interface RunRecord {
  runId: string;
  startedAt: string;
  finishedAt: string;
  status: "ok" | "failed" | "skipped-locked";
  count: number;
  addedIds: string[];
  removedIds: string[];
  error: string | null;
}

// Minimal subset of KVNamespace we use — keeps us off @cloudflare/workers-types.
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  get<T = unknown>(key: string, type: "json"): Promise<T | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

const RUNS_KEY = "meta:runs";
const LAST_KEY = "meta:last-refresh";
const LOCK_KEY = "lock:refresh";
const CURRENT_KEY = "dataset:current";
const PREVIOUS_KEY = "dataset:previous";
const RUNS_HISTORY = 10;

function newRunId(): string {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function readRuns(env: AtlasEnv): Promise<RunRecord[]> {
  const existing = await env.FEATURE_ATLAS_KV.get<RunRecord[]>(RUNS_KEY, "json");
  return Array.isArray(existing) ? existing : [];
}

async function appendRun(env: AtlasEnv, run: RunRecord): Promise<void> {
  const list = await readRuns(env);
  list.push(run);
  const trimmed = list.slice(-RUNS_HISTORY);
  await env.FEATURE_ATLAS_KV.put(RUNS_KEY, JSON.stringify(trimmed));
  await env.FEATURE_ATLAS_KV.put(LAST_KEY, JSON.stringify(run));
}

function diffIds(prev: FeatureRecord[], next: FeatureRecord[]) {
  const prevSet = new Set(prev.map((f) => f.id));
  const nextSet = new Set(next.map((f) => f.id));
  const addedIds: string[] = [];
  const removedIds: string[] = [];
  for (const id of nextSet) if (!prevSet.has(id)) addedIds.push(id);
  for (const id of prevSet) if (!nextSet.has(id)) removedIds.push(id);
  return { addedIds, removedIds };
}

export interface RefreshResult {
  runId: string;
  status: RunRecord["status"];
  count: number;
}

export async function runRefresh(env: AtlasEnv): Promise<RefreshResult> {
  const runId = newRunId();
  const startedAt = new Date().toISOString();

  // Acquire lock — if a refresh is already in flight, skip.
  const existingLock = await env.FEATURE_ATLAS_KV.get(LOCK_KEY);
  if (existingLock) {
    const skipped: RunRecord = {
      runId,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "skipped-locked",
      count: 0,
      addedIds: [],
      removedIds: [],
      error: `lock held by ${existingLock}`,
    };
    await appendRun(env, skipped);
    return { runId, status: "skipped-locked", count: 0 };
  }

  await env.FEATURE_ATLAS_KV.put(LOCK_KEY, runId, { expirationTtl: 600 });

  try {
    const features = await fetchAndParse();

    if (features.length === 0) {
      throw new Error("zero-result-parse");
    }

    const current = await env.FEATURE_ATLAS_KV.get<FeatureDataset>(
      CURRENT_KEY,
      "json",
    );
    const prevFeatures = current?.features ?? [];
    if (prevFeatures.length > 0 && features.length < prevFeatures.length * 0.5) {
      throw new Error(
        `suspicious-shrink: new=${features.length} prev=${prevFeatures.length}`,
      );
    }

    const dataset: FeatureDataset = {
      version: env.ATLAS_VERSION,
      generatedAt: startedAt,
      count: features.length,
      features,
    };

    if (current) {
      await env.FEATURE_ATLAS_KV.put(PREVIOUS_KEY, JSON.stringify(current));
    }
    await env.FEATURE_ATLAS_KV.put(CURRENT_KEY, JSON.stringify(dataset));

    const { addedIds, removedIds } = diffIds(prevFeatures, features);

    const ok: RunRecord = {
      runId,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "ok",
      count: features.length,
      addedIds,
      removedIds,
      error: null,
    };
    await appendRun(env, ok);
    return { runId, status: "ok", count: features.length };
  } catch (err) {
    const failed: RunRecord = {
      runId,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "failed",
      count: 0,
      addedIds: [],
      removedIds: [],
      error: String(err instanceof Error ? err.message : err),
    };
    await appendRun(env, failed);
    return { runId, status: "failed", count: 0 };
  } finally {
    try {
      await env.FEATURE_ATLAS_KV.delete(LOCK_KEY);
    } catch (e) {
      console.error("[scheduled] failed to release lock", e);
    }
  }
}

export interface ScheduledController {
  scheduledTime?: number;
  cron?: string;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

export async function scheduled(
  _event: ScheduledController,
  env: AtlasEnv,
  _ctx: ExecutionContext,
): Promise<void> {
  await runRefresh(env);
}
