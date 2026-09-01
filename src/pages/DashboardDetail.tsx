import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Maximize2 } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import DashboardViewer from "@/components/DashboardViewer";
import { useDashboardById } from "@/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";

const DashboardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: dashboard, isLoading } = useDashboardById(id);
  const [viewing, setViewing] = useState(false);

  useEffect(() => {
    if (dashboard) document.title = `${dashboard.title} | Dashboards`;
  }, [dashboard?.title]);

  const Icon = getIcon(dashboard?.icon);

  return (
    <SiteLayout>
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/dashboards"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Dashboards
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !dashboard ? (
            <p className="text-muted-foreground font-body">Dashboard não encontrado.</p>
          ) : (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <header className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary font-body">
                    {dashboard.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold font-heading">
                    {dashboard.title}
                  </h1>
                </div>
              </header>

              {dashboard.cover_url && (
                <div className="overflow-hidden rounded-2xl border border-border/50">
                  <img
                    src={dashboard.cover_url}
                    alt={`Capa do dashboard ${dashboard.title}`}
                    className="w-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setViewing(true)} size="lg">
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Abrir dashboard
                </Button>
                {dashboard.source_type !== "html" && dashboard.embed_url && (
                  <Button variant="outline" size="lg" asChild>
                    <a href={dashboard.embed_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir no Power BI
                    </a>
                  </Button>
                )}
              </div>

              <div className="line-gradient" />

              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold font-heading">Sobre este dashboard</h2>
                <div className="rich-text text-muted-foreground font-body leading-relaxed whitespace-pre-line">
                  {dashboard.description || "Descrição em breve."}
                </div>
                <p className="text-xs text-muted-foreground font-body">
                  {dashboard.source_type === "html"
                    ? "Dashboard interativo desenvolvido em HTML, executado com segurança dentro do portfólio."
                    : "Dashboard publicado no Power BI, com filtros e visuais interativos."}{" "}
                  Todos os dados são fictícios.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setViewing(true)} size="lg">
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Abrir dashboard
                </Button>
                {dashboard.source_type !== "html" && dashboard.embed_url && (
                  <Button variant="outline" size="lg" asChild>
                    <a href={dashboard.embed_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir no Power BI
                    </a>
                  </Button>
                )}
              </div>
            </motion.article>
          )}
        </div>
      </section>

      <DashboardViewer
        dashboard={viewing ? dashboard ?? null : null}
        onClose={() => setViewing(false)}
      />
    </SiteLayout>
  );
};

export default DashboardDetail;
