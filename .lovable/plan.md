# Experiências completas com fluxogramas embutidos

Hoje a experiência profissional tem apenas cargo, empresa, período, local, descrição e destaques — e os fluxogramas vivem numa lista separada, sem vínculo com a experiência. A ideia é transformar cada experiência numa página rica, com os fluxogramas cadastrados dentro dela.

## O que muda no cadastro (admin > Trajetória)

Novos campos por experiência:
- Slug (URL própria da experiência)
- Setor / área e tipo de contrato
- Resumo curto (para o card) e descrição longa (texto detalhado, várias linhas)
- Principais responsabilidades (lista)
- Resultados / números alcançados (lista)
- Ferramentas e sistemas usados (tags)
- Logo/imagem da empresa (opcional, upload)
- Publicado (sim/não) e ordem

Dentro da edição de cada experiência aparece uma aba/seção **Fluxogramas desta experiência**:
- Criar um novo fluxograma já vinculado à experiência (título, contexto, resumo, tags)
- Abrir o editor visual existente (arrastar etapas, ligar conexões, editar detalhes de cada etapa)
- Reordenar e remover
- Vincular um fluxograma já existente que ainda não tem experiência

## O que muda no site público

- `/experiencias` passa a listar as **experiências** (cards com cargo, empresa, período, resumo, tags), em vez de listar fluxogramas soltos.
- `/experiencias/:slug` mostra a experiência completa: cabeçalho, descrição longa, responsabilidades, resultados, ferramentas — e abaixo os fluxogramas vinculados, cada um interativo (seletor quando houver mais de um).
- Fluxogramas sem experiência vinculada continuam acessíveis pela rota atual, para não quebrar links já existentes.

## Detalhes técnicos

Migração no banco:
- `career_experiences`: adicionar `slug` (único), `sector`, `employment_type`, `short_summary`, `long_description`, `responsibilities text[]`, `results text[]`, `tools text[]`, `logo_url`, `is_published` (default true). Preencher `slug` dos registros existentes a partir de empresa + cargo antes de aplicar a restrição de unicidade.
- `flowcharts`: adicionar `experience_id uuid` referenciando `career_experiences(id) on delete set null`, com índice.
- Políticas de leitura pública de experiências passam a filtrar `is_published`; GRANTs mantidos/ajustados conforme as políticas.

Frontend:
- `useContent.ts`: `useCareer` com filtro de publicação, novo `useExperienceBySlug` (experiência + fluxogramas + nós/arestas), `useFlowcharts` aceitando filtro por experiência.
- `CareerManager.tsx`: campos novos + botão "Detalhar" abrindo um editor de experiência com a seção de fluxogramas reaproveitando `FlowchartEditor`.
- `FlowchartsManager.tsx`: passa a mostrar a experiência vinculada e permite alterá-la.
- Páginas `Experiences.tsx` e `ExperienceDetail.tsx` reescritas conforme acima; rota antiga de fluxograma por slug mantida.
