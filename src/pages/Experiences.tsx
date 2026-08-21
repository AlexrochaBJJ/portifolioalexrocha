import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Briefcase,
  ArrowRight,
  CalendarRange,
  MapPin,
  Building2,
} from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useCareer } from "@/hooks/useContent";

const Experiences = () => {
  const { data: career, isLoading } = useCareer();

  return (
    <SiteLayout>
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-5">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground font-body">
                Trajetória profissional
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              Linha do tempo das minhas{" "}
              <span className="text-gradient-amber">experiências</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto font-body">
              Percorra a trajetória em ordem e clique em qualquer etapa para ver
              os detalhes, resultados e os fluxogramas dos processos.
            </p>
            <div className="line-gradient max-w-xs mx-auto mt-8" />
          </motion.div>

          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* linha vertical */}
              <div
                className="absolute left-4 md:left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/40 to-transparent"
                aria-hidden
              />

              <ol className="space-y-10 md:space-y-14">
                {(career ?? []).map((exp, index) => {
                  const isRight = index % 2 === 1;
                  return (
                    <motion.li
                      key={exp.id}
                      className="relative pl-12 md:pl-0"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                    >
                      {/* marcador */}
                      <span
                        className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 flex items-center justify-center"
                        aria-hidden
                      >
                        <span className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20 shadow-[0_0_18px_hsl(var(--primary)/0.6)]" />
                      </span>

                      <div
                        className={`md:w-[calc(50%-2.5rem)] ${
                          isRight ? "md:ml-auto" : "md:mr-auto"
                        }`}
                      >
                        {/* período fora do card no desktop */}
                        <div
                          className={`hidden md:flex absolute top-5 items-center gap-1.5 text-xs font-medium text-primary font-body ${
                            isRight
                              ? "right-[calc(50%+2.5rem)] justify-end"
                              : "left-[calc(50%+2.5rem)]"
                          }`}
                        >
                          <CalendarRange className="w-3.5 h-3.5" />
                          {exp.period}
                        </div>

                        <Link
                          to={`/experiencias/${exp.slug}`}
                          className="group glass-card-hover rounded-xl p-6 flex flex-col h-full block"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <h2 className="text-lg font-semibold font-heading text-foreground group-hover:text-primary transition-colors leading-snug">
                                {exp.role_title}
                              </h2>
                              <p className="text-sm text-primary font-body inline-flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" />
                                {exp.company}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-body mb-3">
                            <span className="inline-flex items-center gap-1.5 md:hidden">
                              <CalendarRange className="w-3.5 h-3.5" />
                              {exp.period}
                            </span>
                            {exp.location && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {exp.location}
                              </span>
                            )}
                            {exp.sector && (
                              <span className="inline-flex items-center gap-1.5">
                                {exp.sector}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-3 mb-4">
                            {exp.short_summary || exp.description}
                          </p>

                          <div className="mt-auto flex items-end justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                              {exp.tools.slice(0, 3).map((tool) => (
                                <span
                                  key={tool}
                                  className="px-2.5 py-1 text-xs rounded-md bg-secondary/60 text-muted-foreground border border-border/40 font-body"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-primary font-body opacity-70 group-hover:opacity-100 transition-opacity">
                              Ver experiência
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </Link>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          )}

          {!isLoading && (career ?? []).length === 0 && (
            <p className="text-center text-muted-foreground font-body">
              Nenhuma experiência publicada ainda.
            </p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Experiences;
