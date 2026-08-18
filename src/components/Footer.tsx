import { Mail, Link2, Linkedin, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { useAbout, useContactLinks } from "@/hooks/useContent";

const linkIcon = (kind: string) => {
  if (kind === "email") return Mail;
  if (kind === "linkedin") return Linkedin;
  if (kind === "github") return Github;
  return Link2;
};

const Footer = () => {
  const { data: about } = useAbout();
  const { data: links } = useContactLinks();

  return (
    <footer className="border-t border-border/30 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-heading font-semibold text-foreground">
            {about?.full_name || "Alex Rocha"}
          </p>
          <p className="text-sm text-muted-foreground font-body">
            {about?.headline || "Business Intelligence & Compras"}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {(links ?? []).map((link) => {
            const Icon = linkIcon(link.kind);
            return (
              <a
                key={link.id}
                href={link.kind === "email" ? `mailto:${link.value}` : link.value}
                target={link.kind === "email" ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-body text-muted-foreground hover:text-primary transition-all duration-300"
              >
                <Icon className="w-4 h-4 text-primary" />
                {link.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground/60 font-body">
          © {new Date().getFullYear()} {about?.full_name || "Alex Rocha"}. Dados dos
          dashboards são fictícios.
        </p>
        <Link
          to="/admin/login"
          className="text-xs text-muted-foreground/40 hover:text-primary transition-colors font-body"
        >
          Área administrativa
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
