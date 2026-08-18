import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Workflow, MousePointerClick } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import FlowchartViewer from "@/components/FlowchartViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlowchartBySlug } from "@/hooks/useContent";

const ExperienceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useFlowchartBySlug(slug);

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

          {isLoading ? (
            <Skeleton className="h-[60vh] rounded-xl" />
          ) : !data?.chart ? (
            <p className="text-muted-foreground font-body">Fluxograma não encontrado.</p>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
                  <Workflow className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-body">
                    {data.chart.context || "Processo de compras"}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">
                  {data.chart.title}
                </h1>
                <p className="text-muted-foreground font-body max-w-3xl leading-relaxed">
                  {data.chart.summary}
                </p>
                {data.chart.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {data.chart.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs rounded-md bg-secondary/60 text-muted-foreground border border-border/40 font-body"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-6 inline-flex items-center gap-2 text-xs text-primary font-body">
                  <MousePointerClick className="w-4 h-4" />
                  Clique nas etapas para ver os detalhes
                </p>
              </div>

              <FlowchartViewer nodes={data.nodes} edges={data.edges} />
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default ExperienceDetail;
