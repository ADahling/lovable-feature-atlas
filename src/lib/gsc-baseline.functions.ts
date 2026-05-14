import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface GscBaseline {
  errors: number;
  warnings: number;
  lastDownloaded: string | null;
  updatedAt: string;
}

const SINGLETON_ID = "singleton";

export const getGscBaseline = createServerFn({ method: "GET" }).handler(
  async (): Promise<GscBaseline | null> => {
    const { data, error } = await supabaseAdmin
      .from("gsc_baseline")
      .select("errors, warnings, last_downloaded, updated_at")
      .eq("id", SINGLETON_ID)
      .maybeSingle();

    if (error) {
      console.error("getGscBaseline failed:", error);
      return null;
    }
    if (!data) return null;

    return {
      errors: data.errors ?? 0,
      warnings: data.warnings ?? 0,
      lastDownloaded: data.last_downloaded ?? null,
      updatedAt: data.updated_at,
    };
  },
);

const SetBaselineSchema = z.object({
  errors: z.number().int().min(0).max(1_000_000),
  warnings: z.number().int().min(0).max(1_000_000),
  lastDownloaded: z.string().datetime().nullable().optional(),
});

export const setGscBaseline = createServerFn({ method: "POST" })
  .inputValidator((input) => SetBaselineSchema.parse(input))
  .handler(async ({ data }): Promise<GscBaseline> => {
    const payload = {
      id: SINGLETON_ID,
      errors: data.errors,
      warnings: data.warnings,
      last_downloaded: data.lastDownloaded ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data: row, error } = await supabaseAdmin
      .from("gsc_baseline")
      .upsert(payload, { onConflict: "id" })
      .select("errors, warnings, last_downloaded, updated_at")
      .single();

    if (error) {
      console.error("setGscBaseline failed:", error);
      throw new Error("Could not save baseline");
    }

    return {
      errors: row.errors ?? 0,
      warnings: row.warnings ?? 0,
      lastDownloaded: row.last_downloaded ?? null,
      updatedAt: row.updated_at,
    };
  });
