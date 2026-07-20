
CREATE TABLE public.digest_suppressions (
  email TEXT PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT 'unsubscribed',
  source TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.digest_suppressions TO service_role;

ALTER TABLE public.digest_suppressions ENABLE ROW LEVEL SECURITY;

-- No client-role policies: suppression list is service-role only (admin API + server fns).
COMMENT ON TABLE public.digest_suppressions IS 'Permanent opt-out list for the digest. Emails here are blocked from subscribing and receiving. Access is service-role only.';

CREATE INDEX IF NOT EXISTS digest_suppressions_created_at_idx ON public.digest_suppressions (created_at DESC);

-- Backfill: every already-unsubscribed subscriber gets a suppression row so
-- the block is enforced even if the row is later deleted or reactivated.
INSERT INTO public.digest_suppressions (email, reason, source)
SELECT lower(email), 'unsubscribed', COALESCE(source, 'backfill')
FROM public.digest_subscribers
WHERE status = 'unsubscribed'
ON CONFLICT (email) DO NOTHING;
