import { Label } from "@/components/ui/label";

interface Props {
  value: string;
  /** Quando omitido/nulo, exibe apenas a contagem (sem limite). */
  max?: number | null;
}

/** Contador de caracteres no formato "115/400". */
export const CharCount = ({ value, max }: Props) => {
  const used = String(value ?? "").length;
  const hasMax = typeof max === "number";
  return (
    <span
      className={`text-xs font-body tabular-nums ${
        hasMax && used >= (max as number) ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      {hasMax ? `${used}/${max}` : `${used} caracteres`}
    </span>
  );
};

interface RowProps extends Props {
  label: string;
  htmlFor?: string;
}

/** Linha de rótulo com contador alinhado à direita. */
export const LabelWithCount = ({ label, htmlFor, value, max }: RowProps) => (
  <div className="flex items-center justify-between gap-2">
    <Label htmlFor={htmlFor}>{label}</Label>
    <CharCount value={value} max={max} />
  </div>
);

export default CharCount;
