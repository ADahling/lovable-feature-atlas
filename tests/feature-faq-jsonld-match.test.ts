/**
 * Every /features/$slug page must expose a FAQPage JSON-LD block whose
 * Question/Answer pairs exactly match the visible collapsible FAQ rendered
 * from <details><summary>Q</summary><p>A</p></details>. Both must cover the
 * four AI-engine questions: What is X, Is X GA or in beta, What Lovable plan
 * includes X, When did X launch.
 *
 * Run:    `bunx vitest run tests/feature-faq-jsonld-match.test.ts`
 * Subset: `FEATURE_SAMPLE=25 bunx vitest run tests/feature-faq-jsonld-match.test.ts`
 */

import { describe, it, expect } from "vitest";
import { features, type Feature } from "../src/data/features";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const SAMPLE = process.env.FEATURE_SAMPLE ? Number(process.env.FEATURE_SAMPLE) : 25;

function pickSample(list: Feature[], n: number): Feature[] {
  if (!n || n >= list.length) return list;
  const stride = Math.max(1, Math.floor(list.length / n));
  const out: Feature[] = [];
  for (let i = 0; i < list.length && out.length < n; i += stride) out.push(list[i]);
  return out;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function extractJsonLdBlocks(html: string): unknown[] {
  const raw = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);
  const out: unknown[] = [];
  for (const body of raw) {
    try {
      const parsed = JSON.parse(body);
      const nodes = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray((parsed as any)["@graph"])
          ? (parsed as any)["@graph"]
          : [parsed];
      out.push(...nodes);
    } catch {
      // Sibling parse test owns raw-JSON validity; skip malformed blocks here.
    }
  }
  return out;
}

function findFaqPage(nodes: unknown[]): { q: string; a: string }[] | null {
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    if ((node as any)["@type"] !== "FAQPage") continue;
    const main = (node as any).mainEntity;
    if (!Array.isArray(main)) return null;
    const pairs: { q: string; a: string }[] = [];
    for (const q of main) {
      if (!q || typeof q !== "object" || q["@type"] !== "Question") return null;
      const accepted = q.acceptedAnswer;
      if (!accepted || typeof accepted !== "object" || accepted["@type"] !== "Answer") return null;
      pairs.push({ q: String(q.name ?? "").trim(), a: String(accepted.text ?? "").trim() });
    }
    return pairs;
  }
  return null;
}

function extractVisibleFaqs(html: string): { q: string; a: string }[] {
  const faqSection = html.match(
    /Frequently asked[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i,
  );
  if (!faqSection) return [];
  const pairs: { q: string; a: string }[] = [];
  const detailsRegex = /<details\b[^>]*>([\s\S]*?)<\/details>/gi;
  for (const [, inner] of faqSection[1].matchAll(detailsRegex)) {
    const qMatch = inner.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    const aMatch = inner.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    if (!qMatch || !aMatch) continue;
    pairs.push({ q: stripTags(qMatch[1]), a: stripTags(aMatch[1]) });
  }
  return pairs;
}

const sample = pickSample(features, SAMPLE);

describe(`FAQPage JSON-LD matches visible FAQ (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: JSON-LD FAQ mirrors visible answers for the four AI-engine questions",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
      expect(res.status, `${path} status`).toBe(200);
      const html = await res.text();

      const nodes = extractJsonLdBlocks(html);
      const jsonld = findFaqPage(nodes);
      expect(jsonld, `${path}: FAQPage JSON-LD block present with well-formed Question/Answer pairs`).not.toBeNull();

      const visible = extractVisibleFaqs(html);
      expect(visible.length, `${path}: visible <details> FAQ items rendered`).toBe(jsonld!.length);
      expect(jsonld!.length, `${path}: exactly four AI-engine questions`).toBe(4);

      const expectedQuestions = [
        `What is ${feature.name}?`,
        `Is ${feature.name} GA or in beta?`,
        `What Lovable plan includes ${feature.name}?`,
        `When did ${feature.name} launch?`,
      ];
      for (let i = 0; i < expectedQuestions.length; i++) {
        expect(jsonld![i].q, `${path}: JSON-LD question #${i + 1}`).toBe(expectedQuestions[i]);
        expect(visible[i].q, `${path}: visible question #${i + 1}`).toBe(expectedQuestions[i]);
        expect(jsonld![i].a, `${path}: answer text matches visible copy for "${expectedQuestions[i]}"`)
          .toBe(visible[i].a);
        expect(jsonld![i].a.length, `${path}: answer #${i + 1} non-empty`).toBeGreaterThan(0);
      }
    },
    30_000,
  );
});
