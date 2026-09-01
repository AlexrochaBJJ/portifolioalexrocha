import CrudList from "./CrudList";
import { useWebProjects } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";

const WebProjectsManager = () => {
  const { data, isLoading } = useWebProjects(true);
  const crud = useCrud("web_projects", ["web_projects"]);

  return (
    <CrudList
      title="Aplicações Web"
      isLoading={isLoading}
      items={data ?? []}
      primaryField="title"
      secondaryField="category"
      fields={[
        { name: "title", label: "Título", required: true, maxLength: 150 },
        { name: "category", label: "Categoria", required: true, maxLength: 60 },
        { name: "url", label: "URL do projeto", required: true, maxLength: 500 },
        { name: "description", label: "Descrição", type: "textarea" },
        {
          name: "preview_url",
          label: "Imagem de capa",
          type: "image",
          hint: "Envie uma foto para servir como capa do projeto.",
        },

        { name: "tags", label: "Tags (separadas por vírgula)", type: "tags" },
        { name: "sort_order", label: "Ordem", type: "number" },
        { name: "is_published", label: "Publicado", type: "switch" },
      ]}
      onCreate={crud.insert}
      onUpdate={crud.update}
      onDelete={crud.remove}
    />
  );
};

export default WebProjectsManager;
