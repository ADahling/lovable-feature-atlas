CREATE TABLE public.digest_email_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  tag TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL CHECK (status IN ('ok','failed')),
  provider TEXT NOT NULL DEFAULT 'lovable',
  idempotency_key TEXT,
  error TEXT
);
GRANT ALL ON public.digest_email_log TO service_role;
CREATE INDEX digest_email_log_sent_at_idx ON public.digest_email_log (sent_at DESC);
CREATE INDEX digest_email_log_recipient_idx ON public.digest_email_log (recipient);
CREATE INDEX digest_email_log_tag_idx ON public.digest_email_log (tag);
ALTER TABLE public.digest_email_log ENABLE ROW LEVEL SECURITY;
-- No policies: service_role bypasses RLS; all other roles denied.