import { useState } from "react";
import { ArrowLeft, Workflow, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CrudList from "./CrudList";
import FlowchartEditor from "./FlowchartEditor";
import {
  useFlowcharts,
  type CareerExperience,
  type Flowchart,
} from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";

interface Props {
  experience: CareerExperience;
  onBack: () => void;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ExperienceEditor = ({ experience, onBack }: Props) => {
  const { data: linked, isLoading } = useFlowcharts(true, experience.id);
  const { data: all } = useFlowcharts(true);
  const crud = useCrud("flowcharts", ["flowcharts"]);
  const [drawing, setDrawing] = useState<Flowchart | null>(null);
  const [linkId, setLinkId] = useState("");

  const current = drawing
    ? (linked ?? []).find((c) => c.id === drawing.id) ?? drawing
    : null;

  if (current) {
    return <FlowchartEditor chart={current} onBack={() => setDrawing(null)} />;
  }

  const available = (all ?? []).filter((c) => !c.experience_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à trajetória
        </button>
        <div className="text-right">
          <p className="text-sm font-heading text-foreground">{experience.role_title}</p>
          <p className="text-xs text-muted-foreground font-body">{experience.company}</p>
        </div>
      </div>

      {available.length > 0 && (
        <div className="glass-card rounded-xl p-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1.5 min-w-[240px]">
            <p className="text-xs text-muted-foreground font-body">
              Vincular fluxograma existente
            </p>
            <Select value={linkId} onValueChange={setLinkId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fluxograma" />
              </SelectTrigger>
              <SelectContent>
                {available.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            disabled={!linkId}
            onClick={async () => {
              await crud.update(linkId, { experience_id: experience.id });
              setLinkId("");
            }}
          >
            <Link2 className="w-4 h-4 mr-1.5" />
            Vincular
          </Button>
        </div>
      )}

      <CrudList
        title="Fluxogramas desta experiência"
        isLoading={isLoading}
        items={linked ?? []}
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
        onCreate={(values) =>
          crud.insert({
            ...values,
            slug: values.slug || slugify(String(values.title ?? "")),
            context: values.context || experience.company,
            experience_id: experience.id,
          })
        }
        onUpdate={crud.update}
        onDelete={crud.remove}
        extraActions={(item) => (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => setDrawing(item as Flowchart)}
          >
            <Workflow className="w-4 h-4 mr-1.5" />
            Desenhar
          </Button>
        )}
      />
    </div>
  );
};

export default ExperienceEditor;
