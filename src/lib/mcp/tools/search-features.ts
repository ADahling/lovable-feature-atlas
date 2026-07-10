import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { FEATURE_COLUMNS, getPublicSupabase, rowToFeature } from "../supabase";
import { searchFeatures as searchCore, type SearchableFeature } from "../../search-core";

export default defineTool({
  name: "search_features",
  title: "Search Lovable features",
  description:
    "Hybrid search across the Lovable Feature Atlas. Ranks records by normalized exact matches on title, category, and status first, then weighted keyword hits across tagline, capabilities, use cases, and description, with synonym expansion (e.g. MCP ↔ Model Context Protocol ↔ connector). Returns up to 20 records with a short excerpt of the matched concept. All data is public.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .max(200)
      .optional()
      .describe(
        "Free-text query. Synonyms are expanded automatically (MCP/connector/integration, SSO/authentication, AI/model/image generation, deploy/publish/hosting).",
      ),
    category: z
      .string()
      .trim()
      .max(100)
      .optional()
      .describe("Filter by exact category name (e.g. 'Agents', 'AI', 'Editor')."),
    status: z
      .enum(["GA", "Beta", "Alpha", "Removed", "Deprecated"])
      .optional()
      .describe("Filter by lifecycle status."),
    limit: z.number().int().min(1).max(20).default(20).describe("Max results (capped at 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, status, limit }) => {
    const supabase = getPublicSupabase();
    // When a free-text query is supplied we pull a wider candidate set
    // (filtered by hard category/status only) and rerank in memory with
    // the shared hybrid scorer. Without a query we keep the old
    // release-date-desc listing behavior.
    const candidateLimit = query ? 400 : limit;
    let q = supabase.from("features").select(FEATURE_COLUMNS).limit(candidateLimit);
    if (!query) q = q.order("release_date", { ascending: false });
    if (category) q = q.eq("category", category);
    if (status) q = q.eq("status", status);

    const { data, error } = await q;
    if (error) {
      return {
        content: [{ type: "text", text: `Search failed: ${error.message}` }],
        isError: true,
      };
    }

    const records = (data ?? []).map(rowToFeature);

    if (!query) {
      // No free-text — return the top-N most-recent that match the filters.
      const trimmed = records.slice(0, limit);
      return {
        content: [
          {
            type: "text",
            text:
              trimmed.length === 0
                ? "No matching features."
                : trimmed
                    .map((f) => `• ${f.name} [${f.status}, ${f.category}] — ${f.tagline}\n  ${f.url}`)
                    .join("\n"),
          },
        ],
        structuredContent: { count: trimmed.length, features: trimmed },
      };
    }

    // Hybrid rerank across every candidate.
    const searchable: (SearchableFeature & { url: string; releaseDate: string })[] = records.map(
      (r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        status: r.status,
        tagline: r.tagline,
        description: r.description,
        capabilities: r.capabilities,
        useCases: r.useCases,
        url: r.url,
        releaseDate: r.releaseDate,
      }),
    );
    const hits = searchCore(searchable, query, limit);

    const features = hits.map((h) => ({
      id: h.feature.id,
      name: h.feature.name,
      category: h.feature.category,
      status: h.feature.status,
      tagline: h.feature.tagline ?? "",
      releaseDate: h.feature.releaseDate,
      url: h.feature.url,
      matchedField: h.matchedField,
      excerpt: h.excerpt,
    }));

    return {
      content: [
        {
          type: "text",
          text:
            features.length === 0
              ? "No matching features."
              : features
                  .map(
                    (f) =>
                      `• ${f.name} [${f.status}, ${f.category}] — ${f.tagline}\n  ↳ matched ${f.matchedField}: "${f.excerpt}"\n  ${f.url}`,
                  )
                  .join("\n"),
        },
      ],
      structuredContent: { count: features.length, features },
    };
  },
});
