import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

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
