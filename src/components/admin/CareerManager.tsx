import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CrudList from "./CrudList";
import ExperienceEditor from "./ExperienceEditor";
import { useCareer, type CareerExperience } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";

const CareerManager = () => {
  const { data, isLoading } = useCareer(true);
  const crud = useCrud("career_experiences", ["career", "experience"]);
  const [editing, setEditing] = useState<CareerExperience | null>(null);

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
        {
          name: "slug",
          label: "Slug (URL)",
          required: true,
          maxLength: 80,
          placeholder: "comprador-empresa-x",
        },
        { name: "period", label: "Período", required: true, placeholder: "2022 — Atual" },
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
        { name: "description", label: "Descrição", type: "textarea", maxLength: 2000 },
        {
          name: "long_description",
          label: "Descrição detalhada",
          type: "textarea",
          maxLength: 8000,
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
          name: "highlights",
          label: "Destaques (separados por vírgula)",
          type: "tags",
        },
        { name: "logo_url", label: "Logo da empresa (URL)", maxLength: 500 },
        { name: "sort_order", label: "Ordem", type: "number" },
        { name: "is_published", label: "Publicado", type: "switch" },
      ]}
      onCreate={crud.insert}
      onUpdate={crud.update}
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
