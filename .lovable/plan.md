## Goal
Daily cron scrapes Lovable's changelog, docs, and X feed via Firecrawl, auto-publishes new features to the live site.

## Architecture

```text
Cloudflare cron (daily 12:00 UTC)
        │
        ▼
POST /api/public/refresh-features  (TanStack server route, token-protected)
        │
        ├─► Firecrawl: scrape lovable.dev/changelog
        ├─► Firecrawl: crawl docs.lovable.dev (limit 50)
        └─► Firecrawl: search "site:x.com lovable_dev" (last 24h)
                │
                ▼
        Diff against `features` table in Lovable Cloud
                │
                ▼
        Upsert new rows + log to `scrape_runs`
                │
                ▼
Home page reads from `features` table via server function
(falls back to bundled features.ts if DB empty)
```

## Why Lovable Cloud over KV
- Zero operator setup — no `wrangler kv:namespace create` step
- Queryable (filter, sort, audit log)
- Free tier covers this easily
- The deleted KV scraper failed precisely because nobody created the namespace

## Steps

1. **Link Firecrawl** to this project (`standard_connectors--connect`)
2. **Enable Lovable Cloud**
3. **Create tables** via migration:
   - `features` — mirrors current `Feature` type (id, name, category, status, release_date, tagline, description, capabilities, source_url, first_seen_at)
   - `scrape_runs` — run_id, started_at, finished_at, status, added_count, error
4. **Seed** `features` with the existing 200ish entries from `src/data/features.ts`
5. **Build `/api/public/refresh-features`** server route:
   - Bearer token check (`REFRESH_TOKEN` secret)
   - Scrape 3 sources via Firecrawl with structured JSON extraction
   - Normalize → diff against DB → insert new rows
   - Log run
6. **Cron**: re-add `triggers.crons` in `wrangler.jsonc` (`0 12 * * *`) and a `scheduled` handler in `src/server.ts` that fetches the public route with the bearer token
7. **Wire site to DB**: server function `getFeatures()` reads from Supabase, falls back to bundled data; replace `useFeatures()` source
8. **Footer**: show real "Last updated" timestamp from latest successful scrape_run

## Risks of "auto-publish"
LLM extraction will sometimes mislabel category/status. To mitigate without a review queue:
- New entries default to `status: "Beta"` (safer than guessing)
- Strict Zod schema rejects malformed records before insert
- Suspicious-shrink check: if a scrape returns < 50% of expected, skip the write
- `/admin/runs` (no auth, public read-only) so you can spot-check what got added

## Secrets needed
- `REFRESH_TOKEN` — random string, you provide via add_secret, used to protect the public refresh route from abuse
- `FIRECRAWL_API_KEY` — auto-injected by the connector

## Out of scope
- No review/approval UI (you chose auto-publish)
- No webhook from Lovable — purely scrape-driven
- No deletion of features that disappear from changelog (only adds)
