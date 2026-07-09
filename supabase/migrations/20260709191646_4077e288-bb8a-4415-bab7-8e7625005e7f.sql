
DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('digest-preview-retry');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

CREATE OR REPLACE FUNCTION public._digest_preview_once()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $fn$
DECLARE
  tok text;
BEGIN
  SELECT decrypted_secret INTO tok FROM vault.decrypted_secrets WHERE name = 'atlas_refresh_token' LIMIT 1;
  PERFORM net.http_post(
    url := 'https://atlas.dahlingdigital.com/api/public/digest-send',
    headers := jsonb_build_object('Content-Type','application/json','apikey', tok),
    body := '{"preview": true, "to": "adahling@gmail.com"}'::jsonb
  );
  BEGIN
    PERFORM cron.unschedule('digest-preview-retry-v3');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END;
$fn$;

SELECT cron.schedule(
  'digest-preview-retry-v3',
  (to_char(now() + interval '3 minutes', 'MI HH24') || ' * * *'),
  $cron$ SELECT public._digest_preview_once(); $cron$
);
