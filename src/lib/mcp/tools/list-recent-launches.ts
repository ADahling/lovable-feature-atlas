import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getMcpFeatureRecords } from "../supabase";

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
    const cutoff = sinceDays
      ? new Date(Date.now() - sinceDays * 86_400_000).toISOString().slice(0, 10)
      : null;
    const features = (await getMcpFeatureRecords())
      .filter((feature) => !status || feature.status === status)
      .filter((feature) => !cutoff || feature.releaseDate >= cutoff)
      .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
      .slice(0, limit);
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
