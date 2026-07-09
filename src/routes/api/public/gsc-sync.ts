import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE = "https://atlas.dahlingdigital.com/";
const SITE_ENC = encodeURIComponent(SITE);
const SITEMAP_ENC = encodeURIComponent(`${SITE}sitemap.xml`);

async function gsc(path: string, init: RequestInit = {}) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const gscKey = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");
  if (!gscKey) throw new Error("GOOGLE_SEARCH_CONSOLE_API_KEY not configured");

  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gscKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

function authorize(request: Request): Response | null {
  const expected = process.env.REFRESH_TOKEN ?? "";
  if (!expected) {
    return new Response("Server misconfigured", { status: 500 });
  }
  const provided = request.headers.get("apikey") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export const Route = createFileRoute("/api/public/gsc-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = authorize(request);
        if (unauthorized) return unauthorized;

        const steps: Array<{ step: string; status: number; ok: boolean; body?: string }> = [];

        const verify = await gsc(
          `/siteVerification/v1/webResource?verificationMethod=META`,
          {
            method: "POST",
            body: JSON.stringify({ site: { identifier: SITE, type: "SITE" } }),
          },
        );
        steps.push({ step: "verify", status: verify.status, ok: verify.ok, body: verify.body.slice(0, 300) });

        const addSite = await gsc(`/webmasters/v3/sites/${SITE_ENC}`, { method: "PUT" });
        steps.push({ step: "add_site", status: addSite.status, ok: addSite.ok });

        const sitemap = await gsc(
          `/webmasters/v3/sites/${SITE_ENC}/sitemaps/${SITEMAP_ENC}`,
          { method: "PUT" },
        );
        steps.push({ step: "submit_sitemap", status: sitemap.status, ok: sitemap.ok });

        const allOk = steps.every((s) => s.ok);
        return new Response(
          JSON.stringify({ success: allOk, ranAt: new Date().toISOString(), steps }, null, 2),
          {
            status: allOk ? 200 : 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      },
      GET: async () => {
        return Response.json({
          message: "POST with the apikey header to trigger a sync run.",
        });
      },
    },
  },
});
