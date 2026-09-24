// Rodada com IA de verdade dentro da página publicada no Claude (capacidade "sample").
// Uma chamada decide as próximas ações de vários agentes; cada ação entra no escritório assim que chega.

import { descreverEmpresa, descreverEquipe, descreverCaixa, descreverDados, descreverAnalise, descreverEntregas, descreverPesquisas, descreverBacklog, ESCRITORIO, REGRAS } from './prompts.js';

export async function rodadaComIA(sample, escritorio, { signal, quantidade = 4, aoChegar }) {
  const prompt = montarPrompt(escritorio, quantidade);
  let resto = '';
  let recebidas = 0;
  let fila = Promise.resolve();
  const consumir = (linha) => {
    const acao = lerAcao(linha);
    if (!acao) return;
    recebidas++;
    fila = fila.then(() => aoChegar(acao));
  };

  try {
    const { text } = await sample(prompt, {
      cache: false,
      signal,
      onText: ({ delta }) => {
        const linhas = (resto + delta).split('\n');
        resto = linhas.pop();
        linhas.forEach(consumir);
      },
    });
    consumir(resto);
    // Se o Claude respondeu com uma lista JSON em vez de uma ação por linha, aproveita assim mesmo.
    if (!recebidas) {
      let lista = [];
      try {
        lista = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
      } catch {
        throw { code: 'sem_acoes', message: 'A resposta não trouxe ações no formato combinado.' };
      }
      for (const acao of lista) fila = fila.then(() => aoChegar(acao));
      recebidas = lista.length;
    }
  } finally {
    await fila;
  }
  return recebidas;
}

function lerAcao(linha) {
  const texto = linha.trim().replace(/,$/, '');
  if (!texto.startsWith('{')) return null;
  try {
    const acao = JSON.parse(texto);
    return typeof acao?.agente === 'string' && typeof acao?.texto === 'string' ? acao : null;
  } catch {
    return null;
  }
}

function montarPrompt(escritorio, quantidade) {
  const { estado } = escritorio;
  const nomeDe = (id) => escritorio.nomeDe(id);
  const agentes = Object.values(estado.agentes);
  const pendentes = escritorio
    .pendenciasAbertas()
    .sort((a, b) => (b.mensagem.de === 'ceo') - (a.mensagem.de === 'ceo'))
    .slice(0, 8)
    .map(({ agente, mensagem }) => `- [${mensagem.id}] ${nomeDe(mensagem.de)} → ${nomeDe(agente)} (${mensagem.tipo}): ${mensagem.texto}`);

  return `Você coordena a equipe de agentes de IA da empresa abaixo. Cada agente tem cargo e perfil próprios. Escreva as próximas ${quantidade} ações da equipe, uma depois da outra. O CEO vai ler tudo e agir: cada ação precisa ajudar de verdade a bater a meta, com análise dos dados reais, decisões, pedidos de pesquisa quando faltar informação, ou materiais prontos para usar.

${descreverEmpresa(estado.empresa)}

${descreverDados(estado.dados)}

${descreverAnalise(estado.dados, estado.empresa.meta)}

${descreverPesquisas(estado.pesquisas)}

${descreverBacklog(estado.backlog, nomeDe)}

${ESCRITORIO}
- "tarefa": colocar uma tarefa no backlog do produto (funcionalidade, bug, melhoria, infraestrutura, segurança ou lançamento). Título em "tarefa_titulo", tipo em "tarefa_tipo", prioridade em "prioridade" (alta, média ou baixa) e, em "texto", o que fazer e o critério de pronto. Só para o que ainda não está no backlog.
- "pesquisa": pedir à equipe de pesquisa (que tem internet) uma informação de fora da empresa. Título curto em "pesquisa_titulo" e, em "texto", exatamente o que pesquisar e para quê (ex.: "20 buffets móveis em Uberlândia com WhatsApp público, para a prospecção da Bianca"). Só peça o que ainda não está nas pesquisas prontas ou na fila.
- "entrega": produzir um material pronto para o CEO usar de verdade (ex.: mensagens de WhatsApp, roteiro, checklist, plano). Título em "entrega_titulo" e o material completo em "texto", com quebras de linha (\\n) e listas com "- ". Use no máximo uma entrega por rodada, só quando a conversa pedir, e sem repetir uma entrega que já existe.

${descreverEquipe(estado.setores, agentes)}

${REGRAS}
- Use agentes variados, de pelo menos 3 setores diferentes. Enquanto o sistema não estiver lançado, a TI deve aparecer em quase toda rodada. Cada ação é de um agente só.
- As ações podem reagir às anteriores desta mesma rodada.
- Quando há pesquisas prontas, usem os dados delas (nomes, contatos, preços) nas análises e nos materiais, citando de qual pesquisa veio.

${descreverEntregas(estado.entregas, nomeDe)}

${descreverCaixa({ mensagens: estado.mensagens.slice(-25), ideias: estado.ideias.filter((i) => i.status !== 'descartada').slice(-10), nomeDe })}

Esperando resposta (responda estas primeiro, as do CEO antes de todas):
${pendentes.join('\n') || '(ninguém esperando resposta)'}

Formato da resposta: exatamente ${quantidade} linhas, cada linha um objeto JSON completo, sem nenhum outro texto e sem cercas de código. Campos:
{"agente":"id do agente","status":"o que ele está fazendo na mesa agora, até 8 palavras","acao":"mensagem | ideia | votar | entrega | pesquisa | tarefa","para":"id de agente, id de setor, todos ou ceo","texto":"a fala, a descrição da ideia ou o comentário do voto","ideia_titulo":"título curto se acao = ideia, senão vazio","entrega_titulo":"título se acao = entrega, senão vazio","pesquisa_titulo":"título se acao = pesquisa, senão vazio","tarefa_titulo":"título se acao = tarefa, senão vazio","tarefa_tipo":"tipo se acao = tarefa, senão vazio","prioridade":"alta | média | baixa se acao = tarefa, senão vazio","ideia_id":"id da ideia se acao = votar, senão vazio","voto":"apoiar | questionar | nenhum","responde_a":"id [msg_...] da mensagem respondida, senão vazio"}`;
}
