import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FlowchartStepForm, {
  emptyDraft,
  draftFromNode,
  typeLabel,
  type Draft,
} from "./FlowchartStepForm";
import { useFlowchartSteps } from "@/hooks/useFlowchartSteps";
import type { FlowNode } from "@/hooks/useContent";

interface Props {
  flowchartId: string;
}

const FlowchartStepList = ({ flowchartId }: Props) => {
  const { nodes, edges, isLoading, saving, incoming, saveStep, removeStep, moveStep } =
    useFlowchartSteps(flowchartId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const startCreate = () => {
    const last = nodes[nodes.length - 1];
    setCreating(true);
    setEditingId(null);
    setDraft({ ...emptyDraft, prevIds: last ? [last.id] : [] });
  };

  const startEdit = (node: FlowNode) => {
    const ins = incoming(node.id);
    setCreating(false);
    setEditingId(node.id);
    setDraft(
      draftFromNode(
        node,
        ins.map((e) => e.source_node_id),
        ins.find((e) => e.label)?.label ?? "",
      ),
    );
  };

  const cancel = () => {
    setCreating(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const save = async () => {
    const ok = await saveStep(draft, editingId);
    if (ok) cancel();
  };

  const handleDelete = async (node: FlowNode) => {
    await removeStep(node);
    if (editingId === node.id) cancel();
  };

  const formOpen = creating || !!editingId;

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-heading text-foreground">
            Etapas cadastradas ({nodes.length})
          </p>
          <Button size="sm" onClick={startCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Nova etapa
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : nodes.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body glass-card rounded-xl p-6">
            Nenhuma etapa ainda. Comece por uma etapa do tipo "Início".
          </p>
        ) : (
          <ol className="space-y-2">
            {nodes.map((node, index) => {
              const ins = incoming(node.id);
              return (
                <li
                  key={node.id}
                  className={`glass-card rounded-xl p-4 flex gap-3 ${
                    editingId === node.id ? "ring-1 ring-primary" : ""
                  }`}
                >
                  <span className="text-xs text-muted-foreground font-body pt-1 w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-primary font-body">
                      {typeLabel(node.node_type)}
                    </p>
                    <p className="text-sm font-heading text-foreground">{node.title}</p>
                    {((node as FlowNode & { items?: string[] }).items ?? []).length >
                      0 && (
                      <p className="text-xs text-muted-foreground font-body mt-1">
                        {((node as FlowNode & { items?: string[] }).items ?? []).join(
                          " • ",
                        )}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground font-body mt-1">
                      {ins.length === 0
                        ? "Sem etapa anterior"
                        : `Vem de: ${ins
                            .map((e) => {
                              const src = nodes.find((n) => n.id === e.source_node_id);
                              return `${src?.title ?? "?"}${e.label ? ` (${e.label})` : ""}`;
                            })
                            .join(", ")}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Subir"
                        disabled={index === 0}
                        onClick={() => moveStep(index, -1)}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Descer"
                        disabled={index === nodes.length - 1}
                        onClick={() => moveStep(index, 1)}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                        onClick={() => startEdit(node)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remover"
                        onClick={() => handleDelete(node)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="glass-card rounded-xl p-5 space-y-4 lg:sticky lg:top-24">
          {!formOpen ? (
            <p className="text-sm text-muted-foreground font-body">
              Clique em "Nova etapa" para cadastrar, ou no lápis para editar uma etapa.
            </p>
          ) : (
            <FlowchartStepForm
              draft={draft}
              setDraft={setDraft}
              nodes={nodes}
              editingId={editingId}
              creating={creating}
              saving={saving}
              onSave={save}
              onCancel={cancel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowchartStepList;
