import { Label } from "@/components/ui/label";

interface Props {
  value: string;
  max: number;
}

/** Contador de caracteres no formato "115/400". */
export const CharCount = ({ value, max }: Props) => {
  const used = String(value ?? "").length;
  return (
    <span
      className={`text-xs font-body tabular-nums ${
        used >= max ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      {used}/{max}
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
