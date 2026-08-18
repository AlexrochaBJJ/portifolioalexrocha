import CrudList from "./CrudList";
import { useDashboards } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";
import { iconNames } from "@/lib/icons";

const DashboardsManager = () => {
  const { data, isLoading } = useDashboards(true);
  const crud = useCrud("dashboards", ["dashboards"]);

  return (
    <CrudList
      title="Dashboards Power BI"
      isLoading={isLoading}
      items={data ?? []}
      primaryField="title"
      secondaryField="category"
      fields={[
        { name: "title", label: "Título", required: true, maxLength: 150 },
        { name: "category", label: "Categoria", required: true, maxLength: 60 },
        { name: "embed_url", label: "URL de publicação (embed)", required: true, maxLength: 800 },
        { name: "description", label: "Descrição", type: "textarea", maxLength: 1500 },
        { name: "icon", label: "Ícone", type: "select", options: iconNames },
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
