// Motor do escritório: guarda o estado, escolhe quem fala e aplica as ações dos agentes.
// Roda igual no navegador (modo demonstração) e no Node (server.js).

import { PADRAO_EXECUCAO } from './prompts.js';

const LIMITE_MENSAGENS = 400;
const PROFUNDIDADE_MAXIMA = 3; // quantas respostas em cadeia uma conversa pode gerar sozinha
const APOIOS_PARA_CEO = 4;

let sequencia = 0;
const novoId = (prefixo) => `${prefixo}_${Date.now().toString(36)}${(sequencia++).toString(36)}`;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];

export class Escritorio {
  constructor(config, cerebro, opcoes = {}) {
    this.cerebro = cerebro;
    this.ouvintes = new Set();
    this.intervaloBase = opcoes.intervaloBase ?? 3500;
    this.pendencias = [];
    this.timer = null;
    this.rodando = false;

    this.estado = {
      empresa: config.empresa,
      setores: config.setores.map(({ agentes, ...setor }) => ({ ...setor, agentes: agentes.map((a) => a.id) })),
      agentes: {},
      mensagens: [],
      ideias: [],
      entregas: [],
      pesquisas: [],
      backlog: [],
      tarefasCeo: [],
      dados: null,
      pausado: false,
      velocidade: 1,
      modo: cerebro.nome,
    };
    for (const setor of config.setores) {
      for (const agente of setor.agentes) {
        this.estado.agentes[agente.id] = {
          ...agente,
          setor: setor.id,
          status: 'trabalhando',
          atividade: 'Organizando a mesa',
          balao: null,
          ultimaAcao: 0,
        };
      }
    }
  }

  // ---------- eventos ----------
  ouvir(fn) {
    this.ouvintes.add(fn);
    return () => this.ouvintes.delete(fn);
  }

  emitir(tipo, dados, extra) {
    for (const fn of this.ouvintes) fn(tipo, dados, extra);
  }

  foto() {
    return structuredClone(this.estado);
  }

  // Recupera o que foi salvo (servidor: data/estado.json; página no Claude: armazenamento do artefato).
  restaurar(salvo) {
    if (!salvo) return;
    this.estado.mensagens = (salvo.mensagens ?? []).slice(-LIMITE_MENSAGENS);
    this.estado.ideias = salvo.ideias ?? [];
    const ids = new Set(this.estado.mensagens.map((m) => m.id));
    this.pendencias = (salvo.pendencias ?? []).filter((p) => this.estado.agentes[p.agente] && ids.has(p.mensagemId));
    for (const [id, a] of Object.entries(salvo.agentes ?? {})) {
      if (this.estado.agentes[id]) this.estado.agentes[id].atividade = a.atividade ?? this.estado.agentes[id].atividade;
    }
  }

  // O que precisa ser guardado para continuar de onde parou.
  exportar() {
    const { mensagens, ideias, agentes } = this.estado;
    return {
      mensagens,
      ideias,
      pendencias: this.pendencias,
      agentes: Object.fromEntries(Object.values(agentes).map((a) => [a.id, { atividade: a.atividade }])),
    };
  }

  // ---------- ciclo ----------
  iniciar() {
    if (this.rodando) return;
    this.rodando = true;
    this.agendar(800);
  }

  parar() {
    this.rodando = false;
    clearTimeout(this.timer);
  }

  agendar(ms = this.intervaloBase / this.estado.velocidade) {
    clearTimeout(this.timer);
    if (!this.rodando) return;
    this.timer = setTimeout(async () => {
      if (!this.estado.pausado) {
        try {
          await this.passo();
        } catch (erro) {
          this.emitir('aviso', { texto: `Falha em um passo do escritório: ${erro.message}` });
        }
      }
      this.agendar();
    }, ms);
  }

