import { useEffect } from "react";
import { Bot } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import AiAssistantPanel from "@/components/AiAssistantPanel";

const Assistant = () => {
  useEffect(() => {
    document.title = "Assistente de IA | Portfólio Allex Rocha";
    const description =
      "Pergunte à IA sobre a trajetória, resultados e processos de Allex Rocha e baixe um relatório completo em Word.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/assistente`);
  }, []);

  return (
    <SiteLayout>
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-4">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-body">
                Feito para recrutadores e RH
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">
              Assistente de <span className="text-gradient-amber">IA</span>
            </h1>
            <p className="text-muted-foreground font-body leading-relaxed">
              Tire dúvidas sobre o perfil, peça resumos por competência ou gere um relatório
              profissional completo em Word — tudo com base nas informações do portfólio.
            </p>
          </div>

          <AiAssistantPanel />
        </div>
      </section>
    </SiteLayout>
  );
};

export default Assistant;
