ALTER TABLE public.dashboards
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'powerbi',
  ADD COLUMN IF NOT EXISTS html_code text;

ALTER TABLE public.dashboards ALTER COLUMN embed_url SET DEFAULT '';