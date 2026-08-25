import { useState } from "react";
import { Plus, MousePointerClick, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { FlowNode, FlowEdge } from "@/hooks/useContent";

interface Props {
  flowchartId: string;
}

const sideOptions = [
  { value: "auto", label: "Automático" },
  { value: "direct", label: "Reta (direto)" },
  { value: "right", label: "Contornar pela direita" },
  { value: "left", label: "Contornar pela esquerda" },
];

const FlowchartDiagramEditor = ({ flowchartId }: Props) => {
  const {
    nodes,
    edges,
    isLoading,
    saving,
    incoming,
    saveStep,
    removeStep,
    updateEdge,
    removeEdge,
  } = useFlowchartSteps(flowchartId);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const [edgeOpen, setEdgeOpen] = useState(false);
  const [edge, setEdge] = useState<FlowEdge | null>(null);
  const [edgeLabel, setEdgeLabel] = useState("");
  const [edgeSide, setEdgeSide] = useState("auto");
  const [edgeOffset, setEdgeOffset] = useState(0);

  const titleOf = (id: string) => nodes.find((n) => n.id === id)?.title ?? "—";

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

  const openEdge = (e: FlowEdge) => {
    setEdge(e);
    setEdgeLabel(e.label ?? "");
    setEdgeSide(e.route_side ?? "auto");
    setEdgeOffset(e.lane_offset ?? 0);
    setEdgeOpen(true);
  };

  const handleSave = async () => {
    const ok = await saveStep(draft, editingId);
    if (ok) setOpen(false);
  };

  const handleSaveEdge = async () => {
    if (!edge) return;
    const ok = await updateEdge(edge.id, {
      label: edgeLabel.trim() || null,
      route_side: edgeSide,
      lane_offset: Number.isFinite(edgeOffset) ? edgeOffset : 0,
    });
    if (ok) setEdgeOpen(false);
  };

  const handleDeleteEdge = async () => {
    if (!edge) return;
    await removeEdge(edge.id);
    setEdgeOpen(false);
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
          Clique em uma etapa para editar, em "etapa depois" para criar a próxima já
          ligada, ou clique sobre uma seta para ajustar o caminho dela.
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
          onEditEdge={openEdge}
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

      <Dialog open={edgeOpen} onOpenChange={setEdgeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Editar ligação</DialogTitle>
          </DialogHeader>
          {edge && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-body">
                <span className="text-foreground">{titleOf(edge.source_node_id)}</span> →{" "}
                <span className="text-foreground">{titleOf(edge.target_node_id)}</span>
              </p>

              <div className="space-y-1.5">
                <Label className="text-xs font-body">Rótulo da seta</Label>
                <Input
                  value={edgeLabel}
                  onChange={(ev) => setEdgeLabel(ev.target.value)}
                  placeholder="Ex.: Sim / Não"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-body">Caminho da linha</Label>
                <div className="grid grid-cols-2 gap-2">
                  {sideOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEdgeSide(opt.value)}
                      className={`rounded-md border px-3 py-2 text-xs font-body transition-colors ${
                        edgeSide === opt.value
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-body">
                  Ajuste fino da distância (px)
                </Label>
                <Input
                  type="number"
                  step={10}
                  value={edgeOffset}
                  onChange={(ev) => setEdgeOffset(Number(ev.target.value))}
                />
                <p className="text-[11px] text-muted-foreground font-body">
                  Valores maiores afastam a linha das etapas; use para separar setas que
                  se sobrepõem.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteEdge}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Remover ligação
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEdgeOpen(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveEdge} disabled={saving}>
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowchartDiagramEditor;

