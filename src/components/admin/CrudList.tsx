import { useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "tags" | "switch" | "select" | "url";
  options?: string[];
  choices?: { label: string; value: string }[];
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

interface Props {
  title: string;
  fields: FieldDef[];
  items: Row[];
  isLoading?: boolean;
  primaryField: string;
  secondaryField?: string;
  onCreate: (values: Row) => Promise<unknown>;
  onUpdate: (id: string, values: Row) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  extraActions?: (item: Row) => React.ReactNode;
}

const emptyValue = (field: FieldDef) => {
  if (field.type === "switch") return true;
  if (field.type === "number") return 0;
  if (field.type === "tags") return "";
  return "";
};

const CrudList = ({
  title,
  fields,
  items,
  isLoading,
  primaryField,
  secondaryField,
  onCreate,
  onUpdate,
  onDelete,
  extraActions,
}: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Row>({});
  const [saving, setSaving] = useState(false);

  const startCreate = () => {
    const blank: Row = {};
    fields.forEach((f) => (blank[f.name] = emptyValue(f)));
    setForm(blank);
    setEditingId(null);
    setCreating(true);
  };

  const startEdit = (item: Row) => {
    const values: Row = {};
    fields.forEach((f) => {
      const raw = item[f.name];
      values[f.name] =
        f.type === "tags"
          ? Array.isArray(raw)
            ? raw.join(", ")
            : ""
          : raw ?? emptyValue(f);
    });
    setForm(values);
    setEditingId(item.id);
    setCreating(false);
  };

  const cancel = () => {
    setCreating(false);
    setEditingId(null);
    setForm({});
  };

  const submit = async () => {
    const payload: Row = {};
    for (const field of fields) {
      const value = form[field.name];
      if (field.type === "tags") {
        payload[field.name] = String(value ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (field.type === "number") {
        payload[field.name] = Number(value) || 0;
      } else if (field.type === "switch") {
        payload[field.name] = !!value;
      } else {
        const text = String(value ?? "").trim();
        if (field.required && !text) {
          toast.error(`Preencha o campo "${field.label}"`);
          return;
        }
        payload[field.name] = text || (field.required ? text : null);
      }
    }
    setSaving(true);
    const ok = editingId ? await onUpdate(editingId, payload) : await onCreate(payload);
    setSaving(false);
    if (ok) cancel();
  };

  const renderField = (field: FieldDef) => {
    const value = form[field.name];
    if (field.type === "textarea") {
      return (
        <Textarea
          rows={4}
          value={value ?? ""}
          maxLength={field.maxLength ?? 2000}
          placeholder={field.placeholder}
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
        />
      );
    }
    if (field.type === "switch") {
      return (
        <Switch
          checked={!!value}
          onCheckedChange={(checked) => setForm({ ...form, [field.name]: checked })}
        />
      );
    }
    if (field.type === "select") {
      return (
        <Select
          value={value || ""}
          onValueChange={(v) => setForm({ ...form, [field.name]: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <Input
        type={field.type === "number" ? "number" : "text"}
        value={value ?? ""}
        maxLength={field.maxLength ?? 500}
        placeholder={field.placeholder}
        onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
      />
    );
  };

  const showForm = creating || editingId !== null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-heading">{title}</h2>
        {!showForm && (
          <Button size="sm" onClick={startCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Adicionar
          </Button>
        )}
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium font-heading text-primary">
              {editingId ? "Editando item" : "Novo item"}
            </p>
            <button onClick={cancel} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`space-y-2 ${field.type === "textarea" ? "md:col-span-2" : ""}`}
              >
                <Label>{field.label}</Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={submit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="ghost" onClick={cancel}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground font-body">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body">Nenhum item cadastrado.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="glass-card rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-heading text-sm text-foreground truncate">
                  {item[primaryField]}
                  {item.is_published === false && (
                    <span className="ml-2 text-xs text-muted-foreground">(rascunho)</span>
                  )}
                </p>
                {secondaryField && item[secondaryField] && (
                  <p className="text-xs text-muted-foreground font-body line-clamp-2">
                    {item[secondaryField]}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {extraActions?.(item)}
                <Button variant="ghost" size="icon" onClick={() => startEdit(item)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover item?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(item.id)}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CrudList;
