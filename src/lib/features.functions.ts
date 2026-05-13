import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { features as bundledFeatures, type Feature } from "@/data/features";

export const getFeatures = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    features: Feature[];
    generatedAt: string | null;
    source: "live" | "bundled";
  }> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("features")
        .select(
          "id,name,category,status,release_date,pricing,icon,tagline,description,capabilities,use_cases,source",
        )
        .order("release_date", { ascending: false })
        .limit(1000);

      if (error || !data || data.length === 0) {
        if (error) console.error("[getFeatures] db read failed:", error.message);
        return { features: bundledFeatures, generatedAt: null, source: "bundled" };
      }

      const features: Feature[] = data.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        status: row.status as Feature["status"],
        releaseDate: row.release_date,
        pricing: row.pricing,
        icon: row.icon,
        tagline: row.tagline,
        description: row.description,
        capabilities: Array.isArray(row.capabilities)
          ? (row.capabilities as string[])
          : [],
        useCases: Array.isArray(row.use_cases) ? (row.use_cases as string[]) : [],
        source: row.source,
      }));

      const { data: lastRun } = await supabaseAdmin
        .from("scrape_runs")
        .select("finished_at")
        .eq("status", "ok")
        .order("finished_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        features,
        generatedAt: lastRun?.finished_at ?? null,
        source: "live",
      };
    } catch (err) {
      console.error("[getFeatures] failed:", err);
      return { features: bundledFeatures, generatedAt: null, source: "bundled" };
    }
  },
);