  definirControle({ pausado, velocidade }) {
    if (typeof pausado === 'boolean') this.estado.pausado = pausado;
    if ([0.5, 1, 2, 4].includes(velocidade)) this.estado.velocidade = velocidade;
    this.emitir('controle', { pausado: this.estado.pausado, velocidade: this.estado.velocidade });
    if (!this.estado.pausado) this.agendar(300);
  }

  async passo() {
    const { agenteId, pendencia } = this.escolherAgente();
    const agente = this.estado.agentes[agenteId];
    const vel = this.estado.velocidade;

    this.atualizarAgente(agenteId, { status: 'pensando', balao: null });
    const inicio = Date.now();
    let acao = null;
    try {
      acao = await this.cerebro.decidir(this.montarContexto(agente, pendencia));
    } catch (erro) {
      this.emitir('aviso', { texto: `${agente.nome} não conseguiu pensar agora: ${erro.message}` });
    }
    await esperar(Math.max(0, 1100 / vel - (Date.now() - inicio)));

    if (pendencia) this.pendencias = this.pendencias.filter((p) => p !== pendencia);
    if (!acao) {
      this.atualizarAgente(agenteId, { status: 'trabalhando' });
      return;
    }
    this.aplicar(agente, acao, pendencia);
  }

  escolherAgente() {
    const ceo = this.pendencias.find((p) => p.prioridade);
    if (ceo) return { agenteId: ceo.agente, pendencia: ceo };
    if (this.pendencias.length && Math.random() < 0.75) {
      return { agenteId: this.pendencias[0].agente, pendencia: this.pendencias[0] };
    }
    const menosAtivos = Object.values(this.estado.agentes)
      .sort((a, b) => a.ultimaAcao - b.ultimaAcao)
      .slice(0, 4);
    const agenteId = sortear(menosAtivos).id;
    const pendencia = this.pendencias.find((p) => p.agente === agenteId) ?? null;
    return { agenteId, pendencia };
  }

  montarContexto(agente, pendencia) {
    const { estado } = this;
    const setor = estado.setores.find((s) => s.id === agente.setor);
    return {
      empresa: estado.empresa,
      agente: { id: agente.id, nome: agente.nome, cargo: agente.cargo, perfil: agente.perfil, atividade: agente.atividade },
      setor: { id: setor.id, nome: setor.nome, missao: setor.missao },
      setores: estado.setores.map(({ id, nome, missao }) => ({ id, nome, missao })),
      colegas: Object.values(estado.agentes)
        .filter((a) => a.id !== agente.id)
        .map(({ id, nome, cargo, setor, perfil }) => ({ id, nome, cargo, setor, perfil })),
      mensagensRecentes: estado.mensagens.slice(-20),
      ideias: estado.ideias.filter((i) => i.status !== 'descartada').slice(-10),
      pendencia: pendencia ? estado.mensagens.find((m) => m.id === pendencia.mensagemId) ?? null : null,
      nomeDe: (id) => this.nomeDe(id),
    };
  }

  // ---------- rodadas com IA decididas fora do ciclo automático ----------
  // Mensagens que alguém mandou para um agente e ainda esperam resposta.
  pendenciasAbertas() {
    return this.pendencias
      .map((p) => ({ agente: p.agente, mensagem: this.estado.mensagens.find((m) => m.id === p.mensagemId) }))
      .filter((p) => p.mensagem);
  }

  // Aplica uma ação que veio pronta (ex.: rodada do Claude na página), com a mesma animação do ciclo normal.
  async executarAcao(acao) {
    const agente = this.estado.agentes[acao?.agente];
    if (!agente) return false;
    const pendencia =
      this.pendencias.find((p) => p.agente === agente.id && p.mensagemId === acao.responde_a) ??
      this.pendencias.find((p) => p.agente === agente.id) ??
      null;
    this.atualizarAgente(agente.id, { status: 'pensando', balao: null });
    await esperar(900 / this.estado.velocidade);
    if (pendencia) this.pendencias = this.pendencias.filter((p) => p !== pendencia);
    this.aplicar(agente, acao, pendencia);
    await esperar(1800 / this.estado.velocidade);
    return true;
  }

