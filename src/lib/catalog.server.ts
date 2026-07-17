import type { Feature } from "@/data/features";
import type { Database } from "@/integrations/supabase/types";

export const CATALOG_TTL_MS = 5 * 60 * 1000;

export type CatalogSource = "live" | "bundled";

export type FeatureCard = Pick<
  Feature,
  | "id"
  | "name"
  | "category"
  | "status"
  | "releaseDate"
  | "pricing"
  | "icon"
  | "tagline"
>;

export interface CatalogCardsResult {
  features: FeatureCard[];
  generatedAt: string | null;
  source: CatalogSource;
}

export interface CatalogCategorySummary {
  name: string;
  count: number;
}

export interface CatalogSummaryResult {
  total: number;
  categories: CatalogCategorySummary[];
  generatedAt: string | null;
  source: CatalogSource;
}

export interface FeaturePageDataResult {
  feature: Feature | null;
  generatedAt: string | null;
  source: CatalogSource;
}

export interface CategoryCardsResult extends CatalogCardsResult {
  category: string;
}

type FeatureRow = Database["public"]["Tables"]["features"]["Row"];
type CatalogMode = "live" | "bundled";

interface CatalogSnapshot {
  features: Feature[];
  generatedAt: string | null;
  source: CatalogSource;
}

interface CacheEntry {
  expiresAt: number;
  snapshot: CatalogSnapshot;
}

// Module state is intentionally isolate-local. Cloudflare can reuse it across
// requests without requiring a separate cache service, while concurrent cold
// reads share one promise instead of issuing duplicate Supabase queries.
const cacheByMode = new Map<CatalogMode, CacheEntry>();
const inFlightByMode = new Map<CatalogMode, Promise<CatalogSnapshot>>();

function shouldForceBundledFeatures(): boolean {
  return process.env.ATLAS_FORCE_BUNDLED_FEATURES === "true";
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapFeatureRow(row: FeatureRow): Feature {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    status: row.status as Feature["status"],
    releaseDate: row.release_date,
    pricing: row.pricing,
    icon: row.icon,
    tagline: row.tagline,
    description: row.description,
    capabilities: stringArray(row.capabilities),
    useCases: stringArray(row.use_cases),
    source: row.source,
  };
}

function copyFeature(feature: Feature): Feature {
  return {
    ...feature,
    capabilities: [...feature.capabilities],
    useCases: [...feature.useCases],
  };
}

function mapFeatureCard(feature: Feature): FeatureCard {
  return {
    id: feature.id,
    name: feature.name,
    category: feature.category,
    status: feature.status,
    releaseDate: feature.releaseDate,
    pricing: feature.pricing,
    icon: feature.icon,
    tagline: feature.tagline,
  };
}

async function loadBundledSnapshot(): Promise<CatalogSnapshot> {
  const { features } = await import("@/data/features");
  return {
    features: features.map(copyFeature),
    generatedAt: null,
    source: "bundled",
  };
}

async function loadLiveSnapshot(): Promise<CatalogSnapshot> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  try {
    const [featureResult, lastRunResult] = await Promise.all([
      supabaseAdmin
        .from("features")
        .select(
          "id,name,category,status,release_date,pricing,icon,tagline,description,capabilities,use_cases,source",
        )
        .order("release_date", { ascending: false })
        .limit(1000),
      supabaseAdmin
        .from("scrape_runs")
        .select("finished_at")
        .eq("status", "ok")
        .order("finished_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (featureResult.error || !featureResult.data?.length) {
      if (featureResult.error) {
        console.error("[catalog] db read failed:", featureResult.error.message);
      }
      return loadBundledSnapshot();
    }

    if (lastRunResult.error) {
      console.error("[catalog] scrape-run read failed:", lastRunResult.error.message);
    }

    return {
      features: featureResult.data.map(mapFeatureRow),
      generatedAt: lastRunResult.data?.finished_at ?? null,
      source: "live",
    };
  } catch (error) {
    console.error("[catalog] live read failed:", error);
    return loadBundledSnapshot();
  }
}

async function loadSnapshot(mode: CatalogMode): Promise<CatalogSnapshot> {
  return mode === "bundled" ? loadBundledSnapshot() : loadLiveSnapshot();
}

async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  const mode: CatalogMode = shouldForceBundledFeatures() ? "bundled" : "live";
  const now = Date.now();
  const cached = cacheByMode.get(mode);
  if (cached && cached.expiresAt > now) return cached.snapshot;

  const existingRead = inFlightByMode.get(mode);
  if (existingRead) return existingRead;

  const read = loadSnapshot(mode)
    .then((snapshot) => {
      cacheByMode.set(mode, {
        expiresAt: Date.now() + CATALOG_TTL_MS,
        snapshot,
      });
      return snapshot;
    })
    .finally(() => {
      inFlightByMode.delete(mode);
    });

  inFlightByMode.set(mode, read);
  return read;
}

export async function getCatalogCards(): Promise<CatalogCardsResult> {
  const snapshot = await getCatalogSnapshot();
  return {
    features: snapshot.features.map(mapFeatureCard),
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
  };
}

export async function getCatalogSummary(): Promise<CatalogSummaryResult> {
  const snapshot = await getCatalogSnapshot();
  const counts = new Map<string, number>();
  for (const feature of snapshot.features) {
    counts.set(feature.category, (counts.get(feature.category) ?? 0) + 1);
  }

  return {
    total: snapshot.features.length,
    categories: Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
  };
}

export async function getFeaturePageData(id: string): Promise<FeaturePageDataResult> {
  const snapshot = await getCatalogSnapshot();
  const feature = snapshot.features.find((candidate) => candidate.id === id);
  if (feature) {
    return {
      feature: copyFeature(feature),
      generatedAt: snapshot.generatedAt,
      source: snapshot.source,
    };
  }

  // Preserve the legacy detail-read behavior: a live catalog that has not yet
  // received a bundled record can still serve that record from the fallback.
  if (snapshot.source === "live") {
    const bundled = await loadBundledSnapshot();
    const bundledFeature = bundled.features.find((candidate) => candidate.id === id);
    if (bundledFeature) {
      return {
        feature: copyFeature(bundledFeature),
        generatedAt: null,
        source: "bundled",
      };
    }
  }

  return {
    feature: null,
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
  };
}

export async function getCategoryCards(name: string): Promise<CategoryCardsResult> {
  const snapshot = await getCatalogSnapshot();
  return {
    category: name,
    features: snapshot.features
      .filter((feature) => feature.category === name)
      .map(mapFeatureCard),
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
  };
}
