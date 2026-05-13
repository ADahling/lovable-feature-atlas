import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const KNOWN_CATEGORIES = [
  "Agent",
  "AI Models",
  "App Connectors",
  "Cloud",
  "Community",
  "Deploy",
  "Editor",
  "Integrations",
  "MCP Connectors",
  "Mobile",
  "Publishing",
  "Security",
  "Testing",
  "Workflow",
  "Workspace",
] as const;

const FeatureCandidate = z.object({
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(60),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tagline: z.string().min(8).max(280),
  description: z.string().min(20).max(2000),
  capabilities: z.array(z.string().min(2).max(200)).max(10).default([]),
  source_url: z.string().url().optional().nullable(),
});

type FeatureCandidate = z.infer<typeof FeatureCandidate>;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function normalizeCategory(input: string): string {
  const lower = input.toLowerCase();
  for (const c of KNOWN_CATEGORIES) {
    if (c.toLowerCase() === lower) return c;
  }
  for (const c of KNOWN_CATEGORIES) {
    if (lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower)) return c;
  }
  return "Editor";
}

interface SourceConfig {
  id: string;
  url: string;
  prompt: string;
  formats: Array<
    | string
    | { type: "json"; prompt: string; schema: Record<string, unknown> }
  >;
  endpoint: "scrape" | "crawl" | "search";
  query?: string;
  limit?: number;
}

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    features: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: {
            type: "string",
            description: `One of: ${KNOWN_CATEGORIES.join(", ")}`,
          },
          release_date: {
            type: "string",
            description: "ISO date YYYY-MM-DD. If only month is given, use the 1st.",
          },
          tagline: {
            type: "string",
            description: "Single declarative sentence under 140 chars.",
          },
          description: {
            type: "string",
            description: "1-2 paragraph description.",
          },
          capabilities: {
            type: "array",
            items: { type: "string" },
            description: "Up to 6 short capability bullet points.",
          },
          source_url: { type: "string" },
        },
        required: ["name", "category", "release_date", "tagline", "description"],
      },
    },
  },
  required: ["features"],
};

const EXTRACTION_PROMPT = `Extract every distinct Lovable platform feature, beta, or product release announcement from this page. For each, capture the launch date (YYYY-MM-DD; use the 1st of the month if only month is known), a one-sentence tagline, a short description, and up to 6 capabilities. Set category to one of: ${KNOWN_CATEGORIES.join(", ")}. Skip blog posts, customer stories, hiring posts, and pricing changes. Only return real shipped features.`;

const SOURCES: SourceConfig[] = [
  {
    id: "changelog",
    url: "https://lovable.dev/changelog",
    prompt: EXTRACTION_PROMPT,
    endpoint: "scrape",
    formats: [
      { type: "json", prompt: EXTRACTION_PROMPT, schema: EXTRACTION_SCHEMA },
    ],
  },
  {
    id: "docs",
    url: "https://docs.lovable.dev",
    prompt: EXTRACTION_PROMPT,
    endpoint: "crawl",
    limit: 30,
    formats: [
      { type: "json", prompt: EXTRACTION_PROMPT, schema: EXTRACTION_SCHEMA },
    ],
  },
  {
    id: "twitter",
    url: "",
    prompt: EXTRACTION_PROMPT,
    endpoint: "search",
    query: "site:x.com lovable_dev new feature OR launch OR shipped",
    limit: 5,
    formats: ["markdown"],
  },
];

interface RawCandidate {
  name?: string;
  category?: string;
  release_date?: string;
  tagline?: string;
  description?: string;
  capabilities?: string[];
  source_url?: string | null;
}

