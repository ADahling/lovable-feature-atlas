import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import {
  SITE_ORIGIN,
  buildCanonicalTags,
  canonicalPath,
  canonicalUrl,
} from "@/lib/canonical-meta";

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

export const Route = createFileRoute("/api/debug/seo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const unauthorized = authorize(request);
        if (unauthorized) return unauthorized;
        const url = new URL(request.url);
        const rawPath = url.searchParams.get("path") ?? "/";
        const noindex = url.searchParams.get("noindex") === "1";

        const normalizedPath = canonicalPath(rawPath);
        const canonical = canonicalUrl(rawPath);
        const tags = buildCanonicalTags({ path: rawPath, noindex });

        const pick = (key: string) =>
          tags.meta.find((m) => m.property === key || m.name === key)?.content ?? null;

        return Response.json(
          {
            site_origin: SITE_ORIGIN,
            input: { path: rawPath, noindex },
            normalized_path: normalizedPath,
            canonical_url: canonical,
            tags: {
              canonical: tags.links.find((l) => l.rel === "canonical")?.href ?? null,
              "og:url": pick("og:url"),
              "twitter:url": pick("twitter:url"),
            },
            head: tags,
          },
          {
            headers: {
              "Cache-Control": "no-store",
              "Content-Type": "application/json",
            },
          },
        );
      },
    },
  },
});
