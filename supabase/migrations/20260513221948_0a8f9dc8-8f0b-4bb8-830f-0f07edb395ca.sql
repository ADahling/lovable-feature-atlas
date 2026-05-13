DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'gsc-sync-daily') THEN
    PERFORM cron.unschedule('gsc-sync-daily');
  END IF;
END $$;

SELECT cron.schedule(
  'gsc-sync-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lovable-feature-atlas.lovable.app/api/public/gsc-sync',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);