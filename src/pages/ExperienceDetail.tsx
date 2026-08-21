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
} from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import FlowchartViewer from "@/components/FlowchartViewer";
import DashboardCard from "@/components/DashboardCard";
import DashboardViewer from "@/components/DashboardViewer";
import LovableProjectCard from "@/components/LovableProjectCard";
import FlowchartDetail from "./FlowchartDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { useExperienceBySlug, type DashboardRow } from "@/hooks/useContent";

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

  return (
    <SiteLayout>
      <section className="py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/experiencias"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para experiências
          </Link>

          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-body">
                {exp.sector || "Experiência profissional"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">
              {exp.role_title}
            </h1>
            <p className="text-lg text-primary font-body mb-4">{exp.company}</p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-body">
              <span className="inline-flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5" />
                {exp.period}
              </span>
              {exp.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {exp.location}
                </span>
              )}
              {exp.employment_type && <span>{exp.employment_type}</span>}
            </div>
          </header>

          {(exp.description || exp.long_description) && (
            <div className="glass-card rounded-xl p-6 mb-8">
              <p className="text-sm text-muted-foreground font-body leading-relaxed whitespace-pre-line">
                {exp.description || exp.long_description}
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 mb-10">
            {exp.responsibilities.length > 0 && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="inline-flex items-center gap-2 font-heading font-semibold mb-4">
                  <ListChecks className="w-4 h-4 text-primary" />
                  Responsabilidades
                </h2>
                <ul className="space-y-2">
                  {exp.responsibilities.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-muted-foreground font-body flex gap-2"
                    >
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {exp.results.length > 0 && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="inline-flex items-center gap-2 font-heading font-semibold mb-4">
                  <Target className="w-4 h-4 text-primary" />
                  Resultados
                </h2>
                <ul className="space-y-2">
                  {exp.results.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-muted-foreground font-body flex gap-2"
                    >
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {highlights.length > 0 && (
            <div className="mb-12">
              <h2 className="inline-flex items-center gap-2 text-2xl font-bold font-heading mb-5">
                <Sparkles className="w-5 h-5 text-primary" />
                Destaques e impacto
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {highlights.map((item) => (
                  <div key={item.id} className="glass-card rounded-xl p-5">
                    <p className="text-sm text-foreground font-body leading-relaxed whitespace-pre-line">
                      {item.highlight}
                    </p>
                    {item.impact && (
                      <div className="mt-4 pt-4 border-t border-border/40 flex gap-2">
                        <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground font-body leading-relaxed whitespace-pre-line">
                          {item.impact}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {exp.tools.length > 0 && (
            <div className="mb-12 space-y-4">
              {exp.tools.length > 0 && (
                <div>
                  <p className="inline-flex items-center gap-2 text-xs text-muted-foreground font-body mb-2">
                    <Wrench className="w-3.5 h-3.5 text-primary" />
                    Ferramentas e sistemas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exp.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2.5 py-1 text-xs rounded-md bg-secondary/60 text-muted-foreground border border-border/40 font-body"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {charts.length > 0 && (
            <div>
              <h2 className="inline-flex items-center gap-2 text-2xl font-bold font-heading mb-4">
                <Workflow className="w-5 h-5 text-primary" />
                Fluxogramas de processos
              </h2>

              {charts.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-5">
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
                  {current.summary && (
                    <p className="text-sm text-muted-foreground font-body max-w-3xl mb-4 leading-relaxed">
                      {current.summary}
                    </p>
                  )}
                  <p className="mb-5 inline-flex items-center gap-2 text-xs text-primary font-body">
                    <MousePointerClick className="w-4 h-4" />
                    Clique nas etapas para ver os detalhes
                  </p>
                  <FlowchartViewer nodes={nodes} edges={edges} />
                </>
              )}
            </div>
          )}

          {dashboards.length > 0 && (
            <div className="mt-14">
              <h2 className="inline-flex items-center gap-2 text-2xl font-bold font-heading mb-5">
                <BarChart3 className="w-5 h-5 text-primary" />
                Dashboards deste trabalho
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboards.map((dashboard, index) => (
                  <DashboardCard
                    key={dashboard.id}
                    dashboard={dashboard}
                    index={index}
                    onOpen={setOpenDashboard}
                  />
                ))}
              </div>
            </div>
          )}

          {webProjects.length > 0 && (
            <div className="mt-14">
              <h2 className="inline-flex items-center gap-2 text-2xl font-bold font-heading mb-5">
                <AppWindow className="w-5 h-5 text-primary" />
                Aplicações web deste trabalho
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {webProjects.map((project, index) => (
                  <LovableProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <DashboardViewer
        dashboard={openDashboard}
        onClose={() => setOpenDashboard(null)}
      />
    </SiteLayout>
  );
};

export default ExperienceDetail;
