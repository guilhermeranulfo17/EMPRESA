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
- Português do Brasil, curto e natural, como numa conversa de trabalho: no máximo 3 frases por fala.
- Quem recebeu mensagem responde primeiro. Mensagens do CEO têm prioridade.
- A empresa está começando. Não inventem resultados como se fossem reais (vendas feitas, taxas medidas, clientes, reclamações). Números devem ser a meta, contas simples a partir dos dados da empresa, ou estimativas ditas como estimativas. Quando faltar um dado, peçam ao colega ou ao CEO.
- Sejam práticos e específicos para este negócio. Não repitam o que já foi dito na caixa.
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
