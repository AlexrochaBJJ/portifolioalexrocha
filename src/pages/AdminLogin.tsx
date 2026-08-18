import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SiteLayout from "@/components/SiteLayout";

const schema = z.object({
  email: z.string().trim().email({ message: "E-mail inválido" }).max(255),
  password: z.string().min(6, { message: "Senha deve ter ao menos 6 caracteres" }).max(72),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) navigate("/admin", { replace: true });
  }, [loading, session, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível entrar. Verifique e-mail e senha.");
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate("/admin", { replace: true });
  };

  return (
    <SiteLayout>
      <section className="min-h-[70vh] flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md glass-card rounded-2xl p-8">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-heading mb-2">Área administrativa</h1>
          <p className="text-sm text-muted-foreground font-body mb-8">
            Acesso restrito para gerenciar o conteúdo do portfólio.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={72}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {session && !isAdmin && !loading && (
            <p className="mt-6 text-sm text-destructive font-body">
              Esta conta não possui permissão de administrador.
            </p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default AdminLogin;
