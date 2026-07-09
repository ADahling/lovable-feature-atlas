
CREATE OR REPLACE FUNCTION public._digest_preview_once()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  tok text;
BEGIN
  SELECT decrypted_secret INTO tok FROM vault.decrypted_secrets WHERE name = 'REFRESH_TOKEN' LIMIT 1;
  PERFORM net.http_post(
    url := 'https://atlas.dahlingdigital.com/api/public/digest-send',
    headers := jsonb_build_object('Content-Type','application/json','apikey', tok),
    body := '{"preview": true, "to": "adahling@gmail.com"}'::jsonb
  );
  BEGIN
    PERFORM cron.unschedule('digest-preview-once');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END;
$$;

SELECT cron.schedule(
  'digest-preview-once',
  (to_char(now() + interval '3 minutes', 'MI HH24 DD MM')) || ' *',
  $cron$ SELECT public._digest_preview_once(); $cron$
);
