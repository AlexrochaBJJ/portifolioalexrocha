import { useMemo, useState } from "react";
import {
  X,
  User,
  Monitor,
  StickyNote,
  ArrowDown,
  Play,
  Flag,
  Diamond,
  GitBranch,
  CornerUpLeft,
} from "lucide-react";
import type { FlowNode, FlowEdge } from "@/hooks/useContent";
import { computeFlowLayout } from "@/lib/flowLayout";

interface Props {
  nodes: FlowNode[];
  edges: FlowEdge[];
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
};

const shell = (type: string) => {
  if (type === "start" || type === "end")
    return "border-primary/70 bg-primary/10 rounded-3xl";
  if (type === "decision") return "border-accent/70 bg-accent/10 rounded-2xl";
  if (type === "branch") return "border-primary/40 bg-card/70 rounded-2xl border-dashed";
  return "border-border/70 bg-card/70 rounded-2xl";
};

const FlowchartViewer = ({ nodes, edges }: Props) => {
  const [selected, setSelected] = useState<FlowNode | null>(null);

  const layout = useMemo(() => computeFlowLayout(nodes, edges), [nodes, edges]);

  const levels = useMemo(() => {
    const groups = new Map<number, FlowNode[]>();
    nodes.forEach((n) => {
      const y = layout.positions[n.id]?.y ?? 0;
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y)!.push(n);
    });
    return [...groups.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, list]) =>
        [...list].sort(
          (a, b) =>
            (layout.positions[a.id]?.x ?? 0) - (layout.positions[b.id]?.x ?? 0),
        ),
      );
  }, [nodes, layout]);

  const incomingOf = (id: string) =>
    edges
      .filter((e) => e.target_node_id === id)
      .map((e) => ({
        label: e.label,
        source: nodes.find((n) => n.id === e.source_node_id),
        isBack: layout.backEdges.has(`${e.source_node_id}->${e.target_node_id}`),
      }));

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
      <div className="glass-card rounded-xl p-5 sm:p-8">
        <div className="flex flex-col items-center">
          {levels.map((group, levelIndex) => (
            <div key={levelIndex} className="w-full flex flex-col items-center">
              {levelIndex > 0 && (
                <ArrowDown className="w-5 h-5 text-primary/70 my-2 shrink-0" />
              )}
              <div className="w-full flex flex-wrap justify-center items-stretch gap-4">
                {group.map((node) => {
                  const Icon = typeIcon[node.node_type];
                  const incoming = incomingOf(node.id);
                  const tags = incoming.filter((i) => i.label);
                  const loops = incoming.filter((i) => i.isBack);
                  const items =
                    (node as FlowNode & { items?: string[] }).items ?? [];
                  return (
                    <div
                      key={node.id}
                      className="flex flex-col items-center w-full max-w-xs"
                    >
                      {tags.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1.5 mb-1.5">
                          {tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-body px-2 py-0.5 rounded-full bg-primary/15 text-primary"
                            >
                              {t.label}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setSelected((cur) => (cur?.id === node.id ? null : node))
                        }
                        className={`w-full text-left border p-4 transition-colors hover:border-primary ${shell(
                          node.node_type,
                        )} ${selected?.id === node.id ? "ring-1 ring-primary" : ""}`}
                      >
                        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-primary font-body">
                          {Icon && <Icon className="w-3 h-3" />}
                          {typeLabel[node.node_type] ?? node.node_type}
                        </span>
                        <span className="block text-sm font-heading text-foreground mt-1 leading-snug">
                          {node.title}
                        </span>
                        {items.length > 0 && (
                          <ul className="mt-2 space-y-0.5">
                            {items.map((item, i) => (
                              <li
                                key={i}
                                className="text-xs text-muted-foreground font-body flex gap-1.5"
                              >
                                <span className="text-primary">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </button>
                      {loops.length > 0 && (
                        <p className="mt-1.5 text-[10px] text-muted-foreground font-body inline-flex items-center gap-1">
                          <CornerUpLeft className="w-3 h-3 text-accent" />
                          retorna de {loops.map((l) => l.source?.title ?? "?").join(", ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
};

export default FlowchartViewer;
