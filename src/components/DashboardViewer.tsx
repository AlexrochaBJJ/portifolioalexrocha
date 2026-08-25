import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { prepareSandboxHtml } from "@/lib/htmlSandbox";
import type { DashboardRow } from "@/hooks/useContent";


interface DashboardViewerProps {
  dashboard: DashboardRow | null;
  onClose: () => void;
}

const DashboardViewer = ({ dashboard, onClose }: DashboardViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const isHtml = dashboard?.source_type === "html";
  const sandboxedHtml = useMemo(
    () => (isHtml ? prepareSandboxHtml(dashboard?.html_code) : ""),
    [isHtml, dashboard?.html_code],
  );

  useEffect(() => {
    if (dashboard) setIsLoading(true);
  }, [dashboard?.id]);


  return (
    <AnimatePresence>
      {dashboard && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-background/95 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.header
            className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/50"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary font-body">
                {dashboard.category}
              </span>
              <h2 className="text-lg font-semibold font-heading text-foreground">
                {dashboard.title}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {!isHtml && (
                <a
                  href={dashboard.embed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-body"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Abrir no Power BI</span>
                </a>
              )}
              <button
                onClick={onClose}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.header>

          <motion.div
            className="relative z-10 flex-1 p-4 md:p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-border/30 glass-card">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground font-body">
                    Carregando dashboard...
                  </p>
                </div>
              )}
              <iframe
                key={dashboard.id}
                title={dashboard.title}
                {...(isHtml
                  ? {
                      srcDoc: sandboxedHtml,
                      sandbox:
                        "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-downloads allow-forms allow-modals",
                      referrerPolicy: "no-referrer" as const,
                    }
                  : { src: dashboard.embed_url })}

                className="w-full h-full bg-card"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                style={{ minHeight: "400px", border: 0 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardViewer;
