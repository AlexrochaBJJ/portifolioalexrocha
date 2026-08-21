import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, FileDown, Loader2, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { streamPortfolioAi, type AiMessage } from "@/lib/aiChat";
import { buildReportDocx, downloadBlob } from "@/lib/reportDocx";

const SUGGESTIONS = [
  "Faça um resumo do perfil profissional em poucas linhas.",
  "Quais resultados concretos ele já entregou na área de compras?",
  "Quais ferramentas e sistemas ele domina?",
  "Como funcionam os processos de compra que ele mapeou?",
  "Ele tem experiência com Power BI e indicadores? Explique.",
];

const REPORT_PROMPT =
  "Gere um relatório profissional completo sobre este perfil, para uso do RH em processo seletivo.";

const renderLine = (line: string, index: number) => {
  const bold = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="text-foreground">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );

  const trimmed = line.trim();
  if (!trimmed) return <div key={index} className="h-2" />;
  if (trimmed.startsWith("### "))
    return (
      <h4 key={index} className="font-heading text-sm font-semibold text-primary mt-3">
        {bold(trimmed.slice(4))}
      </h4>
    );
  if (trimmed.startsWith("## "))
    return (
      <h3 key={index} className="font-heading text-base font-semibold text-primary mt-4">
        {bold(trimmed.slice(3))}
      </h3>
    );
  if (/^[-*•]\s+/.test(trimmed))
    return (
      <div key={index} className="flex gap-2 pl-1">
        <span className="text-primary">•</span>
        <span>{bold(trimmed.replace(/^[-*•]\s+/, ""))}</span>
      </div>
    );
  return <p key={index}>{bold(trimmed)}</p>;
};

const AiAssistantPanel = () => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [reporting, setReporting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || streaming || reporting) return;

    const history: AiMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      await streamPortfolioAi(history, (delta) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + delta };
          return next;
        });
      });
    } catch (error) {
      setMessages(history);
      toast({
        title: "Erro na IA",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setStreaming(false);
    }
  };

  const generateReport = async () => {
    if (streaming || reporting) return;
    setReporting(true);
    try {
      const markdown = await streamPortfolioAi([{ role: "user", content: REPORT_PROMPT }], () => {}, {
        mode: "report",
      });
      if (!markdown.trim()) throw new Error("A IA não retornou conteúdo para o relatório.");
      const blob = await buildReportDocx(markdown, {
        title: "Relatório Profissional — Allex Rocha",
        subtitle: `Gerado por IA a partir do portfólio em ${new Date().toLocaleDateString("pt-BR")}`,
      });
      downloadBlob(blob, `relatorio-profissional-allex-rocha.docx`);
      toast({ title: "Relatório gerado", description: "O arquivo Word foi baixado." });
    } catch (error) {
      toast({
        title: "Não foi possível gerar o relatório",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col min-h-[520px]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
            <Bot className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold font-heading">Assistente do portfólio</p>
            <p className="text-xs text-muted-foreground font-body">
              Responde com base apenas nas informações cadastradas
            </p>
          </div>
        </div>

        <div className="flex-1 px-5 py-5 space-y-5 overflow-y-auto max-h-[52vh]">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground font-body space-y-3">
              <p className="flex items-center gap-2 text-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                Pergunte o que quiser sobre a trajetória, resultados e processos.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="px-3 py-1.5 rounded-full text-xs glass-card hover:bg-primary/10 hover:text-primary transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-primary/15 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-sm font-body leading-relaxed max-w-[85%] space-y-1 ${
                  message.role === "user"
                    ? "bg-primary/15 text-foreground"
                    : "bg-card/60 border border-border/40 text-muted-foreground"
                }`}
              >
                {message.role === "assistant" && !message.content && streaming ? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> pensando...
                  </span>
                ) : (
                  message.content.split("\n").map(renderLine)
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border/40 p-4 flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            placeholder="Ex.: quais foram os principais resultados em negociação de compras?"
            maxLength={1000}
            rows={2}
            className="resize-none font-body"
          />
          <Button onClick={() => ask(input)} disabled={streaming || reporting || !input.trim()}>
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold font-heading flex items-center gap-2">
            <FileDown className="w-4 h-4 text-primary" />
            Relatório em Word
          </h3>
          <p className="text-xs text-muted-foreground font-body leading-relaxed">
            Gera um documento .docx completo com resumo executivo, experiências, resultados,
            processos, competências e projetos — pronto para anexar ao processo seletivo.
          </p>
          <Button onClick={generateReport} disabled={reporting || streaming} className="w-full">
            {reporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Baixar relatório (.docx)
              </>
            )}
          </Button>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold font-heading mb-2">Como usar</h3>
          <ul className="text-xs text-muted-foreground font-body space-y-2 leading-relaxed">
            <li>• Pergunte em linguagem natural, como em uma entrevista.</li>
            <li>• Peça comparações, resumos por competência ou detalhes de processos.</li>
            <li>• A IA usa apenas o conteúdo publicado no portfólio.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default AiAssistantPanel;