  // Zera conversas e ideias (os agentes continuam nas mesas).
  limpar() {
    this.estado.mensagens = [];
    this.estado.ideias = [];
    this.pendencias = [];
    for (const agente of Object.values(this.estado.agentes)) Object.assign(agente, { status: 'trabalhando', balao: null, ultimaAcao: 0 });
    this.emitir('foto', this.foto());
  }

  // ---------- entregas e números reais ----------
  // Um material pronto para usar (mensagens de WhatsApp, roteiro, plano...). Avisa o CEO na caixa.
  registrarEntrega(entrega, { avisar = true } = {}) {
    const i = this.estado.entregas.findIndex((e) => e.id === entrega.id);
    if (i >= 0) this.estado.entregas[i] = entrega;
    else this.estado.entregas.push(entrega);
    this.emitir('entrega', entrega);
    if (avisar) {
      const texto = entrega.versao > 1 ? `Refiz "${entrega.titulo}" (versão ${entrega.versao}). Está na aba Entregas.` : `Entreguei "${entrega.titulo}". Está na aba Entregas, pronto para usar.`;
      this.registrar({ de: entrega.autor, para: 'ceo', tipo: 'entrega', entregaId: entrega.id, texto, profundidade: PROFUNDIDADE_MAXIMA });
    }
    return entrega;
  }

  carregarEntregas(entregas) {
    this.estado.entregas = [...entregas].sort((a, b) => a.ts - b.ts);
  }

  // Pesquisa na internet: o pedido fica na fila e a equipe de pesquisa (Claude Code com busca) devolve o resultado.
  // `remoto`: veio do armazenamento (a equipe de pesquisa gravou), então não precisa salvar de novo.
  registrarPesquisa(pesquisa, { remoto = false } = {}) {
    const i = this.estado.pesquisas.findIndex((p) => p.id === pesquisa.id);
    if (i >= 0) this.estado.pesquisas[i] = pesquisa;
    else this.estado.pesquisas.push(pesquisa);
    this.emitir('pesquisa', pesquisa, { remoto });
    this.anunciarPesquisasProntas();
    return pesquisa;
  }

  // Cada pesquisa pronta é anunciada na caixa uma vez só.
  anunciarPesquisasProntas() {
    for (const pesquisa of this.estado.pesquisas) {
      if (pesquisa.status !== 'pronta') continue;
      if (this.estado.mensagens.some((m) => m.tipo === 'pesquisa_pronta' && m.pesquisaId === pesquisa.id)) continue;
      const autor = this.estado.agentes[pesquisa.responsavel] ? pesquisa.responsavel : Object.keys(this.estado.agentes)[0];
      this.registrar({ de: autor, para: 'todos', tipo: 'pesquisa_pronta', pesquisaId: pesquisa.id, texto: `Pesquisa pronta, com fontes reais: "${pesquisa.titulo}". Está na aba Entregas.`, profundidade: PROFUNDIDADE_MAXIMA });
    }
  }

  carregarPesquisas(pesquisas) {
    this.estado.pesquisas = [...pesquisas].sort((a, b) => a.criadoEm - b.criadoEm);
  }

  // ---------- tarefas do CEO (o que uma pessoa precisa executar) ----------
  definirTarefasCeo(itens, { remoto = false } = {}) {
    this.estado.tarefasCeo = itens;
    this.emitir('tarefasCeo', itens, { remoto });
  }

  salvarTarefaCeo(tarefa) {
    const lista = [...this.estado.tarefasCeo];
    const i = lista.findIndex((t) => t.id === tarefa.id);
    if (i >= 0) lista[i] = tarefa;
    else lista.push(tarefa);
    this.definirTarefasCeo(lista);
    return tarefa;
  }

  removerTarefaCeo(id) {
    this.definirTarefasCeo(this.estado.tarefasCeo.filter((t) => t.id !== id));
  }

