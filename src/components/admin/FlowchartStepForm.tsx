import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LabelWithCount } from "./CharCount";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlowNode } from "@/hooks/useContent";

export const typeChoices = [
  { value: "start", label: "Início" },
  { value: "process", label: "Etapa" },
  { value: "decision", label: "Decisão" },
  { value: "branch", label: "Ramificação" },
  { value: "end", label: "Fim" },
];

export const typeLabel = (value: string) =>
  typeChoices.find((t) => t.value === value)?.label ?? value;

export interface Draft {
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

export const emptyDraft: Draft = {
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

export const draftFromNode = (node: FlowNode, prevIds: string[], edgeLabel: string): Draft => ({
  title: node.title,
  node_type: node.node_type,
  items: ((node as FlowNode & { items?: string[] }).items ?? []).join("\n"),
  description: node.description ?? "",
  owner: node.owner ?? "",
  system: node.system ?? "",
  notes: node.notes ?? "",
  prevIds,
  edgeLabel,
});

interface Props {
  draft: Draft;
  setDraft: (d: Draft) => void;
  nodes: FlowNode[];
  editingId: string | null;
  creating: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  showHeader?: boolean;
}

const FlowchartStepForm = ({
  draft,
  setDraft,
  nodes,
  editingId,
  creating,
  saving,
  onSave,
  onCancel,
  showHeader = true,
}: Props) => (
  <div className="space-y-4">
    {showHeader && (
      <div className="flex items-center justify-between">
        <p className="text-sm font-heading text-primary">
          {creating ? "Nova etapa" : "Editar etapa"}
        </p>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Fechar">
          <X className="w-4 h-4" />
        </Button>
      </div>
    )}

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
      <LabelWithCount label="Título" value={draft.title} max={150} />
      <Input
        value={draft.title}
        maxLength={150}
        placeholder="Equalização Comercial"
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
      />
    </div>

    <div className="space-y-2">
      <LabelWithCount label="Itens (um por linha)" value={draft.items} max={2000} />
      <Textarea
        rows={4}
        maxLength={2000}
        value={draft.items}
        placeholder={"Preço\nFrete\nPrazo\nPagamento"}
        onChange={(e) => setDraft({ ...draft, items: e.target.value })}
      />
    </div>

    <div className="space-y-2">
      <Label>Vem depois de</Label>
      {nodes.filter((n) => n.id !== editingId).length === 0 ? (
        <p className="text-xs text-muted-foreground font-body">Primeira etapa do fluxo.</p>
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
      <LabelWithCount label="Rótulo da seta (opcional)" value={draft.edgeLabel} max={60} />
      <Input
        value={draft.edgeLabel}
        maxLength={60}
        placeholder="Sim / Não / CIF"
        onChange={(e) => setDraft({ ...draft, edgeLabel: e.target.value })}
      />
    </div>

    <div className="space-y-2">
      <LabelWithCount
        label="Descrição (aparece ao clicar)"
        value={draft.description}
        max={2000}
      />
      <Textarea
        rows={3}
        value={draft.description}
        maxLength={2000}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
      />
    </div>

    <div className="space-y-2">
      <LabelWithCount label="Responsável" value={draft.owner} max={120} />
      <Input
        value={draft.owner}
        maxLength={120}
        onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
      />
    </div>

    <div className="space-y-2">
      <LabelWithCount label="Sistema / ferramenta" value={draft.system} max={120} />
      <Input
        value={draft.system}
        maxLength={120}
        onChange={(e) => setDraft({ ...draft, system: e.target.value })}
      />
    </div>

    <div className="space-y-2">
      <LabelWithCount label="Observações" value={draft.notes} max={300} />
      <Input
        value={draft.notes}
        maxLength={300}
        onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
      />
    </div>

    <Button onClick={onSave} disabled={saving} className="w-full">
      <Save className="w-4 h-4 mr-1.5" />
      {saving ? "Salvando..." : "Salvar etapa"}
    </Button>
  </div>
);

export default FlowchartStepForm;
