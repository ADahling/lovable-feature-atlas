/**
 * /llms-full.txt — complete machine-readable catalog dump.
 * One entry per feature so an LLM can ingest the entire atlas in a single fetch.
 * Sourced from the live features table with bundled fallback.
 */

import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { canonicalUrl } from "../lib/canonical-meta";
import { supabaseAdmin } from "../integrations/supabase/client.server";
import { features as bundledFeatures, type Feature } from "../data/features";
import { fmtMonthDayYearUTC } from "../lib/format-date";

async function loadFeatures(): Promise<Feature[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("features")
      .select(
        "id,name,category,status,release_date,pricing,icon,tagline,description,capabilities,use_cases,source",
      )
      .order("release_date", { ascending: false })
      .limit(2000);
    if (error || !data || data.length === 0) return bundledFeatures;
    return data.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      status: r.status as Feature["status"],
      releaseDate: r.release_date,
      pricing: r.pricing,
      icon: r.icon,
      tagline: r.tagline,
      description: r.description,
      capabilities: Array.isArray(r.capabilities) ? (r.capabilities as string[]) : [],
      useCases: Array.isArray(r.use_cases) ? (r.use_cases as string[]) : [],
      source: r.source,
    }));
  } catch (err) {
    console.error("[llms-full.txt] db read failed, using bundled fallback:", err);
    return bundledFeatures;
  }
}

function firstSentence(text: string): string {
  const s = text.trim();
  const m = s.match(/^(.+?[.!?])(\s|$)/);
  return (m ? m[1] : s).trim();
}

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        const list = await loadFeatures();
        const sorted = [...list].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));

        const lines: string[] = [];
        lines.push("# Lovable Feature Atlas — Full Catalog");
        lines.push("");
        lines.push(
          `> Complete machine-readable dump of every tracked Lovable feature (${sorted.length} entries), sorted newest first. Index: ${canonicalUrl("/llms.txt")}`,
        );
        lines.push("");
        lines.push(
          "Fields per entry: name, status (GA / Beta / Removed), category, release date, plan, one-line description, canonical URL.",
        );
        lines.push("");
        lines.push("## Features");
        lines.push("");
        for (const f of sorted) {
          const url = canonicalUrl(`/features/${f.id}`);
          const desc = firstSentence(f.description || f.tagline);
          lines.push(`### ${f.name}`);
          lines.push(`- Status: ${f.status}`);
          lines.push(`- Category: ${f.category}`);
          lines.push(`- Released: ${fmtMonthDayYearUTC(f.releaseDate)}`);
          lines.push(`- Plan: ${f.pricing}`);
          lines.push(`- Description: ${desc}`);
          lines.push(`- URL: ${url}`);
          lines.push("");
        }

        return new Response(lines.join("\n"), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});
