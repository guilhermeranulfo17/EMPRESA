// Entregas: materiais prontos para usar, escritos por um agente com o Claude.

import { descreverEmpresa, descreverDados, descreverAnalise, descreverValidacao, descreverEntregas, descreverPesquisas, descreverBacklog, descreverTarefasCeo } from './prompts.js';

// Materiais escritos por um agente com o Claude, na hora.
const M = (id, titulo, agente, pedido, precisaDetalhe = false) => ({ id, titulo, agente, pedido, precisaDetalhe });
export const MODELOS = [
  M('abordagem', 'Mensagem de abordagem da oferta de validação', 'bianca',
    'Escreva a primeira mensagem para abordar um dono de buffet do cliente ideal pelo WhatsApp ou direct, apresentando a oferta de validação (catálogo montado de graça, link na bio por 14 dias, resultado no dia 14). Use o discurso central da empresa. Dê 3 variações curtas e naturais, um follow-up para quem não respondeu em 2 dias, e diga como personalizar com o nome e o tipo de festa do buffet.'),
  M('roteiro_conversa', 'Roteiro da conversa de validação', 'tiago',
    'Monte o roteiro da conversa com o dono do buffet: perguntas para descobrir se é do cliente ideal e como ele precifica hoje, como mostrar a página demo, como apresentar a oferta de 14 dias, respostas para as objeções esperadas e o que registrar na planilha no fim (aceitou ou não, objeção principal, como precifica hoje).'),
  M('proposta_dia14', 'Proposta do dia 14 com preço de fundador', 'rafael',
    'Escreva a proposta do plano pago para apresentar no dia 14: como abrir com o resultado do teste, a oferta com preço de fundador para quem fechar na hora, formas de pagamento (Pix ou cartão) e o que dizer se o buffet hesitar. Deixe o preço como variável se ainda não foi decidido.'),
  M('relatorio14', 'Modelo do relatório de 14 dias para o buffet', 'otto',
    'Monte o modelo do relatório de 14 dias que o buffet recebe: orçamentos gerados, valor total em propostas, quantos viraram conversa no WhatsApp, destaques e próximos passos. Em formato para mandar pelo WhatsApp e para mostrar numa conversa.'),
  M('onboarding', 'Checklist do onboarding feito pela equipe', 'duda',
    'Monte o checklist do onboarding feito pela equipe: roteiro da reunião de 30 minutos para levantar cardápio, pacotes, extras e regras de preço; cadastro de identidade; teste com 3 orçamentos reais antigos (como conferir se o valor bate); link na bio e nos destaques; mensagens de acompanhamento dos dias 3, 7 e 14.'),
  M('regras_preco', 'Planilha de regras de preço do buffet', 'paula',
    'Monte o formulário para registrar, no onboarding, cada regra de preço do buffet que o sistema não cobre hoje (dia da semana, temporada, mínimo de convidados por pacote, datas bloqueadas, negociação). Diga como decidir quando uma regra entra no produto: só se aparecer em mais de um buffet.'),
  M('nova_mensagem', 'Nova mensagem para o site, bio e painel', 'luna',
    'Escreva os textos para trocar "CRM para buffets & eventos" pela nova mensagem de orçamento automático que gera cliente: subtítulo do logo, bio do Instagram da Orkestra, título e subtítulo da página demo e da futura página de venda, e 3 frases curtas para o comercial usar.'),
  M('video60', 'Roteiro do vídeo de 60 segundos', 'caio',
    'Escreva o roteiro de um vídeo de 60 segundos mostrando um cliente montando uma festa pelo celular na página do buffet: cenas, falas ou legendas, o momento em que o preço aparece e o fechamento no WhatsApp do buffet.'),
  M('preco_plano', 'Análise de preço e plano para o dia 14', 'helena',
    'Analise qual preço e plano oferecer no dia 14 dentro da faixa em teste, com preço de fundador: o que cada faixa significa para o buffet (use a tese de um evento a mais por ano), prós e contras, e a recomendação. Deixe claro o que é conta e o que é estimativa.'),
  M('plano_bugs', 'Plano de correção antes do teste real', 'marcos',
    'A partir do backlog real, monte o plano para deixar o sistema pronto para o primeiro teste com buffet real: ordem das correções, o que cada uma precisa, como testar que foi resolvida e o que fica para depois. Nada de funcionalidade nova.'),
  M('spec_notificacao', 'Especificação: aviso de lead novo', 'paula',
    'Escreva a especificação do aviso ao buffet quando entra um lead novo pelo link (WhatsApp ou e-mail): quando dispara, o que a mensagem diz, dados do lead incluídos, o que acontece se falhar e critérios de aceite.'),
  M('spec_funil', 'Especificação: medir o funil da página pública', 'paula',
    'Escreva a especificação para medir o funil da página pública: visitas, início do orçamento, dados deixados e clique no WhatsApp. Eventos a registrar, onde o buffet vê os números e critérios de aceite.'),
  M('dominio', 'Plano de domínio próprio, backup e isolamento', 'sara',
    'Monte o plano para sair do endereço de preview: domínio próprio no formato orkestra.com.br/b/nome-do-buffet, HTTPS, backup e teste de restauração, isolamento dos dados de cada buffet e o que conferir antes do primeiro cliente pagante.'),
  M('outra', 'Outra entrega', 'rafael', '', true),
];

