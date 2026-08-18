import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Briefcase, ArrowRight, CalendarRange, MapPin } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useCareer } from "@/hooks/useContent";

const Experiences = () => {
  const { data: career, isLoading } = useCareer();

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
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground font-body">
                Trajetória profissional
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              Minhas <span className="text-gradient-amber">experiências</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto font-body">
              Cada experiência reúne o que construí na área de compras, com os
              fluxogramas interativos dos processos que estruturei e operei.
            </p>
            <div className="line-gradient max-w-xs mx-auto mt-8" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-xl" />
                ))
              : (career ?? []).map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <Link
                      to={`/experiencias/${exp.slug}`}
                      className="group glass-card-hover rounded-xl p-6 flex flex-col h-full"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-lg font-semibold font-heading text-foreground group-hover:text-primary transition-colors">
                        {exp.role_title}
                      </h2>
                      <p className="text-sm text-primary font-body mb-3">{exp.company}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-body mb-3">
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
                      </div>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-3 mb-4">
                        {exp.short_summary || exp.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
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
                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>

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
