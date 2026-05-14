CREATE TABLE public.gsc_baseline (
  id text NOT NULL PRIMARY KEY DEFAULT 'singleton',
  errors integer NOT NULL DEFAULT 0,
  warnings integer NOT NULL DEFAULT 0,
  last_downloaded timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gsc_baseline_singleton CHECK (id = 'singleton')
);

ALTER TABLE public.gsc_baseline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read gsc baseline"
  ON public.gsc_baseline
  FOR SELECT
  USING (true);

INSERT INTO public.gsc_baseline (id) VALUES ('singleton')
  ON CONFLICT (id) DO NOTHING;