async function callFirecrawl(path: string, body: unknown): Promise<unknown> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");
  const res = await fetch(`https://api.firecrawl.dev/v2/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firecrawl ${path} ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

function extractFeaturesFromResult(result: unknown): RawCandidate[] {
  if (!result || typeof result !== "object") return [];
  const r = result as Record<string, unknown>;

  // v2 scrape: { success, data: { json: { features: [...] }, ... } }
  const data = (r.data ?? r) as Record<string, unknown>;
  const json = data.json as { features?: RawCandidate[] } | undefined;
  if (json?.features && Array.isArray(json.features)) return json.features;

  // crawl: { data: [{ json: { features: [...] } }, ...] }
  if (Array.isArray(data)) {
    return data.flatMap((page) => {
      const pj = (page as { json?: { features?: RawCandidate[] } }).json;
      return pj?.features ?? [];
    });
  }
  if (Array.isArray(r.data)) {
    return r.data.flatMap((page) => {
      const pj = (page as { json?: { features?: RawCandidate[] } }).json;
      return pj?.features ?? [];
    });
  }
  return [];
}

async function scrapeSource(source: SourceConfig): Promise<RawCandidate[]> {
  if (source.endpoint === "scrape") {
    const result = await callFirecrawl("scrape", {
      url: source.url,
      formats: source.formats,
      onlyMainContent: true,
    });
    return extractFeaturesFromResult(result);
  }
  if (source.endpoint === "crawl") {
    const result = await callFirecrawl("crawl", {
      url: source.url,
      limit: source.limit ?? 30,
      scrapeOptions: { formats: source.formats, onlyMainContent: true },
    });
    return extractFeaturesFromResult(result);
  }
  // Twitter search returns markdown; skip structured extraction for now.
  // We just collect URLs as future signal — not auto-published.
  return [];
}

export const Route = createFileRoute("/api/public/refresh-features")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const provided = request.headers.get("apikey") ?? "";
        const expected = process.env.REFRESH_TOKEN ?? "";
        if (!expected) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (
          a.length !== b.length ||
          !(await import("crypto")).timingSafeEqual(a, b)
        ) {
          return new Response("Unauthorized", { status: 401 });
        }

        const runStart = new Date().toISOString();
        const summary = {
          started_at: runStart,
          sources: [] as Array<{
            source: string;
            scanned: number;
            added: number;
            added_ids: string[];
            error: string | null;
          }>,
        };

        // Load existing IDs once
        const { data: existing, error: existingErr } = await supabaseAdmin
          .from("features")
          .select("id");
        if (existingErr) {
          console.error("[refresh-features] db read failed:", existingErr);
          return Response.json(
            { ok: false, error: "db_read_failed" },
            { status: 500 },
          );
        }
        const existingIds = new Set((existing ?? []).map((r) => r.id));

        for (const source of SOURCES) {
          const sourceLog = {
            source: source.id,
            scanned: 0,
            added: 0,
            added_ids: [] as string[],
            error: null as string | null,
          };
          try {
            const candidates = await scrapeSource(source);
            sourceLog.scanned = candidates.length;

            const toInsert: Array<{
              id: string;
              name: string;
              category: string;
              status: string;
              release_date: string;
              pricing: string;
              icon: string;
              tagline: string;
              description: string;
              capabilities: string[];
              use_cases: string[];
              source: string;
              source_url: string | null;
            }> = [];
            for (const raw of candidates) {
              const parsed = FeatureCandidate.safeParse({
                ...raw,
                capabilities: raw.capabilities ?? [],
              });
              if (!parsed.success) continue;
              const c: FeatureCandidate = parsed.data;
              const id = slugify(c.name);
              if (!id || existingIds.has(id)) continue;
              existingIds.add(id);
              toInsert.push({
                id,
                name: c.name,
                category: normalizeCategory(c.category),
                status: "Beta",
                release_date: c.release_date,
                pricing: "All plans",
                icon: "✨",
                tagline: c.tagline,
                description: c.description,
                capabilities: c.capabilities,
                use_cases: [],
                source: source.url || `firecrawl:${source.id}`,
                source_url: c.source_url ?? source.url ?? null,
              });
            }

            // Suspicious shrink guard for the changelog source
            if (source.id === "changelog" && candidates.length > 0) {
              if (candidates.length < 5) {
                sourceLog.error = `low yield: only ${candidates.length} candidates parsed`;
              }
            }

            if (toInsert.length > 0) {
              const { error: insErr } = await supabaseAdmin
                .from("features")
                .insert(toInsert);
              if (insErr) {
                console.error(`[refresh-features] insert failed (${source.id}):`, insErr);
                sourceLog.error = "insert_failed";
              } else {
                sourceLog.added = toInsert.length;
                sourceLog.added_ids = toInsert.map((r) => r.id);
              }
            }
          } catch (err) {
            console.error(`[refresh-features] source ${source.id} failed:`, err);
            sourceLog.error = "source_failed";
          }
          summary.sources.push(sourceLog);

          await supabaseAdmin.from("scrape_runs").insert({
            started_at: runStart,
            finished_at: new Date().toISOString(),
            status: sourceLog.error
              ? "failed"
              : sourceLog.added > 0
                ? "ok"
                : "skipped",
            source: source.id,
            added_count: sourceLog.added,
            scanned_count: sourceLog.scanned,
            added_ids: sourceLog.added_ids,
            error: sourceLog.error,
          });
        }

        return Response.json({ ok: true, ...summary });
      },
      GET: async () => {
        return Response.json({
          message: "POST with the apikey header to trigger a scrape run.",
        });
      },
    },
  },
});
