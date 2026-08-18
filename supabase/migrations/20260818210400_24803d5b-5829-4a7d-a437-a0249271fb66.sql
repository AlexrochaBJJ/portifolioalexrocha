ALTER TABLE public.career_experiences
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS employment_type text,
  ADD COLUMN IF NOT EXISTS short_summary text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS long_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsibilities text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS results text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS tools text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

UPDATE public.career_experiences
SET slug = trim(both '-' from regexp_replace(lower(company || '-' || role_title), '[^a-z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 4)
WHERE slug IS NULL OR slug = '';

ALTER TABLE public.career_experiences ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS career_experiences_slug_key ON public.career_experiences (slug);

ALTER TABLE public.flowcharts
  ADD COLUMN IF NOT EXISTS experience_id uuid REFERENCES public.career_experiences(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS flowcharts_experience_id_idx ON public.flowcharts (experience_id);

DROP POLICY IF EXISTS "Career is publicly readable" ON public.career_experiences;
CREATE POLICY "Published career is publicly readable"
  ON public.career_experiences FOR SELECT USING (is_published);

GRANT SELECT ON public.career_experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_experiences TO authenticated;
GRANT ALL ON public.career_experiences TO service_role;