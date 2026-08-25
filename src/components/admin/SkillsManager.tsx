import CrudList from "./CrudList";
import { useSkills } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";

const SkillsManager = () => {
  const { data, isLoading } = useSkills();
  const crud = useCrud("skills", ["skills"]);

  return (
    <CrudList
      title="Habilidades"
      isLoading={isLoading}
      items={data ?? []}
      primaryField="name"
      secondaryField="category"
      fields={[
        { name: "name", label: "Habilidade", required: true, maxLength: 100 },
        { name: "category", label: "Categoria", required: true, maxLength: 80 },
        { name: "is_featured", label: "Maior destaque (colorida)", type: "switch" },
        { name: "sort_order", label: "Ordem", type: "number" },
      ]}

      onCreate={crud.insert}
      onUpdate={crud.update}
      onDelete={crud.remove}
    />
  );
};

export default SkillsManager;
