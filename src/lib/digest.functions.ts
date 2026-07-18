import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { createHash } from "crypto";
import type { DigestFeatureRow } from "./digest-email.server";

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const SUBSCRIBE_RATE_LIMIT = 5; // max attempts per hour per IP hash

async function getSupabaseAdmin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().min(5).max(254).regex(EMAIL_RE),
  source: z.enum(["web", "about", "footer"]).default("web"),
});

const tokenSchema = z.object({
  token: z
    .string()
    .min(20)
    .max(128)
    .regex(/^[a-f0-9]+$/i),
});

function hashIp(req: Request): string {
  const fwd =
    req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "unknown";
  const ip = fwd.split(",")[0]!.trim();
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export const subscribeToDigest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => subscribeSchema.parse(d))
  .handler(
    async ({ data }): Promise<{ ok: boolean; message: string; alreadyConfirmed?: boolean }> => {
      const [supabaseAdmin, emailModule] = await Promise.all([
        getSupabaseAdmin(),
        import("./digest-email.server"),
      ]);
      const { renderConfirmEmail, sendEmail } = emailModule;

      // Rate limit
      try {
        const req = getRequest();
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

      const sendFailMsg = "We couldn't send the confirmation email. Please try again in a moment.";

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
          const sent = await sendEmail({ to: email, ...msg, tag: "confirm" });
          if (!sent.ok) {
            console.error("[subscribeToDigest] confirm send failed (reactivate):", sent.error);
            return { ok: false, message: sendFailMsg };
          }
          return { ok: true, message: "Check your inbox for a confirmation link." };
        }
        // pending → re-send confirm
        const msg = renderConfirmEmail(existing.confirm_token);
        const sent = await sendEmail({ to: email, ...msg, tag: "confirm" });
        if (!sent.ok) {
          console.error("[subscribeToDigest] confirm send failed (resend):", sent.error);
          return { ok: false, message: sendFailMsg };
        }
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
      const sent = await sendEmail({ to: email, ...msg, tag: "confirm" });
      if (!sent.ok) {
        console.error("[subscribeToDigest] confirm send failed (new):", sent.error);
        return { ok: false, message: sendFailMsg };
      }
      return { ok: true, message: "Check your inbox to confirm." };
    },
  );

export const confirmDigestSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => tokenSchema.parse(d))
  .handler(
    async ({ data }): Promise<{ ok: boolean; state: "confirmed" | "already" | "invalid" }> => {
      const supabaseAdmin = await getSupabaseAdmin();
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
    },
  );

export const unsubscribeFromDigest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => tokenSchema.parse(d))
  .handler(
    async ({ data }): Promise<{ ok: boolean; state: "unsubscribed" | "already" | "invalid" }> => {
      const supabaseAdmin = await getSupabaseAdmin();
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
    },
  );

export const getDigestStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    confirmed: number;
    pending: number;
    lastSendAt: string | null;
    lastRecipients: number | null;
    senderReady: boolean;
  }> => {
    try {
      const supabaseAdmin = await getSupabaseAdmin();
      const [confRes, pendRes, logRes] = await Promise.all([
        supabaseAdmin
          .from("digest_subscribers")
          .select("id", { count: "exact", head: true })
          .eq("status", "confirmed"),
        supabaseAdmin
          .from("digest_subscribers")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabaseAdmin
          .from("digest_send_log")
          .select("sent_at,recipient_count")
          .order("sent_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
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
      return {
        confirmed: 0,
        pending: 0,
        lastSendAt: null,
        lastRecipients: null,
        senderReady: false,
      };
    }
  },
);

// Shared helper (also used by /api/public/digest-send).
// Splits into two buckets so the digest never conflates "shipped on Lovable"
// with "newly catalogued in the atlas":
//   - shipped: release_date falls inside the window (genuine Lovable launches)
//   - catalogued: entered the atlas in the window (first_seen_at) but the
//     release_date is older — connector backfill, not a new launch
export interface DigestBuckets {
  shipped: DigestFeatureRow[];
  cataloguedTotal: number;
  catalogued: DigestFeatureRow[]; // capped, see CATALOGUED_LIMIT
}

const CATALOGUED_LIMIT = 10;

export async function collectRecentFeatures(days = 7): Promise<DigestBuckets> {
  const supabaseAdmin = await getSupabaseAdmin();
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const sinceDate = sinceIso.slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from("features")
    .select("id,name,category,status,tagline,release_date,first_seen_at")
    .or(`release_date.gte.${sinceDate},first_seen_at.gte.${sinceIso}`)
    .order("release_date", { ascending: false })
    .limit(200);
  if (error || !data) return { shipped: [], cataloguedTotal: 0, catalogued: [] };

  const shipped: DigestFeatureRow[] = [];
  const catalogued: DigestFeatureRow[] = [];
  for (const r of data) {
    const row: DigestFeatureRow = {
      id: r.id,
      name: r.name,
      category: r.category,
      status: r.status,
      tagline: r.tagline,
      release_date: r.release_date,
    };
    const releasedInWindow = r.release_date && r.release_date >= sinceDate;
    const seenInWindow = r.first_seen_at && r.first_seen_at >= sinceIso;
    if (releasedInWindow) shipped.push(row);
    else if (seenInWindow) catalogued.push(row);
  }
  return {
    shipped,
    cataloguedTotal: catalogued.length,
    catalogued: catalogued.slice(0, CATALOGUED_LIMIT),
  };
}

// Admin preview: sends a test digest to one specific address (secured by REFRESH_TOKEN in the route wrapper).
