// Server-only implementation for digest archive reads.
// Only sends with status ok/partial and trigger != preview are exposed.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface ArchiveListItem {
  id: string;
  sent_at: string;
  subject: string;
  feature_count: number;
  period_end: string;
}

export interface ArchiveFeature {
  id: string;
  name: string;
  category: string;
  status: string;
  tagline: string;
  description: string;
  release_date: string;
}

export interface ArchiveDetail {
  id: string;
  sent_at: string;
  subject: string;
  feature_count: number;
  period_start: string;
  period_end: string;
  catalogued_total: number;
  shipped: ArchiveFeature[];
  catalogued: ArchiveFeature[];
}

export async function listPublishedDigestsImpl(): Promise<ArchiveListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("digest_send_log")
    .select("id,sent_at,subject,feature_count,period_end,trigger,status")
    .neq("trigger", "preview")
    .in("status", ["ok", "partial"])
    .order("sent_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    sent_at: r.sent_at as string,
    subject: (r.subject as string) ?? "What Lovable Shipped",
    feature_count: (r.feature_count as number) ?? 0,
    period_end: r.period_end as string,
  }));
}

export async function getPublishedDigestImpl(id: string): Promise<ArchiveDetail | null> {
  const { data: row, error } = await supabaseAdmin
    .from("digest_send_log")
    .select("id,sent_at,subject,feature_count,period_start,period_end,catalogued_total,shipped_feature_ids,catalogued_feature_ids,trigger,status")
    .eq("id", id)
    .neq("trigger", "preview")
    .in("status", ["ok", "partial"])
    .maybeSingle();
  if (error || !row) return null;

  const shippedIds = ((row.shipped_feature_ids as string[]) ?? []).filter(Boolean);
  const cataloguedIds = ((row.catalogued_feature_ids as string[]) ?? []).filter(Boolean);
  const allIds = Array.from(new Set([...shippedIds, ...cataloguedIds]));

  let features: ArchiveFeature[] = [];
  if (allIds.length > 0) {
    const { data: featureRows } = await supabaseAdmin
      .from("features")
      .select("id,name,category,status,tagline,description,release_date")
      .in("id", allIds);
    features = (featureRows ?? []) as ArchiveFeature[];
  }
  const byId = new Map(features.map((f) => [f.id, f]));
  const shipped = shippedIds.map((id) => byId.get(id)).filter((f): f is ArchiveFeature => Boolean(f));
  const catalogued = cataloguedIds.map((id) => byId.get(id)).filter((f): f is ArchiveFeature => Boolean(f));

  return {
    id: row.id as string,
    sent_at: row.sent_at as string,
    subject: (row.subject as string) ?? "What Lovable Shipped",
    feature_count: (row.feature_count as number) ?? 0,
    period_start: row.period_start as string,
    period_end: row.period_end as string,
    catalogued_total: (row.catalogued_total as number) ?? catalogued.length,
    shipped,
    catalogued,
  };
}

export async function listArchiveIdsForSitemap(): Promise<{ id: string; sent_at: string }[]> {
  try {
    const { data } = await supabaseAdmin
      .from("digest_send_log")
      .select("id,sent_at")
      .neq("trigger", "preview")
      .in("status", ["ok", "partial"])
      .order("sent_at", { ascending: false })
      .limit(500);
    return (data ?? []).map((r) => ({ id: r.id as string, sent_at: r.sent_at as string }));
  } catch {
    return [];
  }
}
