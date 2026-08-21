import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TableName =
  | "profile_about"
  | "skills"
  | "career_experiences"
  | "contact_links"
  | "web_projects"
  | "dashboards"
  | "flowcharts"
  | "flowchart_nodes"
  | "flowchart_edges"
  | "experience_highlights"
  | "experience_dashboards"
  | "experience_web_projects";

export const useCrud = (table: TableName, invalidateKeys: string[]) => {
  const qc = useQueryClient();

  const done = (message?: string) => {
    invalidateKeys.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
    if (message) toast.success(message);
  };

  const fail = (error: { message: string }) => {
    toast.error(error.message);
    return false;
  };

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insert: async (values: any, message = "Criado com sucesso") => {
      const { data, error } = await supabase.from(table).insert(values).select().single();
      if (error) return fail(error);
      done(message);
      return data;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: async (id: string, values: any, message = "Atualizado com sucesso") => {
      const { error } = await supabase.from(table).update(values).eq("id", id);
      if (error) return fail(error);
      done(message);
      return true;
    },
    remove: async (id: string, message = "Removido") => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) return fail(error);
      done(message);
      return true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    silentUpdate: async (id: string, values: any) => {
      const { error } = await supabase.from(table).update(values).eq("id", id);
      if (error) return fail(error);
      invalidateKeys.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      return true;
    },
  };
};
