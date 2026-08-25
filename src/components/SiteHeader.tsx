import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/experiencias", label: "Experiências" },
  { to: "/dashboards", label: "Dashboards" },
  { to: "/aplicacoes", label: "Aplicações Web" },
];


const SiteHeader = () => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold font-heading text-gradient-amber">AR</span>
          <span className="text-sm text-muted-foreground font-body hidden sm:inline">
            Alex Rocha
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-body transition-all duration-300",
                pathname === item.to
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body glass-card text-primary"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border/40 px-6 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-body",
                pathname === item.to
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-body text-primary"
            >
              Admin
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
