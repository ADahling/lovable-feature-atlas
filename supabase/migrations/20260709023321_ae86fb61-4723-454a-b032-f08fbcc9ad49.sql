DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'gsc-sync-daily') THEN
    PERFORM cron.unschedule('gsc-sync-daily');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'gsc-sitemap-resubmit-daily') THEN
    PERFORM cron.unschedule('gsc-sitemap-resubmit-daily');
  END IF;
END $$;

SELECT cron.schedule(
  'gsc-sync-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://atlas.dahlingdigital.com/api/public/gsc-sync',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'gsc-sitemap-resubmit-daily',
  '17 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://atlas.dahlingdigital.com/api/public/gsc-sync',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);