ALTER TABLE public.digest_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_subscribe_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_email_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public.digest_subscribers,
  public.digest_subscribe_attempts,
  public.digest_send_log,
  public.digest_email_log
FROM PUBLIC, anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE
  public.digest_subscribers,
  public.digest_subscribe_attempts,
  public.digest_send_log,
  public.digest_email_log
TO service_role;

DROP POLICY IF EXISTS "Anon can subscribe (pending only)" ON public.digest_subscribers;

DROP POLICY IF EXISTS "Service role can manage digest subscribers" ON public.digest_subscribers;
CREATE POLICY "Service role can manage digest subscribers"
  ON public.digest_subscribers AS PERMISSIVE FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage digest subscribe attempts" ON public.digest_subscribe_attempts;
CREATE POLICY "Service role can manage digest subscribe attempts"
  ON public.digest_subscribe_attempts AS PERMISSIVE FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage digest send log" ON public.digest_send_log;
CREATE POLICY "Service role can manage digest send log"
  ON public.digest_send_log AS PERMISSIVE FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage digest email log" ON public.digest_email_log;
CREATE POLICY "Service role can manage digest email log"
  ON public.digest_email_log AS PERMISSIVE FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Deny client access to digest subscribers" ON public.digest_subscribers;
CREATE POLICY "Deny client access to digest subscribers"
  ON public.digest_subscribers AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to digest subscribe attempts" ON public.digest_subscribe_attempts;
CREATE POLICY "Deny client access to digest subscribe attempts"
  ON public.digest_subscribe_attempts AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to digest send log" ON public.digest_send_log;
CREATE POLICY "Deny client access to digest send log"
  ON public.digest_send_log AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to digest email log" ON public.digest_email_log;
CREATE POLICY "Deny client access to digest email log"
  ON public.digest_email_log AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);