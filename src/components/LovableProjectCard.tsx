import { motion } from "framer-motion";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import type { LovableProject } from "@/data/lovableProjects";

interface Props {
  project: LovableProject;
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
      {/* Preview */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
        <img
          src={project.preview}
          alt={`Preview do projeto ${project.title}`}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />

        {/* Hover CTA */}
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 z-20"
          aria-label={`Abrir ${project.title} em nova aba`}
        >
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-heading font-medium text-sm shadow-lg">
            <ExternalLink className="w-4 h-4" />
            Acessar projeto
          </div>
        </a>

        {/* Lovable badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-background/70 backdrop-blur-sm text-primary border border-primary/20 font-body">
            Lovable
          </span>
        </div>
      </div>

      {/* Content */}
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

        {project.tags && project.tags.length > 0 && (
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
    </motion.article>
  );
};

export default LovableProjectCard;
