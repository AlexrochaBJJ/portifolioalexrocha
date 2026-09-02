import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CrudList from "./CrudList";
import ExperienceEditor from "./ExperienceEditor";
import {
  useCareer,
  useDashboards,
  useWebProjects,
  type CareerExperience,
} from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";
import { slugify } from "@/lib/slug";

const CareerManager = () => {
  const { data, isLoading } = useCareer(true);
  const { data: dashboards } = useDashboards(true);
  const { data: webProjects } = useWebProjects(true);
  const crud = useCrud("career_experiences", ["career", "experience"]);
  const [editing, setEditing] = useState<CareerExperience | null>(null);

  const dashboardCategories = useMemo(
    () => Array.from(new Set((dashboards ?? []).map((d) => d.category))).sort(),
    [dashboards],
  );
  const webappCategories = useMemo(
    () => Array.from(new Set((webProjects ?? []).map((p) => p.category))).sort(),
    [webProjects],
  );

  const current = editing
    ? (data ?? []).find((e) => e.id === editing.id) ?? editing
    : null;

  if (current) {
    return <ExperienceEditor experience={current} onBack={() => setEditing(null)} />;
  }

  return (
    <CrudList
      title="Trajetória profissional"
      isLoading={isLoading}
      items={data ?? []}
      primaryField="role_title"
      secondaryField="company"
      fields={[
        { name: "role_title", label: "Cargo", required: true, maxLength: 120 },
        { name: "company", label: "Empresa", required: true, maxLength: 120 },
        { name: "start_date", label: "Data de início", type: "date", required: true },
        {
          name: "is_current",
          label: "Trabalho atual (sem data de término)",
          type: "switch",
        },
        {
          name: "end_date",
          label: "Data de término",
          type: "date",
          showIf: (v) => !v.is_current,
        },
        { name: "location", label: "Local", maxLength: 120 },
        { name: "sector", label: "Setor / área", maxLength: 120 },
        {
          name: "employment_type",
          label: "Tipo de contrato",
          type: "select",
          options: ["CLT", "PJ", "Estágio", "Temporário", "Freelance", "Consultoria"],
        },
        {
          name: "short_summary",
          label: "Resumo curto (card)",
          type: "textarea",
          maxLength: 400,
        },
        {
          name: "description",
          label: "Descrição",
          type: "richtext",
        },
        {
          name: "responsibilities",
          label: "Responsabilidades (separadas por vírgula)",
          type: "tags",
        },
        {
          name: "results",
          label: "Resultados / números (separados por vírgula)",
          type: "tags",
        },
        {
          name: "tools",
          label: "Ferramentas e sistemas (separados por vírgula)",
          type: "tags",
        },
        {
          name: "dashboard_categories",
          label: "Categorias de dashboards exibidas nesta experiência",
          type: "multiselect",
          options: dashboardCategories,
        },
        {
          name: "webapp_categories",
          label: "Categorias de aplicações web exibidas nesta experiência",
          type: "multiselect",
          options: webappCategories,
        },
        { name: "logo_url", label: "Logo da empresa (URL)", maxLength: 500 },
        {
          name: "slug",
          label: "Endereço da página (opcional — gerado automaticamente)",
          maxLength: 80,
          placeholder: "comprador-empresa-x",
        },
        { name: "sort_order", label: "Ordem", type: "number" },
        { name: "is_published", label: "Publicado", type: "switch" },
      ]}
      onCreate={(values) =>
        crud.insert({
          ...values,
          slug:
            values.slug ||
            slugify(`${values.role_title ?? ""} ${values.company ?? ""}`) ||
            `experiencia-${Date.now()}`,
        })
      }
      onUpdate={(id, values) =>
        crud.update(id, {
          ...values,
          slug:
            values.slug ||
            slugify(`${values.role_title ?? ""} ${values.company ?? ""}`) ||
            id,
        })
      }
      onDelete={crud.remove}
      extraActions={(item) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={() => setEditing(item as CareerExperience)}
        >
          <FileText className="w-4 h-4 mr-1.5" />
          Detalhar
        </Button>
      )}
    />
  );
};

export default CareerManager;
