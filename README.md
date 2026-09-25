# Escritório de Agentes da Orkestra

A Orkestra faz orçamento automático no link da bio do Instagram de buffets: o cliente monta a festa, vê o preço e cai no WhatsApp do buffet já qualificado.

A estratégia interna (oferta, metas de validação, preços em teste, backlog) **não fica neste repositório**: ela está no armazenamento privado da página publicada no Claude, carregada quando a página abre.

Este é um escritório visual onde 18 agentes de IA trabalham em cinco setores (**Comercial**, **Marketing**, **Suporte & Sucesso**, **Financeiro** e **TI & Produto**) e conversam entre si por uma **caixa de comunicação** compartilhada. Eles têm autonomia para pedir dados uns aos outros, propor ideias para a empresa e apoiar ou questionar as ideias dos colegas. Você entra como **CEO**: manda mensagens para todos, para um setor ou para um agente, e aprova ou descarta as ideias.

## O que é real e o que não é

- **Os agentes da página pensam com o Claude de verdade, mas não têm internet.** Eles analisam os dados, fazem contas, decidem e escrevem. Não acessam WhatsApp, Instagram, Google ou sistemas, e as regras proíbem que finjam fazer isso ("já estou buscando", "te mando em instantes").
- **Pesquisa na internet é feita pela equipe de pesquisa:** uma rotina do Claude Code com busca na web que roda de hora em hora, das 8h às 20h (seg. a sáb.). Ela pega os pedidos da fila, pesquisa e grava o resultado com fontes na página, que aparece sozinho. Os agentes também podem pedir pesquisas quando falta informação de fora.
- **Análise do funil é conta, não IA:** a aba Números calcula quanto falta para a meta, taxa de resposta, conversão das apresentações e o volume de mensagens necessário. Os agentes recebem essa análise em toda rodada.
- **Tudo fica salvo:** conversa, ideias, entregas, pesquisas e números continuam na próxima visita. Para recomeçar a conversa, use "Apagar conversa e ideias" na aba Números.
- **Entregas são materiais prontos para usar:** mensagens de prospecção, roteiro da IA vendedora, objeções, apresentação, plano da semana, posts, checklist de implantação e relatório da meta. Elas usam os números reais e as pesquisas prontas. Se um material depende de dado de fora que ainda não foi pesquisado, ele diz qual pesquisa pedir, em vez de inventar.
- **Tarefas do CEO:** agentes não executam nada. Quando algo precisa ser feito por uma pessoa, eles criam uma tarefa na aba **Tarefas**, que você marca quando fizer. Uma fala em que um agente diga que executou algo aparece com um aviso.
- **Validação:** o topo mostra buffets pagando, que aceitaram o link e abordados contra as metas mínimas, e os dias até o prazo. A aba Números calcula onde a validação está.
- **Salvar no Drive:** cada entrega e pesquisa pode virar um documento na pasta da empresa no Google Drive.
- **TI & Produto:** 7 agentes (CTO, Gerente de Produto, Designer, Front-end, Back-end, QA e DevOps) que especificam, desenham, planejam e testam o sistema. Eles não escrevem nem publicam código dentro da página. A aba **Produto** tem o backlog do MVP: você marca o que está feito, fazendo ou a fazer, e os agentes usam isso como a verdade (e sugerem tarefas novas).
- **Planilha do funil:** a lista de prospecção fica no Google Drive ("Funil de Prospecção - Orkestra"). Na aba Números, "Atualizar pela planilha" lê a planilha pelo seu Google Drive conectado ao Claude e conta os buffets por status.
- **Modo simulação:** só aparece quando a página é aberta fora do Claude. Um aviso diz que as falas são frases prontas, e nada é salvo.

## Como usar pela página no Claude

1. Abra o link do escritório no Claude.
2. Preencha a aba **Números** com o que você sabe hoje e salve.
3. Na aba **Entregas**, peça uma **pesquisa na internet** (por exemplo, "Lista de buffets de uma cidade") ou um **material** (por exemplo, "Mensagens de prospecção no WhatsApp"). Materiais aparecem na hora, enquanto são escritos; pesquisas chegam na próxima passada da equipe de pesquisa.
4. Clique em **Rodada da equipe** para os agentes conversarem entre si, ou mande uma mensagem como CEO na aba **Caixa**. Nas rodadas, os agentes também podem produzir entregas por conta própria e propor ideias para você aprovar.

A página só chama o Claude quando você clica em algo (rodada, mensagem, entrega, aprovação). Ela não fica gastando o seu plano sozinha.

## Rodando no computador

- **Com chave da API:** os agentes trabalham sozinhos o tempo todo, um de cada vez (veja abaixo). Entregas e Números ainda são exclusivos da página no Claude.
- **Sem chave:** modo simulação, com frases prontas.

## Como rodar no computador

Precisa de Node.js 20 ou mais novo.

```bash
npm install
npm start          # abre em http://localhost:3000
```

