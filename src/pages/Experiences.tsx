import { useMemo } from "react";
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

const CURRENT = /atual|presente|hoje|momento/i;

/** Ano final da experiência (ou "Atual") a partir do texto do período. */
const endLabel = (period: string) => {
  if (CURRENT.test(period)) return "Atual";
  const years = period.match(/\d{4}/g);
  return years?.[years.length - 1] ?? period.trim();
};

const endValue = (period: string) => {
  if (CURRENT.test(period)) return Infinity;
  const years = period.match(/\d{4}/g);
  return years ? Date.parse(`${years[years.length - 1]}-12-31`) : 0;
};

const Experiences = () => {
  const { data: career, isLoading } = useCareer();

  const timeline = useMemo(
    () =>
      [...(career ?? [])].sort((a, b) => {
        const va = a.is_current ? Infinity : a.end_date ? Date.parse(a.end_date) : endValue(a.period);
        const vb = b.is_current ? Infinity : b.end_date ? Date.parse(b.end_date) : endValue(b.period);
        if (va !== vb) return vb - va;
        return a.sort_order - b.sort_order;
      }),
    [career],
  );


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
            <p className="text-muted-foreground max-w-3xl mx-auto font-body">
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
                {timeline.map((exp, index) => {
                  const isRight = index % 2 === 1;
                  const year = endLabel(exp.period);
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
                        {/* ano de saída em destaque, do lado oposto ao card */}
                        <div
                          className={`hidden md:flex absolute top-1 flex-col ${
                            isRight
                              ? "right-[calc(50%+2.5rem)] items-end text-right"
                              : "left-[calc(50%+2.5rem)] items-start"
                          }`}
                        >
                          <span className="text-3xl lg:text-4xl font-bold font-heading text-gradient-amber leading-none">
                            {year}
                          </span>
                          <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                            <CalendarRange className="w-3.5 h-3.5" />
                            {exp.period}
                          </span>
                        </div>

                        {/* ano em destaque no mobile */}
                        <div className="md:hidden mb-2 text-2xl font-bold font-heading text-gradient-amber leading-none">
                          {year}
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
