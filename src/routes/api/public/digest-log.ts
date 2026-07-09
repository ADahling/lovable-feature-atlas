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

export const Route = createFileRoute("/api/public/digest-log")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const unauth = authorize(request);
        if (unauth) return unauth;

        const { data, error } = await supabaseAdmin
          .from("digest_send_log")
          .select("id, sent_at, recipient_count, feature_count, period_start, period_end, status, error, trigger")
          .order("sent_at", { ascending: false })
          .limit(100);

        if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

        const rows = data ?? [];
        const summary = {
          total: rows.length,
          ok: rows.filter((r) => r.status === "ok").length,
          failed: rows.filter((r) => r.status === "failed").length,
          partial: rows.filter((r) => r.status === "partial").length,
          skipped: rows.filter((r) => r.status === "skipped").length,
        };
        return Response.json({ ok: true, rows, summary });
      },
    },
  },
});
