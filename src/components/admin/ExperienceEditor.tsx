import { useState } from "react";
import { ArrowLeft, Workflow, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CrudList from "./CrudList";
import FlowchartEditor from "./FlowchartEditor";
import {
  useDashboards,
  useExperienceDashboardLinks,
  useExperienceHighlights,
  useExperienceWebProjectLinks,
  useFlowcharts,
  useWebProjects,
  type CareerExperience,
  type Flowchart,
} from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";
import { slugify } from "@/lib/slug";

interface Props {
  experience: CareerExperience;
  onBack: () => void;
}

interface PickerProps {
  label: string;
  emptyText: string;
  items: { id: string; title: string; hint?: string }[];
  selectedIds: string[];
  onToggle: (id: string, selected: boolean) => void;
  categoryNote: string;
}

const LinkPicker = ({
  label,
  emptyText,
  items,
  selectedIds,
  onToggle,
  categoryNote,
}: PickerProps) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg font-semibold font-heading">{label}</h2>
      <p className="text-xs text-muted-foreground font-body mt-1">{categoryNote}</p>
    </div>
    {items.length === 0 ? (
      <p className="text-sm text-muted-foreground font-body">{emptyText}</p>
    ) : (
      <ul className="space-y-2">
        {items.map((item) => {
          const active = selectedIds.includes(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onToggle(item.id, active)}
                className={`w-full glass-card rounded-lg p-4 flex items-center justify-between gap-4 text-left transition-colors ${
                  active ? "border-primary/40" : "hover:border-primary/20"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-heading text-sm text-foreground truncate">
                    {item.title}
                  </p>
                  {item.hint && (
                    <p className="text-xs text-muted-foreground font-body truncate">
                      {item.hint}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 w-6 h-6 rounded-md border flex items-center justify-center ${
                    active
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "border-border/60 text-transparent"
                  }`}
                >
                  <Check className="w-4 h-4" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

const ExperienceEditor = ({ experience, onBack }: Props) => {
  const { data: linked, isLoading } = useFlowcharts(true, experience.id);
  const { data: all } = useFlowcharts(true);
  const crud = useCrud("flowcharts", ["flowcharts"]);
  const [drawing, setDrawing] = useState<Flowchart | null>(null);
  const [linkId, setLinkId] = useState("");

  const { data: highlights, isLoading: loadingHighlights } = useExperienceHighlights(
    experience.id,
  );
  const highlightCrud = useCrud("experience_highlights", [
    "experience_highlights",
    "experience",
  ]);

  const { data: dashboards } = useDashboards(true);
  const { data: webProjects } = useWebProjects(true);
  const { data: dashLinks } = useExperienceDashboardLinks(experience.id);
  const { data: appLinks } = useExperienceWebProjectLinks(experience.id);
  const dashLinkCrud = useCrud("experience_dashboards", [
    "experience_dashboards",
    "experience",
  ]);
  const appLinkCrud = useCrud("experience_web_projects", [
    "experience_web_projects",
    "experience",
  ]);

  const current = drawing
    ? (linked ?? []).find((c) => c.id === drawing.id) ?? drawing
    : null;

  if (current) {
    return <FlowchartEditor chart={current} onBack={() => setDrawing(null)} />;
  }

  const available = (all ?? []).filter((c) => !c.experience_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à trajetória
        </button>
        <div className="text-right">
          <p className="text-sm font-heading text-foreground">{experience.role_title}</p>
          <p className="text-xs text-muted-foreground font-body">{experience.company}</p>
        </div>
      </div>

      <Tabs defaultValue="highlights">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="highlights">Destaques e impacto</TabsTrigger>
          <TabsTrigger value="flowcharts">Fluxogramas</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="apps">Aplicações web</TabsTrigger>
        </TabsList>

        <TabsContent value="highlights" className="mt-6">
          <CrudList
            title="Destaques e impacto"
            isLoading={loadingHighlights}
            items={highlights ?? []}
            primaryField="highlight"
            secondaryField="impact"
            fields={[
              {
                name: "highlight",
                label: "Destaque (o que você fez)",
                type: "textarea",
                required: true,
                maxLength: 1000,
              },
              {
                name: "impact",
                label: "Impacto (no que resultou)",
                type: "textarea",
                maxLength: 1000,
              },
              { name: "sort_order", label: "Ordem", type: "number" },
            ]}
            onCreate={(values) =>
              highlightCrud.insert({ ...values, experience_id: experience.id })
            }
            onUpdate={highlightCrud.update}
            onDelete={highlightCrud.remove}
          />
        </TabsContent>

        <TabsContent value="flowcharts" className="mt-6 space-y-6">
          {available.length > 0 && (
            <div className="glass-card rounded-xl p-4 flex flex-wrap items-end gap-3">
              <div className="space-y-1.5 min-w-[240px]">
                <p className="text-xs text-muted-foreground font-body">
                  Vincular fluxograma existente
                </p>
                <Select value={linkId} onValueChange={setLinkId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fluxograma" />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                disabled={!linkId}
                onClick={async () => {
                  await crud.update(linkId, { experience_id: experience.id });
                  setLinkId("");
                }}
              >
                <Link2 className="w-4 h-4 mr-1.5" />
                Vincular
              </Button>
            </div>
          )}

          <CrudList
            title="Fluxogramas desta experiência"
            isLoading={isLoading}
            items={linked ?? []}
            primaryField="title"
            secondaryField="summary"
            fields={[
              { name: "title", label: "Título", required: true, maxLength: 150 },
              { name: "context", label: "Contexto / empresa", maxLength: 150 },
              { name: "summary", label: "Resumo", type: "textarea", maxLength: 1500 },
              { name: "tags", label: "Tags (separadas por vírgula)", type: "tags" },
              {
                name: "slug",
                label: "Endereço da página (opcional)",
                maxLength: 80,
                placeholder: "processo-de-compra-direta",
              },
              { name: "sort_order", label: "Ordem", type: "number" },
              { name: "is_published", label: "Publicado", type: "switch" },
            ]}
            onCreate={(values) =>
              crud.insert({
                ...values,
                slug: values.slug || slugify(String(values.title ?? "")),
                context: values.context || experience.company,
                experience_id: experience.id,
              })
            }
            onUpdate={(id, values) =>
              crud.update(id, {
                ...values,
                slug: values.slug || slugify(String(values.title ?? "")) || id,
              })
            }
            onDelete={crud.remove}
            extraActions={(item) => (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => setDrawing(item as Flowchart)}
              >
                <Workflow className="w-4 h-4 mr-1.5" />
                Desenhar
              </Button>
            )}
          />
        </TabsContent>

        <TabsContent value="dashboards" className="mt-6">
          <LinkPicker
            label="Dashboards desta experiência"
            emptyText="Nenhum dashboard cadastrado ainda."
            categoryNote={`Além dos itens marcados aqui, aparecem automaticamente os dashboards das categorias: ${
              (experience.dashboard_categories ?? []).join(", ") || "nenhuma selecionada"
            }.`}
            items={(dashboards ?? []).map((d) => ({
              id: d.id,
              title: d.title,
              hint: d.category,
            }))}
            selectedIds={(dashLinks ?? []).map((l) => l.dashboard_id)}
            onToggle={async (id, active) => {
              if (active) {
                const link = (dashLinks ?? []).find((l) => l.dashboard_id === id);
                if (link) await dashLinkCrud.remove(link.id, "Dashboard desvinculado");
              } else {
                await dashLinkCrud.insert(
                  { experience_id: experience.id, dashboard_id: id },
                  "Dashboard vinculado",
                );
              }
            }}
          />
        </TabsContent>

        <TabsContent value="apps" className="mt-6">
          <LinkPicker
            label="Aplicações web desta experiência"
            emptyText="Nenhuma aplicação cadastrada ainda."
            categoryNote={`Além dos itens marcados aqui, aparecem automaticamente as aplicações das categorias: ${
              (experience.webapp_categories ?? []).join(", ") || "nenhuma selecionada"
            }.`}
            items={(webProjects ?? []).map((p) => ({
              id: p.id,
              title: p.title,
              hint: p.category,
            }))}
            selectedIds={(appLinks ?? []).map((l) => l.web_project_id)}
            onToggle={async (id, active) => {
              if (active) {
                const link = (appLinks ?? []).find((l) => l.web_project_id === id);
                if (link) await appLinkCrud.remove(link.id, "Aplicação desvinculada");
              } else {
                await appLinkCrud.insert(
                  { experience_id: experience.id, web_project_id: id },
                  "Aplicação vinculada",
                );
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExperienceEditor;
