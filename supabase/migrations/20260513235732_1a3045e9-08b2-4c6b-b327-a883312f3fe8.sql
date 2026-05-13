SELECT cron.schedule(
  'gsc-sitemap-resubmit-daily',
  '17 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lovable-feature-atlas.lovable.app/api/public/gsc-sync',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);