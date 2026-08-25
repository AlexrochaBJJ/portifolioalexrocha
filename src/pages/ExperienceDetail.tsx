import RichText from "@/components/RichText";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  CalendarRange,
  MousePointerClick,
  Workflow,
  Target,
  ListChecks,
  Wrench,
  Sparkles,
  TrendingUp,
  BarChart3,
  AppWindow,
  FileText,
} from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import FlowchartViewer from "@/components/FlowchartViewer";
import DashboardCard from "@/components/DashboardCard";
import DashboardViewer from "@/components/DashboardViewer";
import LovableProjectCard from "@/components/LovableProjectCard";
import FlowchartDetail from "./FlowchartDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { useExperienceBySlug, type DashboardRow } from "@/hooks/useContent";

const Section = ({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: typeof Target;
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-28 py-12 border-t border-border/40 first:border-t-0">
    <div className="mb-7 max-w-3xl">
      <h2 className="inline-flex items-center gap-2.5 text-2xl md:text-[1.75rem] font-bold font-heading">
        <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </span>
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground font-body mt-3 leading-relaxed">
          {description}
        </p>
      )}
    </div>
    {children}
  </section>
);

const ExperienceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useExperienceBySlug(slug);
  const [activeChart, setActiveChart] = useState<string | null>(null);
  const [openDashboard, setOpenDashboard] = useState<DashboardRow | null>(null);

  if (isLoading) {
    return (
      <SiteLayout>
        <section className="py-14 px-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <Skeleton className="h-10 w-2/3 rounded-lg" />
            <Skeleton className="h-[50vh] rounded-xl" />
          </div>
        </section>
      </SiteLayout>
    );
  }

  // Slug antigo de fluxograma continua funcionando
  if (!data?.experience) return <FlowchartDetail />;

  const exp = data.experience;
  const charts = data.charts;
  const highlights = data.highlights;
  const dashboards = data.dashboards;
  const webProjects = data.webProjects;
  const currentId = activeChart ?? charts[0]?.id ?? null;
  const current = charts.find((c) => c.id === currentId) ?? null;
  const nodes = data.nodes.filter((n) => n.flowchart_id === currentId);
  const edges = data.edges.filter((e) => e.flowchart_id === currentId);

  const description = exp.description || exp.long_description;

  const summary = [
    description && { id: "sobre", label: "Sobre a atuação" },
    exp.responsibilities.length > 0 && { id: "responsabilidades", label: "Responsabilidades" },
    exp.results.length > 0 && { id: "resultados", label: "Resultados" },
    highlights.length > 0 && { id: "destaques", label: "Destaques e impacto" },
    exp.tools.length > 0 && { id: "ferramentas", label: "Ferramentas" },
    charts.length > 0 && { id: "fluxogramas", label: "Fluxogramas" },
    dashboards.length > 0 && { id: "dashboards", label: "Dashboards" },
    webProjects.length > 0 && { id: "aplicacoes", label: "Aplicações web" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <SiteLayout>
      {/* Cabeçalho */}
      <header className="px-6 pt-12 pb-10 border-b border-border/40 bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/experiencias"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para experiências
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-5">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-body">
              {exp.sector || "Experiência profissional"}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-heading tracking-tight mb-3 max-w-4xl leading-[1.1]">
            {exp.role_title}
          </h1>
          <p className="text-lg md:text-xl text-primary font-body mb-6">{exp.company}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground font-body">
            <span className="inline-flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-primary/70" />
              {exp.period}
            </span>
            {exp.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary/70" />
                {exp.location}
              </span>
            )}
            {exp.employment_type && <span>{exp.employment_type}</span>}
          </div>
        </div>
      </header>

      <div className="px-6 pb-20">
        <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[200px_1fr] lg:gap-14">
          {/* Sumário lateral */}
          {summary.length > 1 && (
            <nav className="hidden lg:block">
              <div className="sticky top-28 py-12">
                <p className="text-[0.7rem] uppercase tracking-widest text-muted-foreground font-body mb-4">
                  Nesta página
                </p>
                <ul className="space-y-2.5 border-l border-border/50">
                  {summary.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block -ml-px pl-4 border-l border-transparent text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors font-body"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          )}

          <div className="min-w-0">
            {description && (
              <Section
                id="sobre"
                icon={FileText}
                title="Sobre a atuação"
              >
                <RichText value={description} />

              </Section>
            )}

            {exp.responsibilities.length > 0 && (
              <Section id="responsabilidades" icon={ListChecks} title="Responsabilidades">
                <ul className="grid gap-3 md:grid-cols-2">
                  {exp.responsibilities.map((item) => (
                    <li
                      key={item}
                      className="glass-card rounded-xl p-4 flex gap-3 text-sm text-muted-foreground font-body leading-relaxed"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {exp.results.length > 0 && (
              <Section id="resultados" icon={Target} title="Resultados">
                <ul className="grid gap-3 md:grid-cols-2">
                  {exp.results.map((item) => (
                    <li
                      key={item}
                      className="glass-card rounded-xl p-4 flex gap-3 text-sm text-muted-foreground font-body leading-relaxed"
                    >
                      <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {highlights.length > 0 && (
              <Section
                id="destaques"
                icon={Sparkles}
                title="Destaques e impacto"
                description="O que foi feito e no que resultou."
              >
                <p className="inline-flex items-center gap-2 text-xs text-muted-foreground font-body mb-5">
                  <span className="featured-chip px-2 py-1 rounded-md border text-[0.7rem]">
                    Colorido
                  </span>
                  = maior destaque
                </p>
                <div className="space-y-5">
                  {highlights.map((item) => {
                    const featured = Boolean(
                      (item as { is_featured?: boolean }).is_featured,
                    );
                    return (
                      <div
                        key={item.id}
                        className={`glass-card rounded-2xl p-6 md:p-8 ${
                          featured
                            ? "border-primary/50 bg-primary/[0.06] shadow-[0_0_40px_-16px_hsl(var(--amber-glow)/0.5)]"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[0.7rem] uppercase tracking-widest text-primary/80 font-body">
                            O que fiz
                          </p>
                          {featured && (
                            <span className="featured-chip px-2 py-0.5 rounded-md border text-[0.65rem] uppercase tracking-widest font-body">
                              Maior destaque
                            </span>
                          )}
                        </div>
                        <div className="rich-text rich-text-wide rich-text-strong">
                          {item.highlight}
                        </div>
                        {item.impact && (
                          <div className="mt-6 pt-6 border-t border-border/40">
                            <p className="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-widest text-muted-foreground font-body mb-2">
                              <TrendingUp className="w-3.5 h-3.5 text-primary" />
                              Impacto
                            </p>
                            <div className="rich-text rich-text-wide">{item.impact}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}


            {exp.tools.length > 0 && (
              <Section id="ferramentas" icon={Wrench} title="Ferramentas e sistemas">
                <div className="flex flex-wrap gap-2">
                  {exp.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1.5 text-xs rounded-lg bg-secondary/60 text-muted-foreground border border-border/40 font-body"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {charts.length > 0 && (
              <Section
                id="fluxogramas"
                icon={Workflow}
                title="Fluxogramas de processos"
                description={current?.summary || undefined}
              >
                {charts.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {charts.map((chart) => (
                      <button
                        key={chart.id}
                        onClick={() => setActiveChart(chart.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-body border transition-colors ${
                          chart.id === currentId
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-secondary/50 text-muted-foreground border-border/40 hover:text-foreground"
                        }`}
                      >
                        {chart.title}
                      </button>
                    ))}
                  </div>
                )}

                {current && (
                  <>
                    <p className="mb-6 inline-flex items-center gap-2 text-xs text-primary font-body">
                      <MousePointerClick className="w-4 h-4" />
                      Clique nas etapas para ver os detalhes
                    </p>
                    <FlowchartViewer nodes={nodes} edges={edges} />
                  </>
                )}
              </Section>
            )}

            {dashboards.length > 0 && (
              <Section id="dashboards" icon={BarChart3} title="Dashboards deste trabalho">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dashboards.map((dashboard, index) => (
                    <DashboardCard
                      key={dashboard.id}
                      dashboard={dashboard}
                      index={index}
                    />
                  ))}
                </div>
              </Section>
            )}

            {webProjects.length > 0 && (
              <Section id="aplicacoes" icon={AppWindow} title="Aplicações web deste trabalho">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {webProjects.map((project, index) => (
                    <LovableProjectCard key={project.id} project={project} index={index} />
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>

      <DashboardViewer
        dashboard={openDashboard}
        onClose={() => setOpenDashboard(null)}
      />
    </SiteLayout>
  );
};

export default ExperienceDetail;
