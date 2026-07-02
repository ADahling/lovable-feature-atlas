import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SITE_ORIGIN } from "./canonical-meta";

// Cache scan-history reads: the table is admin-only, but the fetch is exposed
// as a public RPC. Cache for 30s to prevent anonymous callers from hammering
// the database.
type ScansCache = { at: number; payload: { scans: unknown[] } };
let scansCache: ScansCache | null = null;

export const getSeoScans = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  const c = scansCache;
  if (c && now - c.at < 30 * 1000) return c.payload;
  const { data, error } = await supabaseAdmin
    .from("seo_scans")
    .select("*")
    .order("ran_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  const payload = { scans: data ?? [] };
  scansCache = { at: now, payload };
  return payload;
});

const SelfScanInput = z.object({
  url: z
    .string()
    .url()
    .refine(
      (u) => {
        try {
          return new URL(u).origin === SITE_ORIGIN;
        } catch {
          return false;
        }
      },
      { message: `URL must be on ${SITE_ORIGIN}` },
    ),
});

interface SelfFinding {
  finding_id: string;
  name: string;
  category: string;
  level: "low" | "mid" | "high";
  state: "passing" | "failing";
  description: string;
}

function check(html: string, url: string): SelfFinding[] {
  const out: SelfFinding[] = [];
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? "";
  out.push({
    finding_id: "self:title_length",
    name: "Title length",
    category: "meta_title",
    level: "mid",
    state: title.length > 0 && title.length <= 60 ? "passing" : "failing",
    description: `Title is ${title.length} chars (target ≤ 60). "${title.slice(0, 80)}"`,
  });

  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const desc = descMatch?.[1] ?? "";
  out.push({
    finding_id: "self:description_length",
    name: "Description length",
    category: "meta_description",
    level: "mid",
    state: desc.length >= 50 && desc.length <= 160 ? "passing" : "failing",
    description: `Meta description is ${desc.length} chars (target 50–160).`,
  });

  const ogTitle = /<meta[^>]+property=["']og:title["']/i.test(html);
  const ogDesc = /<meta[^>]+property=["']og:description["']/i.test(html);
  const ogImage = /<meta[^>]+property=["']og:image["']/i.test(html);
  const ogType = /<meta[^>]+property=["']og:type["']/i.test(html);
  const missingOg = [
    !ogTitle && "og:title",
    !ogDesc && "og:description",
    !ogImage && "og:image",
    !ogType && "og:type",
  ].filter(Boolean);
  out.push({
    finding_id: "self:open_graph",
    name: "Open Graph coverage",
    category: "social",
    level: "low",
    state: missingOg.length === 0 ? "passing" : "failing",
    description:
      missingOg.length === 0
        ? "All core Open Graph tags present."
        : `Missing: ${missingOg.join(", ")}.`,
  });

  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
  out.push({
    finding_id: "self:h1_count",
    name: "Single H1",
    category: "headings",
    level: "mid",
    state: h1Count === 1 ? "passing" : "failing",
    description: `Found ${h1Count} <h1> element(s) (expected 1).`,
  });

  const canonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  out.push({
    finding_id: "self:canonical",
    name: "Canonical link",
    category: "canonical",
    level: "mid",
    state: canonical ? "passing" : "failing",
    description: canonical ? `Canonical present.` : `No <link rel="canonical"> on ${url}.`,
  });

  const jsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
  out.push({
    finding_id: "self:json_ld",
    name: "Structured data (JSON-LD)",
    category: "structured_data",
    level: "low",
    state: jsonLd ? "passing" : "failing",
    description: jsonLd ? "JSON-LD block detected." : "No JSON-LD structured data found.",
  });

  return out;
}

export const runSelfSeoScan = createServerFn({ method: "POST" })
  .inputValidator((input) => SelfScanInput.parse(input))
  .handler(async ({ data }) => {
    // Abuse guard: this endpoint is publicly callable from the SEO audit
    // dashboard and writes to seo_scans via the service role. Cap inserts
    // to 1 per 60s and 20 per hour globally to prevent anonymous flooding.
    const now = Date.now();
    const sixtySecondsAgo = new Date(now - 60 * 1000).toISOString();
    const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();

    const { count: recentCount, error: recentErr } = await supabaseAdmin
      .from("seo_scans")
      .select("id", { count: "exact", head: true })
      .eq("source", "self_scan")
      .gte("ran_at", sixtySecondsAgo);
    if (recentErr) throw new Error(recentErr.message);
    if ((recentCount ?? 0) >= 1) {
      throw new Error("Rate limited: please wait a moment before scanning again.");
    }

    const { count: hourCount, error: hourErr } = await supabaseAdmin
      .from("seo_scans")
      .select("id", { count: "exact", head: true })
      .eq("source", "self_scan")
      .gte("ran_at", oneHourAgo);
    if (hourErr) throw new Error(hourErr.message);
    if ((hourCount ?? 0) >= 20) {
      throw new Error("Hourly self-scan quota reached. Try again later.");
    }

    let html = "";
    let fetchError: string | null = null;
    try {
      const res = await fetch(data.url, {
        headers: { "User-Agent": "AtlasSEO/1.0 (+self-scan)" },
      });
      if (!res.ok) {
        fetchError = `Fetch returned ${res.status}`;
      } else {
        html = await res.text();
      }
    } catch (e) {
      fetchError = e instanceof Error ? e.message : "Fetch failed";
    }

    const findings = fetchError ? [] : check(html, data.url);
    const failing = findings.filter((f) => f.state === "failing").length;
    const passing = findings.filter((f) => f.state === "passing").length;

    const { error, data: row } = await supabaseAdmin
      .from("seo_scans")
      .insert({
        source: "self_scan",
        url: data.url,
        failing_count: failing,
        passing_count: passing,
        ignored_count: 0,
        findings: JSON.parse(JSON.stringify(findings)),
        summary: fetchError ?? `Self-scan: ${failing} failing, ${passing} passing.`,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, failing, passing, error: fetchError };
  });
