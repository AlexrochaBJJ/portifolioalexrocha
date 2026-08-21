ALTER TABLE public.web_projects ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Geral';

ALTER TABLE public.career_experiences
  ADD COLUMN IF NOT EXISTS dashboard_categories text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS webapp_categories text[] NOT NULL DEFAULT '{}'::text[];

UPDATE public.career_experiences
SET description = long_description
WHERE coalesce(long_description, '') <> '';

CREATE TABLE IF NOT EXISTS public.experience_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.career_experiences(id) ON DELETE CASCADE,
  highlight text NOT NULL,
  impact text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experience_highlights TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experience_highlights TO authenticated;
GRANT ALL ON public.experience_highlights TO service_role;
ALTER TABLE public.experience_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Highlights of published experiences are readable"
  ON public.experience_highlights FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.career_experiences e
    WHERE e.id = experience_highlights.experience_id AND e.is_published
  ));
CREATE POLICY "Admins manage highlights"
  ON public.experience_highlights FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER experience_highlights_updated_at BEFORE UPDATE ON public.experience_highlights
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.experience_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.career_experiences(id) ON DELETE CASCADE,
  dashboard_id uuid NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (experience_id, dashboard_id)
);
GRANT SELECT ON public.experience_dashboards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experience_dashboards TO authenticated;
GRANT ALL ON public.experience_dashboards TO service_role;
ALTER TABLE public.experience_dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dashboard links of published experiences are readable"
  ON public.experience_dashboards FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.career_experiences e
    WHERE e.id = experience_dashboards.experience_id AND e.is_published
  ));
CREATE POLICY "Admins manage experience dashboards"
  ON public.experience_dashboards FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.experience_web_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.career_experiences(id) ON DELETE CASCADE,
  web_project_id uuid NOT NULL REFERENCES public.web_projects(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (experience_id, web_project_id)
);
GRANT SELECT ON public.experience_web_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experience_web_projects TO authenticated;
GRANT ALL ON public.experience_web_projects TO service_role;
ALTER TABLE public.experience_web_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Web project links of published experiences are readable"
  ON public.experience_web_projects FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.career_experiences e
    WHERE e.id = experience_web_projects.experience_id AND e.is_published
  ));
CREATE POLICY "Admins manage experience web projects"
  ON public.experience_web_projects FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.experience_highlights (experience_id, highlight, impact, sort_order)
SELECT e.id, h.value, '', h.ord - 1
FROM public.career_experiences e
CROSS JOIN LATERAL unnest(e.highlights) WITH ORDINALITY AS h(value, ord)
WHERE coalesce(h.value, '') <> '';