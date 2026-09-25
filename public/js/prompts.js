// Textos que descrevem a empresa, a equipe e a caixa de comunicação para o Claude.
// Usados pelo servidor (um agente por chamada) e pela página (uma rodada com vários agentes).

export function descreverEmpresa(empresa) {
  const linhas = [`Empresa: ${empresa.nome}`];
  if (empresa.descricao) linhas.push(`O que faz: ${empresa.descricao}`);
  if (empresa.publico) linhas.push(`Quem compra: ${empresa.publico}`);
  if (empresa.preco) linhas.push(`Preço: ${empresa.preco}`);
  if (empresa.instagram) linhas.push(`Instagram da empresa: ${empresa.instagram}`);
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
- VOCÊS SÃO ASSESSORES DO CEO E NÃO EXECUTAM NADA NO MUNDO: não mandam mensagem, não ligam, não postam, não programam, não configuram o sistema e não atualizam planilhas. É proibido escrever que algo foi feito, está sendo feito ou será feito por vocês (ex.: "mandei", "já mandamos", "vou mandar", "começo hoje", "estou corrigindo", "atualizo lá", "te passo em instantes"). Quando algo precisa ser executado, criem uma tarefa para o CEO (ação "para_ceo") dizendo exatamente o que fazer, ou preparem o material pronto (ação "entrega").
- Prazos e estimativas de trabalho são sugestões para o CEO decidir, nunca promessas de vocês.
- O status das tarefas (do CEO e do backlog do produto) é o real, marcado pelo CEO. Não digam que algo foi feito se lá não está feito.
- Quando faltar informação de fora da empresa (buffets, concorrentes, preços, ferramentas), façam um pedido de pesquisa (ação "pesquisa"): a equipe de pesquisa tem internet e devolve com fontes.
- Não inventem resultados (conversas, buffets interessados, orçamentos, pagamentos). Usem os números reais, a planilha e as pesquisas prontas; o resto é meta ou estimativa, e digam isso.
- Respeitem a regra da empresa: nenhuma funcionalidade nova antes de 3 buffets pagando, a não ser que um cliente real peça e isso bloqueie o uso dele.
- Cada fala precisa trazer algo novo e útil: uma conta, uma conclusão sobre os dados, uma decisão, um rascunho pronto ou uma pergunta objetiva que só o CEO sabe responder. Nada de "apoio", "boa ideia", "combinado" sem conteúdo.
- Quem recebeu mensagem responde primeiro. Mensagens do CEO têm prioridade. Não repitam o que já foi dito.
- Ninguém vota na própria ideia nem vota duas vezes na mesma. Ideia nova só quando for realmente diferente das que já estão no mural.`;

// Frases em que um agente diz que executou algo. A página marca essas falas, porque agentes não executam.
export const PADRAO_EXECUCAO = /\b(j[aá] )?(mandei|enviei|mandamos|enviamos|postei|publiquei|liguei|atualizei|cadastrei|configurei|corrigi|subi|mando)\b|\b(vou|vamos|irei) (mandar|enviar|postar|publicar|ligar|atualizar|cadastrar|configurar|programar|corrigir|subir|montar)\b|\bcome[cç]o (hoje|agora|amanh[aã])\b|\bem instantes\b|\batualizo l[aá]\b|\bte (mando|passo|envio)\b|\bestou (corrigindo|programando|mandando|enviando|montando)\b/i;

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

// Números de validação. Vêm da planilha do funil (Google Drive) ou, se ela não foi lida, do que o CEO digitou.
export const CAMPOS_DADOS = [
  { id: 'abordados', rotulo: 'Buffets abordados', tipo: 'numero' },
  { id: 'aceitaram', rotulo: 'Aceitaram colocar o link (teste de 14 dias)', tipo: 'numero' },
  { id: 'com5', rotulo: 'Buffets com 5 ou mais orçamentos reais em 14 dias', tipo: 'numero' },
  { id: 'pagando', rotulo: 'Buffets pagando (Pix ou cartão)', tipo: 'numero' },
  { id: 'notas', rotulo: 'O que está acontecendo', tipo: 'texto' },
];

const numero = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));

// Os números que valem: a planilha, quando lida, tem prioridade sobre o que foi digitado.
export function numerosValidacao(dados) {
  const planilha = dados?.funil?.validacao;
  const pega = (campo) => (planilha && planilha[campo] != null ? planilha[campo] : numero(dados?.[campo]));
  return { abordados: pega('abordados'), aceitaram: pega('aceitaram'), com5: pega('com5'), pagando: pega('pagando'), fonte: planilha ? 'planilha' : 'digitado' };
}

export function descreverDados(dados) {
  if (!dados) return 'Números reais: nenhum ainda. Não suponham resultados; quando precisarem de um dado, peçam ao CEO.';
  const v = numerosValidacao(dados);
  const linhas = [['Buffets abordados', v.abordados], ['Aceitaram colocar o link', v.aceitaram], ['Com 5+ orçamentos reais em 14 dias', v.com5], ['Pagando', v.pagando]]
    .filter(([, n]) => n != null)
    .map(([r, n]) => `- ${r}: ${n}`);
  let texto = `Números reais de validação (fonte: ${v.fonte === 'planilha' ? 'planilha do funil' : 'digitados pelo CEO'}):\n${linhas.join('\n') || '- (nenhum número ainda)'}`;
  const f = dados.funil;
  if (f?.total) {
    texto += `\nPlanilha do funil (lida em ${new Date(f.lidoEm).toLocaleString('pt-BR')}${f.completa === false ? ', leitura parcial' : ''}): ${f.total} buffets na lista. Por status: ${Object.entries(f.porStatus).map(([k, n]) => `${k}: ${n}`).join(', ')}.`;
    if (f.fila?.length) texto += `\nBuffets em aberto na planilha (buffet · cidade · prioridade · status · próximo passo), na ordem da planilha:\n${f.fila.map((b) => `- ${b}`).join('\n')}`;
    if (f.objecoes?.length) texto += `\nObjeções registradas na planilha: ${f.objecoes.map((o) => `"${o}"`).join('; ')}.`;
    if (f.precificacao?.length) texto += `\nComo os buffets dizem que precificam hoje: ${f.precificacao.map((o) => `"${o}"`).join('; ')}.`;
  }
  if (dados.notas?.trim()) texto += `\nObservações do CEO:\n${dados.notas.trim().slice(0, 4000)}`;
  return texto;
}

export function descreverEntregas(entregas, nomeDe) {
  if (!entregas?.length) return 'Entregas prontas: nenhuma ainda.';
  return `Entregas prontas (materiais que a equipe já produziu):\n${entregas
    .slice(-10)
    .map((e) => `- "${e.titulo}" por ${nomeDe(e.autor)} (versão ${e.versao ?? 1}): ${e.conteudo.replace(/\s+/g, ' ').slice(0, 220)}…`)
    .join('\n')}`;
}

const diasAte = (data) => Math.ceil((new Date(`${data}T23:59:59-03:00`) - Date.now()) / 86400000);
const dataBR = (data) => new Date(`${data}T12:00:00-03:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const pct = (a, b) => `${Math.round((a / b) * 100)}%`;

// Análise calculada, sem IA: onde a validação está contra as metas mínimas do plano de 21 dias.
export function analisarValidacao(dados, validacao) {
  if (!validacao?.metas) return [];
  const v = numerosValidacao(dados);
  const { metas, prazo, marcos = [] } = validacao;
  const itens = [];
  const dias = diasAte(prazo);
  const proximo = marcos.find((m) => diasAte(m.ate) >= 0);
  itens.push({
    rotulo: 'Prazo da validação',
    valor: dias >= 0 ? `${dias} ${dias === 1 ? 'dia' : 'dias'}` : 'encerrado',
    nota: proximo ? `Próximo marco até ${dataBR(proximo.ate)}: ${proximo.entrega}.` : `Prazo final: ${dataBR(prazo)}.`,
  });
  const metricas = [
    ['abordados', 'Buffets abordados'],
    ['aceitaram', 'Aceitaram o link'],
    ['com5', 'Com 5+ orçamentos em 14 dias'],
    ['pagando', 'Buffets pagando'],
  ];
  for (const [campo, rotulo] of metricas) {
    const atual = v[campo];
    const meta = metas[campo];
    if (!meta) continue;
    itens.push({
      rotulo,
      valor: atual == null ? `? de ${meta}` : `${atual} de ${meta}`,
      nota: atual == null ? 'Sem dado ainda: atualize pela planilha.' : atual >= meta ? 'Meta mínima batida.' : `Faltam ${meta - atual}.`,
    });
  }
  if (v.abordados && v.aceitaram != null) {
    itens.push({ rotulo: 'Aceite da oferta', valor: pct(v.aceitaram, v.abordados), nota: `${v.aceitaram} de ${v.abordados} abordados. A meta mínima pede ${pct(metas.aceitaram, metas.abordados)}.` });
  }
  if (v.aceitaram && v.pagando != null) {
    itens.push({ rotulo: 'Teste → pagamento', valor: pct(v.pagando, v.aceitaram), nota: `${v.pagando} de ${v.aceitaram} que testaram. A meta mínima pede ${pct(metas.pagando, metas.aceitaram)}.` });
  }
  if (dias < 0 && (v.pagando ?? 0) < metas.pagando) {
    itens.push({ rotulo: 'Regra do plano', valor: 'rever a tese', nota: 'Prazo encerrado sem a meta de buffets pagando: voltar a conversar com donos de buffet antes de escrever mais código.' });
  }
  return itens;
}

export function descreverAnalise(dados, validacao) {
  const itens = analisarValidacao(dados, validacao);
  if (!itens.length) return '';
  return `Análise da validação (calculada, não é IA):\n${itens.map((i) => `- ${i.rotulo}: ${i.valor}. ${i.nota}`).join('\n')}`;
}

export function descreverValidacao(validacao) {
  if (!validacao?.metas) return '';
  const m = validacao.metas;
  return `Plano de validação (até ${dataBR(validacao.prazo)}): metas mínimas de ${m.abordados} buffets abordados, ${m.aceitaram} aceitando colocar o link, ${m.com5} com 5 ou mais orçamentos reais em 14 dias e ${m.pagando} pagando.
Marcos:
${(validacao.marcos ?? []).map((x) => `- até ${dataBR(x.ate)}: ${x.entrega} (${x.areas})`).join('\n')}`;
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

// Tarefas do CEO: o que precisa ser executado por uma pessoa. O CEO marca como feitas.
export function descreverTarefasCeo(tarefas) {
  if (!tarefas?.length) return 'Tarefas do CEO: nenhuma.';
  const pendentes = tarefas.filter((t) => !t.feita);
  const feitas = tarefas.filter((t) => t.feita).slice(-8);
  const linha = (t) => `- ${t.texto}${t.prazo ? ` (até ${dataBR(t.prazo)})` : ''}`;
  return `Tarefas do CEO (marcadas por ele):
Pendentes:
${pendentes.map(linha).join('\n') || '- (nenhuma)'}
Feitas:
${feitas.map(linha).join('\n') || '- (nenhuma)'}`;
}

// Backlog do produto (status real, mantido pelo CEO na aba Produto).
export function descreverBacklog(backlog, nomeDe) {
  if (!backlog?.length) return 'Backlog do produto: vazio.';
  const grupo = (status) => backlog.filter((t) => t.status === status);
  const linha = (t) => `- ${t.titulo} [${t.tipo}, prioridade ${t.prioridade}${t.responsavel ? `, ${nomeDe(t.responsavel)}` : ''}${t.mvp ? ', antes do teste real' : ''}]`;
  const bloqueiam = backlog.filter((t) => t.mvp);
  return `Backlog do produto (status real informado pelo CEO; itens que precisam estar prontos antes do primeiro teste com buffet real: ${bloqueiam.filter((t) => t.status === 'feito').length} de ${bloqueiam.length}):
Fazendo:
${grupo('fazendo').map(linha).join('\n') || '- (nada)'}
A fazer:
${grupo('a fazer').map(linha).join('\n') || '- (nada)'}
Congelado até a validação:
${grupo('congelado').map(linha).join('\n') || '- (nada)'}
Feito:
${grupo('feito').map(linha).join('\n') || '- (nada)'}`;
}
