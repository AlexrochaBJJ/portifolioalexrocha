import fluxoMaisPreview from "@/assets/lovable-fluxomais.png";
import hubFerramentasPreview from "@/assets/lovable-hubferramentas.png";

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
  {
    id: "hub-ferramentas-fluxo",
    title: "Hub de Ferramentas Fluxo+",
    description:
      "Central unificada com diversas ferramentas: envio de e-mails em massa, editor de tabelas, cadastro de fornecedores, painel de cobranças e mais.",
    url: "https://hubferramentasfluxo.lovable.app/",
    preview: hubFerramentasPreview,
    tags: ["Hub", "Automação", "Produtividade"],
  },
];
