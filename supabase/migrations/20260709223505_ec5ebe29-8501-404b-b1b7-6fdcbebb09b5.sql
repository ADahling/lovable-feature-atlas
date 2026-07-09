-- Re-uses the existing _digest_preview_once() helper which POSTs a preview to adahling@gmail.com and unschedules itself.
DO $$
DECLARE
  fire_at timestamptz := now() + interval '4 minutes';
  cron_expr text;
BEGIN
  cron_expr := to_char(fire_at at time zone 'UTC', 'MI HH24 DD MM') || ' *';
  BEGIN
    PERFORM cron.unschedule('digest-preview-retry-v3');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  PERFORM cron.schedule(
    'digest-preview-retry-v3',
    cron_expr,
    $cron$ SELECT public._digest_preview_once(); $cron$
  );
END $$;