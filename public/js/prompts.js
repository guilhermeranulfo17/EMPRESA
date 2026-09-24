// Textos que descrevem a empresa, a equipe e a caixa de comunicação para o Claude.
// Usados pelo servidor (um agente por chamada) e pela página (uma rodada com vários agentes).

export function descreverEmpresa(empresa) {
  const linhas = [`Empresa: ${empresa.nome}`];
  if (empresa.descricao) linhas.push(`O que faz: ${empresa.descricao}`);
  if (empresa.publico) linhas.push(`Quem compra: ${empresa.publico}`);
  if (empresa.preco) linhas.push(`Preço: ${empresa.preco}`);
  if (empresa.contexto?.length) linhas.push('Contexto:', ...empresa.contexto.map((c) => `- ${c}`));
  if (empresa.objetivo_do_trimestre) linhas.push(`Objetivo do trimestre: ${empresa.objetivo_do_trimestre}`);
  return linhas.join('\n');
}

export function descreverEquipe(setores, agentes) {
  return `Setores:
${setores.map((s) => `- ${s.id}: ${s.nome}. ${s.missao}`).join('\n')}

Agentes (id: nome, cargo, setor. perfil):
${agentes.map((a) => `- ${a.id}: ${a.nome}, ${a.cargo}, ${a.setor}.${a.perfil ? ` ${a.perfil}` : ''}`).join('\n')}`;
}

export const ESCRITORIO = `Todos trabalham em um escritório de agentes de IA e se comunicam por uma caixa de comunicação compartilhada. O CEO (uma pessoa, id "ceo") lê tudo e aprova ou descarta as ideias. Os agentes têm autonomia para conversar entre setores, pedir dados, cobrar uns aos outros e propor ideias para a empresa bater a meta.

Tipos de ação:
- "mensagem": falar com um agente (id), um setor (id), "todos" ou "ceo".
- "ideia": propor uma ideia concreta para a empresa (título curto + descrição dizendo o que fazer, quais setores participam e como medir).
- "votar": apoiar ou questionar uma ideia em discussão, com um comentário do ponto de vista do próprio setor.`;

export const REGRAS = `Regras:
- Português do Brasil, direto, como numa conversa de trabalho: no máximo 3 frases por fala.
- O QUE VOCÊS CONSEGUEM FAZER: pensar, analisar os dados abaixo, fazer contas, decidir e escrever (mensagens, roteiros, planos). O QUE NÃO CONSEGUEM: acessar internet, WhatsApp, Instagram, Google Maps ou qualquer sistema. Nunca digam que vão buscar, mandar, postar, ligar ou verificar algo, nem que algo sai "em instantes" ou "ainda hoje". Quem executa é o CEO.
- Quando faltar informação de fora da empresa (lista de buffets, concorrentes, preços de mercado, tendências), façam um pedido de pesquisa (ação "pesquisa"): a equipe de pesquisa tem internet e devolve o resultado com fontes. Não perguntem ao CEO o que dá para pesquisar.
- Não inventem resultados como se fossem reais (vendas, taxas, clientes, conversas). Usem os números reais e as pesquisas prontas abaixo; o resto é meta ou estimativa, e digam isso.
- Cada fala precisa trazer algo novo e útil: uma conta, uma conclusão sobre os dados, uma decisão, um rascunho pronto ou uma pergunta objetiva que só o CEO sabe responder. Nada de "apoio", "boa ideia", "combinado" sem conteúdo.
- Quem recebeu mensagem responde primeiro. Mensagens do CEO têm prioridade. Não repitam o que já foi dito.
- Ninguém vota na própria ideia nem vota duas vezes na mesma. Ideia nova só quando for realmente diferente das que já estão no mural.`;

export function descreverCaixa({ mensagens, ideias, nomeDe }) {
  const linhas = mensagens.map((m) => {
    const extra = m.ideiaId ? ` [ideia ${m.ideiaId}]` : '';
    return `- ${nomeDe(m.de)} → ${nomeDe(m.para)} (${m.tipo})${extra}: ${m.texto}`;
  });
  const mural = ideias.map(
    (i) =>
      `- ${i.id} | "${i.titulo}" de ${nomeDe(i.autor)} | ${i.status} | apoios: ${i.apoios.map(nomeDe).join(', ')}` +
      (i.comentarios.length ? ` | comentários: ${i.comentarios.map((c) => `${nomeDe(c.agente)} (${c.voto})`).join(', ')}` : ''),
  );
  return `Caixa de comunicação (mais recentes por último):
${linhas.join('\n') || '(vazia: o dia está começando)'}

Mural de ideias:
${mural.join('\n') || '(nenhuma ideia ainda)'}`;
}

// Números que o CEO informou na aba Números. São os únicos dados reais que os agentes conhecem.
export const CAMPOS_DADOS = [
  { id: 'clientes', rotulo: 'Clientes ativos', tipo: 'numero' },
  { id: 'mrr', rotulo: 'MRR atual (R$)', tipo: 'numero' },
  { id: 'vendas_mes', rotulo: 'Vendas novas este mês', tipo: 'numero' },
  { id: 'mensagens_semana', rotulo: 'Mensagens frias enviadas (últimos 7 dias)', tipo: 'numero' },
  { id: 'respostas_semana', rotulo: 'Buffets que responderam (últimos 7 dias)', tipo: 'numero' },
  { id: 'apresentacoes_mes', rotulo: 'Apresentações feitas este mês', tipo: 'numero' },
  { id: 'notas', rotulo: 'O que está acontecendo', tipo: 'texto' },
];

