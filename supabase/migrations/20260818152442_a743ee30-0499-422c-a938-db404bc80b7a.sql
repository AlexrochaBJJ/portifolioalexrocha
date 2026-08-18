INSERT INTO public.dashboards (title, description, category, embed_url, icon, sort_order) VALUES
('Performance de Vendas Anual','Visão macro e detalhada dos principais indicadores do negócio: volume de pedidos, ticket médio, margem de lucro, total de clientes, análises mensais, desempenho por segmento e ranking de vendedores.','Vendas','https://app.powerbi.com/view?r=eyJrIjoiN2U3YmYxNTAtOWM3Ni00NTk1LWE4YmQtZjJiNzQ2NmQ0ZWU4IiwidCI6IjY4ZTJiZjNhLWI1NmMtNDgzMS05OGQyLWViMzhlNjMxMWZlNSJ9','BarChart3',1),
('Acompanhamento de Metas','Painel de acompanhamento de vendas para distribuidora de motopeças com monitoramento de metas semanais e mensais, total vendido por categoria, pedidos, SKUs vendidos e ticket médio.','Metas','https://app.powerbi.com/view?r=eyJrIjoiZGFiNjU3ZjktNzIzOS00NzZmLTg2ZDktYWU1N2UxNDNlYzI5IiwidCI6IjY4ZTJiZjNhLWI1NmMtNDgzMS05OGQyLWViMzhlNjMxMWZlNSJ9','Target',2),
('Acompanhamento de Vendas','Painel para gestores com dados atuais e históricos: vendas vs metas, participação no faturamento, segmentação por grupos de produtos, SKUs e clientes, com projeção para o período.','Vendas','https://app.powerbi.com/view?r=eyJrIjoiNTJjY2JhZjQtZGM2Ni00NTQzLThmMDMtYTUzYjdlOGE1MzQ2IiwidCI6IjY4ZTJiZjNhLWI1NmMtNDgzMS05OGQyLWViMzhlNjMxMWZlNSJ9','ShoppingCart',3),
('Gestão de RH','Painel completo com módulos de visão geral, frequência e banco de horas. Distribuição por estado, faltas, funções, diversidade de gênero, atrasos por cargo e controle de horas.','RH','https://app.powerbi.com/view?r=eyJrIjoiMzhiZjEzMmYtZjRhNy00ZmIxLWJmZDMtNWNjZTQxYTQxNWI1IiwidCI6IjY4ZTJiZjNhLWI1NmMtNDgzMS05OGQyLWViMzhlNjMxMWZlNSJ9','Users',4),
('Acompanhamento de Metas v2','Indicadores de clientes atendidos, SKUs vendidos, pedidos e ticket médio. Velocímetro de desempenho, faixas de aceleração de metas e análise de mix de produtos.','Metas','https://app.powerbi.com/view?r=eyJrIjoiNWZlNTQwZTktZjI3ZS00OWM5LTkzOTgtODA4YTJkZDJhZjVjIiwidCI6IjY4ZTJiZjNhLWI1NmMtNDgzMS05OGQyLWViMzhlNjMxMWZlNSJ9','Gauge',5);

INSERT INTO public.web_projects (title, description, url, tags, sort_order) VALUES
('Fluxo+ — Gerenciador de Tarefas','Aplicação web para gerenciamento de tarefas com autenticação, foco em produtividade e organização do fluxo de trabalho diário.','https://gerenciadorfluxomais.lovable.app/auth','{Produtividade,Auth,SaaS}',1),
('Hub de Ferramentas Fluxo+','Central unificada com diversas ferramentas: envio de e-mails em massa, editor de tabelas, cadastro de fornecedores, painel de cobranças e mais.','https://hubferramentasfluxo.lovable.app/','{Hub,Automação,Produtividade}',2);

INSERT INTO public.profile_about (full_name, headline, summary, bio) VALUES
('Alex Rocha','Comprador & Analista de Business Intelligence','Transformando dados em decisões estratégicas através de dashboards interativos e visuais poderosos no Power BI.','Atuo na área de compras e suprimentos com forte foco em processos, negociação e análise de dados. Uno a experiência prática de comprador ao domínio de ferramentas de Business Intelligence para desenhar processos mais eficientes e apoiar decisões com dados.');

INSERT INTO public.contact_links (label, kind, value, sort_order) VALUES
('E-mail','email','Allexdasilvarocha@gmail.com',1);

INSERT INTO public.skills (name, category, sort_order) VALUES
('Power BI','Business Intelligence',1),
('DAX','Business Intelligence',2),
('Excel Avançado','Análise de Dados',3),
('SQL','Análise de Dados',4),
('Negociação com Fornecedores','Compras',5),
('Gestão de Processos de Compra','Compras',6),
('Mapeamento de Processos','Compras',7);