# Experiências mais completas: descrição única, destaques com impacto e vitrines vinculadas

## 1. O que é "Slug (URL)"

É o endereço da página. Se o slug é `comprador-empresa-x`, a experiência abre em
`/experiencias/comprador-empresa-x`. Serve para links limpos e compartilháveis.

Mudança: o slug passa a ser **gerado automaticamente** a partir do cargo + empresa,
com campo opcional "endereço da página (avançado)" caso você queira ajustar.
Assim você não precisa mais pensar nele ao cadastrar.

## 2. Unificar as descrições

Hoje existem três campos parecidos: "Resumo curto (card)", "Descrição" e
"Descrição detalhada". Passa a existir:

- **Resumo curto** — usado nos cards da lista de experiências
- **Descrição** — texto completo mostrado na página da experiência

O conteúdo já existente é preservado: o texto detalhado, quando houver, vira a
Descrição; se estiver vazio, usa a descrição antiga.

## 3. Destaques com impacto

Cada experiência ganha uma lista de destaques, cadastrados um por um:

- **Destaque** — o que você fez
- **Impacto** — no que isso resultou
- Ordem

Na página da experiência aparecem em cards pareados (destaque em cima, impacto
abaixo, com ícone), no estilo dark amber atual. Os destaques atuais (texto solto)
são migrados como destaques sem impacto, para você completar depois.

## 4. Power BI dentro da experiência

No cadastro da experiência você escolhe:

- **Categorias de dashboards** (ex.: Vendas, Metas) — traz automaticamente todos os
  dashboards publicados dessas categorias
- **Dashboards específicos** — marcação item por item, somada às categorias

Na página da experiência surge a seção "Dashboards deste trabalho", com os mesmos
cards de ícone da aba Dashboards, abrindo o Power BI no modal interativo. Os mesmos
dashboards continuam aparecendo normalmente na aba Dashboards, filtrados pela categoria.

## 5. Aplicações Web dentro da experiência

Mesmo modelo: escolha por **categoria** e/ou por **aplicações específicas**.
Como as aplicações web hoje não têm categoria, passa a existir o campo "Categoria"
nelas, e a aba Aplicações Web ganha os filtros por categoria (igual à aba Dashboards).

## 6. Página da experiência: nova ordem

```text
Cabeçalho (cargo, empresa, período, local, setor, tipo)
Descrição
Responsabilidades | Resultados
Destaques e impacto
Ferramentas e sistemas
Fluxogramas de processos
Dashboards deste trabalho
Aplicações web deste trabalho
```

## Detalhes técnicos

- Migração:
  - `web_projects`: nova coluna `category text not null default 'Geral'`
  - `career_experiences`: novas colunas `dashboard_categories text[]`,
    `webapp_categories text[]`; `long_description` copiada para `description` e
    removida do formulário (coluna mantida no banco por segurança, sem uso na UI)
  - nova tabela `experience_highlights` (`experience_id`, `highlight`, `impact`,
    `sort_order`) com GRANTs, RLS: leitura pública quando a experiência está
    publicada, escrita apenas para admin
  - novas tabelas de vínculo `experience_dashboards` e `experience_web_projects`
    (par experiência + item, com ordem), com GRANTs e as mesmas políticas
- `useContent.ts`: `useExperienceBySlug` passa a trazer destaques, dashboards e
  aplicações (união de categorias + itens marcados, sem duplicar); novos hooks para
  as categorias disponíveis
- Admin: `ExperienceEditor` ganha abas — Dados, Destaques e impacto, Fluxogramas,
  Dashboards, Aplicações web; `CareerManager` perde os campos duplicados e o slug
  passa a ser automático; `CrudList` ganha suporte a campo de múltipla seleção
  (categorias e itens)
- `LovableProjectsGallery` ganha filtro por categoria reaproveitando o padrão de
  `DashboardGallery`; reutilização de `DashboardCard`/`DashboardViewer` e
  `LovableProjectCard` na página da experiência
- Tokens semânticos do `index.css` mantidos, nenhuma cor fixa
