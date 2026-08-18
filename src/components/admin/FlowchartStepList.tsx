import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlowchartDetail, type FlowNode } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";

const typeChoices = [
  { value: "start", label: "Início" },
  { value: "process", label: "Etapa" },
  { value: "decision", label: "Decisão" },
  { value: "branch", label: "Ramificação" },
  { value: "end", label: "Fim" },
];

const typeLabel = (value: string) =>
  typeChoices.find((t) => t.value === value)?.label ?? value;

interface Draft {
  title: string;
  node_type: string;
  items: string;
  description: string;
  owner: string;
  system: string;
  notes: string;
  prevIds: string[];
  edgeLabel: string;
}

const emptyDraft: Draft = {
  title: "",
  node_type: "process",
  items: "",
  description: "",
  owner: "",
  system: "",
  notes: "",
  prevIds: [],
  edgeLabel: "",
};

interface Props {
  flowchartId: string;
}

const FlowchartStepList = ({ flowchartId }: Props) => {
  const { data, isLoading } = useFlowchartDetail(flowchartId);
  const nodeCrud = useCrud("flowchart_nodes", ["flowchart_detail", "flowchart"]);
  const edgeCrud = useCrud("flowchart_edges", ["flowchart_detail", "flowchart"]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const nodes = useMemo(() => data?.nodes ?? [], [data?.nodes]);
  const edges = useMemo(() => data?.edges ?? [], [data?.edges]);

  const incoming = (nodeId: string) => edges.filter((e) => e.target_node_id === nodeId);

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
    setDraft({
      title: node.title,
      node_type: node.node_type,
      items: ((node as FlowNode & { items?: string[] }).items ?? []).join("\n"),
      description: node.description ?? "",
      owner: node.owner ?? "",
      system: node.system ?? "",
      notes: node.notes ?? "",
      prevIds: ins.map((e) => e.source_node_id),
      edgeLabel: ins.find((e) => e.label)?.label ?? "",
    });
  };

  const cancel = () => {
    setCreating(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const itemsArray = () =>
    draft.items
      .split("\n")
      .map((i) => i.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);

  const syncEdges = async (nodeId: string) => {
    const existing = incoming(nodeId);
    const label = draft.edgeLabel.trim() || null;
    for (const edge of existing) {
      if (!draft.prevIds.includes(edge.source_node_id)) {
        await edgeCrud.remove(edge.id, "");
      } else if ((edge.label ?? null) !== label) {
        await edgeCrud.silentUpdate(edge.id, { label });
      }
    }
    for (const prev of draft.prevIds) {
      if (!existing.some((e) => e.source_node_id === prev)) {
        await edgeCrud.insert(
          {
            flowchart_id: flowchartId,
            source_node_id: prev,
            target_node_id: nodeId,
            label,
          },
          "",
        );
      }
    }
  };

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error("Informe o título da etapa");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        node_type: draft.node_type,
        items: itemsArray(),
        description: draft.description,
        owner: draft.owner || null,
        system: draft.system || null,
        notes: draft.notes || null,
      };
      if (creating) {
        const created = await nodeCrud.insert(
          {
            ...payload,
            flowchart_id: flowchartId,
            sort_order: nodes.length + 1,
            position_x: 0,
            position_y: nodes.length * 140,
          },
          "Etapa adicionada",
        );
        if (created && typeof created !== "boolean") await syncEdges(created.id);
      } else if (editingId) {
        await nodeCrud.update(editingId, payload, "Etapa atualizada");
        await syncEdges(editingId);
      }
      cancel();
    } finally {
      setSaving(false);
    }
  };

  const removeNode = async (node: FlowNode) => {
    for (const edge of edges.filter(
      (e) => e.source_node_id === node.id || e.target_node_id === node.id,
    )) {
      await edgeCrud.remove(edge.id, "");
    }
    await nodeCrud.remove(node.id, "Etapa removida");
    if (editingId === node.id) cancel();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const a = nodes[index];
    const b = nodes[index + direction];
    if (!a || !b) return;
    await nodeCrud.silentUpdate(a.id, { sort_order: b.sort_order });
    await nodeCrud.silentUpdate(b.id, { sort_order: a.sort_order });
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
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Descer"
                        disabled={index === nodes.length - 1}
                        onClick={() => move(index, 1)}
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
                        onClick={() => removeNode(node)}
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
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-heading text-primary">
                  {creating ? "Nova etapa" : "Editar etapa"}
                </p>
                <Button variant="ghost" size="icon" onClick={cancel} aria-label="Fechar">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={draft.node_type}
                  onValueChange={(v) => setDraft({ ...draft, node_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeChoices.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={draft.title}
                  maxLength={150}
                  placeholder="Equalização Comercial"
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Itens (um por linha)</Label>
                <Textarea
                  rows={4}
                  value={draft.items}
                  placeholder={"Preço\nFrete\nPrazo\nPagamento"}
                  onChange={(e) => setDraft({ ...draft, items: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Vem depois de</Label>
                {nodes.filter((n) => n.id !== editingId).length === 0 ? (
                  <p className="text-xs text-muted-foreground font-body">
                    Primeira etapa do fluxo.
                  </p>
                ) : (
                  <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                    {nodes
                      .filter((n) => n.id !== editingId)
                      .map((n) => (
                        <label
                          key={n.id}
                          className="flex items-start gap-2 text-sm font-body text-muted-foreground"
                        >
                          <Checkbox
                            checked={draft.prevIds.includes(n.id)}
                            onCheckedChange={(checked) =>
                              setDraft({
                                ...draft,
                                prevIds: checked
                                  ? [...draft.prevIds, n.id]
                                  : draft.prevIds.filter((id) => id !== n.id),
                              })
                            }
                          />
                          <span className="leading-tight">{n.title}</span>
                        </label>
                      ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Rótulo da seta (opcional)</Label>
                <Input
                  value={draft.edgeLabel}
                  maxLength={60}
                  placeholder="Sim / Não / CIF"
                  onChange={(e) => setDraft({ ...draft, edgeLabel: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição (aparece ao clicar)</Label>
                <Textarea
                  rows={3}
                  value={draft.description}
                  maxLength={2000}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input
                  value={draft.owner}
                  maxLength={120}
                  onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Sistema / ferramenta</Label>
                <Input
                  value={draft.system}
                  maxLength={120}
                  onChange={(e) => setDraft({ ...draft, system: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Input
                  value={draft.notes}
                  maxLength={300}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </div>

              <Button onClick={save} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-1.5" />
                {saving ? "Salvando..." : "Salvar etapa"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowchartStepList;
