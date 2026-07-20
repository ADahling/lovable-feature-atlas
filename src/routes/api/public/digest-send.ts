import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual, randomUUID } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { collectRecentFeatures } from "@/lib/digest.functions";
import { renderDigestEmail, renderReportEmail, sendEmail } from "@/lib/digest-email.server";
import { SITE_ORIGIN } from "@/lib/canonical-meta";

const ADMIN_REPORT_TO = "adahling@gmail.com";

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
        let trigger: "cron" | "manual" | "preview" = "cron";
        try {
          const body = (await request.json().catch(() => ({}))) as { preview?: boolean; to?: string; trigger?: string };
          if (body.preview) {
            mode = "preview";
            trigger = "preview";
            if (typeof body.to === "string" && body.to.length > 3) previewTo = body.to.trim().toLowerCase();
          } else if (body.trigger === "manual") {
            trigger = "manual";
          }
        } catch { /* ignore */ }

        const periodEnd = new Date();
        const periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const buckets = await collectRecentFeatures(7);
        const shippedCount = buckets.shipped.length;
        const shippedIds = buckets.shipped.map((f) => f.id);
        const cataloguedIds = buckets.catalogued.map((f) => f.id);

        // Preview: send once to `to` — never logged in archive.
        if (mode === "preview") {
          if (!previewTo) return Response.json({ ok: false, error: "preview requires { to }" }, { status: 400 });
          const msg = renderDigestEmail(buckets, "preview-token-not-valid", periodEnd.toISOString());
          const res = await sendEmail({ to: previewTo, ...msg, tag: "preview", unsubscribeToken: "preview-token-not-valid" });
          await supabaseAdmin.from("digest_send_log").insert({
            recipient_count: 1,
            feature_count: shippedCount,
            period_start: periodStart.toISOString().slice(0, 10),
            period_end: periodEnd.toISOString().slice(0, 10),
            status: res.ok ? "ok" : "failed",
            error: res.error ?? null,
            trigger: "preview",
            subject: msg.subject,
            shipped_feature_ids: shippedIds,
            catalogued_feature_ids: cataloguedIds,
            catalogued_total: buckets.cataloguedTotal,
          });
          return Response.json({
            ok: res.ok,
            mode: "preview",
            to: previewTo,
            shippedCount,
            cataloguedCount: buckets.cataloguedTotal,
            provider: res.provider,
          });
        }

        // Pre-mint the archive id so it can appear inside the email as "View in browser".
        const digestId = randomUUID();
        const archiveUrl = `${SITE_ORIGIN}/digest/${digestId}`;

        // Fetch all confirmed subscribers
        const { data: subs, error: subsErr } = await supabaseAdmin
          .from("digest_subscribers")
          .select("email,unsubscribe_token")
          .eq("status", "confirmed");
        if (subsErr) {
          await supabaseAdmin.from("digest_send_log").insert({
            id: digestId,
            recipient_count: 0,
            feature_count: shippedCount,
            period_start: periodStart.toISOString().slice(0, 10),
            period_end: periodEnd.toISOString().slice(0, 10),
            status: "failed",
            error: subsErr.message,
            trigger,
            shipped_feature_ids: shippedIds,
            catalogued_feature_ids: cataloguedIds,
            catalogued_total: buckets.cataloguedTotal,
          });
          return Response.json({ ok: false, error: subsErr.message }, { status: 500 });
        }

        // Filter against the permanent suppression list. Any confirmed row
        // whose email is suppressed is skipped and its status corrected so
        // it does not resurface on future sends.
        const { data: suppRows } = await supabaseAdmin
          .from("digest_suppressions")
          .select("email");
        const suppressed = new Set((suppRows ?? []).map((r) => r.email.toLowerCase()));
        const allSubs = subs ?? [];
        const eligible = allSubs.filter((r) => !suppressed.has(r.email.toLowerCase()));
        const skippedSuppressed = allSubs.length - eligible.length;
        if (skippedSuppressed > 0) {
          const staleEmails = allSubs
            .filter((r) => suppressed.has(r.email.toLowerCase()))
            .map((r) => r.email);
          await supabaseAdmin
            .from("digest_subscribers")
            .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
            .in("email", staleEmails);
        }

        const recipients = eligible;
        let sent = 0;

        let failed = 0;
        const errorSamples: string[] = [];
        // Compute subject from a sample render (subject is deterministic per week).
        const sampleMsg = renderDigestEmail(buckets, "sample", periodEnd.toISOString(), archiveUrl);
        const digestSubject = sampleMsg.subject;

        for (const r of recipients) {
          const msg = renderDigestEmail(buckets, r.unsubscribe_token, periodEnd.toISOString(), archiveUrl);
          const res = await sendEmail({ to: r.email, ...msg, tag: "digest", unsubscribeToken: r.unsubscribe_token });
          if (res.ok) sent++; else {
            failed++;
            if (errorSamples.length < 5 && res.error) errorSamples.push(`${r.email}: ${res.error}`);
          }
        }
        if (sent > 0) {
          const emails = recipients.map((r) => r.email);
          await supabaseAdmin
            .from("digest_subscribers")
            .update({ last_email_sent_at: new Date().toISOString() })
            .in("email", emails);
        }

        const status = failed === 0 ? (sent === 0 ? "skipped" : "ok") : (sent === 0 ? "failed" : "partial");
        const errorText = failed > 0 ? `${failed} of ${recipients.length} failed${errorSamples.length ? "\n" + errorSamples.join("\n") : ""}` : null;

        await supabaseAdmin.from("digest_send_log").insert({
          id: digestId,
          recipient_count: sent,
          feature_count: shippedCount,
          period_start: periodStart.toISOString().slice(0, 10),
          period_end: periodEnd.toISOString().slice(0, 10),
          status,
          error: errorText,
          trigger,
          subject: digestSubject,
          shipped_feature_ids: shippedIds,
          catalogued_feature_ids: cataloguedIds,
          catalogued_total: buckets.cataloguedTotal,
        });

        // Owner send report — always sent for cron/manual, never for preview.
        try {
          const { count: confirmedTotal } = await supabaseAdmin
            .from("digest_subscribers")
            .select("email", { count: "exact", head: true })
            .eq("status", "confirmed");
          const report = renderReportEmail({
            digestSubject,
            digestId,
            archiveUrl,
            periodEndIso: periodEnd.toISOString(),
            shippedCount,
            cataloguedCount: buckets.catalogued.length,
            cataloguedTotal: buckets.cataloguedTotal,
            recipientsAttempted: recipients.length,
            recipientsDelivered: sent,
            recipientsFailed: failed,
            confirmedSubscriberTotal: confirmedTotal ?? 0,
            errorDetails: errorText,
            trigger: trigger === "manual" ? "manual" : "cron",
          });
          await sendEmail({ to: ADMIN_REPORT_TO, ...report, tag: "report" });
        } catch (err) {
          console.error("[digest-send] owner report failed:", err);
        }

        return Response.json({
          ok: failed === 0,
          mode: "send",
          digestId,
          archiveUrl,
          recipients: recipients.length,
          sent,
          failed,
          shippedCount,
          cataloguedCount: buckets.cataloguedTotal,
        });
      },
      GET: async () => Response.json({ message: "POST with apikey header to trigger the weekly digest. Body { preview: true, to: 'you@x.com' } for a single-address preview." }),
    },
  },
});
