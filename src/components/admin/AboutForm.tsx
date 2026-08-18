import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAbout } from "@/hooks/useContent";
import { useCrud } from "@/hooks/useCrud";

const schema = z.object({
  full_name: z.string().trim().min(1, "Informe o nome").max(120),
  headline: z.string().trim().max(160),
  summary: z.string().trim().max(600),
  bio: z.string().trim().max(5000),
});

const AboutForm = () => {
  const { data: about, isLoading } = useAbout();
  const crud = useCrud("profile_about", ["about"]);
  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    summary: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (about) {
      setForm({
        full_name: about.full_name ?? "",
        headline: about.headline ?? "",
        summary: about.summary ?? "",
        bio: about.bio ?? "",
      });
    }
  }, [about]);

  const save = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    if (about) await crud.update(about.id, parsed.data, "Página inicial atualizada");
    else await crud.insert(parsed.data, "Página inicial criada");
    setSaving(false);
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input
          id="full_name"
          value={form.full_name}
          maxLength={120}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="headline">Título / cargo</Label>
        <Input
          id="headline"
          value={form.headline}
          maxLength={160}
          onChange={(e) => setForm({ ...form, headline: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Resumo (aparece no topo da página)</Label>
        <Textarea
          id="summary"
          rows={3}
          value={form.summary}
          maxLength={600}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Quem sou eu (texto completo)</Label>
        <Textarea
          id="bio"
          rows={10}
          value={form.bio}
          maxLength={5000}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </div>
      <Button onClick={save} disabled={saving}>
        {saving ? "Salvando..." : "Salvar alterações"}
      </Button>
    </div>
  );
};

export default AboutForm;
