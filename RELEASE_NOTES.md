# Release Notes

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
