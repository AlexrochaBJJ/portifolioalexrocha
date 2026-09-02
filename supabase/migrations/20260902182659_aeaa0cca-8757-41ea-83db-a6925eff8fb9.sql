CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  visitor_id text NOT NULL DEFAULT '',
  event_type text NOT NULL DEFAULT 'pageview',
  path text NOT NULL DEFAULT '/',
  page_title text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  referrer text NOT NULL DEFAULT '',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text NOT NULL DEFAULT '',
  browser text NOT NULL DEFAULT '',
  os text NOT NULL DEFAULT '',
  device_type text NOT NULL DEFAULT '',
  screen_size text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT '',
  timezone text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  ip_hint text NOT NULL DEFAULT '',
  duration_ms integer NOT NULL DEFAULT 0,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_created_at_idx ON public.analytics_events (created_at DESC);
CREATE INDEX analytics_events_session_idx ON public.analytics_events (session_id);

GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read analytics" ON public.analytics_events
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));