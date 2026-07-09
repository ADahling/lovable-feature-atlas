
-- Subscribers table for "What Lovable Shipped" weekly digest
CREATE TABLE public.digest_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirm_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  unsubscribe_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'about', 'footer', 'import')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  last_email_sent_at TIMESTAMP WITH TIME ZONE
);

-- anon may INSERT only; validation via WITH CHECK
GRANT INSERT ON public.digest_subscribers TO anon;
GRANT INSERT ON public.digest_subscribers TO authenticated;
GRANT ALL ON public.digest_subscribers TO service_role;

ALTER TABLE public.digest_subscribers ENABLE ROW LEVEL SECURITY;

-- INSERT policy: pinned status='pending', email format check, length caps, pinned source enum
CREATE POLICY "Anon can subscribe (pending only)"
  ON public.digest_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND length(email) BETWEEN 5 AND 254
    AND email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
    AND source IN ('web', 'about', 'footer')
    AND confirmed_at IS NULL
    AND unsubscribed_at IS NULL
    AND last_email_sent_at IS NULL
  );

-- Deliberate: no SELECT / UPDATE / DELETE policy for anon or authenticated.
-- All reads/state changes go through service_role server functions.

-- Rate limit: track subscribe attempts per hashed IP to blunt bulk abuse
CREATE TABLE public.digest_subscribe_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX digest_subscribe_attempts_ip_hash_time_idx
  ON public.digest_subscribe_attempts (ip_hash, attempted_at DESC);

GRANT ALL ON public.digest_subscribe_attempts TO service_role;
ALTER TABLE public.digest_subscribe_attempts ENABLE ROW LEVEL SECURITY;
-- Deny-all for anon/authenticated (edge/server access only).

-- Digest send log
CREATE TABLE public.digest_send_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  feature_count INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'partial', 'failed', 'skipped')),
  error TEXT,
  trigger TEXT NOT NULL DEFAULT 'cron' CHECK (trigger IN ('cron', 'manual', 'preview'))
);

GRANT ALL ON public.digest_send_log TO service_role;
ALTER TABLE public.digest_send_log ENABLE ROW LEVEL SECURITY;
-- Deny-all for anon/authenticated.