  // ---------- backlog do produto ----------
  definirBacklog(itens, { remoto = false } = {}) {
    this.estado.backlog = itens;
    this.emitir('backlog', itens, { remoto });
  }

  salvarTarefa(tarefa) {
    const lista = [...this.estado.backlog];
    const i = lista.findIndex((t) => t.id === tarefa.id);
    if (i >= 0) lista[i] = tarefa;
    else lista.push(tarefa);
    this.definirBacklog(lista);
    return tarefa;
  }

  removerTarefa(id) {
    this.definirBacklog(this.estado.backlog.filter((t) => t.id !== id));
  }

  definirDados(dados) {
    this.estado.dados = dados;
    this.emitir('dados', dados);
  }

  // ---------- aplicar ações ----------
  aplicar(agente, acao, pendencia) {
    acao = { ...acao, texto: String(acao.texto ?? '').trim().slice(0, acao.acao === 'entrega' ? 6000 : 1200) };
    if (!acao.texto) {
      this.atualizarAgente(agente.id, { status: 'trabalhando' });
      return;
    }
    const profundidade = (pendencia?.profundidade ?? 0) + 1;
    let para = this.destinoValido(acao.para, agente.id);
    if (!para) para = pendencia ? this.estado.mensagens.find((m) => m.id === pendencia.mensagemId)?.de ?? 'todos' : 'todos';

    const ideia = this.estado.ideias.find((i) => i.id === acao.ideia_id);
    let mensagem;

    if (acao.acao === 'ideia' && acao.ideia_titulo?.trim()) {
      const nova = {
        id: novoId('ideia'),
        autor: agente.id,
        titulo: acao.ideia_titulo.trim().slice(0, 90),
        descricao: acao.texto,
        apoios: [agente.id],
        comentarios: [],
        status: 'em discussão',
        ts: Date.now(),
      };
      this.estado.ideias.push(nova);
      this.emitir('ideia', nova);
      mensagem = this.registrar({ de: agente.id, para: 'todos', tipo: 'ideia', texto: nova.descricao, ideiaId: nova.id, profundidade });
      // Chama dois colegas de outros setores para opinar.
      const outros = Object.values(this.estado.agentes).filter((a) => a.setor !== agente.setor);
      for (let i = 0; i < 2 && outros.length; i++) {
        const [escolhido] = outros.splice(Math.floor(Math.random() * outros.length), 1);
        this.pendencias.push({ agente: escolhido.id, mensagemId: mensagem.id, profundidade });
      }
    } else if (acao.acao === 'entrega' && acao.entrega_titulo?.trim()) {
      const entrega = this.registrarEntrega(
        { id: novoId('entrega'), autor: agente.id, titulo: acao.entrega_titulo.trim().slice(0, 90), conteudo: acao.texto, origem: 'rodada', versao: 1, ts: Date.now() },
        { avisar: false },
      );
      mensagem = this.registrar({ de: agente.id, para: 'ceo', tipo: 'entrega', entregaId: entrega.id, texto: `Preparei "${entrega.titulo}". Está na aba Entregas.`, profundidade });
    } else if (acao.acao === 'pesquisa' && acao.pesquisa_titulo?.trim()) {
      const pesquisa = {
        id: novoId('pesquisa'), titulo: acao.pesquisa_titulo.trim().slice(0, 90), pedido: acao.texto,
        pedidoPor: agente.id, responsavel: agente.id, status: 'na fila', criadoEm: Date.now(),
      };
      this.registrarPesquisa(pesquisa);
      mensagem = this.registrar({ de: agente.id, para: 'ceo', tipo: 'pedido_pesquisa', pesquisaId: pesquisa.id, texto: `Pedi uma pesquisa na internet: "${pesquisa.titulo}". ${acao.texto}`, profundidade });
    } else if (acao.acao === 'para_ceo') {
      const prazo = /^\d{4}-\d{2}-\d{2}$/.test(acao.prazo ?? '') ? acao.prazo : null;
      const tarefa = this.salvarTarefaCeo({
        id: novoId('ceo'), texto: acao.texto.slice(0, 400), prazo, autor: agente.id, origem: agente.nome, feita: false, criadoEm: Date.now(),
      });
      mensagem = this.registrar({ de: agente.id, para: 'ceo', tipo: 'para_ceo', tarefaCeoId: tarefa.id, texto: `Tarefa para você${prazo ? ` (até ${prazo.split('-').reverse().slice(0, 2).join('/')})` : ''}: ${tarefa.texto}`, profundidade });
    } else if (acao.acao === 'tarefa' && acao.tarefa_titulo?.trim()) {
      const ehTI = agente.setor === 'ti';
      const tarefa = this.salvarTarefa({
        id: novoId('tarefa'), titulo: acao.tarefa_titulo.trim().slice(0, 90), descricao: acao.texto,
        tipo: acao.tarefa_tipo || 'funcionalidade', prioridade: ['alta', 'média', 'baixa'].includes(acao.prioridade) ? acao.prioridade : 'média',
        responsavel: ehTI ? agente.id : null, status: 'a fazer', mvp: false, origem: `sugerida por ${agente.nome}`, sugeridaPor: agente.id, criadoEm: Date.now(),
      });
      mensagem = this.registrar({ de: agente.id, para: 'ceo', tipo: 'tarefa', tarefaId: tarefa.id, texto: `Coloquei no backlog: "${tarefa.titulo}" (prioridade ${tarefa.prioridade}). ${acao.texto}`, profundidade });
    } else if (acao.acao === 'votar' && ideia && ideia.status === 'em discussão' && !ideia.apoios.includes(agente.id)) {
      const voto = acao.voto === 'questionar' ? 'questionar' : 'apoiar';
      if (voto === 'apoiar') ideia.apoios.push(agente.id);
      ideia.comentarios.push({ agente: agente.id, voto, texto: acao.texto, ts: Date.now() });
      const setoresApoiando = new Set(ideia.apoios.map((id) => this.estado.agentes[id]?.setor));
      if (ideia.apoios.length >= APOIOS_PARA_CEO && setoresApoiando.size >= 2) ideia.status = 'aguardando CEO';
      this.emitir('ideia', ideia);
      mensagem = this.registrar({ de: agente.id, para: ideia.autor, tipo: 'voto', voto, texto: acao.texto, ideiaId: ideia.id, profundidade });
      if (voto === 'questionar' && profundidade < PROFUNDIDADE_MAXIMA) {
        this.pendencias.push({ agente: ideia.autor, mensagemId: mensagem.id, profundidade });
      }
    } else {
      mensagem = this.registrar({ de: agente.id, para, tipo: 'mensagem', texto: acao.texto, profundidade });
      if (profundidade < PROFUNDIDADE_MAXIMA) this.chamarDestinatario(mensagem, agente, profundidade);
    }

    this.atualizarAgente(agente.id, {
      status: 'falando',
      balao: mensagem.texto,
      atividade: acao.status?.trim() || agente.atividade,
      ultimaAcao: Date.now(),
    });
    const id = agente.id;
    setTimeout(() => {
      if (this.estado.agentes[id].balao === mensagem.texto) this.atualizarAgente(id, { status: 'trabalhando', balao: null });
    }, 6000 / this.estado.velocidade);
  }

