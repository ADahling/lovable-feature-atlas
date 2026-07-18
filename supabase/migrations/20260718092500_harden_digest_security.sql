BEGIN;

-- Digest writes already pass through validated server functions that use the
-- service role. Remove the unused direct PostgREST insert path so callers
-- cannot choose confirmation tokens or bypass the server-side rate limit.
REVOKE ALL PRIVILEGES ON TABLE public.digest_subscribers
  FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "Anon can subscribe (pending only)"
  ON public.digest_subscribers;

-- Keep the intended client denial explicit. This is equivalent to PostgreSQL's
-- default-deny behavior while making the security posture legible to scanners.
DROP POLICY IF EXISTS "Deny client access to digest subscribers"
  ON public.digest_subscribers;
CREATE POLICY "Deny client access to digest subscribers"
  ON public.digest_subscribers
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to digest subscribe attempts"
  ON public.digest_subscribe_attempts;
CREATE POLICY "Deny client access to digest subscribe attempts"
  ON public.digest_subscribe_attempts
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to digest send log"
  ON public.digest_send_log;
CREATE POLICY "Deny client access to digest send log"
  ON public.digest_send_log
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to digest email log"
  ON public.digest_email_log;
CREATE POLICY "Deny client access to digest email log"
  ON public.digest_email_log
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- This helper only existed to retry a one-off preview. Remove any surviving
-- schedules before dropping the SECURITY DEFINER function and its PUBLIC RPC.
DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('digest-preview-retry');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  BEGIN
    PERFORM cron.unschedule('digest-preview-retry-v3');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

DROP FUNCTION IF EXISTS public._digest_preview_once();

COMMIT;
