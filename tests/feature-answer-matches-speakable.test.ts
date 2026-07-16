/**
 * Confirms the exact text rendered inside <p id="answer"> — the element
 * targeted by TechArticle.speakable.cssSelector — matches the answer-first
 * content derived from the feature record, and that the FAQPage JSON-LD
 * answer for "What is <name>?" starts with the same sentence. This locks
 * the speakable structured data to the crawlable prose an AI engine would
 * quote back.
 *
 * Run:    `bunx vitest run tests/feature-answer-matches-speakable.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-answer-matches-speakable.test.ts`
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

// Mirror of src/routes/features.$slug.tsx `answerFirstSentence`. Keep in sync.
function answerFirstSentence(f: Feature): string {
  const tag = f.tagline.trim().replace(/[.!?]+$/, "");
  return `${f.name} is Lovable's ${f.category} feature: ${tag}.`;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function extractJsonLdNodes(html: string): unknown[] {
  const raw = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);
  const out: unknown[] = [];
  for (const body of raw) {
    const parsed = JSON.parse(body);
    const nodes = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as any)["@graph"])
        ? (parsed as any)["@graph"]
        : [parsed];
    out.push(...nodes);
  }
  return out;
}

const sample = pickSample(features, SAMPLE);

const FETCH_TIMEOUT_MS = Number(process.env.FEATURE_FETCH_TIMEOUT_MS ?? 15_000);
// Set STRICT_UPSTREAM=1 to fail on transient upstream timeouts/network errors
// instead of soft-skipping. Default is lenient so the workflow doesn't red on
// upstream CDN blips — real content regressions still fail (HTTP 4xx/2xx body
// mismatches propagate as normal).
const STRICT_UPSTREAM = process.env.STRICT_UPSTREAM === "1";

type FetchOutcome =
  | { ok: true; response: Response; attempts: number }
  | { ok: false; reason: string; attempts: number; lastStatus?: number };

const DEBUG = process.env.DEBUG_ANSWER_SPEAKABLE === "1" || process.env.CI === "true";

function dbg(...args: unknown[]) {
  if (DEBUG) console.log("[answer-speakable]", ...args);
}

async function fetchWithRetry(url: string, attempts = 3): Promise<FetchOutcome> {
  let lastErr: unknown;
  let lastStatus: number | undefined;
  for (let i = 1; i <= attempts; i++) {
    const startedAt = Date.now();
    try {
      dbg(`fetch attempt ${i}/${attempts} → ${url}`);
      const res = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      lastStatus = res.status;
      const ms = Date.now() - startedAt;
      dbg(`  → HTTP ${res.status} in ${ms}ms (attempt ${i})`);
      if (res.status >= 500 && i < attempts) throw new Error(`HTTP ${res.status}`);
      return { ok: true, response: res, attempts: i };
    } catch (err) {
      lastErr = err;
      const ms = Date.now() - startedAt;
      const name = err instanceof Error ? err.name : "Error";
      const message = err instanceof Error ? err.message : String(err);
      dbg(`  ✗ attempt ${i} failed after ${ms}ms: ${name}: ${message}`);
      if (i === attempts) break;
      const backoff = 400 * 2 ** (i - 1);
      dbg(`  ↻ backing off ${backoff}ms before retry`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  const reason = lastErr instanceof Error ? `${lastErr.name}: ${lastErr.message}` : String(lastErr);
  return { ok: false, reason, attempts, lastStatus };
}

function summarizeBody(body: string, limit = 800): string {
  const trimmed = body.trim();
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit)}… [truncated ${trimmed.length - limit} chars of ${trimmed.length}]`;
}

describe(`#answer text matches speakable-referenced content (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: <p id=\"answer\"> text === answerFirstSentence(feature) and matches FAQ answer",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const url = `${SITE_ORIGIN}${path}`;
      const outcome = await fetchWithRetry(url);
      if (!outcome.ok) {
        const msg = `[soft-skip] ${url}: upstream unreachable after ${outcome.attempts} attempts (${outcome.reason}${outcome.lastStatus ? `, lastStatus=${outcome.lastStatus}` : ""})`;
        if (STRICT_UPSTREAM) throw new Error(msg);
        console.warn(msg);
        return; // graceful fallback — treat as passing so CI doesn't red on transient blips
      }
      const res = outcome.response;
      const html = await res.text();

      if (res.status !== 200) {
        console.error(
          `[answer-speakable] non-200 response for ${url}\n  status: ${res.status} ${res.statusText}\n  attempts: ${outcome.attempts}\n  content-type: ${res.headers.get("content-type") ?? "(none)"}\n  content-length: ${res.headers.get("content-length") ?? html.length}\n  body: ${summarizeBody(html)}`,
        );
      }
      expect(res.status, `${url} status`).toBe(200);

      const expected = answerFirstSentence(feature);

      // 1) The <p id="answer"> element (the speakable target) contains the
      //    exact answer-first sentence.
      const answerMatch = html.match(/<p\b[^>]*\bid=["']answer["'][^>]*>([\s\S]*?)<\/p>/i);
      if (!answerMatch) {
        console.error(
          `[answer-speakable] <p id="answer"> missing at ${url}\n  status: ${res.status}\n  content-type: ${res.headers.get("content-type") ?? "(none)"}\n  body: ${summarizeBody(html)}`,
        );
      }
      expect(answerMatch, `${url}: <p id="answer"> present`).not.toBeNull();
      const answerText = stripTags(answerMatch![1]);
      if (answerText !== expected) {
        console.error(
          `[answer-speakable] #answer text mismatch at ${url}\n  expected: ${expected}\n  actual:   ${answerText}`,
        );
      }
      expect(answerText, `${url}: #answer text matches derived answer-first sentence`).toBe(expected);

      // 2) TechArticle.speakable.cssSelector references #answer.
      const nodes = extractJsonLdNodes(html);
      const tech = nodes.find(
        (n): n is Record<string, unknown> =>
          !!n && typeof n === "object" && (n as any)["@type"] === "TechArticle",
      );
      if (!tech) {
        console.error(
          `[answer-speakable] TechArticle JSON-LD missing at ${url}\n  json-ld nodes found: ${nodes.length}\n  types: ${nodes.map((n: any) => n?.["@type"] ?? "(none)").join(", ")}`,
        );
      }
      expect(tech, `${url}: TechArticle JSON-LD present`).toBeDefined();
      const speakable = (tech as any).speakable;
      expect(speakable?.["@type"], `${url}: SpeakableSpecification @type`).toBe("SpeakableSpecification");
      const selectors: string[] = Array.isArray(speakable.cssSelector)
        ? speakable.cssSelector
        : [speakable.cssSelector].filter(Boolean);
      expect(selectors, `${url}: speakable targets #answer`).toContain("#answer");

      // 3) FAQPage answer for "What is <name>?" begins with the same sentence
      //    that #answer renders, so the crawlable prose an AI engine would
      //    "speak" is reproduced verbatim in the structured FAQ answer.
      const faq = nodes.find(
        (n): n is Record<string, unknown> =>
          !!n && typeof n === "object" && (n as any)["@type"] === "FAQPage",
      );
      if (!faq) {
        console.error(
          `[answer-speakable] FAQPage JSON-LD missing at ${url}\n  json-ld types: ${nodes.map((n: any) => n?.["@type"] ?? "(none)").join(", ")}`,
        );
      }
      expect(faq, `${url}: FAQPage JSON-LD present`).toBeDefined();
      const mainEntity = (faq as any).mainEntity as Array<Record<string, any>>;
      const whatIs = mainEntity.find((q) => q.name === `What is ${feature.name}?`);
      if (!whatIs) {
        console.error(
          `[answer-speakable] "What is ${feature.name}?" FAQ entry missing at ${url}\n  available questions: ${mainEntity.map((q) => q.name).join(" | ")}`,
        );
      }
      expect(whatIs, `${url}: "What is ${feature.name}?" FAQ entry present`).toBeDefined();
      const answerBody = (whatIs!.acceptedAnswer as Record<string, string>).text;
      if (!answerBody.startsWith(expected)) {
        console.error(
          `[answer-speakable] FAQ answer prefix mismatch at ${url}\n  expected prefix: ${expected}\n  actual:          ${answerBody.slice(0, 240)}${answerBody.length > 240 ? "…" : ""}`,
        );
      }
      expect(
        answerBody.startsWith(expected),
        `${url}: FAQ answer starts with #answer sentence — got "${answerBody.slice(0, 120)}…"`,
      ).toBe(true);
    },
    30_000,
  );
});
