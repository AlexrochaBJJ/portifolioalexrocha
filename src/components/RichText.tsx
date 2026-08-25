import { ReactNode } from "react";

/**
 * Renderiza texto do admin com formatação leve:
 * **negrito**, ==destaque==, *itálico*, "- " marcadores, "## " subtítulo.
 * Cada parágrafo recebe um leve fundo alternado para facilitar a leitura.
 */

const inline = (text: string, keyPrefix: string): ReactNode[] => {
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|==[^=]+==|\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key} className="text-foreground font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("==")) {
      parts.push(
        <mark
          key={key}
          className="bg-primary/15 text-primary rounded px-1 py-0.5 font-medium"
        >
          {token.slice(2, -2)}
        </mark>,
      );
    } else {
      parts.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : [text];
};

interface Props {
  value?: string | null;
  className?: string;
  /** Alterna um leve fundo entre parágrafos (padrão: ativo). */
  striped?: boolean;
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "ul"; lines: string[] }
  | { kind: "h"; lines: string[] };

const parseBlocks = (raw: string): Block[] => {
  const blocks: Block[] = [];
  raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;
      const bullet = /^[-*•]\s+/.test(line);
      const heading = /^#{1,3}\s+/.test(line);
      const kind: Block["kind"] = heading ? "h" : bullet ? "ul" : "p";
      const content = heading
        ? line.replace(/^#{1,3}\s+/, "")
        : bullet
          ? line.replace(/^[-*•]\s+/, "")
          : line;
      const last = blocks[blocks.length - 1];
      if (last && last.kind === kind && kind === "ul") last.lines.push(content);
      else blocks.push({ kind, lines: [content] });
    });
  return blocks;
};

export const RichText = ({ value, className = "", striped = true }: Props) => {
  if (!value || !value.trim()) return null;
  const blocks = parseBlocks(value);
  let paragraphIndex = -1;

  return (
    <div className={`rich-text space-y-3 ${className}`}>
      {blocks.map((block, bi) => {
        if (block.kind === "h") {
          return (
            <h3
              key={bi}
              className="font-heading text-base text-foreground pt-2 first:pt-0"
            >
              {inline(block.lines[0], `h-${bi}`)}
            </h3>
          );
        }
        if (block.kind === "ul") {
          return (
            <ul key={bi} className="space-y-2">
              {block.lines.map((item, li) => (
                <li
                  key={li}
                  className="flex gap-2.5 text-sm text-muted-foreground font-body leading-relaxed"
                >
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                  <span className="min-w-0">{inline(item, `li-${bi}-${li}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        paragraphIndex += 1;
        const tinted = striped && paragraphIndex % 2 === 1;
        return (
          <p
            key={bi}
            className={`text-sm md:text-[0.95rem] text-muted-foreground font-body leading-relaxed rounded-lg px-3 py-2.5 ${
              tinted ? "bg-muted/30" : "bg-transparent"
            }`}
          >
            {inline(block.lines[0], `p-${bi}`)}
          </p>
        );
      })}
    </div>
  );
};

export default RichText;