export function descreverDados(dados) {
  if (!dados) return 'Números reais: o CEO ainda não informou nenhum número. Não suponha resultados; quando precisar de um dado, peça ao CEO.';
  const linhas = CAMPOS_DADOS.filter((c) => c.tipo === 'numero' && dados[c.id] !== '' && dados[c.id] != null).map((c) => `- ${c.rotulo}: ${dados[c.id]}`);
  const quando = dados.atualizadoEm ? new Date(dados.atualizadoEm).toLocaleDateString('pt-BR') : 'data não informada';
  let texto = `Números reais informados pelo CEO (atualizados em ${quando}):\n${linhas.join('\n') || '- (nenhum número preenchido)'}`;
  if (dados.notas?.trim()) texto += `\nObservações do CEO (conversas, objeções, o que funcionou):\n${dados.notas.trim().slice(0, 4000)}`;
  return texto;
}

export function descreverEntregas(entregas, nomeDe) {
  if (!entregas?.length) return 'Entregas prontas: nenhuma ainda.';
  return `Entregas prontas (materiais que a equipe já produziu):\n${entregas
    .slice(-10)
    .map((e) => `- "${e.titulo}" por ${nomeDe(e.autor)} (versão ${e.versao ?? 1}): ${e.conteudo.replace(/\s+/g, ' ').slice(0, 220)}…`)
    .join('\n')}`;
}

const ritmo = (diasPorVenda) => {
  if (diasPorVenda < 1) return 'mais de uma venda por dia';
  const dias = Math.round(diasPorVenda);
  return dias === 1 ? 'uma venda por dia' : `uma venda a cada ${dias} dias`;
};

// Análise calculada a partir dos números reais: não depende de IA, é conta.
export function analisarFunil(dados, meta = {}) {
  if (!dados) return [];
  const n = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));
  const pct = (a, b) => `${Math.round((a / b) * 100)}%`;
  const reais = (v) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
  const itens = [];
  const clientes = n(dados.clientes);
  const mrr = n(dados.mrr) ?? (clientes != null && meta.ticket ? clientes * meta.ticket : null);
  const vendas = n(dados.vendas_mes);
  const msgs = n(dados.mensagens_semana);
  const resp = n(dados.respostas_semana);
  const apres = n(dados.apresentacoes_mes);

  if (mrr != null && meta.mrr) {
    const falta = Math.max(0, meta.mrr - mrr);
    const clientesFaltando = meta.ticket ? Math.ceil(falta / meta.ticket) : null;
    itens.push({ rotulo: 'Meta de MRR', valor: `${pct(mrr, meta.mrr)} atingido`, nota: falta ? `Faltam ${reais(falta)}${clientesFaltando != null ? `, cerca de ${clientesFaltando} clientes a ${reais(meta.ticket)}` : ''}.` : 'Meta batida.' });
  }
  if (vendas != null && meta.vendas_mes) {
    const hoje = new Date();
    const fimDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    const diasRestantes = fimDoMes - hoje.getDate() + 1;
    const faltam = Math.max(0, meta.vendas_mes - vendas);
    itens.push({ rotulo: 'Vendas do mês', valor: `${vendas} de ${meta.vendas_mes}`, nota: faltam ? `Faltam ${faltam} em ${diasRestantes} dias: ${ritmo(diasRestantes / faltam)}.` : 'Meta do mês batida.' });
  }
  if (msgs && resp != null) {
    itens.push({ rotulo: 'Taxa de resposta (7 dias)', valor: pct(resp, msgs), nota: `${resp} respostas para ${msgs} mensagens frias.` });
  }
  if (apres && vendas != null) {
    itens.push({ rotulo: 'Apresentação → venda (mês)', valor: pct(vendas, apres), nota: `${vendas} ${vendas === 1 ? 'venda' : 'vendas'} em ${apres} ${apres === 1 ? 'apresentação' : 'apresentações'}.` });
  }
  if (msgs && resp && vendas && meta.vendas_mes) {
    // Estimativa grosseira: respostas por semana viram vendas na mesma proporção do mês.
    const respostasMes = resp * 4.3;
    const vendaPorResposta = vendas / respostasMes;
    const respostasNecessarias = Math.ceil(meta.vendas_mes / vendaPorResposta);
    const mensagensNecessarias = Math.ceil(respostasNecessarias / (resp / msgs));
    itens.push({ rotulo: 'Volume para 5 vendas/mês (estimativa)', valor: `~${Math.ceil(mensagensNecessarias / 4.3)} mensagens/semana`, nota: `Mantendo as taxas atuais: cerca de ${respostasNecessarias} respostas no mês. É estimativa, melhora com mais semanas de dados.` });
  }
  return itens;
}

export function descreverAnalise(dados, meta) {
  const itens = analisarFunil(dados, meta);
  if (!itens.length) return '';
  return `Análise calculada a partir dos números reais:\n${itens.map((i) => `- ${i.rotulo}: ${i.valor}. ${i.nota}`).join('\n')}`;
}

// Pesquisas feitas na internet pela equipe de pesquisa: informação real, com fontes.
export function descreverPesquisas(pesquisas) {
  const prontas = (pesquisas ?? []).filter((p) => p.status === 'pronta').slice(-3);
  const fila = (pesquisas ?? []).filter((p) => p.status === 'na fila' || p.status === 'pesquisando');
  let texto = prontas.length
    ? `Pesquisas prontas (feitas na internet, com fontes; são informação real):\n${prontas.map((p) => `### ${p.titulo}\n${p.resultado.slice(0, 3500)}`).join('\n\n')}`
    : 'Pesquisas prontas: nenhuma ainda.';
  if (fila.length) texto += `\nPesquisas na fila (ainda sem resultado, não usem como fato): ${fila.map((p) => `"${p.titulo}"`).join(', ')}.`;
  return texto;
}
