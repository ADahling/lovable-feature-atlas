# Design System — The Lovable Feature Atlas

## Product Context

- **What this is:** An independent editorial catalog of every Lovable feature, beta, connector, and release.
- **Who it is for:** Builders evaluating Lovable, active Lovable users tracking releases, and teams looking for a specific capability.
- **Project type:** Editorial discovery application with searchable catalog, feature records, quiz, draw, timeline, and public MCP access.
- **Primary job:** Help a visitor understand what Lovable can do and reach the right feature quickly.

## Aesthetic Direction

- **Direction:** Paper Cosmos — Cinematic Cut ("Every release is a premiere").
- **Creative source:** Alicia's Higgsfield Supercomputer master build prompt (2026-07-19): the Atlas staged as a prestige film — ivory light, molten gold, film typography — layered over the Paper Cosmos foundation.
- **Decoration level:** Expressive in the hero (title sequence), Now Showing posters, and cast roll; utility-grade around search and catalog content.
- **Mood:** A film premiere held in an observatory library: gilded key art, letterbox curtains, mono data labels, and a catalog that behaves like a professional tool underneath the cinema.
- **Theme:** Light only. Do not maintain a parallel dark theme or use runtime theme detection. Nothing dark on any large surface.

The interface should feel fun without making the visitor wait. The hero can be theatrical, but the navigation, headline, search, and first 24 feature cards must exist in the first server-rendered response. Decorative motion loads later.

## Visual DNA to Preserve

- Warm paper field and fine printed texture.
- Oversized editorial title with asymmetric composition.
- Gold heart as the recognizable Atlas mark.
- Constellation lines, category colors, and annotated-map details.
- Quiz and draw as playful secondary ways into the catalog.
- Monospaced labels that make the experience feel indexed and researched.

## Typography

- **Display/Hero:** Fraunces, variable optical size 144, weight 500. The film-title serif — hero and section titles only.
- **Body/UI:** Inter, weights 400–700. Clear at catalog density and visually quiet beside Fraunces.
- **Labels/Data:** IBM Plex Mono, weights 400–600, uppercase with tabular numerals.
- **Fallbacks:** Keep metric-adjusted Fraunces fallbacks so headings do not shift when fonts load.
- **Scale:**
  - Display: `clamp(3.25rem, 8.4vw, 8rem)`, line-height `0.98`
  - Page title: `clamp(2.5rem, 5vw, 4.75rem)`, line-height `1.02`
  - Section title: `clamp(2rem, 3vw, 3.25rem)`, line-height `1.08`
  - Card title: `1.125rem`, line-height `1.2`
  - Body: `0.9375rem`, line-height `1.65`
  - Small body: `0.8125rem`, line-height `1.55`
  - Label: `0.625–0.75rem`, uppercase, tracking `0.14–0.24em`

## Color

- **Approach:** Expressive category color on a restrained ivory base; molten gold is decorative, espresso gold is text.
- **Ivory field:** `#FBF8F1`
- **Raised ivory:** `#FFFDF6`
- **Parchment (alternate sections, letterbox bars):** `#F3EDDE`
- **Primary ink (warm espresso):** `#221D12`
- **Forest:** `#0B3D2E`
- **Accessible emerald:** `#094836`
- **Text gold (AA on ivory):** `#6B5423`
- **Molten gold (decorative/interactive accents only):** `#C9A227`
- **Bright gold (gradient start, hover glow):** `#E8C864`
- **Deep gold (gradient end, pressed):** `#A67C00`
- **Standard border:** `rgba(34,29,18,0.16)`; hover border `rgba(34,29,18,0.44)`
- **Secondary text:** `rgba(34,29,18,0.62)`
- **Soft rule:** `#EDE6D4`
- **Semantic success:** `#1B7A54`
- **Semantic warning:** `#8A6820`
- **Semantic error:** `#A85340`
- **Semantic information:** `#2867A8`

Category colors are identity, not decoration. Use one category accent per card, filter, timeline event, and constellation node. Do not wash whole surfaces with competing colors.

## Spacing

- **Base unit:** 4px.
- **Density:** Spacious in hero/editorial areas, comfortable in catalog controls, compact only for metadata.
- **Scale:** 2xs `2px`, xs `4px`, sm `8px`, md `16px`, lg `24px`, xl `32px`, 2xl `48px`, 3xl `64px`, 4xl `96px`.

## Layout

- **Approach:** Hybrid. Creative editorial composition for the hero; disciplined grid for the catalog.
- **Grid:** 4 columns mobile, 8 tablet, 12 desktop.
- **Max content width:** 1440px with 24–32px desktop gutters and 16px mobile gutters.
- **Cards:** Tactile index cards with hierarchical radii, not uniformly bubbly tiles.
- **Radius scale:** 4px metadata, 8px controls, 12px cards, 18px feature moments, full only for chips.
- **Asymmetry:** Allowed above the catalog. Search results and feature records remain predictable.

