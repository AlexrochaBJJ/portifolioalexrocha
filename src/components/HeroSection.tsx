import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Mail, Phone } from "lucide-react";
import alexProfile from "@/assets/alex-profile.png";

const stats = [
  { icon: BarChart3, label: "Dashboards", value: "5+" },
  { icon: TrendingUp, label: "Áreas", value: "Vendas, RH, Metas" },
  { icon: Users, label: "Para", value: "Gestores & CEOs" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-glow/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Profile photo */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative w-36 h-36 md:w-44 md:h-44 mx-auto">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-primary/50 to-accent/30 blur-sm animate-pulse-glow" />
            <img
              src={alexProfile}
              alt="Alex Rocha - Analista de BI"
              className="relative w-full h-full rounded-full object-cover border-2 border-primary/30 shadow-lg"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm text-muted-foreground font-body">
              Portfólio de Business Intelligence
            </span>
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <span className="text-foreground">Alex</span>{" "}
          <span className="text-gradient-amber">Rocha</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-body"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
        >
          Transformando dados em decisões estratégicas através de dashboards
          interativos e visuais poderosos no Power BI.
        </motion.p>

        <motion.p
          className="text-sm text-muted-foreground/70 max-w-xl mx-auto mb-10 font-body"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
        >
          Todos os dashboards contêm apenas dados fictícios, servindo como
          demonstração das funcionalidades e possibilidades.
        </motion.p>

        {/* Contact info */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
        >
          <a
            href="https://wa.me/5521981303694"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-body text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300"
          >
            <Phone className="w-4 h-4 text-primary" />
            (21) 98130-3694
          </a>
          <a
            href="mailto:Allexdasilvarocha@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm font-body text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300"
          >
            <Mail className="w-4 h-4 text-primary" />
            Allexdasilvarocha@gmail.com
          </a>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-6 md:gap-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
                <p className="text-sm font-semibold text-foreground font-heading">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <a
            href="#dashboards"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body"
          >
            <span>Explorar Projetos</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ↓
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
