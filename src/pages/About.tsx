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

  const skillsByCategory = (skills ?? []).reduce<Record<string, string[]>>(
    (acc, skill) => {
      acc[skill.category] = [...(acc[skill.category] ?? []), skill.name];
      return acc;
    },
    {},
  );

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
            <p className="text-muted-foreground leading-relaxed font-body whitespace-pre-line">
              {about.bio}
            </p>
          </div>
        </section>
      )}

      {/* Skills */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section className="py-16 px-6 border-t border-border/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-10">
              Habilidades & <span className="text-gradient-amber">Ferramentas</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(skillsByCategory).map(([category, names]) => (
                <div key={category} className="glass-card rounded-xl p-5">
                  <h3 className="text-sm font-semibold font-heading text-primary mb-4">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {names.map((name) => (
                      <span
                        key={name}
                        className="px-2.5 py-1 text-xs rounded-md bg-secondary/60 text-muted-foreground border border-border/40 font-body"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Career */}
      {career && career.length > 0 && (
        <section className="py-16 px-6 border-t border-border/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-10">
              Trajetória <span className="text-gradient-amber">Profissional</span>
            </h2>
            <ol className="relative border-l border-border/60 pl-6 space-y-8">
              {career.map((job) => (
                <li key={job.id} className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground font-body mb-1">{job.period}</p>
                  <h3 className="font-heading font-semibold text-foreground">
                    {job.role_title}
                  </h3>
                  <p className="text-sm text-primary font-body mb-2">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                  {job.description && (
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">
                      {job.description}
                    </p>
                  )}
                  {job.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {job.highlights.map((h) => (
                        <li
                          key={h}
                          className="text-sm text-muted-foreground font-body flex gap-2"
                        >
                          <span className="text-primary">•</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
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
