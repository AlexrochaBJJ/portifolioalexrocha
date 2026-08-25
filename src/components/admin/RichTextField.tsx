import { useRef, useState } from "react";
import { Bold, Eye, Heading, Highlighter, Italic, List } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import RichText from "@/components/RichText";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number | null;
  rows?: number;
}

/** Editor de texto com negrito, destaque, itálico, marcadores e pré-visualização. */
const RichTextField = ({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 10,
}: Props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  const wrap = (before: string, after = before) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "texto";
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const prefixLines = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", end);
    const stop = lineEnd === -1 ? value.length : lineEnd;
    const block = value.slice(lineStart, stop) || "item";
    const transformed = block
      .split("\n")
      .map((line) =>
        line.trim().startsWith(prefix.trim()) ? line : `${prefix}${line.trim()}`,
      )
      .join("\n");
    onChange(`${value.slice(0, lineStart)}${transformed}${value.slice(stop)}`);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(lineStart, lineStart + transformed.length);
    });
  };

  const tools = [
    { icon: Bold, title: "Negrito", run: () => wrap("**") },
    { icon: Highlighter, title: "Destacar", run: () => wrap("==") },
    { icon: Italic, title: "Itálico", run: () => wrap("*") },
    { icon: List, title: "Marcadores", run: () => prefixLines("- ") },
    { icon: Heading, title: "Subtítulo", run: () => prefixLines("## ") },
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {tools.map((tool) => (
          <Button
            key={tool.title}
            type="button"
            variant="outline"
            size="sm"
            title={tool.title}
            onClick={tool.run}
            className="h-8 px-2.5"
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}
        <Button
          type="button"
          variant={preview ? "default" : "outline"}
          size="sm"
          className="h-8 px-2.5 ml-auto"
          onClick={() => setPreview((p) => !p)}
        >
          <Eye className="w-4 h-4 mr-1.5" />
          {preview ? "Editar" : "Pré-visualizar"}
        </Button>
      </div>

      {preview ? (
        <div className="glass-card rounded-lg p-4 min-h-[180px]">
          {value.trim() ? (
            <RichText value={value} />
          ) : (
            <p className="text-sm text-muted-foreground font-body">
              Nada para pré-visualizar ainda.
            </p>
          )}
        </div>
      ) : (
        <Textarea
          ref={ref}
          rows={rows}
          value={value}
          maxLength={maxLength ?? undefined}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="font-body leading-relaxed"
        />
      )}

      <p className="text-xs text-muted-foreground font-body">
        Use **negrito**, ==destaque==, *itálico*, "- " para marcadores e "## " para
        subtítulos. Cada linha em branco separa um parágrafo, que aparece com fundo
        alternado na página.
      </p>
    </div>
  );
};

export default RichTextField;
