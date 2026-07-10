// ============================================================================
// search-core.ts
// ---------------------------------------------------------------------------
// Hybrid retrieval used by both the Oracle overlay (UI) and the MCP
// `search_features` tool. Pure and dependency-free so it runs in the
// browser, in server functions, and in the Cloudflare Worker MCP handler.
//
// Ranking pipeline for a single query:
//   1) Tokenize + expand each token through a small curated synonym map.
//   2) Score each record with a normalized-exact-first weighting across
//      title, category, status, tagline (lede), capabilities, use cases.
//   3) Filter to score > 0, sort desc, return up to `limit` (default 20).
//   4) Attach a highlighted excerpt of the field the match came from.
//
// The scorer is intentionally simple and readable — high-signal weights
// on exact title/category/status, moderate on multi-field keyword hits,
// small credit for synonym-only matches so conceptually related records
// stay in the top-20 while exact matches always lead.
// ---------------------------------------------------------------------------

export interface SearchableFeature {
  id: string;
  name: string;
  category: string;
  status: string;
  tagline?: string | null;
  description?: string | null;
  capabilities?: string[] | null;
  useCases?: string[] | null;
}

export interface SearchHit<T extends SearchableFeature = SearchableFeature> {
  feature: T;
  score: number;
  matchedField: "title" | "category" | "status" | "tagline" | "capability" | "useCase" | "description";
  excerpt: string; // plain text
  excerptHtml: string; // <mark> around the hit
}

// --------------------- Synonym groups ---------------------
// A token in any group is expanded to include every peer. Keep entries
// lowercase; multi-word phrases match as substrings. Add sparingly —
// noise here directly costs ranking precision.
const SYNONYM_GROUPS: string[][] = [
  ["mcp", "model context protocol", "connector", "connectors", "integration", "integrations"],
  ["sso", "single sign-on", "single sign on", "authentication", "auth", "login", "sign-in", "sign in"],
  ["ai", "model", "models", "image generation", "generation", "genai", "llm"],
  ["deploy", "deployment", "publish", "publishing", "hosting", "ship", "release"],
  ["db", "database", "postgres", "postgresql", "supabase", "cloud"],
  ["edge", "worker", "workers", "function", "functions", "serverless"],
  ["payment", "payments", "billing", "stripe", "checkout", "subscription"],
  ["email", "mail", "smtp", "resend"],
  ["storage", "file", "files", "upload", "uploads", "bucket"],
];

// Precompute a quick synonym lookup map: token -> group index (or -1).
const SYNONYM_LOOKUP = new Map<string, Set<string>>();
for (const group of SYNONYM_GROUPS) {
  const set = new Set(group);
  for (const term of group) SYNONYM_LOOKUP.set(term, set);
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenize(q: string): string[] {
  return normalize(q)
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length > 1);
}

// Expand each token to its full synonym set (including itself). Multi-word
// synonym phrases are included as their own strings so `includes()` finds
// them in haystacks like "Model Context Protocol".
function expandTokens(tokens: string[]): { primary: string[]; expanded: Set<string> } {
  const expanded = new Set<string>();
  for (const tok of tokens) {
    expanded.add(tok);
    const peers = SYNONYM_LOOKUP.get(tok);
    if (peers) for (const p of peers) expanded.add(p);
  }
  return { primary: tokens, expanded };
}

// Also treat the full query string as a possible phrase for synonym match:
// "single sign on" as one phrase should activate the SSO group.
function expandPhrase(rawQuery: string): Set<string> {
  const phrase = normalize(rawQuery);
  const peers = SYNONYM_LOOKUP.get(phrase);
  if (!peers) return new Set();
  return new Set(peers);
}

