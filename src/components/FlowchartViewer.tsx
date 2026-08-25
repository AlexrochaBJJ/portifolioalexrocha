import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  X,
  User,
  Monitor,
  StickyNote,
  Play,
  Flag,
  Diamond,
  GitBranch,
  CornerUpLeft,
  ListOrdered,
  Plus,
  Trash2,
} from "lucide-react";

import type { FlowNode, FlowEdge } from "@/hooks/useContent";
import { computeFlowLayout, NODE_LAYOUT_WIDTH } from "@/lib/flowLayout";

interface Props {
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** modo de edição: clicar na etapa abre o formulário */
  editable?: boolean;
  onEditNode?: (node: FlowNode) => void;
  onAddAfter?: (node: FlowNode) => void;
  onDeleteNode?: (node: FlowNode) => void;
  onEditEdge?: (edge: FlowEdge) => void;
}



const typeLabel: Record<string, string> = {
  start: "Início",
  end: "Fim",
  decision: "Decisão",
  branch: "Ramificação",
  process: "Etapa",
};

const typeIcon: Record<string, typeof Play> = {
  start: Play,
  end: Flag,
  decision: Diamond,
  branch: GitBranch,
  process: ListOrdered,
};

const palette: Record<string, { token: string; radius: string; dashed?: boolean }> = {
  start: { token: "--flow-start", radius: "rounded-full" },
  end: { token: "--flow-end", radius: "rounded-full" },
  decision: { token: "--flow-decision", radius: "rounded-xl" },
  branch: { token: "--flow-branch", radius: "rounded-xl", dashed: true },
  process: { token: "--flow-process", radius: "rounded-xl" },
};

const V_GAP = 64;
const NODE_W = NODE_LAYOUT_WIDTH;