  chamarDestinatario(mensagem, autor, profundidade) {
    const { para } = mensagem;
    let alvo = null;
    if (this.estado.agentes[para]) alvo = para;
    else {
      const setor = this.estado.setores.find((s) => s.id === para);
      if (setor) alvo = sortear(setor.agentes.filter((id) => id !== autor.id));
      else if (para === 'todos' && Math.random() < 0.6) {
        alvo = sortear(Object.values(this.estado.agentes).filter((a) => a.setor !== autor.setor)).id;
      }
    }
    if (alvo && !this.pendencias.some((p) => p.agente === alvo && p.mensagemId === mensagem.id)) {
      this.pendencias.push({ agente: alvo, mensagemId: mensagem.id, profundidade });
    }
  }

  destinoValido(para, proprioId) {
    if (!para || para === proprioId) return null;
    if (para === 'todos' || para === 'ceo') return para;
    if (this.estado.agentes[para] || this.estado.setores.some((s) => s.id === para)) return para;
    // aceita nomes ("Rafael", "Marketing") além de ids
    const chave = String(para).toLowerCase();
    const agente = Object.values(this.estado.agentes).find((a) => a.nome.toLowerCase() === chave);
    if (agente && agente.id !== proprioId) return agente.id;
    return this.estado.setores.find((s) => s.nome.toLowerCase() === chave)?.id ?? null;
  }

