
DROP POLICY IF EXISTS "Public can read scrape runs" ON public.scrape_runs;
DROP POLICY IF EXISTS "Public can read seo scans" ON public.seo_scans;
REVOKE SELECT ON public.scrape_runs FROM anon, authenticated;
REVOKE SELECT ON public.seo_scans FROM anon, authenticated;
GRANT ALL ON public.scrape_runs TO service_role;
GRANT ALL ON public.seo_scans TO service_role;
