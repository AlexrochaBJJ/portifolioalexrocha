import fluxoMaisPreview from "@/assets/lovable-fluxomais.png";

export interface LovableProject {
  id: string;
  title: string;
  description: string;
  url: string;
  preview: string;
  tags?: string[];
}

export const lovableProjects: LovableProject[] = [
  {
    id: "fluxo-mais",
    title: "Fluxo+ — Gerenciador de Tarefas",
    description:
      "Aplicação web para gerenciamento de tarefas com autenticação, foco em produtividade e organização do fluxo de trabalho diário.",
    url: "https://gerenciadorfluxomais.lovable.app/auth",
    preview: fluxoMaisPreview,
    tags: ["Produtividade", "Auth", "SaaS"],
  },
];
