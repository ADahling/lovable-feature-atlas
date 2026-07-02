/**
 * Confirms /sitemap-features.xml returns HTTP 200 with an XML content
 * type and a non-empty body.
 *
 * Run: `bunx vitest run tests/sitemap-features-response.test.ts`
 * Override target host: `SITE_ORIGIN=https://<other>.lovable.app bunx vitest run tests/sitemap-features-response.test.ts`
 */

import { describe, it, expect } from "vitest";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";

describe("/sitemap-features.xml response", () => {
  it("returns 200 with XML content type and non-empty body", async () => {
    const res = await fetch(`${SITE_ORIGIN}/sitemap-features.xml`);

    expect(res.status).toBe(200);

    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType).toMatch(/xml/i);

    const body = await res.text();
    expect(body.trim().length).toBeGreaterThan(0);
    expect(body).toMatch(/^<\?xml version="1\.0"/);
    expect(body).toMatch(/<urlset\b/);
    expect(body).toMatch(/<\/urlset>/);
  });
});