- **Sem chave da API**, os agentes rodam em **modo simulação** (falas prontas por setor). Serve para ver o escritório funcionando na hora, sem custo.
- **Com chave da API**, cada agente passa a pensar com o Claude de verdade:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm start
```

Também dá para abrir `public/index.html` servido por qualquer servidor estático: sem o `server.js`, a página roda a demonstração simulada direto no navegador.

### Configurações (variáveis de ambiente)

| Variável | Padrão | Para que serve |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Liga os agentes Claude. |
| `OFFICE_BRAIN` | automático | `sim` força a simulação; `claude` força o Claude. |
| `OFFICE_MODEL` | `claude-opus-5` | Modelo usado pelos agentes. |
| `OFFICE_EFFORT` | `low` | Esforço de raciocínio (`low`, `medium`, `high`...). Mais alto = respostas mais elaboradas e mais caras. |
| `OFFICE_INTERVALO` | `8000` com Claude, `3500` na simulação | Milissegundos entre uma ação e outra (dividido pela velocidade escolhida na tela). |
| `PORT` | `3000` | Porta do servidor. |

**Custo:** com Claude, cada ação de um agente é uma chamada à API. No intervalo padrão são cerca de 7 chamadas por minuto em 1×. Use **Pausar** quando não estiver olhando, ou aumente `OFFICE_INTERVALO`.

## O que aparece na tela

- **Planta do escritório:** uma sala por setor, com uma mesa por agente. O monitor acende quando o agente está trabalhando, aparecem os três pontinhos quando está pensando e um balão com a fala quando ele envia uma mensagem. Embaixo do nome fica o que ele está fazendo agora.
- **Corredor:** o seu posto de CEO e a caixa de comunicação. Cada mensagem vira um envelope que sai de quem enviou, passa pela caixa e chega a quem recebe.
- **Caixa de comunicação:** todas as conversas, com filtro por setor, por conversas com o CEO, ou por agente (clique na mesa dele).
- **Mural de ideias:** as propostas dos agentes com apoios e questionamentos. Uma ideia com 4 apoios de pelo menos 2 setores sobe para **Aguardando você**. Quando você aprova, o autor volta com os próximos passos.
- **Controles:** pausar e retomar, e velocidade de 0,5× a 4×.

## Como os agentes decidem

A cada rodada o motor (`public/js/engine.js`) escolhe um agente, dando prioridade a quem recebeu mensagem (mensagens do CEO passam na frente). O agente escolhe **uma** ação:

- `mensagem`: fala com um colega, um setor, todos ou o CEO;
- `ideia`: propõe uma ideia para a empresa;
- `votar`: apoia ou questiona uma ideia em discussão.

Uma conversa gera no máximo 3 respostas em cadeia sozinha, para os agentes não ficarem presos num pingue-pongue.

No servidor com Claude (`src/cerebro-claude.js`), o agente recebe a descrição da empresa, a missão do setor, o próprio perfil, as últimas 20 mensagens da caixa e o mural de ideias, e responde em JSON validado por esquema. Se uma chamada falhar, o agente usa a simulação naquela rodada e o escritório segue funcionando.

Nos dois modos com IA, os agentes são orientados a não inventar resultados (vendas, taxas, reclamações) como se fossem reais: números são a meta, contas a partir dos dados da empresa ou estimativas ditas como estimativas.

O histórico (mensagens e ideias) é salvo em `data/estado.json` e recarregado quando o servidor reinicia. Apague esse arquivo para começar do zero.

## Como mudar a empresa, os setores e os agentes

Tudo fica em `public/config/empresa.json`:

- `empresa`: nome, o que a empresa faz e o objetivo do trimestre. Os agentes Claude usam isso para dar ideias que façam sentido para o seu negócio, então vale descrever bem.
- `empresa.publico`, `empresa.preco` e `empresa.contexto` (lista de fatos sobre como a empresa funciona hoje) também entram no que os agentes sabem.
- `setores`: cada setor tem `id`, `nome`, `cor`, `missao` e a lista de `agentes`.
- cada agente tem `id`, `nome`, `cargo` e `perfil` (personalidade e foco).

Para colocar mais agentes, basta adicionar itens na lista do setor. Para criar um setor novo (por exemplo, RH ou Produto), adicione um bloco em `setores`: ele ganha uma sala na planta e, no modo Claude, já participa das conversas. No modo simulação, setores novos usam falas genéricas.

## Estrutura

```
server.js                    servidor HTTP + tempo real (SSE) + histórico
src/cerebro-claude.js        agentes pensando com a API do Claude
public/index.html            a página do escritório
public/css/escritorio.css    visual (tema claro e escuro)
public/js/app.js             interface: planta, caixa, mural, controles
public/js/engine.js          motor: estado, escolha de quem fala, regras das ideias
public/js/cerebro-simulado.js falas simuladas por setor
public/js/prompts.js         textos que descrevem empresa, equipe e caixa para o Claude
public/js/rodada-ia.js       rodada com o Claude dentro da página publicada
public/js/entregas.js        modelos de entrega e geração com o Claude
public/js/memoria.js         salva e carrega tudo no armazenamento da página
docs/equipe-de-pesquisa.md   instruções da rotina que faz as pesquisas na internet
public/config/empresa.json   empresa, setores e agentes
```
