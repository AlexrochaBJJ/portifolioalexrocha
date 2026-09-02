import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, FileDown, Loader2, MessageSquare, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { streamPortfolioAi, type AiMessage } from "@/lib/aiChat";
import { buildReportDocx, downloadBlob } from "@/lib/reportDocx";

const SUGGESTIONS = [
  "Resuma o perfil profissional.",
  "Quais resultados ele entregou em compras?",
  "Quais ferramentas ele domina?",
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
  if (!trimmed) return <div key={index} className="h-1.5" />;
  if (trimmed.startsWith("### "))
    return (
      <h4 key={index} className="font-heading text-xs font-semibold text-primary mt-2">
        {bold(trimmed.slice(4))}
      </h4>
    );
  if (trimmed.startsWith("## "))
    return (
      <h3 key={index} className="font-heading text-sm font-semibold text-primary mt-2">
        {bold(trimmed.slice(3))}
      </h3>
    );
  if (/^[-*•]\s+/.test(trimmed))
    return (
      <div key={index} className="flex gap-2">
        <span className="text-primary">•</span>
        <span>{bold(trimmed.replace(/^[-*•]\s+/, ""))}</span>
      </div>
    );
  return <p key={index}>{bold(trimmed)}</p>;
};

const FloatingAiChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [reporting, setReporting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming, open]);

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
      inputRef.current?.focus();
    }
  };

  const generateReport = async () => {
    if (streaming || reporting) return;
    setReporting(true);
    try {
      const markdown = await streamPortfolioAi(
        [{ role: "user", content: REPORT_PROMPT }],
        () => {},
        { mode: "report" },
      );
      if (!markdown.trim()) throw new Error("A IA não retornou conteúdo para o relatório.");
      const blob = await buildReportDocx(markdown, {
        title: "Relatório Profissional — Allex Rocha",
        subtitle: `Gerado por IA a partir do portfólio em ${new Date().toLocaleDateString("pt-BR")}`,
      });
      downloadBlob(blob, "relatorio-profissional-allex-rocha.docx");
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
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed z-50 bottom-28 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[75vh] flex flex-col glass-card rounded-2xl overflow-hidden shadow-2xl border-primary/20"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-gradient-to-r from-primary/10 to-transparent">
              <div className="relative w-10 h-10 shrink-0 rounded-full bg-primary/15 flex items-center justify-center border border-primary/30">
                <Bot className="w-5 h-5 text-primary" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold font-heading flex items-center gap-1.5">
                  Malu
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    IA
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground font-body truncate">
                  Assistente inteligente do portfólio
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar chat"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm font-body">
              {messages.length === 0 && (
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-2 text-foreground">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p>
                      Oi! Sou a <strong className="text-primary">Rocha</strong>, a IA deste portfólio. Pergunte sobre trajetória, resultados e processos.
                    </p>
                  </div>
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

              {messages.map((message, index) =>
                message.role === "user" ? (
                  <div key={index} className="flex justify-end">
                    <div className="max-w-[85%] px-3 py-2 rounded-2xl bg-primary text-primary-foreground">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={index} className="space-y-1 text-muted-foreground leading-relaxed">
                    {message.content
                      ? message.content.split("\n").map(renderLine)
                      : streaming && (
                          <span className="inline-flex items-center gap-2 text-primary">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Malu está pensando...
                          </span>
                        )}
                  </div>
                ),
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-border/40 p-3 space-y-2">
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      ask(input);
                    }
                  }}
                  placeholder="Pergunte para a Malu..."
                  maxLength={1000}
                  rows={1}
                  className="resize-none font-body min-h-[40px]"
                />
                <Button
                  size="icon"
                  onClick={() => ask(input)}
                  disabled={streaming || reporting || !input.trim()}
                >
                  {streaming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={generateReport}
                disabled={reporting || streaming}
              >
                {reporting ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 mr-2" />
                )}
                Baixar relatório (.docx)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed z-50 bottom-5 right-4 sm:right-6 flex items-end flex-col gap-2">
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="hidden sm:flex items-center gap-2 mb-2"
            >
              <div className="glass-card px-3 py-2 rounded-xl rounded-br-sm text-xs text-foreground shadow-lg border-primary/20">
                <p className="font-semibold">Fale com a Malu</p>
                <p className="text-muted-foreground">IA do portfólio</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar assistente de IA" : "Abrir assistente de IA"}
          className="relative group h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:scale-105 transition-transform ai-rocha-pulse"
        >
          <span className="ai-rocha-ping" aria-hidden="true" />
          {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          {!open && (
            <span className="absolute -top-1.5 -left-1.5 bg-background text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-primary/40 shadow-sm">
              IA
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default FloatingAiChat;
