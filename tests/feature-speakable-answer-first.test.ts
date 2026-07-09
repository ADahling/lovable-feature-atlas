/**
 * Speakable contract: every /features/$slug page must expose a
 * SpeakableSpecification on the TechArticle JSON-LD that targets #answer,
 * and the <p id="answer"> element must be the first crawlable prose on the
 * page — appearing after the <h1> title but before the feature description,
 * capabilities, related grid, and FAQ.
 *
 * Run:    `bunx vitest run tests/feature-speakable-answer-first.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-speakable-answer-first.test.ts`
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

function extractJsonLdNodes(html: string): unknown[] {
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
    } catch { /* covered by sibling parse test */ }
  }
  return out;
}

function findTechArticle(nodes: unknown[]): any | null {
  for (const n of nodes) {
    if (n && typeof n === "object" && (n as any)["@type"] === "TechArticle") return n;
  }
  return null;
}

const sample = pickSample(features, SAMPLE);

describe(`Speakable → #answer, and #answer is first crawlable prose (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: Speakable targets #answer and #answer precedes body prose",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
      expect(res.status, `${path} status`).toBe(200);
      const html = await res.text();

      // 1. JSON-LD speakable contract
      const tech = findTechArticle(extractJsonLdNodes(html));
      expect(tech, `${path}: TechArticle JSON-LD present`).not.toBeNull();
      const speakable = tech!.speakable;
      expect(speakable, `${path}: TechArticle.speakable defined`).toBeTruthy();
      expect(speakable["@type"], `${path}: SpeakableSpecification @type`).toBe("SpeakableSpecification");
      const selectors: string[] = Array.isArray(speakable.cssSelector)
        ? speakable.cssSelector
        : [speakable.cssSelector].filter(Boolean);
      expect(selectors, `${path}: cssSelector includes #answer`).toContain("#answer");

      // 2. #answer element exists with non-empty text
      const answerMatch = html.match(/<p\b[^>]*\bid=["']answer["'][^>]*>([\s\S]*?)<\/p>/i);
      expect(answerMatch, `${path}: <p id="answer"> present`).not.toBeNull();
      const answerText = answerMatch![1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      expect(answerText.length, `${path}: #answer paragraph has crawlable text`).toBeGreaterThan(20);

      // 3. Position invariants — #answer sits after <h1> but before description
      //    paragraph, Capabilities section, FAQ block, and Related grid.
      const answerIdx = html.indexOf(answerMatch![0]);
      const h1Idx = html.search(/<h1\b/i);
      expect(h1Idx, `${path}: <h1> present`).toBeGreaterThan(-1);
      expect(answerIdx, `${path}: #answer comes after <h1>`).toBeGreaterThan(h1Idx);

      // Compare positions inside <body>, since <head> meta tags legitimately
      // repeat the description prose before the body renders.
      const bodyStart = html.search(/<body\b/i);
      expect(bodyStart, `${path}: <body> present`).toBeGreaterThan(-1);
      const bodyAnswerIdx = answerIdx - bodyStart;

      const descNeedle = feature.description.slice(0, 40);
      if (descNeedle) {
        const bodyDescIdx = html.indexOf(descNeedle, bodyStart);
        expect(bodyDescIdx, `${path}: description prose renders in <body>`).toBeGreaterThan(-1);
        expect(bodyDescIdx - bodyStart, `${path}: description prose renders AFTER #answer`)
          .toBeGreaterThan(bodyAnswerIdx);
      }

      for (const marker of ["Frequently asked", "Related in ", "Capabilities"]) {
        const idx = html.indexOf(marker);
        if (idx !== -1) {
          expect(idx, `${path}: "${marker}" section renders after #answer`).toBeGreaterThan(answerIdx);
        }
      }
    },
    30_000,
  );
});
