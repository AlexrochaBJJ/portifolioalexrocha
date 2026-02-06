import { motion } from "framer-motion";
import { ExternalLink, Maximize2 } from "lucide-react";
import type { Dashboard } from "@/data/dashboards";

interface DashboardCardProps {
  dashboard: Dashboard;
  index: number;
  onOpen: (dashboard: Dashboard) => void;
}

const DashboardCard = ({ dashboard, index, onOpen }: DashboardCardProps) => {
  return (
    <motion.article
      className="group glass-card-hover rounded-xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      onClick={() => onOpen(dashboard)}
    >
      {/* Preview Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={dashboard.previewImage}
          alt={`Preview do dashboard ${dashboard.title}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Overlay action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-heading font-medium text-sm shadow-lg">
            <Maximize2 className="w-4 h-4" />
            Interagir
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-background/70 backdrop-blur-sm text-primary border border-primary/20 font-body">
            {dashboard.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold font-heading text-foreground leading-tight group-hover:text-primary transition-colors">
            {dashboard.title}
          </h3>
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed font-body line-clamp-3">
          {dashboard.description}
        </p>
      </div>
    </motion.article>
  );
};

export default DashboardCard;
