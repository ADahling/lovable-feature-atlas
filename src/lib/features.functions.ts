import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { features as bundledFeatures, type Feature } from "@/data/features";

/**
 * Card-level projection used by the homepage grid, hero counts, quiz, draw,
 * timeline, and about-page stats. Keeping this narrow shrinks the SSR HTML
 * payload from ~1.2 MB (full records with description + capabilities +
 * use_cases) to ~250 KB (card fields only). Full records are fetched on
 * demand by `getFeatureById` on the detail route.
 */
export type FeatureCard = Pick<
  Feature,
  "id" | "name" | "category" | "status" | "releaseDate" | "pricing" | "icon" | "tagline"
>;

const bundledCards: FeatureCard[] = bundledFeatures.map((f) => ({
  id: f.id,
  name: f.name,
  category: f.category,
  status: f.status,
  releaseDate: f.releaseDate,
  pricing: f.pricing,
  icon: f.icon,
  tagline: f.tagline,
}));

// Public data cache policy — the features dataset changes at most daily
// via the noon cron. Cache aggressively at the edge; browsers still
// revalidate.
const DATA_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const featureIdSchema = z.object({
  id: z.string().min(1).max(120).regex(SLUG_PATTERN),
});

export const getFeatureById = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => featureIdSchema.parse(data))
  .handler(async ({ data }): Promise<{ feature: Feature | null }> => {
    try {
      const { data: row, error } = await supabaseAdmin
        .from("features")
        .select(
          "id,name,category,status,release_date,pricing,icon,tagline,description,capabilities,use_cases,source",
        )
        .eq("id", data.id)
        .maybeSingle();

      if (error) {
        console.error("[getFeatureById] db read failed:", error.message);
        return { feature: null };
      }
      if (!row) return { feature: null };

      const feature: Feature = {
        id: row.id,
        name: row.name,
        category: row.category,
        status: row.status as Feature["status"],
        releaseDate: row.release_date,
        pricing: row.pricing,
        icon: row.icon,
        tagline: row.tagline,
        description: row.description,
        capabilities: Array.isArray(row.capabilities) ? (row.capabilities as string[]) : [],
        useCases: Array.isArray(row.use_cases) ? (row.use_cases as string[]) : [],
        source: row.source,
      };
      return { feature };
    } catch (err) {
      console.error("[getFeatureById] failed:", err);
      return { feature: null };
    }
  });

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
