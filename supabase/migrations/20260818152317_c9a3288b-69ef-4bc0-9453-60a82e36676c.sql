-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- about
CREATE TABLE public.profile_about (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile_about TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_about TO authenticated;
GRANT ALL ON public.profile_about TO service_role;
ALTER TABLE public.profile_about ENABLE ROW LEVEL SECURITY;
CREATE POLICY "About is publicly readable" ON public.profile_about FOR SELECT USING (true);
CREATE POLICY "Admins manage about" ON public.profile_about FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER profile_about_updated_at BEFORE UPDATE ON public.profile_about
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Geral',
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills are publicly readable" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admins manage skills" ON public.skills FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER skills_updated_at BEFORE UPDATE ON public.skills
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- career
CREATE TABLE public.career_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role_title TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT '',
  location TEXT,
  description TEXT NOT NULL DEFAULT '',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.career_experiences TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.career_experiences TO authenticated;
GRANT ALL ON public.career_experiences TO service_role;
ALTER TABLE public.career_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Career is publicly readable" ON public.career_experiences FOR SELECT USING (true);
CREATE POLICY "Admins manage career" ON public.career_experiences FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER career_experiences_updated_at BEFORE UPDATE ON public.career_experiences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- contact links
CREATE TABLE public.contact_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'link',
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contact_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.contact_links TO authenticated;
GRANT ALL ON public.contact_links TO service_role;
ALTER TABLE public.contact_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contact links are publicly readable" ON public.contact_links FOR SELECT USING (true);
CREATE POLICY "Admins manage contact links" ON public.contact_links FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER contact_links_updated_at BEFORE UPDATE ON public.contact_links
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- web projects
CREATE TABLE public.web_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  preview_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.web_projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.web_projects TO authenticated;
GRANT ALL ON public.web_projects TO service_role;
ALTER TABLE public.web_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published web projects are publicly readable" ON public.web_projects FOR SELECT USING (is_published);
CREATE POLICY "Admins manage web projects" ON public.web_projects FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER web_projects_updated_at BEFORE UPDATE ON public.web_projects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- dashboards
CREATE TABLE public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Geral',
  embed_url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'BarChart3',
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dashboards TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.dashboards TO authenticated;
GRANT ALL ON public.dashboards TO service_role;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published dashboards are publicly readable" ON public.dashboards FOR SELECT USING (is_published);
CREATE POLICY "Admins manage dashboards" ON public.dashboards FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER dashboards_updated_at BEFORE UPDATE ON public.dashboards
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- flowcharts
CREATE TABLE public.flowcharts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  context TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.flowcharts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.flowcharts TO authenticated;
GRANT ALL ON public.flowcharts TO service_role;
ALTER TABLE public.flowcharts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published flowcharts are publicly readable" ON public.flowcharts FOR SELECT USING (is_published);
CREATE POLICY "Admins manage flowcharts" ON public.flowcharts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER flowcharts_updated_at BEFORE UPDATE ON public.flowcharts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.flowchart_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flowchart_id UUID NOT NULL REFERENCES public.flowcharts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  owner TEXT,
  system TEXT,
  notes TEXT,
  node_type TEXT NOT NULL DEFAULT 'task',
  position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX flowchart_nodes_flowchart_id_idx ON public.flowchart_nodes(flowchart_id);
GRANT SELECT ON public.flowchart_nodes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.flowchart_nodes TO authenticated;
GRANT ALL ON public.flowchart_nodes TO service_role;
ALTER TABLE public.flowchart_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nodes of published flowcharts are readable" ON public.flowchart_nodes FOR SELECT
USING (EXISTS (SELECT 1 FROM public.flowcharts f WHERE f.id = flowchart_id AND f.is_published));
CREATE POLICY "Admins manage nodes" ON public.flowchart_nodes FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER flowchart_nodes_updated_at BEFORE UPDATE ON public.flowchart_nodes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.flowchart_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flowchart_id UUID NOT NULL REFERENCES public.flowcharts(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES public.flowchart_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.flowchart_nodes(id) ON DELETE CASCADE,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX flowchart_edges_flowchart_id_idx ON public.flowchart_edges(flowchart_id);
GRANT SELECT ON public.flowchart_edges TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.flowchart_edges TO authenticated;
GRANT ALL ON public.flowchart_edges TO service_role;
ALTER TABLE public.flowchart_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Edges of published flowcharts are readable" ON public.flowchart_edges FOR SELECT
USING (EXISTS (SELECT 1 FROM public.flowcharts f WHERE f.id = flowchart_id AND f.is_published));
CREATE POLICY "Admins manage edges" ON public.flowchart_edges FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));