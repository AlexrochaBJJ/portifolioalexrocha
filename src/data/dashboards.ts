import dashboardVendasAnual from "@/assets/dashboard-vendas-anual.jpg";
import dashboardMetas from "@/assets/dashboard-metas.jpg";
import dashboardVendas from "@/assets/dashboard-vendas.jpg";
import dashboardRh from "@/assets/dashboard-rh.jpg";
import dashboardMetas2 from "@/assets/dashboard-metas2.jpg";

export interface Dashboard {
  id: string;
  title: string;
  description: string;
  category: string;
  embedUrl: string;
  previewImage: string;
}

export const dashboards: Dashboard[] = [
  {
    id: "vendas-anual",
    title: "Performance de Vendas Anual",
    description:
      "Visão macro e detalhada dos principais indicadores do negócio: volume de pedidos, ticket médio, margem de lucro, total de clientes, análises mensais, desempenho por segmento e ranking de vendedores.",
    category: "Vendas",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiN2U3YmYxNTAtOWM3Ni00NTk1LWE4YmQtZjJiNzQ2NmQ0ZWU4IiwidCI6IjY4ZTJiZjNhLWI1NmMtNDgzMS05OGQyLWViMzhlNjMxMWZlNSJ9",
    previewImage: dashboardVendasAnual,
  },
  {
    id: "metas",
    title: "Acompanhamento de Metas",
    description:
      "Painel de acompanhamento de vendas para distribuidora de motopeças com monitoramento de metas semanais e mensais, total vendido por categoria, pedidos, SKUs vendidos e ticket médio.",
    category: "Metas",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiZGFiNjU3ZjktNzIzOS00NzZmLTg2ZDktYWU1N2UxNDNlYzI5IiwidCI6IjY4ZTJiZjNhLWI1NmMtNDgzMS05OGQyLWViMzhlNjMxMWZlNSJ9",
    previewImage: dashboardMetas,
  },
  {
    id: "vendas",
    title: "Acompanhamento de Vendas",
    description:
      "Painel para gestores com dados atuais e históricos: vendas vs metas, participação no faturamento, segmentação por grupos de produtos, SKUs e clientes, com projeção para o período.",
    category: "Vendas",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiNTJjY2JhZjQtZGM2Ni00NTQzLThmMDMtYTUzYjdlOGE1MzQ2IiwidCI6IjY4ZTJiZjNhLWI1NmMtNDgzMS05OGQyLWViMzhlNjMxMWZlNSJ9",
    previewImage: dashboardVendas,
  },
  {
    id: "rh",
    title: "Gestão de RH",
    description:
      "Painel completo com módulos de visão geral, frequência e banco de horas. Distribuição por estado, faltas, funções, diversidade de gênero, atrasos por cargo e controle de horas.",
    category: "RH",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiMzhiZjEzMmYtZjRhNy00ZmIxLWJmZDMtNWNjZTQxYTQxNWI1IiwidCI6IjY4ZTJiZjNhLWI1NmMtNDgzMS05OGQyLWViMzhlNjMxMWZlNSJ9",
    previewImage: dashboardRh,
  },
  {
    id: "metas-v2",
    title: "Acompanhamento de Metas v2",
    description:
      "Indicadores de clientes atendidos, SKUs vendidos, pedidos e ticket médio. Velocímetro de desempenho, faixas de aceleração de metas e análise de mix de produtos.",
    category: "Metas",
    embedUrl:
      "https://app.powerbi.com/view?r=eyJrIjoiNWZlNTQwZTktZjI3ZS00OWM5LTkzOTgtODA4YTJkZDJhZjVjIiwidCI6IjY4ZTJiZjNhLWI1NmMtNDgzMS05OGQyLWViMzhlNjMxMWZlNSJ9",
    previewImage: dashboardMetas2,
  },
];
