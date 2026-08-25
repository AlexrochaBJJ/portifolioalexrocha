import { useMemo } from "react";
import CrudList from "./CrudList";
import { useDashboards } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";
import { iconNames } from "@/lib/icons";

const DashboardsManager = () => {
  const { data, isLoading } = useDashboards(true);
  const crud = useCrud("dashboards", ["dashboards"]);

  const categories = useMemo(
    () =>
      Array.from(new Set((data ?? []).map((d) => d.category).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [data],
  );

  return (
    <CrudList
      title="Dashboards"
      isLoading={isLoading}
      items={data ?? []}
      primaryField="title"
      secondaryField="category"
      fields={[
        { name: "title", label: "Título", required: true, maxLength: 150 },
        {
          name: "category",
          label: "Tag / Categoria",
          type: "combo",
          required: true,
          maxLength: 60,
          options: categories,
          hint: "Digite uma nova tag para criá-la ou clique em uma existente.",
        },
        {
          name: "source_type",
          label: "Tipo de dashboard",
          type: "select",
          required: true,
          choices: [
            { label: "Power BI (link de publicação)", value: "powerbi" },
            { label: "HTML (colar o código)", value: "html" },
          ],
        },
        {
          name: "embed_url",
          label: "URL de publicação (embed)",
          required: true,
          maxLength: 800,
          showIf: (v) => (v.source_type ?? "powerbi") !== "html",
        },
        {
          name: "html_code",
          label: "Código HTML do dashboard",
          type: "code",
          maxLength: 400000,
          placeholder: "<!DOCTYPE html> ...",
          hint: "Cole o código completo do dashboard (HTML, CSS e scripts). Ele roda isolado dentro do portfólio.",
          showIf: (v) => v.source_type === "html",
        },
        { name: "description", label: "Descrição", type: "textarea", maxLength: 1500 },
        { name: "icon", label: "Ícone", type: "icon" },
        { name: "sort_order", label: "Ordem", type: "number" },
        { name: "is_published", label: "Publicado", type: "switch" },
      ]}
      onCreate={crud.insert}
      onUpdate={crud.update}
      onDelete={crud.remove}
    />
  );
};

export default DashboardsManager;
