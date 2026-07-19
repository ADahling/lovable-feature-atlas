# Release Notes

## 2026-07-19 — Cinematic rebuild ("Every release is a premiere")

Branch `claude/lovable-atlas-redesign-tdknbo`. Light, film-grade redesign on
the Paper Cosmos foundation: ivory/molten-gold tokens, Inter + IBM Plex Mono,
title-sequence hero over gilded key art, Now Showing premiere posters, Coming
Attractions (self-retiring watchlist of officially-signaled upcoming
features), connectors end-credits marquee, single ⌘K Oracle palette (SEARCH
nav + new noindex `/search` route), virtualized list view with j/k keys,
auto-reveal pagination, ticket-stub quiz staging, end-credits footer, and
deterministic poster OG images for all 322 features
(`scripts/generate-og-posters.ts` — no AI generation, byte-reproducible).

Verification (local, against the built worker with bundled data): typecheck,
lint, build green; ~4,900 tests passing including the full canonical crawl,
JSON-LD suites, MCP tools, OG integrity, cache policy, sitemaps, and digest
security contracts; zero console errors / hydration warnings / horizontal
overflow across all public routes at 390/768/1440/2560px. Page-structure
snapshots deliberately re-recorded (+1 header landmark, +1 footer h2).
Follow-up: re-run the Lighthouse audit below against production after deploy.

## 2026-07-19

### Lighthouse audit (production, desktop preset)

Run against `https://atlas.dahlingdigital.com` on 2026-07-19 with Lighthouse
via headless Chromium, desktop preset, categories: performance, accessibility,
best-practices, seo.

| Route            | Perf | A11y | Best Practices | SEO | FCP  | LCP  | TBT    | CLS  | SI   |
| ---------------- | ---- | ---- | -------------- | --- | ---- | ---- | ------ | ---- | ---- |
| `/`              | 91   | 93   | 100            | 100 | 1.1s | 1.2s | 110 ms | 0.01 | 2.0s |
| `/constellation` | 96   | 85   | 100            | 100 | 0.9s | 1.0s | 10 ms  | 0    | 1.4s |

Notes:
- Both routes pass Core Web Vitals: LCP under 2.5s, CLS under 0.1, TBT well under 200ms.
- `/constellation` accessibility (85) trails the home page; likely canvas /
  starfield labeling. Follow-up: audit color contrast on the constellation
  legend and confirm every interactive star has an accessible name.
- Best-practices and SEO are 100 on both routes.

## 2026-07-19 — Post-rebuild Lighthouse (local worker, simulated throttling)

Run against the built worker at 127.0.0.1:8080 (bundled data, no CDN edge)
with Lighthouse 12 via headless Chromium. Numbers are conservative relative
to production, which serves through Cloudflare's edge cache.

| Route            | Preset  | Perf | A11y | Best Practices | SEO | FCP  | LCP  | TBT    | CLS   |
| ---------------- | ------- | ---- | ---- | -------------- | --- | ---- | ---- | ------ | ----- |
| `/`              | desktop | 89   | 100  | 96             | 100 | 0.8s | 0.9s | 0 ms   | 0.008 |
| `/constellation` | desktop | 90   | 100  | 96             | 100 | 0.7s | 0.7s | 10 ms  | 0     |
| `/`              | mobile  | 75¹  | 100  | 96             | 100 | 3.4s | 3.9s | 270 ms | 0     |

¹ Simulated slow-4G + 4x CPU against a local dev worker; re-measure against
production (edge-cached) for the real mobile number. Accessibility reached
100 on both previously-audited routes — the constellation legend/star-name
gap from the rollback baseline is resolved.

## 2026-07-19 — Post-deploy note

Merge #2 (7622a77) restores the constellation's full-viewport geometry
(global chrome stands down on /constellation). If production still shows the
18:19 build, re-sync from the Lovable editor or land any push to main.
