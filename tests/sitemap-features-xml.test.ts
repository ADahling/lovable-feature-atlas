/**
 * Parses /sitemap-features.xml with a strict XML parser and asserts that
 * every <url> entry contains a non-empty <loc>.
 *
 * Run: `bunx vitest run tests/sitemap-features-xml.test.ts`
 * Override target host: `SITE_ORIGIN=https://<other>.lovable.app bunx vitest run tests/sitemap-features-xml.test.ts`
 */

import { describe, it, expect, beforeAll } from "vitest";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";

let xml = "";

beforeAll(async () => {
  const res = await fetch(`${SITE_ORIGIN}/sitemap-features.xml`);
  expect(res.status).toBe(200);
  xml = await res.text();
});

describe("/sitemap-features.xml XML validity", () => {
  it("is well-formed XML", () => {
    const result = XMLValidator.validate(xml, { allowBooleanAttributes: false });
    // `true` on success, error object on failure.
    if (result !== true) {
      throw new Error(`Invalid XML: ${JSON.stringify(result)}`);
    }
    expect(result).toBe(true);
  });

  it("parses into a urlset with url entries each having a non-empty <loc>", () => {
    const parser = new XMLParser({
      ignoreAttributes: false,
      trimValues: true,
      // Force <url> to always be an array, even with a single entry.
      isArray: (name) => name === "url",
    });
    const doc = parser.parse(xml);

    expect(doc.urlset, "urlset root").toBeDefined();
    const urls = doc.urlset.url as Array<Record<string, unknown>>;
    expect(Array.isArray(urls)).toBe(true);
    expect(urls.length).toBeGreaterThan(0);

    for (const [i, entry] of urls.entries()) {
      const loc = entry.loc;
      expect(loc, `url[${i}].loc present`).toBeDefined();
      expect(typeof loc, `url[${i}].loc is string`).toBe("string");
      const value = (loc as string).trim();
      expect(value.length, `url[${i}].loc non-empty`).toBeGreaterThan(0);
      // Must be an absolute http(s) URL.
      expect(() => new URL(value)).not.toThrow();
      expect(value, `url[${i}].loc scheme`).toMatch(/^https?:\/\//);
    }
  });
});
