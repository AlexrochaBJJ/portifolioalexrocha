# Portfólio com área administrativa, Sobre mim e Experiências

## Objetivo

Transformar o portfólio em um site com múltiplas abas e conteúdo gerenciável por você mesmo, sem precisar pedir alterações de código:

1. Nova home "Quem sou eu"
2. Nova aba "Experiências" com fluxogramas de processos de compra interativos
3. Painel administrativo protegido por login para cadastrar/editar tudo
4. Remoção do número de telefone do site

## Estrutura de navegação

```text
Início (Sobre mim)   -> apresentação, habilidades, trajetória, contato
Dashboards           -> galeria Power BI atual
Aplicações Web       -> projetos Lovable (agora gerenciáveis pelo admin)
Experiências         -> fluxogramas de compras interativos
Admin (privado)      -> login + edição de todo o conteúdo
```

Um menu superior fixo, no mesmo estilo dark amber com glassmorphism, será adicionado.

## 1. Backend e login

- Ativação do Lovable Cloud (banco de dados + autenticação + storage).
- Login por e-mail e senha em `/admin/login`. Apenas usuários com papel de administrador acessam o painel.
- Papéis ficam em tabela separada (`user_roles`) para evitar escalonamento de privilégios.
- Leitura pública do conteúdo publicado; escrita somente para admin.

## 2. Home "Quem sou eu"

Seções editáveis pelo admin:
- Texto de apresentação (nome, cargo, resumo, biografia)
- Habilidades e ferramentas (tags com ícone e nível opcional)
- Trajetória profissional (timeline: empresa, cargo, período, descrição)
- Contato e links (e-mail, LinkedIn, GitHub, outros) — sem telefone

O hero atual é reaproveitado visualmente, mas passa a puxar os dados do banco.

## 3. Aba "Experiências" com fluxogramas interativos

- Lista de fluxogramas em cards (título, empresa/contexto, tags, resumo).
- Ao abrir, um fluxograma interativo renderizado a partir das etapas cadastradas:
  - nós clicáveis com título, descrição, responsável, sistema/ferramenta e observações
  - conexões entre etapas (incluindo caminhos de decisão, ex. "aprovado" / "reprovado")
  - zoom, arrastar, ajustar à tela, e painel lateral com detalhe da etapa clicada
- No admin: criar fluxograma, adicionar/editar/remover etapas, definir tipo do nó (início, tarefa, decisão, fim), ordenar e ligar as etapas.

## 4. Aplicações Web e Dashboards gerenciáveis

- Projetos Lovable e dashboards passam a vir do banco.
- No admin: adicionar/editar/remover, com título, descrição, link, tags, categoria, ordem e imagem de preview (upload).
- Os dois projetos e os dashboards atuais são migrados como conteúdo inicial.

## 5. Remoção do telefone

- Botão de WhatsApp/telefone removido do hero e qualquer referência ao número no rodapé.
- Contato passa a ser e-mail e links, gerenciados pelo admin.

## Detalhes técnicos

- Tabelas: `profile_about`, `skills`, `experiences` (timeline), `contact_links`, `web_projects`, `dashboards`, `flowcharts`, `flowchart_nodes`, `flowchart_edges`, `user_roles`.
- Cada tabela em `public` com GRANTs explícitos, RLS ativo: `SELECT` público onde o conteúdo é publicado, `INSERT/UPDATE/DELETE` restrito via função `has_role(auth.uid(), 'admin')`.
- Storage bucket público `assets` para previews e imagens.
- Rotas novas: `/`, `/dashboards`, `/aplicacoes`, `/experiencias`, `/experiencias/:slug`, `/admin/login`, `/admin` (com sub-abas).
- Fluxograma renderizado com React Flow, mantendo tema dark amber; painel de detalhe em Sheet/Dialog.
- Formulários do admin validados com zod (limites de tamanho, URLs válidas) e feedback via toast.
- Busca de dados com TanStack Query; estados de carregamento com skeletons.
- Tokens semânticos do `index.css` mantidos — nenhuma cor fixa nos componentes.
- SEO por página: title, description, H1 único e canonical.

## Primeiro acesso

Após a implementação, você cria sua conta em `/admin/login` e eu concedo o papel de administrador ao seu e-mail.
