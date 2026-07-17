import { createClient, type SupabaseClient } from "@supabase/supabase-js";
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
export function getPublicSupabase(): SupabaseClient<Database> {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY for MCP Supabase client.",
    );
  }
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

export function rowToFeature(row: FeatureRowSubset): FeatureRecord {
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

export const FEATURE_COLUMNS =
  "id,name,category,status,release_date,pricing,tagline,description,capabilities,use_cases,source,source_url";
