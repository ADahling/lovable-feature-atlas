import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { collectRecentFeatures } from "@/lib/digest.functions";
import { renderDigestEmail, sendEmail } from "@/lib/digest-email.server";

function authorize(request: Request): Response | null {
  const expected = process.env.REFRESH_TOKEN ?? "";
  if (!expected) return new Response("Server misconfigured", { status: 500 });
  const provided = request.headers.get("apikey") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export const Route = createFileRoute("/api/public/digest-send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauth = authorize(request);
        if (unauth) return unauth;

        let mode: "send" | "preview" = "send";
        let previewTo: string | null = null;
        try {
          const body = (await request.json().catch(() => ({}))) as { preview?: boolean; to?: string };
          if (body.preview) {
            mode = "preview";
            if (typeof body.to === "string" && body.to.length > 3) previewTo = body.to.trim().toLowerCase();
          }
        } catch { /* ignore */ }

        const periodEnd = new Date();
        const periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const features = await collectRecentFeatures(7);

        // Preview: send once to `to` using the caller-provided address.
        if (mode === "preview") {
          if (!previewTo) return Response.json({ ok: false, error: "preview requires { to }" }, { status: 400 });
          // Use a synthetic unsubscribe token so the preview link isn't valid.
          const msg = renderDigestEmail(features, "preview-token-not-valid", periodEnd.toISOString());
          const res = await sendEmail({ to: previewTo, ...msg, tag: "preview", unsubscribeToken: "preview-token-not-valid" });
          await supabaseAdmin.from("digest_send_log").insert({
            recipient_count: 1,
            feature_count: features.length,
            period_start: periodStart.toISOString().slice(0, 10),
            period_end: periodEnd.toISOString().slice(0, 10),
            status: res.ok ? "ok" : "failed",
            error: res.error ?? null,
            trigger: "preview",
          });
          return Response.json({ ok: res.ok, mode: "preview", to: previewTo, featureCount: features.length, provider: res.provider });
        }

        // Fetch all confirmed subscribers
        const { data: subs, error: subsErr } = await supabaseAdmin
          .from("digest_subscribers")
          .select("email,unsubscribe_token")
          .eq("status", "confirmed");
        if (subsErr) {
          await supabaseAdmin.from("digest_send_log").insert({
            recipient_count: 0,
            feature_count: features.length,
            period_start: periodStart.toISOString().slice(0, 10),
            period_end: periodEnd.toISOString().slice(0, 10),
            status: "failed",
            error: subsErr.message,
            trigger: "cron",
          });
          return Response.json({ ok: false, error: subsErr.message }, { status: 500 });
        }

        const recipients = subs ?? [];
        let sent = 0;
        let failed = 0;
        for (const r of recipients) {
          const msg = renderDigestEmail(features, r.unsubscribe_token, periodEnd.toISOString());
          const res = await sendEmail({ to: r.email, ...msg, tag: "digest" });
          if (res.ok) sent++; else failed++;
        }
        if (sent > 0) {
          const emails = recipients.map((r) => r.email);
          await supabaseAdmin
            .from("digest_subscribers")
            .update({ last_email_sent_at: new Date().toISOString() })
            .in("email", emails);
        }

        const status = failed === 0 ? (sent === 0 ? "skipped" : "ok") : (sent === 0 ? "failed" : "partial");
        await supabaseAdmin.from("digest_send_log").insert({
          recipient_count: sent,
          feature_count: features.length,
          period_start: periodStart.toISOString().slice(0, 10),
          period_end: periodEnd.toISOString().slice(0, 10),
          status,
          error: failed > 0 ? `${failed} of ${recipients.length} failed` : null,
          trigger: "cron",
        });

        return Response.json({
          ok: failed === 0,
          mode: "send",
          recipients: recipients.length,
          sent,
          failed,
          featureCount: features.length,
        });
      },
      GET: async () => Response.json({ message: "POST with apikey header to trigger the weekly digest. Body { preview: true, to: 'you@x.com' } for a single-address preview." }),
    },
  },
});
