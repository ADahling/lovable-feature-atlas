import { defineTool } from "@lovable.dev/mcp-js";
import { getMcpFeatureRecords, SITE_ORIGIN } from "../supabase";

export default defineTool({
  name: "catalog_stats",
  title: "Lovable catalog stats",
  description:
    "High-level counts across the Lovable Feature Atlas: total features, breakdown by status, and breakdown by category.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const rows = await getMcpFeatureRecords();
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    }
    const stats = {
      total: rows.length,
      byStatus,
      byCategory,
      site: SITE_ORIGIN,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      structuredContent: stats,
    };
  },
});
