
ALTER TABLE public.digest_send_log
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS shipped_feature_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS catalogued_feature_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS catalogued_total integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS digest_send_log_archive_idx
  ON public.digest_send_log (sent_at DESC)
  WHERE trigger <> 'preview' AND status IN ('ok','partial');
