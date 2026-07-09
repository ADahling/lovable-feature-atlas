import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { FEATURE_COLUMNS, getPublicSupabase, rowToFeature } from "../supabase";

export default defineTool({
  name: "search_features",
  title: "Search Lovable features",
  description:
    "Search the Lovable Feature Atlas catalog by keyword, category, and/or status. Returns matching features with canonical atlas.dahlingdigital.com URLs. All data is public.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .max(200)
      .optional()
      .describe("Case-insensitive keyword matched against feature name, tagline, and description."),
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
    limit: z.number().int().min(1).max(50).default(20).describe("Max results to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, status, limit }) => {
    const supabase = getPublicSupabase();
    let q = supabase
      .from("features")
      .select(FEATURE_COLUMNS)
      .order("release_date", { ascending: false })
      .limit(limit);

    if (category) q = q.eq("category", category);
    if (status) q = q.eq("status", status);
    if (query) {
      const like = `%${query.replace(/[%_]/g, (m) => `\\${m}`)}%`;
      q = q.or(`name.ilike.${like},tagline.ilike.${like},description.ilike.${like}`);
    }

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: `Search failed: ${error.message}` }], isError: true };
    }
    const features = (data ?? []).map(rowToFeature);
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
                      `• ${f.name} [${f.status}, ${f.category}] — ${f.tagline}\n  ${f.url}`,
                  )
                  .join("\n"),
        },
      ],
      structuredContent: { count: features.length, features },
    };
  },
});
