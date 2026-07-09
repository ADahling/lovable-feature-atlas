/**
 * /llms.txt — machine-readable index for LLM/AI-search crawlers.
 * Generated dynamically from the live features table so the counts and
 * recent-launches list can never drift from what the site actually shows.
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
    console.error("[llms.txt] db read failed, using bundled fallback:", err);
    return bundledFeatures;
  }
}

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const list = await loadFeatures();
        const total = list.length;
        const recent = [...list]
          .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
          .slice(0, 5);

        const lines: string[] = [];
        lines.push("# Lovable Feature Atlas");
        lines.push("");
        lines.push(
          `> The complete, current catalog of every Lovable feature, beta, and release — ${total} entries and self-updating. Built for ambassadors, builders, and teams evaluating Lovable as a platform.`,
        );
        lines.push("");
        lines.push(
          "The Lovable Feature Atlas is an independent, editorial reference maintained by Alicia Dahling (Dahling Digital, Lovable Ambassador). It tracks every shipped feature across Agent Mode, Plan Mode, Lovable Cloud, AI Gateway, MCP Connectors, Mobile, Publishing, Security, Workflow, and more — including release dates, pricing tiers, capabilities, and use cases.",
        );
        lines.push("");
        lines.push(
          "Each feature entry includes a tagline, description, capability bullets, target use cases, and a primary source link (docs, changelog, or launch post).",
        );
        lines.push("");
        lines.push("## Pages");
        lines.push("");
        lines.push(
          `- [Home — Feature Atlas](${canonicalUrl("/")}): Browse every Lovable feature with filters by status (GA, Beta, Removed), category, and pricing tier. Grid and chronological timeline views.`,
        );
        lines.push(
          `- [About — Curator and methodology](${canonicalUrl("/about")}): Who maintains the atlas, how features are sourced, and independence disclosure.`,
        );
        lines.push(
          `- [Quiz — How many Lovable features have you used?](${canonicalUrl("/quiz")}): Self-assessment with a shareable score card.`,
        );
        lines.push(
          `- [Draw — Daily feature card](${canonicalUrl("/draw")}): Tarot-style draw from the atlas with high-res PNG export.`,
        );
        lines.push(
          `- [Full catalog dump](${canonicalUrl("/llms-full.txt")}): Machine-readable list of every feature (name, status, category, release date, description, canonical URL) in a single fetch.`,
        );
        lines.push("");
        lines.push("## Recent launches");
        lines.push("");
        for (const f of recent) {
          lines.push(
            `- [${f.name}](${canonicalUrl(`/features/${f.id}`)}) — ${f.status}, ${f.category}, released ${fmtMonthDayYearUTC(f.releaseDate)}. ${f.tagline}`,
          );
        }
        lines.push("");
        lines.push("## MCP server");
        lines.push("");
        lines.push(
          "The atlas is also a live MCP (Model Context Protocol) server. Any AI assistant that speaks MCP can query the catalog directly instead of relying on training-cutoff snapshots. Public, read-only, no authentication required.",
        );
        lines.push("");
        lines.push(`- Endpoint: ${canonicalUrl("/mcp")}`);
        lines.push("- Tools:");
        lines.push("  - search_features — keyword / category / status search");
        lines.push("  - get_feature — full detail for a single feature by id");
        lines.push("  - list_recent_launches — most recent releases, newest first");
        lines.push("  - catalog_stats — totals by status, category, and pricing tier");
        lines.push("");
        lines.push("## Maintainer");
        lines.push("");
        lines.push(
          "Curated by Alicia Dahling — Dahling Digital, Lovable Ambassador. Built on Lovable.",
        );
        lines.push("");

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