// Pedidos que precisam de internet: vão para a fila da equipe de pesquisa, que devolve com fontes.
export const MODELOS_PESQUISA = [
  {
    id: 'buffets_cidade',
    titulo: 'Lista de buffets do cliente ideal numa cidade',
    agente: 'nina',
    exemplo: 'Ex.: Uberaba e Araguari, 15 buffets, médio porte, que recebem orçamento pelo Instagram.',
    pedido: 'Encontre buffets reais da cidade indicada que se encaixem no cliente ideal: médio porte, recebendo pedidos de orçamento pelo Instagram ou WhatsApp e com cardápio ou pacotes com preço por convidado. Evite buffets de luxo e muito pequenos. Para cada um: nome, WhatsApp ou telefone público, Instagram ou site, bairro e o que a fonte diz. Separe por prioridade e diga o que não foi encontrado.',
  },
  {
    id: 'concorrentes',
    titulo: 'Concorrentes da Orkestra',
    agente: 'luna',
    exemplo: 'Ex.: focar em quem faz orçamento automático ou link na bio.',
    pedido: 'Encontre ferramentas que buffets no Brasil usam para orçamento e captação de clientes, principalmente as que fazem orçamento automático, link na bio ou captação pelo Instagram. Para cada uma: nome, site, o que faz, preço público e o que a Orkestra faz diferente.',
  },
  {
    id: 'mercado',
    titulo: 'Preços e mercado de buffet de uma cidade',
    agente: 'helena',
    exemplo: 'Ex.: Uberlândia, preço por convidado de casamento e festa infantil.',
    pedido: 'Levante preços públicos de buffet (por convidado e por festa) na cidade indicada, os tipos de festa mais comuns e sinais do tamanho do mercado. Relacione com a faixa de preço em teste da Orkestra e com a tese de um evento a mais por ano.',
  },
  {
    id: 'ferramentas',
    titulo: 'Ferramentas e custos para o sistema',
    agente: 'sara',
    exemplo: 'Ex.: registro de domínio .com.br, envio de aviso por WhatsApp, cobrança recorrente por Pix.',
    pedido: 'Levante opções e preços públicos, no Brasil, do que o sistema precisa agora: registro e configuração de domínio .com.br, envio de aviso de lead por e-mail e por WhatsApp (API oficial), cobrança por Pix e cartão (inclusive recorrente) e backup. Recomende uma combinação barata para os primeiros clientes.',
  },
  { id: 'pesquisa_livre', titulo: 'Pesquisa livre', agente: 'nina', exemplo: 'Descreva o que precisa pesquisar na internet e para quê.', pedido: '' },
];

