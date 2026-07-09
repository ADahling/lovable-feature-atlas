import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { FEATURE_COLUMNS, getPublicSupabase, rowToFeature } from "../supabase";

export default defineTool({
  name: "get_feature",
  title: "Get Lovable feature detail",
  description:
    "Fetch the full record for a single Lovable feature by its id (slug). Returns name, category, status, release date, pricing, tagline, description, capabilities, use cases, source, and canonical atlas.dahlingdigital.com URL.",
  inputSchema: {
    id: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be a lowercase slug (e.g. 'agent-mode').")
      .describe("Feature slug/id, e.g. 'agent-mode'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const { data, error } = await getPublicSupabase()
      .from("features")
      .select(FEATURE_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { content: [{ type: "text", text: `Lookup failed: ${error.message}` }], isError: true };
    }
    if (!data) {
      return { content: [{ type: "text", text: `No feature found with id "${id}".` }], isError: true };
    }
    const feature = rowToFeature(data);
    return {
      content: [{ type: "text", text: JSON.stringify(feature, null, 2) }],
      structuredContent: { feature },
    };
  },
});
