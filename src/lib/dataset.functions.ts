import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { FeatureDataset } from "../worker/features-schema";

/**
 * Returns the live dataset from KV via the same-origin /api/features route,
 * or null if unavailable. Never throws.
 */
export const getFeatureDataset = createServerFn({ method: "GET" }).handler(
  async (): Promise<FeatureDataset | null> => {
    try {
      const req = getRequest();
      const url = new URL("/api/features", req.url);
      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const text = await res.text();
      if (!text || text === "null") return null;
      const parsed = JSON.parse(text) as FeatureDataset | null;
      if (!parsed || !Array.isArray(parsed.features) || parsed.features.length === 0) {
        return null;
      }
      return parsed;
    } catch (err) {
      console.error("[getFeatureDataset] failed", err);
      return null;
    }
  },
);

export interface RunSummary {
  runId: string;
  startedAt: string;
  finishedAt: string;
  status: "ok" | "failed" | "skipped-locked";
  count: number;
  addedIds: string[];
  removedIds: string[];
  error: string | null;
}

export const getRefreshRuns = createServerFn({ method: "GET" }).handler(
  async (): Promise<RunSummary[]> => {
    try {
      const req = getRequest();
      const url = new URL("/api/status-runs", req.url);
      const res = await fetch(url.toString());
      if (!res.ok) return [];
      const text = await res.text();
      if (!text) return [];
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? (parsed as RunSummary[]) : [];
    } catch (err) {
      console.error("[getRefreshRuns] failed", err);
      return [];
    }
  },
);
