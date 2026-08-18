import CrudList from "./CrudList";
import { useCareer } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";

const CareerManager = () => {
  const { data, isLoading } = useCareer();
  const crud = useCrud("career_experiences", ["career"]);

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
        { name: "period", label: "Período", required: true, placeholder: "2022 — Atual" },
        { name: "location", label: "Local", maxLength: 120 },
        { name: "description", label: "Descrição", type: "textarea", maxLength: 2000 },
        {
          name: "highlights",
          label: "Destaques (separados por vírgula)",
          type: "tags",
        },
        { name: "sort_order", label: "Ordem", type: "number" },
      ]}
      onCreate={crud.insert}
      onUpdate={crud.update}
      onDelete={crud.remove}
    />
  );
};

export default CareerManager;
