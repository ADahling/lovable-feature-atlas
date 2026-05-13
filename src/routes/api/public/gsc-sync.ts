import { createFileRoute } from "@tanstack/react-router";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE = "https://lovable-feature-atlas.lovable.app/";
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

export const Route = createFileRoute("/api/public/gsc-sync")({
  server: {
    handlers: {
      POST: async () => {
        const steps: Array<{ step: string; status: number; ok: boolean; body?: string }> = [];

        // 1. Re-verify ownership via META
        const verify = await gsc(
          `/siteVerification/v1/webResource?verificationMethod=META`,
          {
            method: "POST",
            body: JSON.stringify({ site: { identifier: SITE, type: "SITE" } }),
          },
        );
        steps.push({ step: "verify", status: verify.status, ok: verify.ok, body: verify.body.slice(0, 300) });

        // 2. Ensure site is registered in Search Console (idempotent)
        const addSite = await gsc(`/webmasters/v3/sites/${SITE_ENC}`, { method: "PUT" });
        steps.push({ step: "add_site", status: addSite.status, ok: addSite.ok });

        // 3. (Re)submit sitemap so Google re-crawls after the new publish
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
      // Allow GET too so you can hit it from a browser to test
      GET: async ({ request }) => {
        const url = new URL(request.url);
        url.searchParams.set("__method", "POST");
        return Response.redirect(url.toString(), 307);
      },
    },
  },
});
