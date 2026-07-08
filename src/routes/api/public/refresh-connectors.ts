import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeForDedup, DEDUP_WINDOW_DAYS } from "./refresh-features";

const DOCS_URL = "https://docs.lovable.dev/integrations/introduction";

const ConnectorItem = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(8).max(600).optional().nullable(),
  category: z.string().optional().nullable(),
  source_url: z.string().url().optional().nullable(),
});
type ConnectorItem = z.infer<typeof ConnectorItem>;

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    connectors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Display name of the connector/integration" },
          description: { type: "string", description: "One-sentence description" },
          category: { type: "string", description: "Grouping heading it appears under" },
          source_url: { type: "string", description: "Deep link to that connector's docs page" },
        },
        required: ["name"],
      },
    },
  },
  required: ["connectors"],
};

const EXTRACTION_PROMPT =
  "Extract every distinct third-party integration or connector listed on this page. For each: name, short description, grouping heading, and the deep link to that connector's docs page when present.";

async function firecrawlScrape(url: string): Promise<ConnectorItem[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      onlyMainContent: true,
      formats: [
        { type: "json", prompt: EXTRACTION_PROMPT, schema: EXTRACTION_SCHEMA },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firecrawl scrape ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    data?: { json?: { connectors?: unknown[] } };
  };
  const raw = json.data?.json?.connectors ?? [];
  const out: ConnectorItem[] = [];
  for (const r of raw) {
    const parsed = ConnectorItem.safeParse(r);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

function connectorId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  if (!slug) return "";
  return slug.endsWith("-connector") ? slug : `${slug}-connector`;
}

function withinWindow(a: string, b: string, days: number): boolean {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (Number.isNaN(da) || Number.isNaN(db)) return false;
  return Math.abs(da - db) <= days * 86_400_000;
}

export const Route = createFileRoute("/api/public/refresh-connectors")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const provided = request.headers.get("apikey") ?? "";
        const expected = process.env.REFRESH_TOKEN ?? "";
        if (!expected) return new Response("Server misconfigured", { status: 500 });
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (
          a.length !== b.length ||
          !(await import("crypto")).timingSafeEqual(a, b)
        ) {
          return new Response("Unauthorized", { status: 401 });
        }

        const runStart = new Date().toISOString();
        const today = runStart.slice(0, 10);
        const skipped: Array<{ name: string; reason: string }> = [];
        const added: string[] = [];

        try {
          const { data: existing, error: existingErr } = await supabaseAdmin
            .from("features")
            .select("id,name,release_date");
          if (existingErr) throw existingErr;

          const existingIds = new Set((existing ?? []).map((r) => r.id));
          const existingNorm = new Map<string, string[]>();
          for (const r of existing ?? []) {
            const key = normalizeForDedup(r.name);
            if (!key) continue;
            const arr = existingNorm.get(key) ?? [];
            arr.push(r.release_date);
            existingNorm.set(key, arr);
          }

          const items = await firecrawlScrape(DOCS_URL);

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
          for (const item of items) {
            const id = connectorId(item.name);
            if (!id) continue;
            if (existingIds.has(id)) {
              skipped.push({ name: item.name, reason: "id_exists" });
              continue;
            }
            const normKey = normalizeForDedup(item.name);
            const collisions = existingNorm.get(normKey) ?? [];
            if (
              normKey &&
              collisions.some((d) => withinWindow(d, today, DEDUP_WINDOW_DAYS))
            ) {
              console.log(
                `[refresh-connectors] dedup skip: "${item.name}" matches normalized "${normKey}"`,
              );
              skipped.push({ name: item.name, reason: "dedup_window" });
              continue;
            }
            existingIds.add(id);
            existingNorm.set(normKey, [...collisions, today]);

            const description = (item.description ?? `${item.name} connector for Lovable.`).slice(0, 1000);
            toInsert.push({
              id,
              name: item.name,
              category: "App Connectors",
              status: "GA",
              release_date: today,
              pricing: "All plans",
              icon: "🔌",
              tagline: description.slice(0, 240),
              description,
              capabilities: [],
              use_cases: [],
              source: item.source_url ?? DOCS_URL,
              source_url: item.source_url ?? DOCS_URL,
            });
          }

          if (toInsert.length > 0) {
            const { error: insErr } = await supabaseAdmin
              .from("features")
              .insert(toInsert);
            if (insErr) throw insErr;
            for (const r of toInsert) added.push(r.id);
          }

          await supabaseAdmin.from("scrape_runs").insert({
            started_at: runStart,
            finished_at: new Date().toISOString(),
            status: added.length > 0 ? "ok" : "skipped",
            source: "connectors",
            added_count: added.length,
            scanned_count: items.length,
            added_ids: added,
            error: null,
          });

          return Response.json({
            ok: true,
            scanned: items.length,
            added,
            skipped,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[refresh-connectors] failed:", msg);
          await supabaseAdmin.from("scrape_runs").insert({
            started_at: runStart,
            finished_at: new Date().toISOString(),
            status: "failed",
            source: "connectors",
            added_count: 0,
            scanned_count: 0,
            added_ids: [],
            error: msg.slice(0, 500),
          });
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
      GET: async () =>
        Response.json({
          message: "POST with the apikey header to trigger a connector sync.",
        }),
    },
  },
});
