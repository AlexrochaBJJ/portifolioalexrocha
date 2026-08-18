# Cadastro de fluxogramas em lista, com desenho automático

Hoje só é possível montar o fluxograma arrastando blocos na tela. A ideia é cadastrar cada etapa num formulário em lista (sem arrastar) e o diagrama ser desenhado sozinho, de cima para baixo, com as ramificações lado a lado — como no esquema de compras que você enviou.

## Como vai funcionar o cadastro

Dentro de cada experiência > fluxograma, uma aba **Etapas (lista)** com a tabela de etapas. Para cada etapa:

- **Tipo**: Início, Etapa, Decisão, Ramificação, Fim
- **Título** (ex.: "Equalização Comercial", "Compra realmente necessária?")
- **Itens** (bullets exibidos dentro do bloco: Preço, Frete, Prazo, Pagamento)
- **Vem depois de**: escolher uma ou mais etapas anteriores (é isso que cria as setas)
- **Rótulo da seta**: "Sim", "Não", "CIF", "FOB (Empresa)" etc.
- **Detalhes opcionais**: descrição, responsável, sistema, observações
- **Ordem**: subir/descer na lista

Regras práticas:
- Uma etapa pode ter várias etapas anteriores (fecha ramificações, como "Nova proposta → Equalização Comercial").
- Uma etapa pode ter vários caminhos saindo dela (abre ramificações, como Reposição × Novo Produto).
- Etapas de decisão aparecem em formato de losango e com as duas saídas rotuladas Sim/Não.
- Excluir uma etapa remove automaticamente as setas ligadas a ela.

## Como vai aparecer no site

- Diagrama vertical gerado automaticamente: início no topo, fim embaixo, ramos abertos em colunas paralelas e reencontrando o tronco.
- Blocos mostram título e a lista de bullets dentro do próprio card.
- Decisões em losango, setas com rótulo (Sim/Não).
- Clique no bloco continua abrindo o painel com responsável, sistema e observações.
- Zoom, arraste da tela e ajuste automático de enquadramento; no celular o diagrama rola com zoom out inicial.

## Detalhes técnicos

Banco:
- `flowchart_nodes`: adicionar `items text[] not null default '{}'` para os bullets. Manter `position_x/position_y` (usados como fallback), mas o layout público passa a ser calculado.
- `flowchart_edges`: já tem `label`; nada a mudar.
- Novo tipo de nó aceito em `node_type`: `branch` (além de start/process/decision/end).

Layout automático:
- Utilitário `src/lib/flowLayout.ts`: ordenação topológica a partir dos nós sem entrada, atribuição de nível (rank) por profundidade máxima, distribuição horizontal centralizada por nível, tolerante a ciclos (aresta de retorno ignorada no cálculo de rank).
- Altura de cada nó estimada a partir da quantidade de `items`, para evitar sobreposição.

Frontend:
- `FlowchartViewer.tsx`: usa `flowLayout` em vez de `position_x/y`; novo nó customizado (`StepNode`) renderizando título + bullets, com variação visual por tipo (losango para decisão).
- `FlowchartEditor.tsx`: ganha abas "Lista de etapas" (novo `FlowchartStepList.tsx`) e "Diagrama" (pré-visualização com o mesmo layout automático, somente leitura).
- `FlowchartStepList.tsx`: CRUD das etapas com multi-select de etapas anteriores, campo de itens (tags/linhas), rótulo da seta e reordenação; grava nós e arestas via `useCrud`, sincronizando as arestas conforme os "vem depois de".
- `useContent.ts`: incluir `items` nos tipos derivados (regenerado por `types.ts`).

Após publicar, você poderá cadastrar o fluxograma de compras completo etapa por etapa e ele será desenhado exatamente nesse formato de árvore vertical.
