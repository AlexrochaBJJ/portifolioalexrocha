import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Workflow, ArrowRight } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlowcharts, useCareer } from "@/hooks/useContent";

const Experiences = () => {
  const { data: flowcharts, isLoading } = useFlowcharts();
  const { data: career } = useCareer();

  return (
    <SiteLayout>
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-5">
              <Workflow className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground font-body">
                Experiência como comprador
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              Processos de <span className="text-gradient-amber">Compra</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto font-body">
              Fluxogramas interativos dos processos de compras que estruturei e
              operei. Clique em um fluxo para explorar cada etapa em detalhe.
            </p>
            <div className="line-gradient max-w-xs mx-auto mt-8" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-52 rounded-xl" />
                ))
              : (flowcharts ?? []).map((chart, index) => (
                  <motion.div
                    key={chart.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <Link
                      to={`/experiencias/${chart.slug}`}
                      className="group glass-card-hover rounded-xl p-6 flex flex-col h-full"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Workflow className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-lg font-semibold font-heading text-foreground group-hover:text-primary transition-colors mb-2">
                        {chart.title}
                      </h2>
                      {chart.context && (
                        <p className="text-xs text-primary font-body mb-2">
                          {chart.context}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-3 mb-4">
                        {chart.summary}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {chart.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 text-xs rounded-md bg-secondary/60 text-muted-foreground border border-border/40 font-body"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>

          {!isLoading && (flowcharts ?? []).length === 0 && (
            <p className="text-center text-muted-foreground font-body">
              Nenhum fluxograma publicado ainda.
            </p>
          )}
        </div>
      </section>

      {career && career.length > 0 && (
        <section className="py-16 px-6 border-t border-border/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-10">
              Onde <span className="text-gradient-amber">atuei</span>
            </h2>
            <ol className="relative border-l border-border/60 pl-6 space-y-8">
              {career.map((job) => (
                <li key={job.id} className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground font-body mb-1">
                    {job.period}
                  </p>
                  <h3 className="font-heading font-semibold text-foreground">
                    {job.role_title}
                  </h3>
                  <p className="text-sm text-primary font-body mb-2">{job.company}</p>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    {job.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </SiteLayout>
  );
};

export default Experiences;
