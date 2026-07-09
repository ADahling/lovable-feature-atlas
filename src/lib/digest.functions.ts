import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { renderConfirmEmail, renderDigestEmail, sendEmail, type DigestFeatureRow } from "./digest-email.server";

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const SUBSCRIBE_RATE_LIMIT = 5; // max attempts per hour per IP hash

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().min(5).max(254).regex(EMAIL_RE),
  source: z.enum(["web", "about", "footer"]).default("web"),
});

const tokenSchema = z.object({ token: z.string().min(20).max(128).regex(/^[a-f0-9]+$/i) });

function hashIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "unknown";
  const ip = fwd.split(",")[0]!.trim();
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export const subscribeToDigest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => subscribeSchema.parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; message: string; alreadyConfirmed?: boolean }> => {
    // Rate limit
    try {
      const req = (globalThis as { Request?: unknown; __request?: Request }).__request as Request | undefined;
      if (req) {
        const ipHash = hashIp(req);
        const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count } = await supabaseAdmin
          .from("digest_subscribe_attempts")
          .select("id", { count: "exact", head: true })
          .eq("ip_hash", ipHash)
          .gte("attempted_at", since);
        if ((count ?? 0) >= SUBSCRIBE_RATE_LIMIT) {
          return { ok: false, message: "Too many attempts. Try again later." };
        }
        await supabaseAdmin.from("digest_subscribe_attempts").insert({ ip_hash: ipHash });
      }
    } catch (err) {
      console.warn("[subscribeToDigest] rate-limit check skipped:", err);
    }

    const email = data.email.trim().toLowerCase();

    // Check existing
    const { data: existing, error: readErr } = await supabaseAdmin
      .from("digest_subscribers")
      .select("id,status,confirm_token")
      .eq("email", email)
      .maybeSingle();
    if (readErr) {
      console.error("[subscribeToDigest] read failed:", readErr.message);
      return { ok: false, message: "Something went wrong. Please try again." };
    }

    if (existing) {
      if (existing.status === "confirmed") {
        return { ok: true, message: "You're already on the list.", alreadyConfirmed: true };
      }
      if (existing.status === "unsubscribed") {
        // Reactivate to pending, mint fresh token, re-send confirm
        const { data: reset, error: updErr } = await supabaseAdmin
          .from("digest_subscribers")
          .update({ status: "pending", unsubscribed_at: null })
          .eq("id", existing.id)
          .select("confirm_token")
          .maybeSingle();
        if (updErr || !reset) {
          return { ok: false, message: "Something went wrong. Please try again." };
        }
        const msg = renderConfirmEmail(reset.confirm_token);
        await sendEmail({ to: email, ...msg, tag: "confirm" });
        return { ok: true, message: "Check your inbox for a confirmation link." };
      }
      // pending → re-send confirm
      const msg = renderConfirmEmail(existing.confirm_token);
      await sendEmail({ to: email, ...msg, tag: "confirm" });
      return { ok: true, message: "Confirmation resent. Check your inbox." };
    }

    // Insert new pending
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("digest_subscribers")
      .insert({ email, source: data.source, status: "pending" })
      .select("confirm_token")
      .maybeSingle();
    if (insErr || !inserted) {
      console.error("[subscribeToDigest] insert failed:", insErr?.message);
      return { ok: false, message: "Something went wrong. Please try again." };
    }
    const msg = renderConfirmEmail(inserted.confirm_token);
    await sendEmail({ to: email, ...msg, tag: "confirm" });
    return { ok: true, message: "Check your inbox to confirm." };
  });

export const confirmDigestSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => tokenSchema.parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; state: "confirmed" | "already" | "invalid" }> => {
    const { data: row, error } = await supabaseAdmin
      .from("digest_subscribers")
      .select("id,status")
      .eq("confirm_token", data.token)
      .maybeSingle();
    if (error || !row) return { ok: false, state: "invalid" };
    if (row.status === "confirmed") return { ok: true, state: "already" };
    if (row.status === "unsubscribed") return { ok: false, state: "invalid" };
    const { error: updErr } = await supabaseAdmin
      .from("digest_subscribers")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updErr) return { ok: false, state: "invalid" };
    return { ok: true, state: "confirmed" };
  });

export const unsubscribeFromDigest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => tokenSchema.parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; state: "unsubscribed" | "already" | "invalid" }> => {
    const { data: row, error } = await supabaseAdmin
      .from("digest_subscribers")
      .select("id,status")
      .eq("unsubscribe_token", data.token)
      .maybeSingle();
    if (error || !row) return { ok: false, state: "invalid" };
    if (row.status === "unsubscribed") return { ok: true, state: "already" };
    const { error: updErr } = await supabaseAdmin
      .from("digest_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updErr) return { ok: false, state: "invalid" };
    return { ok: true, state: "unsubscribed" };
  });

export const getDigestStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ confirmed: number; pending: number; lastSendAt: string | null; lastRecipients: number | null; senderReady: boolean }> => {
    try {
      const [confRes, pendRes, logRes] = await Promise.all([
        supabaseAdmin.from("digest_subscribers").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
        supabaseAdmin.from("digest_subscribers").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabaseAdmin.from("digest_send_log").select("sent_at,recipient_count").order("sent_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      return {
        confirmed: confRes.count ?? 0,
        pending: pendRes.count ?? 0,
        lastSendAt: logRes.data?.sent_at ?? null,
        lastRecipients: logRes.data?.recipient_count ?? null,
        senderReady: Boolean(process.env.DIGEST_SENDER_READY),
      };
    } catch (err) {
      console.error("[getDigestStats] failed:", err);
      return { confirmed: 0, pending: 0, lastSendAt: null, lastRecipients: null, senderReady: false };
    }
  },
);

// Shared helper (also used by /api/public/digest-send)
export async function collectRecentFeatures(days = 7): Promise<DigestFeatureRow[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("features")
    .select("id,name,category,status,tagline,release_date,first_seen_at")
    .or(`first_seen_at.gte.${since},updated_at.gte.${since}`)
    .order("release_date", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    status: r.status,
    tagline: r.tagline,
    release_date: r.release_date,
  }));
}

// Admin preview: sends a test digest to one specific address (secured by REFRESH_TOKEN in the route wrapper).
export { renderDigestEmail };
