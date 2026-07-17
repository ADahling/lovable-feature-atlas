# Design System — The Lovable Feature Atlas

## Product Context

- **What this is:** An independent editorial catalog of every Lovable feature, beta, connector, and release.
- **Who it is for:** Builders evaluating Lovable, active Lovable users tracking releases, and teams looking for a specific capability.
- **Project type:** Editorial discovery application with searchable catalog, feature records, quiz, draw, timeline, and public MCP access.
- **Primary job:** Help a visitor understand what Lovable can do and reach the right feature quickly.

## Aesthetic Direction

- **Direction:** Paper Cosmos.
- **Creative source:** The playful, cinematic energy from Alicia's Higgsfield Supercomputer direction, translated into an original Atlas interface.
- **Decoration level:** Expressive in the hero and discovery moments, restrained around search and catalog content.
- **Mood:** A curious field guide found in an observatory library: tactile paper, precise annotations, colorful constellations, and a little theatrical surprise.
- **Theme:** Light only. Do not maintain a parallel dark theme or use runtime theme detection.

The interface should feel fun without making the visitor wait. The hero can be theatrical, but the navigation, headline, search, and first 24 feature cards must exist in the first server-rendered response. Decorative motion loads later.

## Visual DNA to Preserve

- Warm paper field and fine printed texture.
- Oversized editorial title with asymmetric composition.
- Gold heart as the recognizable Atlas mark.
- Constellation lines, category colors, and annotated-map details.
- Quiz and draw as playful secondary ways into the catalog.
- Monospaced labels that make the experience feel indexed and researched.

## Typography

- **Display/Hero:** Fraunces, variable optical size 144, weight 500. Large, sharp editorial contrast gives the Atlas its personality.
- **Body/UI:** Geist, weights 400–700. Clear at catalog density and visually quiet beside Fraunces.
- **Labels/Data:** JetBrains Mono, weights 400–500, with tabular numerals.
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

- **Approach:** Expressive category color on a restrained warm-paper base.
- **Paper field:** `#F6EEDD`
- **Raised paper:** `#FFFBF1`
- **Primary ink:** `#0E0E10`
- **Forest:** `#0B3D2E`
- **Accessible emerald:** `#094836`
- **Deep gold:** `#6B5423`
- **Highlight gold:** `#C9A961`
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

