import { useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabelWithCount } from "./CharCount";
import { iconMap, iconNames } from "@/lib/icons";


import { Textarea } from "@/components/ui/textarea";
import RichTextField from "./RichTextField";
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
  type?:
    | "text"
    | "textarea"
    | "richtext"
    | "number"
    | "tags"
    | "switch"
    | "select"
    | "multiselect"
    | "combo"
    | "code"
    | "icon"
    | "image"
    | "url";

  options?: string[];
  choices?: { label: string; value: string }[];
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  hint?: string;
  showIf?: (values: Record<string, unknown>) => boolean;
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
  if (field.type === "multiselect") return [];
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
  const [uploadingField, setUploadingField] = useState<string | null>(null);


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
          : f.type === "multiselect"
            ? Array.isArray(raw)
              ? raw
              : []
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
      const hidden = field.showIf ? !field.showIf(form) : false;
      if (hidden && field.type !== "switch" && field.type !== "number") {
        payload[field.name] = field.required ? "" : null;
        continue;
      }
      if (field.type === "tags") {
        payload[field.name] = String(value ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (field.type === "multiselect") {
        payload[field.name] = Array.isArray(value) ? value : [];
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
    if (field.type === "richtext") {
      return (
        <RichTextField
          value={String(value ?? "")}
          maxLength={field.maxLength ?? null}
          placeholder={field.placeholder}
          onChange={(next) => setForm({ ...form, [field.name]: next })}
        />
      );
    }
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
    if (field.type === "multiselect") {
      const choices =
        field.choices ?? (field.options ?? []).map((o) => ({ label: o, value: o }));
      const selected: string[] = Array.isArray(value) ? value : [];
      if (choices.length === 0) {
        return (
          <p className="text-xs text-muted-foreground font-body">
            Nenhuma opção disponível ainda.
          </p>
        );
      }
      return (
        <div className="flex flex-wrap gap-2">
          {choices.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    [field.name]: active
                      ? selected.filter((s) => s !== opt.value)
                      : [...selected, opt.value],
                  })
                }
                className={`px-3 py-1.5 rounded-full text-xs font-body border transition-colors ${
                  active
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-secondary/50 text-muted-foreground border-border/40 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    }
    if (field.type === "select") {
      const choices =
        field.choices ?? (field.options ?? []).map((o) => ({ label: o, value: o }));
      return (
        <Select
          value={value || ""}
          onValueChange={(v) =>
            setForm({ ...form, [field.name]: v === "__none__" ? "" : v })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {!field.required && <SelectItem value="__none__">— Nenhum —</SelectItem>}
            {choices.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (field.type === "code") {
      return (
        <Textarea
          rows={14}
          spellCheck={false}
          value={value ?? ""}
          {...(field.maxLength ? { maxLength: field.maxLength } : {})}
          placeholder={field.placeholder}
          className="font-mono text-xs"
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
        />
      );
    }
    if (field.type === "icon") {
      const names = field.options ?? iconNames;
      return (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {names.map((name) => {
            const Icon = iconMap[name];
            if (!Icon) return null;
            const active = value === name;
            return (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => setForm({ ...form, [field.name]: active ? "" : name })}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${
                  active
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-secondary/40 text-muted-foreground border-border/40 hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-body truncate w-full text-center">
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    if (field.type === "image") {
      return (
        <div className="space-y-3">
          {value ? (
            <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-border/50">
              <img src={value} alt="Capa selecionada" className="w-full aspect-[16/10] object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setForm({ ...form, [field.name]: "" })}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Remover
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
              <ImageIcon className="w-4 h-4" />
              Nenhuma capa enviada
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            disabled={uploadingField === field.name}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setUploadingField(field.name);
              try {
                const url = await uploadCover(file);
                setForm((prev) => ({ ...prev, [field.name]: url }));
                toast.success("Capa enviada");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Falha no upload");
              } finally {
                setUploadingField(null);
              }
            }}
          />
          {uploadingField === field.name && (
            <p className="text-xs text-muted-foreground font-body">Enviando imagem...</p>
          )}
        </div>
      );
    }

    if (field.type === "combo") {

      const listId = `combo-${field.name}`;
      return (
        <>
          <Input
            list={listId}
            value={value ?? ""}
            maxLength={field.maxLength ?? 60}
            placeholder={field.placeholder ?? "Digite ou escolha"}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          />
          <datalist id={listId}>
            {(field.options ?? []).map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
          {(field.options ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(field.options ?? []).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm({ ...form, [field.name]: opt })}
                  className={`px-2.5 py-1 rounded-full text-xs font-body border transition-colors ${
                    value === opt
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-secondary/50 text-muted-foreground border-border/40 hover:text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </>
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
            {fields
              .filter((field) => (field.showIf ? field.showIf(form) : true))
              .map((field) => (
              <div
                key={field.name}
                className={`space-y-2 ${
                  field.type === "textarea" ||
                  field.type === "richtext" ||
                  field.type === "multiselect" ||
                  field.type === "icon" ||
                  field.type === "code"
                    ? "md:col-span-2"
                    : ""
                }`}
              >
                {(() => {
                  const counted =
                    field.type === undefined ||
                    field.type === "text" ||
                    field.type === "url" ||
                    field.type === "textarea" ||
                    field.type === "richtext" ||
                    field.type === "code" ||
                    field.type === "combo" ||
                    field.type === "tags";
                  if (!counted) return <Label>{field.label}</Label>;
                  const limit =
                    field.maxLength ??
                    (field.type === "code" || field.type === "richtext"
                      ? null
                      : field.type === "textarea"
                        ? 2000
                        : 500);
                  return (
                    <LabelWithCount
                      label={field.label}
                      value={String(form[field.name] ?? "")}
                      max={limit}
                    />
                  );
                })()}
                {renderField(field)}
                {field.hint && (
                  <p className="text-xs text-muted-foreground font-body">{field.hint}</p>
                )}
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
