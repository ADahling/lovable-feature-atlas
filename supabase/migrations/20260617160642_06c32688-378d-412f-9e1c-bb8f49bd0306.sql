-- Add explicit no-access policies for tables that are written/read only by service_role.
-- These tables are accessed exclusively by trusted server code (supabaseAdmin),
-- which bypasses RLS. Explicit deny policies document intent and satisfy the linter.

CREATE POLICY "Deny all client access to scrape_runs"
  ON public.scrape_runs
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny all client access to seo_scans"
  ON public.seo_scans
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);