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
export type ExperienceHighlight = Tables<"experience_highlights">;

const uniqueById = <T extends { id: string }>(rows: T[]) => {
  const map = new Map<string, T>();
  rows.forEach((row) => map.set(row.id, row));
  return Array.from(map.values());
};

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

      const [{ data: charts }, { data: highlights }, { data: dashLinks }, { data: appLinks }] =
        await Promise.all([
          supabase
            .from("flowcharts")
            .select("*")
            .eq("experience_id", experience.id)
            .eq("is_published", true)
            .order("sort_order"),
          supabase
            .from("experience_highlights")
            .select("*")
            .eq("experience_id", experience.id)
            .order("sort_order"),
          supabase
            .from("experience_dashboards")
            .select("dashboard_id")
            .eq("experience_id", experience.id),
          supabase
            .from("experience_web_projects")
            .select("web_project_id")
            .eq("experience_id", experience.id),
        ]);

      const dashboardIds = (dashLinks ?? []).map((l) => l.dashboard_id);
      const appIds = (appLinks ?? []).map((l) => l.web_project_id);
      const dashCategories = experience.dashboard_categories ?? [];
      const appCategories = experience.webapp_categories ?? [];

      const dashboardQueries: PromiseLike<DashboardRow[]>[] = [];
      if (dashCategories.length > 0) {
        dashboardQueries.push(
          supabase
            .from("dashboards")
            .select("*")
            .eq("is_published", true)
            .in("category", dashCategories)
            .order("sort_order")
            .then(({ data }) => data ?? []),
        );
      }
      if (dashboardIds.length > 0) {
        dashboardQueries.push(
          supabase
            .from("dashboards")
            .select("*")
            .eq("is_published", true)
            .in("id", dashboardIds)
            .order("sort_order")
            .then(({ data }) => data ?? []),
        );
      }

      const appQueries: PromiseLike<WebProject[]>[] = [];
      if (appCategories.length > 0) {
        appQueries.push(
          supabase
            .from("web_projects")
            .select("*")
            .eq("is_published", true)
            .in("category", appCategories)
            .order("sort_order")
            .then(({ data }) => data ?? []),
        );
      }
      if (appIds.length > 0) {
        appQueries.push(
          supabase
            .from("web_projects")
            .select("*")
            .eq("is_published", true)
            .in("id", appIds)
            .order("sort_order")
            .then(({ data }) => data ?? []),
        );
      }

      const [dashboardResults, appResults] = await Promise.all([
        Promise.all(dashboardQueries),
        Promise.all(appQueries),
      ]);

      const dashboards = uniqueById(dashboardResults.flat()).sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      const webProjects = uniqueById(appResults.flat()).sort(
        (a, b) => a.sort_order - b.sort_order,
      );

      const ids = (charts ?? []).map((c) => c.id);
      const base = {
        experience,
        charts: charts ?? [],
        highlights: highlights ?? [],
        dashboards,
        webProjects,
      };
      if (ids.length === 0) return { ...base, nodes: [], edges: [] };

      const [{ data: nodes }, { data: edges }] = await Promise.all([
        supabase
          .from("flowchart_nodes")
          .select("*")
          .in("flowchart_id", ids)
          .order("sort_order"),
        supabase.from("flowchart_edges").select("*").in("flowchart_id", ids),
      ]);

      return { ...base, nodes: nodes ?? [], edges: edges ?? [] };
    },
  });

export const useExperienceHighlights = (experienceId?: string) =>
  useQuery({
    queryKey: ["experience_highlights", experienceId],
    enabled: !!experienceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience_highlights")
        .select("*")
        .eq("experience_id", experienceId!)
        .order("sort_order");
      if (error) throw error;
      return data;
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

export const useExperienceDashboardLinks = (experienceId?: string) =>
  useQuery({
    queryKey: ["experience_dashboards", experienceId],
    enabled: !!experienceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience_dashboards")
        .select("*")
        .eq("experience_id", experienceId!);
      if (error) throw error;
      return data;
    },
  });

export const useExperienceWebProjectLinks = (experienceId?: string) =>
  useQuery({
    queryKey: ["experience_web_projects", experienceId],
    enabled: !!experienceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience_web_projects")
        .select("*")
        .eq("experience_id", experienceId!);
      if (error) throw error;
      return data;
    },
  });

export const useDashboardById = (id?: string) =>
  useQuery({
    queryKey: ["dashboard", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboards")
        .select("*")
        .eq("id", id!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useWebProjectById = (id?: string) =>
  useQuery({
    queryKey: ["web_project", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("web_projects")
        .select("*")
        .eq("id", id!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