const FlowchartViewer = ({
  nodes,
  edges,
  editable = false,
  onEditNode,
  onAddAfter,
  onDeleteNode,
  onEditEdge,
}: Props) => {


  const [selected, setSelected] = useState<FlowNode | null>(null);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);


  const layout = useMemo(() => computeFlowLayout(nodes, edges), [nodes, edges]);

  // rank (level index) per node, from layout y ordering
  const { rankOf, levels } = useMemo(() => {
    const groups = new Map<number, string[]>();
    nodes.forEach((n) => {
      const y = layout.positions[n.id]?.y ?? 0;
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y)!.push(n.id);
    });
    const sorted = [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([, ids]) => ids);
    const map: Record<string, number> = {};
    sorted.forEach((ids, i) => ids.forEach((id) => (map[id] = i)));
    return { rankOf: map, levels: sorted };
  }, [nodes, layout]);

  const measure = useCallback(() => {
    const next: Record<string, number> = {};
    Object.entries(nodeRefs.current).forEach(([id, el]) => {
      if (el) next[id] = el.offsetHeight;
    });
    setHeights((prev) => {
      const changed =
        Object.keys(next).length !== Object.keys(prev).length ||
        Object.entries(next).some(([id, h]) => Math.abs((prev[id] ?? 0) - h) > 1);
      return changed ? next : prev;
    });
  }, []);

  useLayoutEffect(measure, [measure, nodes, edges]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const LANE_GAP = 20;

  // espaço reservado à esquerda para as linhas roteadas manualmente por lá
  const leftPad = useMemo(() => {
    const leftCount = edges.filter(
      (e) => (e as FlowEdge).route_side === "left",
    ).length;
    return leftCount > 0 ? 30 + leftCount * LANE_GAP : 0;
  }, [edges]);

  // geometry: x from layout (normalized), y stacked using measured heights
  const geometry = useMemo(() => {
    const xs = nodes.map((n) => layout.positions[n.id]?.x ?? 0);
    const minX = xs.length ? Math.min(...xs) : 0;
    const boxes: Record<string, { x: number; y: number; w: number; h: number }> = {};
    let y = 8;
    levels.forEach((ids) => {
      const levelHeight = Math.max(
        ...ids.map((id) => heights[id] ?? layout.sizes[id]?.height ?? 72),
      );
      ids.forEach((id) => {
        boxes[id] = {
          x: (layout.positions[id]?.x ?? 0) - minX + 8 + leftPad,
          y,
          w: NODE_W,
          h: heights[id] ?? layout.sizes[id]?.height ?? 72,
        };
      });
      y += levelHeight + V_GAP;
    });
    const width = Math.max(
      ...Object.values(boxes).map((b) => b.x + b.w),
      NODE_W + 16 + leftPad,
    ) + 8;
    const height = Math.max(y - V_GAP + 16, 120);
    return { boxes, width, height };
  }, [nodes, levels, layout, heights, leftPad]);

  // rotas: arestas que pulam níveis (ou voltam) saem pela laterais, nunca por
  // dentro dos cards. route_side/lane_offset permitem ajuste manual.
  const routing = useMemo(() => {
    const out: {
      key: string;
      edge: FlowEdge;
      d: string;
      label?: string | null;
      lx?: number;
      ly?: number;
      back: boolean;
    }[] = [];

    const rightEdge = Math.max(
      ...Object.values(geometry.boxes).map((b) => b.x + b.w),
      NODE_W + 8 + leftPad,
    );
    let laneCount = 0;
    let leftLaneCount = 0;
    const nextLane = () => rightEdge + 26 + laneCount++ * LANE_GAP;
    const nextLeftLane = () => Math.max(leftPad - 10 - leftLaneCount++ * LANE_GAP, 6);

    // primeiro as arestas que precisam de canaleta, para reservar as faixas
    const needsLane = (e: FlowEdge) => {
      if (e.route_side === "direct") return false;
      if (e.route_side === "left" || e.route_side === "right") return true;
      const key = `${e.source_node_id}->${e.target_node_id}`;
      if (layout.backEdges.has(key)) return true;
      const rs = rankOf[e.source_node_id];
      const rt = rankOf[e.target_node_id];
      return rs !== undefined && rt !== undefined && rt - rs > 1;
    };

    const ordered = [...edges].sort(
      (a, b) => Number(needsLane(b)) - Number(needsLane(a)),
    );

    ordered.forEach((e) => {
      const a = geometry.boxes[e.source_node_id];
      const b = geometry.boxes[e.target_node_id];
      if (!a || !b) return;
      const key = `${e.source_node_id}->${e.target_node_id}`;
      const back = layout.backEdges.has(key);
      const side = e.route_side ?? "auto";
      const off = e.lane_offset ?? 0;
      const sx = a.x + a.w / 2;
      const sy = a.y + a.h;
      const tx = b.x + b.w / 2;
      const ty = b.y;

      if (side === "left") {
        const lane = nextLeftLane() - off;
        const d = `M ${a.x} ${a.y + a.h / 2} H ${lane} V ${b.y + b.h / 2} H ${b.x}`;
        out.push({
          key,
          edge: e,
          d,
          label: e.label,
          lx: lane - 4,
          ly: (a.y + b.y) / 2,
          back,
        });
        return;
      }

      if (side === "right" || (side === "auto" && back)) {
        const lane = nextLane() + off;
        const d = `M ${a.x + a.w} ${a.y + a.h / 2} H ${lane} V ${b.y + b.h / 2} H ${b.x + b.w}`;
        out.push({
          key,
          edge: e,
          d,
          label: e.label,
          lx: lane + 6,
          ly: (a.y + b.y) / 2,
          back,
        });
        return;
      }

      if (side === "auto" && needsLane(e)) {
        // desvia pela lateral direita para não cortar os cards intermediários
        const lane = nextLane() + off;
        const drop = Math.min(24, V_GAP / 2);
        const d = `M ${sx} ${sy} V ${sy + drop} H ${lane} V ${ty - drop} H ${tx} V ${ty}`;
        out.push({
          key,
          edge: e,
          d,
          label: e.label,
          lx: lane + 6,
          ly: (sy + ty) / 2,
          back: false,
        });
        return;
      }

      const mid = sy + Math.max((ty - sy) / 2, 16) + off;
      const d =
        Math.abs(sx - tx) < 2
          ? `M ${sx} ${sy} V ${ty}`
          : `M ${sx} ${sy} V ${mid} H ${tx} V ${ty}`;
      out.push({
        key,
        edge: e,
        d,
        label: e.label,
        lx: Math.abs(sx - tx) < 2 ? sx + 6 : (sx + tx) / 2,
        ly: mid - 6,
        back: side === "direct" ? false : back,
      });
    });

    const width = Math.max(
      geometry.width,
      laneCount > 0 ? rightEdge + 26 + (laneCount - 1) * LANE_GAP + 60 : 0,
    );
    return { paths: out, width };
  }, [edges, geometry, layout.backEdges, rankOf, leftPad]);


  const paths = routing.paths;
  const canvasWidth = routing.width;

  // escala automática: o fluxograma inteiro cabe na largura disponível,
  // sem precisar de scroll horizontal
  const scale = containerWidth
    ? Math.min(1, containerWidth / canvasWidth)
    : 1;



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
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-3 sm:p-5">
        <div className="flex flex-wrap gap-3 mb-4 px-1">
          {Object.entries(palette).map(([type, cfg]) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 text-[11px] font-body text-muted-foreground"
            >
              <span
                className="w-3 h-3 rounded-sm border"
                style={{
                  background: `hsl(var(${cfg.token}) / 0.18)`,
                  borderColor: `hsl(var(${cfg.token}) / 0.7)`,
                }}
              />
              {typeLabel[type]}
            </span>
          ))}
        </div>

        <div
          className="overflow-x-auto rounded-lg dot-pattern"
          style={{ background: "hsl(var(--flow-canvas) / 0.6)" }}
        >
          <div
            className="relative mx-auto"
            style={{ width: canvasWidth, height: geometry.height, minWidth: NODE_W + 16 }}
          >
            <svg
              className="absolute inset-0 pointer-events-none"
              width={canvasWidth}
              height={geometry.height}
            >
              <defs>
                <marker
                  id="flow-arrow"
                  markerWidth="9"
                  markerHeight="9"
                  refX="7"
                  refY="4.5"
                  orient="auto"
                >
                  <path d="M0,0 L9,4.5 L0,9 z" fill="hsl(var(--flow-line))" />
                </marker>
                <marker
                  id="flow-arrow-back"
                  markerWidth="9"
                  markerHeight="9"
                  refX="7"
                  refY="4.5"
                  orient="auto"
                >
                  <path d="M0,0 L9,4.5 L0,9 z" fill="hsl(var(--accent))" />
                </marker>
              </defs>
              {paths.map((p) => (
                <g key={p.key}>
                  <path
                    d={p.d}
                    fill="none"
                    stroke={p.back ? "hsl(var(--accent) / 0.8)" : "hsl(var(--flow-line))"}
                    strokeWidth={1.6}
                    strokeDasharray={p.back ? "5 4" : undefined}
                    markerEnd={p.back ? "url(#flow-arrow-back)" : "url(#flow-arrow)"}
                  />
                  {editable && onEditEdge && (
                    <path
                      d={p.d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={14}
                      style={{ pointerEvents: "stroke", cursor: "pointer" }}
                      onClick={() => onEditEdge(p.edge)}
                    />
                  )}
                  {p.label && (
                    <text
                      x={p.lx}
                      y={p.ly}
                      textAnchor="middle"
                      className="font-body"
                      fontSize="10"
                      fill="hsl(var(--primary))"
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              ))}

            </svg>

            {nodes.map((node) => {
              const box = geometry.boxes[node.id];
              if (!box) return null;
              const cfg = palette[node.node_type] ?? palette.process;
              const Icon = typeIcon[node.node_type] ?? ListOrdered;
              const items = (node as FlowNode & { items?: string[] }).items ?? [];
              const active = selected?.id === node.id;
              return (
                <div
                  key={node.id}
                  ref={(el) => (nodeRefs.current[node.id] = el)}
                  className="absolute"
                  style={{ left: box.x, top: box.y, width: box.w }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (editable) onEditNode?.(node);
                      else setSelected((cur) => (cur?.id === node.id ? null : node));
                    }}

                    className={`w-full text-left border p-3 transition-shadow ${cfg.radius} ${
                      cfg.dashed ? "border-dashed" : ""
                    } ${active ? "shadow-lg" : ""}`}
                    style={{
                      background: `hsl(var(${cfg.token}) / ${active ? 0.28 : 0.14})`,
                      borderColor: `hsl(var(${cfg.token}) / ${active ? 1 : 0.65})`,
                      boxShadow: active
                        ? `0 0 0 2px hsl(var(${cfg.token}) / 0.35)`
                        : undefined,
                    }}
                  >
                    <span
                      className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-body"
                      style={{ color: `hsl(var(${cfg.token}))` }}
                    >
                      <Icon className="w-3 h-3" />
                      {typeLabel[node.node_type] ?? node.node_type}
                    </span>
                    <span className="block text-[13px] font-heading font-semibold text-foreground mt-1 leading-snug">
                      {node.title}
                    </span>
                    {items.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {items.map((item, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-muted-foreground font-body flex gap-1.5 leading-snug"
                          >
                            <span style={{ color: `hsl(var(${cfg.token}))` }}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                  {editable && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => onAddAfter?.(node)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-primary/50 bg-primary/10 text-[10px] font-body text-primary hover:bg-primary/20"
                      >
                        <Plus className="w-3 h-3" />
                        etapa depois
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNode?.(node)}
                        className="inline-flex items-center px-1.5 py-0.5 rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10"
                        aria-label={`Remover ${node.title}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

              );
            })}
          </div>
        </div>
        <p className="mt-3 px-1 text-[11px] text-muted-foreground font-body inline-flex items-center gap-1.5">
          <CornerUpLeft className="w-3 h-3 text-accent" />
          setas tracejadas indicam retorno a uma etapa anterior
        </p>
      </div>

      {selected && (
        <aside className="glass-card rounded-xl p-5 relative animate-in fade-in">
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

      <p className="text-[11px] text-muted-foreground font-body px-1">
        Total de {nodes.length} etapas · use o scroll horizontal quando o fluxo abrir
        ramificações.
      </p>
    </div>
  );
};

export default FlowchartViewer;
