import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { FEATURE_COLUMNS, getPublicSupabase, rowToFeature } from "../supabase";

export default defineTool({
  name: "list_recent_launches",
  title: "List recent Lovable launches",
  description:
    "Return the most recent Lovable features by release date, newest first. Optionally filter by status (e.g. GA-only).",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10),
    status: z.enum(["GA", "Beta", "Alpha"]).optional().describe("Filter by lifecycle status."),
    sinceDays: z
      .number()
      .int()
      .min(1)
      .max(3650)
      .optional()
      .describe("Only include features released in the last N days."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status, sinceDays }) => {
    let q = getPublicSupabase()
      .from("features")
      .select(FEATURE_COLUMNS)
      .order("release_date", { ascending: false })
      .limit(limit);

    if (status) q = q.eq("status", status);
    if (sinceDays) {
      const cutoff = new Date(Date.now() - sinceDays * 86_400_000).toISOString().slice(0, 10);
      q = q.gte("release_date", cutoff);
    }

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: `Query failed: ${error.message}` }], isError: true };
    }
    const features = (data ?? []).map(rowToFeature);
    return {
      content: [
        {
          type: "text",
          text: features
            .map((f) => `${f.releaseDate}  ${f.name} [${f.status}] — ${f.url}`)
            .join("\n"),
        },
      ],
      structuredContent: { count: features.length, features },
    };
  },
});
