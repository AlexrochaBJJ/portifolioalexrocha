import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { X, User, Monitor, StickyNote } from "lucide-react";
import type { FlowNode, FlowEdge } from "@/hooks/useContent";

const typeStyle: Record<string, string> = {
  start: "hsl(var(--primary))",
  end: "hsl(var(--primary))",
  decision: "hsl(var(--accent))",
  process: "hsl(var(--border))",
};

interface Props {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const FlowchartViewer = ({ nodes, edges }: Props) => {
  const [selected, setSelected] = useState<FlowNode | null>(null);

  const rfNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        position: { x: Number(n.position_x), y: Number(n.position_y) },
        data: { label: n.title },
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
          border: `1px solid ${typeStyle[n.node_type] ?? "hsl(var(--border))"}`,
          borderRadius: n.node_type === "decision" ? 16 : 10,
          padding: 12,
          fontSize: 13,
          fontWeight: 500,
          width: 190,
          textAlign: "center" as const,
        },
      })),
    [nodes],
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        label: e.label ?? undefined,
        animated: true,
        style: { stroke: "hsl(var(--primary) / 0.6)" },
        labelStyle: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
        labelBgStyle: { fill: "hsl(var(--background))" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--primary))" },
      })),
    [edges],
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      setSelected(nodes.find((n) => n.id === node.id) ?? null);
    },
    [nodes],
  );

  if (nodes.length === 0) {
    return (
      <div className="glass-card rounded-xl p-10 text-center">
        <p className="text-sm text-muted-foreground font-body">
          Este fluxograma ainda não possui etapas cadastradas.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-[65vh] min-h-[420px] rounded-xl overflow-hidden border border-border/40 glass-card">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodeClick={onNodeClick}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="hsl(var(--border))" gap={20} />
          <Controls className="!bg-card !border-border" />
          <MiniMap
            pannable
            zoomable
            maskColor="hsl(var(--background) / 0.7)"
            nodeColor="hsl(var(--primary))"
            style={{ background: "hsl(var(--card))" }}
          />
        </ReactFlow>
      </div>

      {selected && (
        <aside className="mt-4 glass-card rounded-xl p-5 relative animate-in fade-in">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            aria-label="Fechar detalhe"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs uppercase tracking-wide text-primary font-body mb-1">
            Etapa do processo
          </p>
          <h3 className="text-lg font-semibold font-heading text-foreground mb-3">
            {selected.title}
          </h3>
          {selected.description && (
            <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4 whitespace-pre-line">
              {selected.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-sm font-body text-muted-foreground">
            {selected.owner && (
              <span className="inline-flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {selected.owner}
              </span>
            )}
            {selected.system && (
              <span className="inline-flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                {selected.system}
              </span>
            )}
            {selected.notes && (
              <span className="inline-flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-primary" />
                {selected.notes}
              </span>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

export default FlowchartViewer;
