UPDATE public.features
SET
  name = 'Design Guidance',
  tagline = 'Pick three design directions or steer typography, color, and layout before Lovable builds.',
  description = 'Design Guidance shapes the visual direction before the build. Lovable either renders three lightweight HTML/Tailwind design directions side-by-side (refinable up to six times), asks a short set of design questions covering typography pairs, curated color palettes, and layout wireframes, or builds directly when the brief is already explicit. Works on new projects and on sections of existing projects (hero, navbar, pricing, footer).',
  capabilities = '["Three parallel design directions","Side-by-side preview + fullscreen","Up to 6 refinements per round","Typography pair picker","Curated color palette picker","Layout wireframe picker (bento, split, magazine, etc.)","Section-level variations on existing projects","Screenshot-based redesign"]'::jsonb,
  use_cases = '["Landing pages and marketing sites","Portfolios and blogs","Exploring visual identity before committing","Redesigning a hero, navbar, pricing card, or footer"]'::jsonb,
  release_date = '2026-05-12',
  source = 'https://docs.lovable.dev/features/design-guidance',
  source_url = 'https://docs.lovable.dev/features/design-guidance',
  updated_at = now()
WHERE id = 'design-guidance';