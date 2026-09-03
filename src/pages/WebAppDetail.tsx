import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Globe } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import SiteLayout from "@/components/SiteLayout";
import { useWebProjectById } from "@/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const WebAppDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useWebProjectById(id);

  useEffect(() => {
    if (project) document.title = `${project.title} | Aplicações Web`;
  }, [project?.title]);

  return (
    <SiteLayout>
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/aplicacoes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Aplicações Web
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !project ? (
            <p className="text-muted-foreground font-body">Aplicação não encontrada.</p>
          ) : (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <header className="space-y-3">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary font-body">
                  {project.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold font-heading">{project.title}</h1>
              </header>

              {project.preview_url ? (
                <div className="rounded-2xl overflow-hidden border border-border/40 glass-card">
                  <img
                    src={project.preview_url}
                    alt={`Preview da aplicação ${project.title}`}
                    loading="lazy"
                    className="w-full object-cover object-top"
                  />
                </div>
              ) : (
                <div className="rounded-2xl glass-card h-48 flex items-center justify-center">
                  <Globe className="w-12 h-12 text-primary" />
                </div>
              )}

              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold font-heading">Como funciona</h2>
                <div className="rich-text text-muted-foreground font-body leading-relaxed whitespace-pre-line">
                  {project.description || "Descrição em breve."}
                </div>

                {project.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs rounded-md bg-secondary/60 text-muted-foreground border border-border/40 font-body"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Button size="lg" asChild>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("Abriu aplicação web", { app: project.title })}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Acessar aplicação
                </a>
              </Button>
            </motion.article>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default WebAppDetail;
