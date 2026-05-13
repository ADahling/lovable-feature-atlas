-- Enable scheduling + outbound HTTP from Postgres
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create vault secret to hold the refresh endpoint token
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'atlas_refresh_token') THEN
    PERFORM vault.create_secret(
      'PLACEHOLDER_REPLACE_ME',
      'atlas_refresh_token',
      'Token used by the daily cron job to authenticate against /api/public/refresh-features'
    );
  END IF;
END $$;

-- Unschedule any prior version of the job
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-features-daily') THEN
    PERFORM cron.unschedule('refresh-features-daily');
  END IF;
END $$;

-- Schedule the daily job at 12:00 UTC
SELECT cron.schedule(
  'refresh-features-daily',
  '0 12 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://project--dd9f58b9-14b6-4f4e-96e2-fe61a82ec133.lovable.app/api/public/refresh-features',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'atlas_refresh_token' LIMIT 1)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $cron$
);