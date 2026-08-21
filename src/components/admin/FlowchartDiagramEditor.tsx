import { useState } from "react";
import { Plus, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FlowchartViewer from "@/components/FlowchartViewer";
import FlowchartStepForm, {
  emptyDraft,
  draftFromNode,
  type Draft,
} from "./FlowchartStepForm";
import { useFlowchartSteps } from "@/hooks/useFlowchartSteps";
import type { FlowNode } from "@/hooks/useContent";

interface Props {
  flowchartId: string;
}

const FlowchartDiagramEditor = ({ flowchartId }: Props) => {
  const { nodes, edges, isLoading, saving, incoming, saveStep, removeStep } =
    useFlowchartSteps(flowchartId);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const openCreate = (after?: FlowNode) => {
    setEditingId(null);
    setDraft({ ...emptyDraft, prevIds: after ? [after.id] : [] });
    setOpen(true);
  };

  const openEdit = (node: FlowNode) => {
    const ins = incoming(node.id);
    setEditingId(node.id);
    setDraft(
      draftFromNode(
        node,
        ins.map((e) => e.source_node_id),
        ins.find((e) => e.label)?.label ?? "",
      ),
    );
    setOpen(true);
  };

  const handleSave = async () => {
    const ok = await saveStep(draft, editingId);
    if (ok) setOpen(false);
  };

  const handleDelete = async (node: FlowNode) => {
    await removeStep(node);
    if (editingId === node.id) setOpen(false);
  };

  if (isLoading) return <Skeleton className="h-[60vh] rounded-xl" />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground font-body inline-flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5 text-primary" />
          Clique em uma etapa para editar, ou em "etapa depois" para criar a próxima já
          ligada por seta.
        </p>
        <Button size="sm" onClick={() => openCreate()}>
          <Plus className="w-4 h-4 mr-1.5" />
          {nodes.length === 0 ? "Primeira etapa" : "Etapa solta"}
        </Button>
      </div>

      {nodes.length === 0 ? (
        <button
          onClick={() => openCreate()}
          className="glass-card rounded-xl w-full p-10 text-sm text-muted-foreground font-body hover:text-primary transition-colors"
        >
          Clique aqui para cadastrar a primeira etapa do fluxo.
        </button>
      ) : (
        <FlowchartViewer
          nodes={nodes}
          edges={edges}
          editable
          onEditNode={openEdit}
          onAddAfter={openCreate}
          onDeleteNode={handleDelete}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingId ? "Editar etapa" : "Nova etapa"}
            </DialogTitle>
          </DialogHeader>
          <FlowchartStepForm
            draft={draft}
            setDraft={setDraft}
            nodes={nodes}
            editingId={editingId}
            creating={!editingId}
            saving={saving}
            onSave={handleSave}
            onCancel={() => setOpen(false)}
            showHeader={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowchartDiagramEditor;
