import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type About = Tables<"profile_about">;
export type Skill = Tables<"skills">;
export type CareerExperience = Tables<"career_experiences">;
export type ContactLink = Tables<"contact_links">;
export type WebProject = Tables<"web_projects">;
export type DashboardRow = Tables<"dashboards">;
export type Flowchart = Tables<"flowcharts">;
export type FlowNode = Tables<"flowchart_nodes">;
export type FlowEdge = Tables<"flowchart_edges">;

export const useAbout = () =>
  useQuery({
    queryKey: ["about"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_about")
        .select("*")
        .order("created_at")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useSkills = () =>
  useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useCareer = (includeUnpublished = false) =>
  useQuery({
    queryKey: ["career", includeUnpublished],
    queryFn: async () => {
      let query = supabase.from("career_experiences").select("*").order("sort_order");
      if (!includeUnpublished) query = query.eq("is_published", true);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useExperienceBySlug = (slug?: string) =>
  useQuery({
    queryKey: ["experience", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data: experience, error } = await supabase
        .from("career_experiences")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      if (!experience) return null;

      const { data: charts } = await supabase
        .from("flowcharts")
        .select("*")
        .eq("experience_id", experience.id)
        .eq("is_published", true)
        .order("sort_order");

      const ids = (charts ?? []).map((c) => c.id);
      if (ids.length === 0) return { experience, charts: [], nodes: [], edges: [] };

      const [{ data: nodes }, { data: edges }] = await Promise.all([
        supabase
          .from("flowchart_nodes")
          .select("*")
          .in("flowchart_id", ids)
          .order("sort_order"),
        supabase.from("flowchart_edges").select("*").in("flowchart_id", ids),
      ]);

      return {
        experience,
        charts: charts ?? [],
        nodes: nodes ?? [],
        edges: edges ?? [],
      };
    },
  });

export const useContactLinks = () =>
  useQuery({
    queryKey: ["contact_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_links")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useWebProjects = (includeUnpublished = false) =>
  useQuery({
    queryKey: ["web_projects", includeUnpublished],
    queryFn: async () => {
      let query = supabase.from("web_projects").select("*").order("sort_order");
      if (!includeUnpublished) query = query.eq("is_published", true);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useDashboards = (includeUnpublished = false) =>
  useQuery({
    queryKey: ["dashboards", includeUnpublished],
    queryFn: async () => {
      let query = supabase.from("dashboards").select("*").order("sort_order");
      if (!includeUnpublished) query = query.eq("is_published", true);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useFlowcharts = (includeUnpublished = false, experienceId?: string) =>
  useQuery({
    queryKey: ["flowcharts", includeUnpublished, experienceId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("flowcharts").select("*").order("sort_order");
      if (!includeUnpublished) query = query.eq("is_published", true);
      if (experienceId) query = query.eq("experience_id", experienceId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useFlowchartBySlug = (slug?: string) =>
  useQuery({
    queryKey: ["flowchart", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data: chart, error } = await supabase
        .from("flowcharts")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      if (!chart) return null;
      const [{ data: nodes }, { data: edges }] = await Promise.all([
        supabase
          .from("flowchart_nodes")
          .select("*")
          .eq("flowchart_id", chart.id)
          .order("sort_order"),
        supabase.from("flowchart_edges").select("*").eq("flowchart_id", chart.id),
      ]);
      return { chart, nodes: nodes ?? [], edges: edges ?? [] };
    },
  });

export const useFlowchartDetail = (flowchartId?: string) =>
  useQuery({
    queryKey: ["flowchart_detail", flowchartId],
    enabled: !!flowchartId,
    queryFn: async () => {
      const [{ data: nodes }, { data: edges }] = await Promise.all([
        supabase
          .from("flowchart_nodes")
          .select("*")
          .eq("flowchart_id", flowchartId!)
          .order("sort_order"),
        supabase.from("flowchart_edges").select("*").eq("flowchart_id", flowchartId!),
      ]);
      return { nodes: nodes ?? [], edges: edges ?? [] };
    },
  });
