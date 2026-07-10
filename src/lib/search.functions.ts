// ============================================================================
// search.functions.ts
// ---------------------------------------------------------------------------
// `searchFeatures` server function used by the Oracle overlay. Loads the
// bundled features dataset (already the daily-synced source of truth) and
// runs the shared `search-core` hybrid ranker over the full-fidelity
// records — title, category, status, tagline, description, capabilities,
// use cases — with synonym expansion. Returns at most 20 results with
// small excerpts so the UI can render highlighted matches.
//
// This does not hit the database: the bundled dataset is byte-identical
// to the live table (refreshed by the daily cron), and running in-memory
// keeps the Oracle instant with no cold DB round trip.
// ---------------------------------------------------------------------------

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { searchFeatures as searchCore, type SearchHit } from "./search-core";

export interface OracleHit {
  id: string;
  name: string;
  category: string;
  status: string;
  tagline: string;
  releaseDate: string;
  matchedField: SearchHit["matchedField"];
  excerpt: string;
  excerptHtml: string;
  score: number;
}

const inputSchema = z.object({
  query: z.string().trim().min(1).max(200),
  limit: z.number().int().min(1).max(20).optional().default(20),
});

export const searchFeaturesFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ hits: OracleHit[] }> => {
    const { features } = await import("@/data/features");
    const hits = searchCore(features, data.query, data.limit);
    return {
      hits: hits.map((h) => ({
        id: h.feature.id,
        name: h.feature.name,
        category: h.feature.category,
        status: h.feature.status,
        tagline: h.feature.tagline ?? "",
        releaseDate: h.feature.releaseDate,
        matchedField: h.matchedField,
        excerpt: h.excerpt,
        excerptHtml: h.excerptHtml,
        score: h.score,
      })),
    };
  });
