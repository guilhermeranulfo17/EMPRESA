# Equipe de pesquisa

Os agentes da página publicada não têm internet. As pesquisas são feitas por uma rotina do Claude Code (com busca na web) que lê a fila no armazenamento da página e devolve o resultado.

- **Quando roda:** de hora em hora, das 8h às 20h (horário de Brasília), de segunda a sábado. Sem pedido na fila, a rotina termina na hora.
- **Onde fica a fila:** coleção `pesquisas` do armazenamento do artefato. Cada documento:
  - `id`, `titulo`, `pedido` (o que pesquisar e para quê), `pedidoPor`, `responsavel` (agente que assina o resultado), `criadoEm`
  - `status`: `na fila` → `pesquisando` → `pronta` (ou `erro`)
  - ao concluir: `resultado` (Markdown, com `##` e tabelas), `fontes` (lista de `{titulo, url}`), `concluidaEm`, `feitaPor`
- **Regras da pesquisa:** só dados encontrados nas fontes, nunca inventados; todo contato vem de página pública; o que não foi encontrado é dito explicitamente; o resultado termina com "Como usar" e "O que não foi possível".
- **Pausar ou mudar o horário:** em claude.ai, em Rotinas, a rotina "Equipe de pesquisa da Orkestra".