function montarPrompt({ escritorio, agenteId, titulo, pedido, anterior, ajuste }) {
  const { estado } = escritorio;
  const agente = estado.agentes[agenteId];
  const setor = estado.setores.find((s) => s.id === agente.setor);
  const nomeDe = (id) => escritorio.nomeDe(id);
  const conversa = estado.mensagens
    .slice(-15)
    .map((m) => `- ${nomeDe(m.de)} → ${nomeDe(m.para)}: ${m.texto}`)
    .join('\n');
  const aprovadas = estado.ideias.filter((i) => i.status === 'aprovada').map((i) => `- ${i.titulo}: ${i.descricao}`).join('\n');

  const tarefa = anterior
    ? `Você já entregou a versão abaixo de "${titulo}". O CEO pediu este ajuste: ${ajuste}\n\nVersão anterior:\n${anterior}\n\nReescreva a entrega inteira com o ajuste.`
    : `O CEO pediu esta entrega: "${titulo}".\n${pedido}`;

  return `Você é ${agente.nome}, ${agente.cargo} no setor ${setor.nome} da ${estado.empresa.nome}. ${agente.perfil}

${descreverEmpresa(estado.empresa)}

${descreverDados(estado.dados)}

${descreverValidacao(estado.empresa.validacao)}

${descreverAnalise(estado.dados, estado.empresa.validacao)}

${descreverTarefasCeo(estado.tarefasCeo)}

${descreverPesquisas(estado.pesquisas)}

${descreverBacklog(estado.backlog, nomeDe)}

Ideias aprovadas pelo CEO:
${aprovadas || '(nenhuma ainda)'}

${descreverEntregas(estado.entregas, nomeDe)}

Conversa recente da equipe:
${conversa || '(sem conversa ainda)'}

${tarefa}

Como escrever:
- Em português do Brasil, pronto para o CEO copiar e usar hoje, sem introdução nem despedida.
- Organize com títulos curtos iniciados por "## " e listas com "- ". Use **negrito** só para destacar o essencial.
- Seja específico para buffets móveis e para a Orkestra.
- Não invente resultados como se fossem reais. Use os números reais, a análise e as pesquisas prontas acima quando existirem; o resto é meta ou estimativa, e diga isso.
- Você não tem acesso à internet. Nunca invente nomes de empresas, telefones, perfis ou preços de mercado. Se a entrega depende disso e não há pesquisa pronta, escreva o que dá para fazer agora e, no fim, uma seção "## Pesquisa necessária" dizendo exatamente o que pedir na aba Entregas em "Pesquisa na internet".`;
}

// Gera (ou refaz) uma entrega. `onText` recebe o texto inteiro até agora, para mostrar enquanto é escrito.
export async function gerarEntrega(sample, escritorio, { agenteId, titulo, pedido, anterior, ajuste, signal, onText }) {
  const { text, truncated } = await sample(montarPrompt({ escritorio, agenteId, titulo, pedido, anterior, ajuste }), {
    cache: false,
    signal,
    onText: ({ text }) => onText?.(text),
  });
  return { conteudo: text.trim(), cortada: truncated };
}

// Markdown simples (## títulos, - listas, **negrito**, tabelas e links) para nós do DOM, sem innerHTML.
export function renderizarMarkdown(texto) {
  const frag = document.createDocumentFragment();
  let lista = null;
  let tabela = null;
  const inline = (linha) => {
    const nos = [];
    for (const parte of linha.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)|]+)/g)) {
      if (!parte) continue;
      if (/^\*\*[^*]+\*\*$/.test(parte)) {
        const b = document.createElement('strong');
        b.textContent = parte.slice(2, -2);
        nos.push(b);
      } else if (/^https?:\/\//.test(parte)) {
        const a = document.createElement('a');
        a.href = parte;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = parte.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
        nos.push(a);
      } else nos.push(document.createTextNode(parte));
    }
    return nos;
  };
  const celulas = (linha) => linha.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

  for (const bruta of texto.split('\n')) {
    const linha = bruta.trimEnd();
    if (/^\s*\|/.test(linha)) {
      lista = null;
      if (/^[\s|:-]+$/.test(linha)) continue; // linha separadora |---|---|
      if (!tabela) {
        const caixa = document.createElement('div');
        caixa.className = 'tabela';
        tabela = document.createElement('table');
        const cab = tabela.createTHead().insertRow();
        for (const c of celulas(linha)) {
          const th = document.createElement('th');
          th.append(...inline(c));
          cab.append(th);
        }
        tabela.createTBody();
        caixa.append(tabela);
        frag.append(caixa);
      } else {
        const tr = tabela.tBodies[0].insertRow();
        for (const c of celulas(linha)) tr.insertCell().append(...inline(c));
      }
      continue;
    }
    tabela = null;
    const item = linha.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (item) {
      if (!lista) {
        lista = document.createElement(/^\s*\d/.test(linha) ? 'ol' : 'ul');
        frag.append(lista);
      }
      const li = document.createElement('li');
      li.append(...inline(item[1]));
      lista.append(li);
      continue;
    }
    lista = null;
    if (!linha.trim()) continue;
    const titulo = linha.match(/^#{1,4}\s+(.*)$/);
    const no = document.createElement(titulo ? 'h4' : 'p');
    no.append(...inline(titulo ? titulo[1] : linha));
    frag.append(no);
  }
  return frag;
}