  registrar(dados) {
    const mensagem = { id: novoId('msg'), ts: Date.now(), ...dados };
    // Agentes não executam nada: uma fala dizendo que executou vem marcada para o CEO não se enganar.
    if (this.estado.agentes[mensagem.de] && ['mensagem', 'voto', 'ideia'].includes(mensagem.tipo) && PADRAO_EXECUCAO.test(mensagem.texto)) mensagem.alerta = true;
    this.estado.mensagens.push(mensagem);
    if (this.estado.mensagens.length > LIMITE_MENSAGENS) this.estado.mensagens.shift();
    this.emitir('mensagem', mensagem);
    return mensagem;
  }

  atualizarAgente(id, mudancas) {
    Object.assign(this.estado.agentes[id], mudancas);
    const { status, atividade, balao, ultimaAcao } = this.estado.agentes[id];
    this.emitir('agente', { id, status, atividade, balao, ultimaAcao });
  }

  nomeDe(id) {
    if (id === 'todos') return 'Todos';
    if (id === 'ceo') return 'CEO';
    return this.estado.agentes[id]?.nome ?? this.estado.setores.find((s) => s.id === id)?.nome ?? id;
  }

  // ---------- ações do CEO (você) ----------
  postarDoCEO({ texto, para = 'todos' }) {
    texto = String(texto ?? '').trim().slice(0, 1000);
    if (!texto) return null;
    const destino = this.destinoValido(para, null) ?? 'todos';
    const mensagem = this.registrar({ de: 'ceo', para: destino, tipo: 'ceo', texto, profundidade: 0 });

    let alvos;
    if (this.estado.agentes[destino]) alvos = [destino];
    else if (destino === 'todos') alvos = this.estado.setores.map((s) => s.agentes[0]);
    else alvos = [this.estado.setores.find((s) => s.id === destino)?.agentes[0]].filter(Boolean);
    for (const agente of alvos) this.pendencias.unshift({ agente, mensagemId: mensagem.id, profundidade: 0, prioridade: true });
    this.agendar(400);
    return mensagem;
  }

  decidirIdeia(ideiaId, decisao) {
    const ideia = this.estado.ideias.find((i) => i.id === ideiaId);
    if (!ideia || !['aprovada', 'descartada'].includes(decisao)) return null;
    ideia.status = decisao;
    this.emitir('ideia', ideia);
    const texto =
      decisao === 'aprovada'
        ? `Ideia aprovada: "${ideia.titulo}". ${this.nomeDe(ideia.autor)}, pode puxar a execução com os setores envolvidos.`
        : `Ideia "${ideia.titulo}" descartada por agora. Obrigado pela proposta, ${this.nomeDe(ideia.autor)}.`;
    const mensagem = this.registrar({ de: 'ceo', para: 'todos', tipo: 'decisao', decisao, texto, ideiaId, profundidade: 0 });
    if (decisao === 'aprovada') {
      this.pendencias.unshift({ agente: ideia.autor, mensagemId: mensagem.id, profundidade: 1, prioridade: true });
      this.agendar(400);
    }
    return ideia;
  }
}
