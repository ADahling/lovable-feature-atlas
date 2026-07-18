import type { SupabaseClient } from "@supabase/supabase-js";
import type { Feature } from "@/data/features";
import type { Database } from "@/integrations/supabase/types";

export const SITE_ORIGIN = "https://atlas.dahlingdigital.com";

function featureUrl(id: string): string {
  return `${SITE_ORIGIN}/features/${id}`;
}

let _client: SupabaseClient<Database> | undefined;

// Public read-only Supabase client for MCP tools. Uses the publishable key,
// so RLS runs as `anon` — every tool returns only intentionally public data.
// NEVER swap this for the service-role key: the MCP server is unauthenticated
// and would leak the entire database to any caller on the internet.
async function getPublicSupabase(): Promise<SupabaseClient<Database>> {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY for MCP Supabase client.");
  }
  const { createClient } = await import("@supabase/supabase-js");
  _client = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export interface FeatureRecord {
  id: string;
  name: string;
  category: string;
  status: string;
  releaseDate: string;
  pricing: string;
  tagline: string;
  description: string;
  capabilities: string[];
  useCases: string[];
  source: string;
  sourceUrl: string | null;
  url: string;
}

type Row = Database["public"]["Tables"]["features"]["Row"];
type FeatureRowSubset = Pick<
  Row,
  | "id"
  | "name"
  | "category"
  | "status"
  | "release_date"
  | "pricing"
  | "tagline"
  | "description"
  | "capabilities"
  | "use_cases"
  | "source"
  | "source_url"
>;

function rowToFeature(row: FeatureRowSubset): FeatureRecord {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    status: row.status,
    releaseDate: row.release_date,
    pricing: row.pricing,
    tagline: row.tagline,
    description: row.description,
    capabilities: Array.isArray(row.capabilities) ? (row.capabilities as string[]) : [],
    useCases: Array.isArray(row.use_cases) ? (row.use_cases as string[]) : [],
    source: row.source,
    sourceUrl: row.source_url,
    url: featureUrl(row.id),
  };
}

const FEATURE_COLUMNS =
  "id,name,category,status,release_date,pricing,tagline,description,capabilities,use_cases,source,source_url";

const MCP_CATALOG_TTL_MS = 5 * 60 * 1000;
let cachedRecords:
  | { mode: "live" | "bundled"; expiresAt: number; records: FeatureRecord[] }
  | undefined;
let inFlightRecords: Promise<FeatureRecord[]> | undefined;

function bundledFeatureToRecord(feature: Feature): FeatureRecord {
  return {
    id: feature.id,
    name: feature.name,
    category: feature.category,
    status: feature.status,
    releaseDate: feature.releaseDate,
    pricing: feature.pricing,
    tagline: feature.tagline,
    description: feature.description,
    capabilities: [...feature.capabilities],
    useCases: [...feature.useCases],
    source: feature.source,
    sourceUrl: feature.source,
    url: featureUrl(feature.id),
  };
}

async function loadBundledRecords(): Promise<FeatureRecord[]> {
  const { features } = await import("@/data/features");
  return features.map(bundledFeatureToRecord);
}

async function loadLiveRecords(): Promise<FeatureRecord[]> {
  const supabase = await getPublicSupabase();
  const { data, error } = await supabase.from("features").select(FEATURE_COLUMNS).limit(1000);
  if (error || !data?.length) {
    throw new Error(error?.message ?? "The public feature catalog is empty.");
  }
  return data.map(rowToFeature);
}

/**
 * Shared MCP catalog read. Production uses the public anon client so RLS
 * remains the security boundary; local/CI and transient read failures use the
 * same daily-synced bundled catalog as the website.
 */
export async function getMcpFeatureRecords(): Promise<FeatureRecord[]> {
  const hasPublicConfig = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
  const mode: "live" | "bundled" =
    process.env.ATLAS_FORCE_BUNDLED_FEATURES === "true" || !hasPublicConfig ? "bundled" : "live";
  const now = Date.now();

  if (cachedRecords?.mode === mode && cachedRecords.expiresAt > now) {
    return cachedRecords.records;
  }
  if (inFlightRecords) return inFlightRecords;

  inFlightRecords = (
    mode === "live" ? loadLiveRecords().catch(loadBundledRecords) : loadBundledRecords()
  )
    .then((records) => {
      cachedRecords = { mode, expiresAt: Date.now() + MCP_CATALOG_TTL_MS, records };
      return records;
    })
    .finally(() => {
      inFlightRecords = undefined;
    });

  return inFlightRecords;
}
