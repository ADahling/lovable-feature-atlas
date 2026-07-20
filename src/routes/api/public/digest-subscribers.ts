import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

export const Route = createFileRoute("/api/public/digest-subscribers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const unauth = authorize(request);
        if (unauth) return unauth;

        const [subsRes, suppRes] = await Promise.all([
          supabaseAdmin
            .from("digest_subscribers")
            .select("id, email, status, source, created_at, confirmed_at, unsubscribed_at, last_email_sent_at")
            .order("created_at", { ascending: false })
            .limit(5000),
          supabaseAdmin
            .from("digest_suppressions")
            .select("email, reason, source, note, created_at")
            .order("created_at", { ascending: false })
            .limit(5000),
        ]);

        if (subsRes.error) return Response.json({ ok: false, error: subsRes.error.message }, { status: 500 });
        if (suppRes.error) return Response.json({ ok: false, error: suppRes.error.message }, { status: 500 });

        const rows = subsRes.data ?? [];
        const suppressions = suppRes.data ?? [];
        const summary = {
          total: rows.length,
          confirmed: rows.filter((r) => r.status === "confirmed").length,
          pending: rows.filter((r) => r.status === "pending").length,
          unsubscribed: rows.filter((r) => r.status === "unsubscribed").length,
          testDomain: rows.filter((r) => /@atlas-test\./i.test(r.email)).length,
          suppressed: suppressions.length,
        };
        return Response.json({ ok: true, rows, summary, suppressions });
      },
      POST: async ({ request }) => {
        const unauth = authorize(request);
        if (unauth) return unauth;

        let body: { action?: string; pattern?: string; email?: string; note?: string } = {};
        try { body = await request.json(); } catch { /* ignore */ }

        if (body.action === "suppress") {
          const email = (body.email ?? "").trim().toLowerCase();
          if (!email || !email.includes("@")) {
            return Response.json({ ok: false, error: "Valid email required" }, { status: 400 });
          }
          const { error: supErr } = await supabaseAdmin
            .from("digest_suppressions")
            .upsert(
              { email, reason: "manual", source: "admin", note: body.note ?? null },
              { onConflict: "email" },
            );
          if (supErr) return Response.json({ ok: false, error: supErr.message }, { status: 500 });
          await supabaseAdmin
            .from("digest_subscribers")
            .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
            .eq("email", email)
            .neq("status", "unsubscribed");
          return Response.json({ ok: true, email, suppressed: true });
        }

        if (body.action === "unsuppress") {
          const email = (body.email ?? "").trim().toLowerCase();
          if (!email) return Response.json({ ok: false, error: "email required" }, { status: 400 });
          const { error: delErr } = await supabaseAdmin
            .from("digest_suppressions")
            .delete()
            .eq("email", email);
          if (delErr) return Response.json({ ok: false, error: delErr.message }, { status: 500 });
          return Response.json({ ok: true, email, suppressed: false });
        }

        if (body.action !== "purge") {
          return Response.json({ ok: false, error: "Unknown action" }, { status: 400 });
        }

        const pattern = body.pattern && typeof body.pattern === "string" ? body.pattern : "%@atlas-test.%";
        // Safety: require an @ and a wildcard so a stray call cannot wipe the table.
        if (!pattern.includes("@") || !pattern.includes("%")) {
          return Response.json({ ok: false, error: "Refusing to purge: pattern must contain @ and %." }, { status: 400 });
        }

        const { data: matched, error: matchErr } = await supabaseAdmin
          .from("digest_subscribers")
          .select("email, status")
          .ilike("email", pattern);
        if (matchErr) return Response.json({ ok: false, error: matchErr.message }, { status: 500 });

        const rows = matched ?? [];
        if (rows.length === 0) {
          return Response.json({ ok: true, purged: 0, confirmed: 0, pending: 0, pattern });
        }

        const { error: delErr } = await supabaseAdmin
          .from("digest_subscribers")
          .delete()
          .ilike("email", pattern);
        if (delErr) return Response.json({ ok: false, error: delErr.message }, { status: 500 });

        return Response.json({
          ok: true,
          pattern,
          purged: rows.length,
          confirmed: rows.filter((r) => r.status === "confirmed").length,
          pending: rows.filter((r) => r.status === "pending").length,
        });
      },
    },
  },
});

