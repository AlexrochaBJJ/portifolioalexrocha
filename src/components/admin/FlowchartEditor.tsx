import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlowchartDetail, type Flowchart, type FlowNode } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";

const nodeTypes = ["start", "process", "decision", "end"];

const borderFor = (type: string) =>
  type === "decision"
    ? "hsl(var(--accent))"
    : type === "start" || type === "end"
      ? "hsl(var(--primary))"
      : "hsl(var(--border))";

interface Props {
  chart: Flowchart;
  onBack: () => void;
}

const FlowchartEditor = ({ chart, onBack }: Props) => {
  const { data, isLoading } = useFlowchartDetail(chart.id);
  const nodeCrud = useCrud("flowchart_nodes", ["flowchart_detail", "flowchart"]);
  const edgeCrud = useCrud("flowchart_edges", ["flowchart_detail", "flowchart"]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<FlowNode>>({});

  const initialNodes: Node[] = useMemo(
    () =>
      (data?.nodes ?? []).map((n) => ({
        id: n.id,
        position: { x: Number(n.position_x), y: Number(n.position_y) },
        data: { label: n.title },
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
          border: `1px solid ${borderFor(n.node_type)}`,
          borderRadius: 10,
          padding: 12,
          fontSize: 13,
          width: 190,
          textAlign: "center" as const,
        },
      })),
    [data?.nodes],
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      (data?.edges ?? []).map((e) => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        label: e.label ?? undefined,
        style: { stroke: "hsl(var(--primary) / 0.6)" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--primary))" },
      })),
    [data?.edges],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [syncKey, setSyncKey] = useState("");

  const currentKey = `${initialNodes.length}-${initialEdges.length}-${chart.id}`;
  if (!isLoading && syncKey !== currentKey) {
    setSyncKey(currentKey);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }

  const handleNodesChange = (changes: NodeChange<Node>[]) => {
    onNodesChange(changes);
    changes.forEach((change) => {
      if (change.type === "position" && !change.dragging && change.position) {
        nodeCrud.silentUpdate(change.id, {
          position_x: Math.round(change.position.x),
          position_y: Math.round(change.position.y),
        });
      }
    });
  };

  const onConnect = useCallback(
    async (connection: Connection) => {
      const created = await edgeCrud.insert(
        {
          flowchart_id: chart.id,
          source_node_id: connection.source,
          target_node_id: connection.target,
        },
        "Conexão criada",
      );
      if (created && typeof created !== "boolean") {
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              id: created.id,
              style: { stroke: "hsl(var(--primary) / 0.6)" },
              markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--primary))" },
            },
            eds,
          ),
        );
      }
    },
    [chart.id, edgeCrud, setEdges],
  );

  const addNode = async () => {
    const created = await nodeCrud.insert(
      {
        flowchart_id: chart.id,
        title: "Nova etapa",
        description: "",
        node_type: "process",
        position_x: 80 + nodes.length * 30,
        position_y: 80 + nodes.length * 90,
        sort_order: nodes.length + 1,
      },
      "Etapa adicionada",
    );
    if (created && typeof created !== "boolean") {
      setSelectedId(created.id);
      setDraft(created as FlowNode);
    }
  };

  const selectNode = (_: unknown, node: Node) => {
    const found = (data?.nodes ?? []).find((n) => n.id === node.id);
    setSelectedId(node.id);
    setDraft(found ?? {});
  };

  const saveNode = async () => {
    if (!selectedId) return;
    if (!draft.title?.trim()) {
      toast.error("Informe o título da etapa");
      return;
    }
    await nodeCrud.update(selectedId, {
      title: draft.title.trim(),
      description: draft.description ?? "",
      node_type: draft.node_type ?? "process",
      owner: draft.owner || null,
      system: draft.system || null,
      notes: draft.notes || null,
    });
  };

  const deleteNode = async () => {
    if (!selectedId) return;
    await nodeCrud.remove(selectedId, "Etapa removida");
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  };

  const onEdgesDelete = async (deleted: Edge[]) => {
    for (const edge of deleted) await edgeCrud.remove(edge.id, "Conexão removida");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos fluxogramas
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-heading text-foreground">{chart.title}</span>
          <Button size="sm" onClick={addNode}>
            <Plus className="w-4 h-4 mr-1.5" />
            Nova etapa
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-body">
        Arraste as etapas para posicioná-las (salva automaticamente). Ligue as bolinhas
        das bordas para criar conexões e clique numa etapa para editar os detalhes.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[60vh] min-h-[420px] rounded-xl overflow-hidden border border-border/40 glass-card">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgesDelete={onEdgesDelete}
            onConnect={onConnect}
            onNodeClick={selectNode}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="hsl(var(--border))" gap={20} />
            <Controls className="!bg-card !border-border" />
          </ReactFlow>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-4">
          {!selectedId ? (
            <p className="text-sm text-muted-foreground font-body">
              Selecione uma etapa no fluxograma para editar.
            </p>
          ) : (
            <>
              <p className="text-sm font-heading text-primary">Detalhes da etapa</p>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={draft.title ?? ""}
                  maxLength={150}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={draft.node_type ?? "process"}
                  onValueChange={(v) => setDraft({ ...draft, node_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  rows={4}
                  value={draft.description ?? ""}
                  maxLength={2000}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input
                  value={draft.owner ?? ""}
                  maxLength={120}
                  onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sistema / ferramenta</Label>
                <Input
                  value={draft.system ?? ""}
                  maxLength={120}
                  onChange={(e) => setDraft({ ...draft, system: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input
                  value={draft.notes ?? ""}
                  maxLength={300}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveNode}>
                  <Save className="w-4 h-4 mr-1.5" />
                  Salvar etapa
                </Button>
                <Button variant="ghost" onClick={deleteNode}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowchartEditor;
