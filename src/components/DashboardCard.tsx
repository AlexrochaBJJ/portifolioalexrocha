import { motion } from "framer-motion";
import { ExternalLink, Maximize2 } from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { DashboardRow } from "@/hooks/useContent";

interface DashboardCardProps {
  dashboard: DashboardRow;
  index: number;
  onOpen: (dashboard: DashboardRow) => void;
}

const DashboardCard = ({ dashboard, index, onOpen }: DashboardCardProps) => {
  const Icon = getIcon(dashboard.icon);

  return (
    <motion.article
      className="group glass-card-hover rounded-xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      onClick={() => onOpen(dashboard)}
    >
      <div className="relative aspect-[16/10] overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/10 via-transparent to-accent/5">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/25 transition-all duration-500">
            <Icon className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 z-20">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-heading font-medium text-sm shadow-lg">
            <Maximize2 className="w-4 h-4" />
            Interagir
          </div>
        </div>

        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-background/70 backdrop-blur-sm text-primary border border-primary/20 font-body">
            {dashboard.category}
          </span>
        </div>
      </div>

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
