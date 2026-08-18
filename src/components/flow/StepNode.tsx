import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Diamond, Flag, Play, GitBranch } from "lucide-react";

export interface StepNodeData {
  title: string;
  items: string[];
  node_type: string;
  [key: string]: unknown;
}

const label: Record<string, string> = {
  start: "Início",
  end: "Fim",
  decision: "Decisão",
  branch: "Ramificação",
};

const icon: Record<string, typeof Play> = {
  start: Play,
  end: Flag,
  decision: Diamond,
  branch: GitBranch,
};

const shell = (type: string) => {
  if (type === "start" || type === "end")
    return "border-primary/70 bg-primary/10 rounded-full";
  if (type === "decision") return "border-accent/70 bg-accent/10 rounded-2xl";
  if (type === "branch") return "border-primary/40 bg-card/80 rounded-2xl border-dashed";
  return "border-border/70 bg-card/80 rounded-xl";
};

const StepNode = ({ data, selected }: NodeProps) => {
  const d = data as StepNodeData;
  const Icon = icon[d.node_type];
  const tag = label[d.node_type];

  return (
    <div
      className={`w-[230px] border backdrop-blur px-4 py-3 text-center transition-shadow ${shell(
        d.node_type,
      )} ${selected ? "shadow-[0_0_0_2px_hsl(var(--primary))]" : "shadow-sm"}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary !border-0" />
      {tag && (
        <p className="text-[10px] uppercase tracking-wider text-primary font-body mb-1 flex items-center justify-center gap-1">
          {Icon && <Icon className="w-3 h-3" />}
          {tag}
        </p>
      )}
      <p className="text-[13px] font-medium font-heading text-foreground leading-snug">
        {d.title}
      </p>
      {d.items?.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-left">
          {d.items.map((item, i) => (
            <li
              key={i}
              className="text-[11px] text-muted-foreground font-body leading-tight flex gap-1.5"
            >
              <span className="text-primary">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-primary !border-0" />
    </div>
  );
};

export default StepNode;
