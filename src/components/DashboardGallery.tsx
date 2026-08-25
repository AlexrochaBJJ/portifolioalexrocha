import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import DashboardCard from "./DashboardCard";
import { useDashboards } from "@/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardGallery = () => {
  const { data: dashboards, isLoading } = useDashboards();
  const [activeCategory, setActiveCategory] = useState("Todos");

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set((dashboards ?? []).map((d) => d.category)))],
    [dashboards],
  );

  const filtered =
    activeCategory === "Todos"
      ? dashboards ?? []
      : (dashboards ?? []).filter((d) => d.category === activeCategory);

  return (
    <section id="dashboards" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Dashboards <span className="text-gradient-amber">Power BI</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-body">
            Clique em um dashboard para ver os detalhes de como ele funciona e abri-lo
            em modo interativo. Todos os dados são fictícios.
          </p>
          <div className="line-gradient max-w-xs mx-auto mt-8" />
        </motion.div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[16/12] rounded-xl" />
              ))
            : filtered.map((dashboard, index) => (
                <DashboardCard
                  key={dashboard.id}
                  dashboard={dashboard}
                  index={index}
                />
              ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardGallery;