## Motion

- **Approach:** Expressive but non-blocking.
- **Rule:** Motion never owns first paint and never blocks a click, focus, or scroll.
- **Easing:** Enter `[0.22, 1, 0.36, 1]`; exit `ease-in`; movement `ease-in-out`.
- **Durations:** Micro `80ms`, short `180ms`, medium `320ms`, long `600ms`.
- **Allowed:** Card lift, category-color sweep, constellation ignition, tactile draw/quiz transitions, small layout morphs.
- **Remove:** Intro overlays, forced smooth-scroll timing, cursor replacement, animation that waits on JavaScript before revealing real content.
- **Accessibility:** Every effect has a `prefers-reduced-motion` path. Keyboard and touch behavior must match pointer behavior.

## Performance Contract

- The first response contains the navigation, hero copy, search entry, and 24 feature cards.
- The full catalog is not serialized into every route's initial HTML.
- Decorative constellation code is dynamically imported after the page becomes interactive.
- No route performs a global catalog query unless it actually needs catalog data.
- Public cacheable content and private/token-bearing routes use separate explicit cache policies.
- No blocking theme script, loader overlay, custom cursor, or full-page hydration gate.

## Protected Product Contracts

- Preserve canonical feature and category URLs.
- Preserve search/filter URL state, quiz, draw, timeline, digest, status, sitemap, llms files, and public MCP tools.
- Preserve structured data, canonical tags, accessibility names, and reduced-motion behavior.
- Preserve exactly one keyboard tab stop within the deferred hero constellation and one close control in its preview.
- Preserve visual-regression and semantic CI coverage.

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-17 | Keep the Higgsfield-derived fun as visual DNA | Alicia explicitly likes the playful look and authorized design change without wanting a generic replacement. |
| 2026-07-17 | Use one light Paper Cosmos system | Removes duplicate theme code and keeps the editorial identity consistent. |
| 2026-07-17 | Rebuild delivery before adding more spectacle | Production evidence shows server/data delivery, not the creative direction, is the remaining first-load bottleneck. |
| 2026-07-17 | Defer decoration, never content | The page must be useful before constellation and motion code arrive. |
| 2026-07-19 | Adopt the cinematic master-prompt tokens (ivory #FBF8F1, molten gold #C9A227 family, espresso ink #221D12; Inter + IBM Plex Mono) | Alicia's Higgsfield build prompt supersedes the earlier cream palette; text-level gold stays #6B5423 so every mono label keeps WCAG AA on ivory. |
| 2026-07-19 | One search surface: the Oracle IS the ⌘K command palette | Two overlapping ⌘K handlers (FilterBar + Oracle) collided; SEARCH nav, /search route, and ⌘K all open the same Oracle overlay, which keeps ranking parity with the MCP search tool. |
| 2026-07-19 | Status label "Retired" is display-only | Data, URLs, DB rows, and MCP enums keep the value "Removed"; only rendered labels say Retired. |
| 2026-07-19 | Auto-reveal replaces "Show 24 More"; list view virtualizes all rows | No pagination clicks; grid keeps the 24-card SSR contract, list view windows ~40 of all matching rows against page scroll. |
| 2026-07-19 | Per-feature OG posters deferred | Regenerating 322 OG images spends Lovable AI credits and requires same-PR CI re-baselining — needs explicit owner approval. |

| 2026-07-20 | One danger red: `--danger` #A03D2E (AA on ivory) | The old ad-hoc `#C9665A` (19 uses) was ~3.3:1 on ivory and SubscribeForm borrowed the editor category accent for errors. All error/danger states now use `text/border/bg-danger`. |
| 2026-07-20 | `.btn-foil` owns its padding; `.btn-foil-sm` is the only variant | Call sites had five different py-* values. Default = hero CTA scale (14px/24px), -sm = compact (8px/16px). Never add ad-hoc padding to a foil button. |
| 2026-07-20 | `.t-eyebrow` canonical tracking is 0.16em | The type-scale comment said .24em while the rule said .16em; .16em is what every surface has rendered since the rebuild, so the comment was fixed, not the rule. `.t-label` (.22em) and `.t-meta` (.18em) remain the other two sanctioned mono tracks. |
| 2026-07-20 | Focus rings are `ring-gold/70` everywhere, including /constellation | Stray cream/emerald/green rings normalized; the constellation's green `#315e53` rings were the last holdout of the pre-rebuild interaction language. |
| 2026-07-20 | `--color-muted-ink` and `--color-emerald-glow` registered in @theme | `bg-muted-ink` (17 uses) and `bg-emerald-glow` were silently compiling to nothing; raised-ivory card fills now actually render. |
| 2026-07-20 | Meta titles use the pipe separator; em dashes swept from index/quiz user-facing strings | Matches the 60-char feature-title format that landed via the Lovable editor. Code comments and data values are exempt. |
