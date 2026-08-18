import { useState } from "react";
import { Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import CrudList from "./CrudList";
import FlowchartEditor from "./FlowchartEditor";
import { useFlowcharts, type Flowchart } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";

const FlowchartsManager = () => {
  const { data, isLoading } = useFlowcharts(true);
  const crud = useCrud("flowcharts", ["flowcharts"]);
  const [editing, setEditing] = useState<Flowchart | null>(null);

  const current = editing ? (data ?? []).find((c) => c.id === editing.id) ?? editing : null;

  if (current) {
    return <FlowchartEditor chart={current} onBack={() => setEditing(null)} />;
  }

  return (
    <CrudList
      title="Fluxogramas de processos"
      isLoading={isLoading}
      items={data ?? []}
      primaryField="title"
      secondaryField="summary"
      fields={[
        { name: "title", label: "Título", required: true, maxLength: 150 },
        {
          name: "slug",
          label: "Slug (URL)",
          required: true,
          maxLength: 80,
          placeholder: "processo-de-compra-direta",
        },
        { name: "context", label: "Contexto / empresa", maxLength: 150 },
        { name: "summary", label: "Resumo", type: "textarea", maxLength: 1500 },
        { name: "tags", label: "Tags (separadas por vírgula)", type: "tags" },
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
          onClick={() => setEditing(item as Flowchart)}
          className="text-primary"
        >
          <Workflow className="w-4 h-4 mr-1.5" />
          Desenhar
        </Button>
      )}
    />
  );
};

export default FlowchartsManager;
