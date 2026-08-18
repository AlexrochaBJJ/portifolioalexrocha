import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import SiteLayout from "@/components/SiteLayout";
import AboutForm from "@/components/admin/AboutForm";
import SkillsManager from "@/components/admin/SkillsManager";
import CareerManager from "@/components/admin/CareerManager";
import ContactManager from "@/components/admin/ContactManager";
import WebProjectsManager from "@/components/admin/WebProjectsManager";
import DashboardsManager from "@/components/admin/DashboardsManager";
import FlowchartsManager from "@/components/admin/FlowchartsManager";
import { useAuth } from "@/hooks/useAuth";

const Admin = () => {
  const navigate = useNavigate();
  const { session, isAdmin, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) navigate("/admin/login", { replace: true });
  }, [loading, session, isAdmin, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-sm text-muted-foreground font-body">Verificando acesso...</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-3">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-body">
                  {session.user.email}
                </span>
              </div>
              <h1 className="text-3xl font-bold font-heading">
                Painel <span className="text-gradient-amber">administrativo</span>
              </h1>
            </div>
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                navigate("/", { replace: true });
              }}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sair
            </Button>
          </div>

          <Tabs defaultValue="about">
            <TabsList className="flex flex-wrap h-auto justify-start">
              <TabsTrigger value="about">Sobre mim</TabsTrigger>
              <TabsTrigger value="skills">Habilidades</TabsTrigger>
              <TabsTrigger value="career">Trajetória</TabsTrigger>
              <TabsTrigger value="contacts">Contatos</TabsTrigger>
              <TabsTrigger value="webapps">Aplicações Web</TabsTrigger>
              <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
              <TabsTrigger value="flowcharts">Fluxogramas</TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="about">
                <AboutForm />
              </TabsContent>
              <TabsContent value="skills">
                <SkillsManager />
              </TabsContent>
              <TabsContent value="career">
                <CareerManager />
              </TabsContent>
              <TabsContent value="contacts">
                <ContactManager />
              </TabsContent>
              <TabsContent value="webapps">
                <WebProjectsManager />
              </TabsContent>
              <TabsContent value="dashboards">
                <DashboardsManager />
              </TabsContent>
              <TabsContent value="flowcharts">
                <FlowchartsManager />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Admin;
