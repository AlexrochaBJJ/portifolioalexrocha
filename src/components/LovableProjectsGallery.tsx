import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import LovableProjectCard from "./LovableProjectCard";
import { useWebProjects } from "@/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";

const LovableProjectsGallery = () => {
  const { data: projects, isLoading } = useWebProjects();
  const [activeCategory, setActiveCategory] = useState("Todos");

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set((projects ?? []).map((p) => p.category)))],
    [projects],
  );

  const filtered =
    activeCategory === "Todos"
      ? projects ?? []
      : (projects ?? []).filter((p) => p.category === activeCategory);


  return (
    <section id="lovable-projects" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground font-body">
              Projetos web que desenvolvi
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Aplicações <span className="text-gradient-amber">Web</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-body">
            Aplicações completas com autenticação, banco de dados e
            funcionalidades reais. Clique para acessar.
          </p>
          <div className="line-gradient max-w-xs mx-auto mt-8" />
        </motion.div>

        {categories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium font-body transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "glass-card text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[16/12] rounded-xl" />
              ))
            : filtered.map((project, index) => (
                <LovableProjectCard key={project.id} project={project} index={index} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default LovableProjectsGallery;
