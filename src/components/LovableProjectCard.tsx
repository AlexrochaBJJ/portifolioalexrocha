import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Globe, Info } from "lucide-react";
import type { WebProject } from "@/hooks/useContent";

interface Props {
  project: WebProject;
  index: number;
}

const LovableProjectCard = ({ project, index }: Props) => {
  return (
    <motion.article
      className="group glass-card-hover rounded-xl overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    >
      <Link to={`/aplicacoes/${project.id}`} className="flex flex-col flex-1">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-accent/5">
          <div className="absolute inset-0 dot-pattern opacity-20" />
          {project.preview_url ? (
            <img
              src={project.preview_url}
              alt={`Preview do projeto ${project.title}`}
              loading="lazy"
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Globe className="w-10 h-10 text-primary" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 z-20 bg-background/40">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-heading font-medium text-sm shadow-lg">
              <Info className="w-4 h-4" />
              Ver detalhes
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold font-heading text-foreground leading-tight group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-body line-clamp-3 mb-4">
            {project.description}
          </p>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
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
      </Link>
    </motion.article>
  );
};

export default LovableProjectCard;
