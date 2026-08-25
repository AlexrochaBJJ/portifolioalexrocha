import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Link2, Linkedin, Github, ArrowRight, Briefcase } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAbout, useSkills, useCareer, useContactLinks } from "@/hooks/useContent";

const linkIcon = (kind: string) => {
  if (kind === "email") return Mail;
  if (kind === "linkedin") return Linkedin;
  if (kind === "github") return Github;
  return Link2;
};

const linkHref = (kind: string, value: string) =>
  kind === "email" ? `mailto:${value}` : value;

const About = () => {
  const { data: about, isLoading } = useAbout();
  const { data: skills } = useSkills();
  const { data: career } = useCareer();
  const { data: links } = useContactLinks();

  const skillsByCategory = (skills ?? []).reduce<
    Record<string, { name: string; featured: boolean }[]>
  >((acc, skill) => {
    acc[skill.category] = [
      ...(acc[skill.category] ?? []),
      { name: skill.name, featured: Boolean((skill as { is_featured?: boolean }).is_featured) },
    ];
    return acc;
  }, {});


  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground font-body">
              {isLoading ? "Carregando..." : about?.headline || "Portfólio profissional"}
            </span>
          </motion.div>

          {isLoading ? (
            <Skeleton className="h-16 w-72 mx-auto mb-6" />
          ) : (
            <motion.h1
              className="text-5xl md:text-7xl font-bold font-heading tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span className="text-gradient-amber">{about?.full_name || "Alex Rocha"}</span>
            </motion.h1>
          )}

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-body"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {about?.summary}
          </motion.p>

          {links && links.length > 0 && (
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {links.map((link) => {
                const Icon = linkIcon(link.kind);
                return (
                  <a
                    key={link.id}
                    href={linkHref(link.kind, link.value)}
                    target={link.kind === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-body text-muted-foreground hover:text-primary transition-all duration-300"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    {link.label}
                  </a>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Bio */}
      {about?.bio && (
        <section className="py-16 px-6 border-t border-border/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-6">
              Quem <span className="text-gradient-amber">sou eu</span>
            </h2>
            <div className="rich-text">{about.bio}</div>
          </div>
        </section>
      )}

      {/* Skills */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section className="py-16 px-6 border-t border-border/30">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-heading">
                Habilidades & <span className="text-gradient-amber">Ferramentas</span>
              </h2>
              <p className="inline-flex items-center gap-2 text-xs text-muted-foreground font-body">
                <span className="featured-chip px-2 py-1 rounded-md border text-[0.7rem]">
                  Exemplo
                </span>
                = maior destaque
              </p>
            </div>
            <div className="space-y-5">
              {Object.entries(skillsByCategory).map(([category, items]) => (
                <div
                  key={category}
                  className="glass-card rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <h3 className="text-sm font-semibold font-heading text-primary md:w-48 md:shrink-0">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span
                        key={skill.name}
                        className={`px-2.5 py-1 text-xs rounded-md border font-body ${
                          skill.featured
                            ? "featured-chip font-semibold"
                            : "bg-secondary/60 text-muted-foreground border-border/40"
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* CTA */}
      <section className="py-16 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto grid gap-4 sm:grid-cols-3">
          {[
            { to: "/dashboards", label: "Dashboards Power BI" },
            { to: "/aplicacoes", label: "Aplicações Web" },
            { to: "/experiencias", label: "Processos de Compra" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="glass-card-hover rounded-xl p-5 flex items-center justify-between group"
            >
              <span className="font-heading text-sm text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </Link>
          ))}
        </div>
      </section>

      <div className="sr-only">
        <Briefcase />
      </div>
    </SiteLayout>
  );
};

export default About;
