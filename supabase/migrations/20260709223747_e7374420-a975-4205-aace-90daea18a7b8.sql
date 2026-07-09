
ALTER TABLE public.digest_send_log
  ALTER COLUMN shipped_feature_ids TYPE text[] USING shipped_feature_ids::text[],
  ALTER COLUMN catalogued_feature_ids TYPE text[] USING catalogued_feature_ids::text[];
