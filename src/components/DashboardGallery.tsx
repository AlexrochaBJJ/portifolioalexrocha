import { useState } from "react";
import { motion } from "framer-motion";
import DashboardCard from "./DashboardCard";
import DashboardViewer from "./DashboardViewer";
import { dashboards, type Dashboard } from "@/data/dashboards";

const categories = ["Todos", ...Array.from(new Set(dashboards.map((d) => d.category)))];

const DashboardGallery = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);

  const filtered =
    activeCategory === "Todos"
      ? dashboards
      : dashboards.filter((d) => d.category === activeCategory);

  return (
    <section id="dashboards" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Meus <span className="text-gradient-amber">Projetos</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-body">
            Clique em qualquer dashboard para interagir diretamente com os dados
            e explorar as visualizações.
          </p>
          <div className="line-gradient max-w-xs mx-auto mt-8" />
        </motion.div>

        {/* Category filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-12"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
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
        </motion.div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dashboard, index) => (
            <DashboardCard
              key={dashboard.id}
              dashboard={dashboard}
              index={index}
              onOpen={setSelectedDashboard}
            />
          ))}
        </div>
      </div>

      {/* Dashboard viewer modal */}
      <DashboardViewer
        dashboard={selectedDashboard}
        onClose={() => setSelectedDashboard(null)}
      />
    </section>
  );
};

export default DashboardGallery;