// -----------------------------------------------------------
// Excerpt builder — pull a ~140-char window around the first
// matching token/synonym in the given text, and wrap the hit
// in <mark>...</mark>. Returns both plaintext and HTML forms.
// -----------------------------------------------------------
function buildExcerpt(text: string, terms: Set<string>, maxLen = 140): { text: string; html: string } {
  const lower = text.toLowerCase();
  let bestIdx = -1;
  let bestTerm = "";
  for (const term of terms) {
    const i = lower.indexOf(term);
    if (i !== -1 && (bestIdx === -1 || i < bestIdx)) {
      bestIdx = i;
      bestTerm = term;
    }
  }
  if (bestIdx === -1) {
    const slice = text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
    return { text: slice, html: escapeHtml(slice) };
  }
  const start = Math.max(0, bestIdx - Math.floor((maxLen - bestTerm.length) / 2));
  const end = Math.min(text.length, start + maxLen);
  const raw = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  const localIdx = raw.toLowerCase().indexOf(bestTerm);
  const html =
    localIdx === -1
      ? escapeHtml(raw)
      : escapeHtml(raw.slice(0, localIdx)) +
        "<mark>" +
        escapeHtml(raw.slice(localIdx, localIdx + bestTerm.length)) +
        "</mark>" +
        escapeHtml(raw.slice(localIdx + bestTerm.length));
  return { text: raw, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// -----------------------------------------------------------
// Weights — higher = more decisive. Tuned so an exact title
// match always outranks a synonym-only body hit, but multiple
// body hits can pull a strongly relevant record above a
// weak startsWith match on an unrelated feature.
// -----------------------------------------------------------
const W = {
  titleExact: 1000,
  categoryExact: 700,
  statusExact: 400,
  titleStartsWith: 320,
  titleSubstring: 220,
  titleTokenHit: 90,
  taglineTokenHit: 55,
  capabilityTokenHit: 45,
  useCaseTokenHit: 40,
  descriptionTokenHit: 20,
  categoryTokenHit: 30,
  synonymOnlyHit: 12, // small credit when only a synonym peer matches
  allTokensBonus: 60, // reward records that contain every primary token
};

// Count how many times any expanded term appears in a haystack, weighted
// so primary tokens count double vs. pure synonym peers.
function fieldHits(
  hay: string,
  primary: Set<string>,
  expanded: Set<string>,
): { primary: number; synonym: number } {
  const lower = hay.toLowerCase();
  let p = 0;
  let s = 0;
  for (const term of expanded) {
    const isPrimary = primary.has(term);
    let idx = lower.indexOf(term);
    while (idx !== -1) {
      if (isPrimary) p++;
      else s++;
      idx = lower.indexOf(term, idx + term.length);
    }
  }
  return { primary: p, synonym: s };
}

export function searchFeatures<T extends SearchableFeature>(
  features: readonly T[],
  rawQuery: string,
  limit = 20,
): SearchHit<T>[] {
  const q = normalize(rawQuery);
  if (!q) return [];

  const tokens = tokenize(rawQuery);
  if (tokens.length === 0) return [];

  const { expanded } = expandTokens(tokens);
  const primarySet = new Set(tokens);
  // Add phrase-level synonym expansion (e.g. "single sign on" → sso group).
  for (const p of expandPhrase(rawQuery)) expanded.add(p);

  const hits: SearchHit<T>[] = [];

  for (const f of features) {
    let score = 0;
    let matchedField: SearchHit["matchedField"] = "title";
    let excerptSource = f.name;

    const nameLower = f.name.toLowerCase();
    const categoryLower = f.category.toLowerCase();
    const statusLower = f.status.toLowerCase();

    // 1. Normalized exact matches — highest signal.
    if (nameLower === q) {
      score += W.titleExact;
    } else if (nameLower.startsWith(q)) {
      score += W.titleStartsWith;
    } else if (nameLower.includes(q)) {
      score += W.titleSubstring;
    }
    if (categoryLower === q) score += W.categoryExact;
    if (statusLower === q) score += W.statusExact;

    // 2. Weighted token hits across every searchable field.
    const titleHits = fieldHits(f.name, primarySet, expanded);
    if (titleHits.primary || titleHits.synonym) {
      score += titleHits.primary * W.titleTokenHit;
      score += titleHits.synonym * W.synonymOnlyHit;
    }

    const catHits = fieldHits(f.category, primarySet, expanded);
    if (catHits.primary || catHits.synonym) {
      score += catHits.primary * W.categoryTokenHit;
      score += catHits.synonym * W.synonymOnlyHit;
      if (score > 0 && matchedField === "title" && !nameLower.includes(q)) {
        matchedField = "category";
        excerptSource = f.category;
      }
    }

    const tagline = f.tagline ?? "";
    if (tagline) {
      const th = fieldHits(tagline, primarySet, expanded);
      if (th.primary || th.synonym) {
        score += th.primary * W.taglineTokenHit;
        score += th.synonym * W.synonymOnlyHit;
        if (matchedField === "title" && !nameLower.includes(q) && !categoryLower.includes(q)) {
          matchedField = "tagline";
          excerptSource = tagline;
        }
      }
    }

    const caps = f.capabilities ?? [];
    for (const cap of caps) {
      const h = fieldHits(cap, primarySet, expanded);
      if (h.primary || h.synonym) {
        score += h.primary * W.capabilityTokenHit;
        score += h.synonym * W.synonymOnlyHit;
        if (matchedField === "title") {
          matchedField = "capability";
          excerptSource = cap;
        }
      }
    }

    const uses = f.useCases ?? [];
    for (const u of uses) {
      const h = fieldHits(u, primarySet, expanded);
      if (h.primary || h.synonym) {
        score += h.primary * W.useCaseTokenHit;
        score += h.synonym * W.synonymOnlyHit;
        if (matchedField === "title") {
          matchedField = "useCase";
          excerptSource = u;
        }
      }
    }

    const desc = f.description ?? "";
    if (desc) {
      const h = fieldHits(desc, primarySet, expanded);
      if (h.primary || h.synonym) {
        score += h.primary * W.descriptionTokenHit;
        score += h.synonym * W.synonymOnlyHit;
        if (matchedField === "title") {
          matchedField = "description";
          excerptSource = desc;
        }
      }
    }

    // 3. Multi-token bonus — reward records containing every primary token.
    if (tokens.length > 1) {
      const bag =
        `${nameLower} ${categoryLower} ${tagline.toLowerCase()} ${caps.join(" ").toLowerCase()} ${uses.join(" ").toLowerCase()} ${desc.toLowerCase()}`;
      const hitAll = tokens.every((t) => bag.includes(t));
      if (hitAll) score += W.allTokensBonus;
    }

    if (score <= 0) continue;

    const { text, html } = buildExcerpt(excerptSource, expanded);
    hits.push({ feature: f, score, matchedField, excerpt: text, excerptHtml: html });
  }

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Stable tiebreak: alphabetical by name so results don't shuffle.
    return a.feature.name.localeCompare(b.feature.name);
  });

  return hits.slice(0, limit);
}
