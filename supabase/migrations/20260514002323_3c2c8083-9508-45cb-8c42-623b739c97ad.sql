CREATE TABLE public.seo_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL CHECK (source IN ('chat', 'self_scan')),
  url text NOT NULL,
  failing_count integer NOT NULL DEFAULT 0,
  passing_count integer NOT NULL DEFAULT 0,
  ignored_count integer NOT NULL DEFAULT 0,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text
);

CREATE INDEX seo_scans_ran_at_idx ON public.seo_scans (ran_at DESC);

ALTER TABLE public.seo_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read seo scans"
  ON public.seo_scans
  FOR SELECT
  USING (true);