import CrudList from "./CrudList";
import { useContactLinks } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";

const ContactManager = () => {
  const { data, isLoading } = useContactLinks();
  const crud = useCrud("contact_links", ["contact_links"]);

  return (
    <CrudList
      title="Contatos e links"
      isLoading={isLoading}
      items={data ?? []}
      primaryField="label"
      secondaryField="value"
      fields={[
        { name: "label", label: "Rótulo", required: true, maxLength: 80 },
        {
          name: "kind",
          label: "Tipo",
          type: "select",
          options: ["email", "linkedin", "github", "link"],
          required: true,
        },
        {
          name: "value",
          label: "Valor (e-mail ou URL completa)",
          required: true,
          maxLength: 300,
        },
        { name: "sort_order", label: "Ordem", type: "number" },
      ]}
      onCreate={crud.insert}
      onUpdate={crud.update}
      onDelete={crud.remove}
    />
  );
};

export default ContactManager;
