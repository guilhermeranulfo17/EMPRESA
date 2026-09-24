// Interface do escritório. Conecta no servidor (npm start) ou, sem servidor, roda uma demonstração no navegador.

const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, ...filhos) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'style') n.style.cssText = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat()) if (f != null && f !== false) n.append(f instanceof Node ? f : document.createTextNode(f));
  return n;
};

let estado = null;
let conexao = null;
let filtro = { tipo: 'todos', valor: null };
const MAX_FEED = 150;

// ---------- conexão ----------
async function conectar() {
  try {
    const resposta = await fetch('api/estado', { cache: 'no-store' });
    if (resposta.ok && resposta.headers.get('content-type')?.includes('json')) return conectarServidor();
  } catch {
    // sem servidor: cai para a demonstração
  }
  return conectarLocal();
}

function conectarServidor() {
  const fonte = new EventSource('api/stream');
  for (const tipo of ['foto', 'agente', 'mensagem', 'ideia', 'controle', 'aviso']) {
    fonte.addEventListener(tipo, (e) => receber(tipo, JSON.parse(e.data)));
  }
  const enviar = (rota, corpo) =>
    fetch(`api/${rota}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  return {
    postar: (dados) => enviar('mensagem', dados),
    decidir: (id, decisao) => enviar('ideia', { id, decisao }),
    controle: (dados) => enviar('controle', dados),
  };
}

async function usar(nome) {
  try {
    return (await window.claude?.use?.(nome)) ?? null;
  } catch {
    return null;
  }
}

// Sem servidor: o escritório roda aqui na página. Com o Claude disponível, os agentes usam IA de verdade
// e tudo fica salvo no armazenamento do artefato; sem ele, roda a simulação com frases prontas.
async function conectarLocal() {
  const [{ Escritorio }, { CerebroSimulado }, { abrirMemoria }, config] = await Promise.all([
    import('./engine.js'),
    import('./cerebro-simulado.js'),
    import('./memoria.js'),
    fetch('config/empresa.json').then((r) => r.json()),
  ]);
  const escritorio = new Escritorio(config, new CerebroSimulado(), { intervaloBase: 3500 });
  ia.escritorio = escritorio;
  escritorio.ouvir(receber);
  receber('foto', escritorio.foto());
  mostrarAbertura('Abrindo o escritório…', 'Conectando os agentes e carregando o que já foi feito.');

  const [sample, memoria] = await Promise.all([
    usar('sample'),
    abrirMemoria({ aoErro: () => avisarMemoria('Não consegui salvar a última mudança. Se continuar, recarregue a página.') }),
  ]);

  if (sample) {
    ia.sample = sample;
    ia.ativa = true;
    if (memoria) {
      try {
        const salvo = await memoria.carregar();
        escritorio.restaurar(salvo.estado);
        escritorio.carregarEntregas(salvo.entregas);
        escritorio.estado.dados = salvo.dados;
        receber('foto', escritorio.foto());
      } catch {
        avisarMemoria('Não consegui carregar o histórico salvo. O que acontecer agora será salvo normalmente.');
      }
      ia.memoria = memoria;
      escritorio.ouvir((tipo, dados) => {
        if (['mensagem', 'ideia', 'foto'].includes(tipo)) memoria.salvarEstado(() => escritorio.exportar());
        if (tipo === 'entrega') memoria.salvarEntrega(dados);
        if (tipo === 'dados') memoria.salvarDados(dados);
      });
    } else {
      avisarMemoria('O histórico não está sendo salvo nesta visualização: ao recarregar, a conversa recomeça.');
    }
    desenharIA();
  } else {
    // Sem Claude: simulação, deixada clara na tela e nunca salva.
    $('#aviso-demo').hidden = false;
    $('#painel-ia').hidden = true;
    escritorio.estado.velocidade = 200;
    for (let i = 0; i < 7; i++) await escritorio.passo();
    escritorio.estado.velocidade = 1;
    for (const a of Object.values(escritorio.estado.agentes)) Object.assign(a, { status: 'trabalhando', balao: null });
    receber('foto', escritorio.foto());
    escritorio.iniciar();
    desenharIA();
  }

  return {
    recursos: true,
    postar: (dados) => {
      escritorio.postarDoCEO(dados);
      if (ia.ativa) rodarIA();
    },
    decidir: (id, decisao) => {
      escritorio.decidirIdeia(id, decisao);
      if (ia.ativa && decisao === 'aprovada') rodarIA();
    },
    controle: (dados) => escritorio.definirControle(dados),
    salvarDados: (dados) => escritorio.definirDados(dados),
    apagarConversa: () => escritorio.limpar(),
  };
}

// ---------- IA de verdade na página (Claude da conta de quem está vendo) ----------
const ia = { sample: null, escritorio: null, memoria: null, ativa: false, rodando: false, outra: false, ctl: null };

function mostrarAbertura(titulo, detalhe) {
  $('#painel-ia').hidden = false;
  $('#painel-ia').dataset.estado = 'abrindo';
  $('#ia-titulo').textContent = titulo;
  $('#ia-detalhe').textContent = detalhe;
  $('#btn-ia').hidden = true;
  $('#btn-parar-ia').hidden = true;
}

function avisarMemoria(texto) {
  const aviso = $('#aviso-memoria');
  aviso.textContent = texto;
  aviso.hidden = false;
}

function desenharIA(detalhe) {
  const modo = $('#modo');
  modo.dataset.modo = ia.ativa ? 'claude' : 'simulação';
  modo.textContent = ia.ativa ? 'Agentes com IA (Claude)' : 'Agentes simulados';
  $('#btn-pausa').hidden = ia.ativa;
  $('.velocidades').hidden = false;
  desenharPedidoEntrega();
  if (!ia.ativa) return;
  $('#painel-ia').hidden = false;
  $('#painel-ia').dataset.estado = ia.rodando ? 'rodando' : 'ativa';
  $('#btn-ia').hidden = ia.rodando;
  $('#btn-parar-ia').hidden = !ia.rodando;
  $('#btn-ia').textContent = 'Rodada da equipe';
  if (ia.rodando) {
    $('#ia-titulo').textContent = 'A equipe está pensando…';
    $('#ia-detalhe').textContent = 'O Claude está decidindo as próximas ações. Cada fala aparece no escritório assim que fica pronta.';
  } else {
    $('#ia-titulo').textContent = 'Agentes com IA ligados';
    $('#ia-detalhe').textContent =
      detalhe ??
      (ia.memoria ? 'Tudo fica salvo. ' : '') + 'Mande uma mensagem como CEO, peça uma entrega ou clique em Rodada da equipe para os agentes conversarem.';
  }
}

async function rodarIA() {
  if (ia.rodando) {
    ia.outra = true;
    return;
  }
  const { rodadaComIA } = await import('./rodada-ia.js');
  ia.rodando = true;
  ia.ctl = new AbortController();
  desenharIA();
  let detalhe;
  try {
    await rodadaComIA(ia.sample, ia.escritorio, {
      signal: ia.ctl.signal,
      aoChegar: (acao) => ia.escritorio.executarAcao(acao),
    });
  } catch (e) {
    detalhe = mensagemDeErro(e, 'rodada');
    ia.outra = false;
  } finally {
    ia.rodando = false;
  }
  desenharIA(detalhe);
  if (ia.outra && ia.ativa) {
    ia.outra = false;
    rodarIA();
  }
}

function mensagemDeErro(e, oQue) {
  const codigo = e?.code ?? 'upstream_error';
  if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(codigo)) {
    return 'O Claude não foi liberado para esta página. Recarregue a página e permita o uso quando ele pedir.';
  }
  return (
    {
      cancelled: oQue === 'rodada' ? 'Rodada interrompida. Peça a próxima quando quiser.' : 'Entrega interrompida.',
      rate_limited: 'O limite de uso do seu plano do Claude foi atingido. Tente de novo mais tarde.',
      session_expired: 'Sua sessão no Claude expirou. Entre de novo e tente outra vez.',
      refused: 'O Claude recusou este pedido. Tente escrever de outro jeito.',
    }[codigo] ?? (oQue === 'rodada' ? 'A rodada falhou no meio do caminho. Clique em Rodada da equipe para tentar de novo.' : 'A entrega falhou no meio do caminho. Tente pedir de novo.')
  );
}

$('#btn-ia').addEventListener('click', rodarIA);
$('#btn-parar-ia').addEventListener('click', () => ia.ctl?.abort());

// ---------- entregas ----------
const entregaAtual = { ctl: null, rodando: false };

async function pedirEntrega({ modeloId, agenteId, obs, refazer }) {
  if (!ia.sample || entregaAtual.rodando) return;
  const { MODELOS, gerarEntrega } = await import('./entregas.js');
  const escritorio = ia.escritorio;
  const modelo = MODELOS.find((m) => m.id === modeloId) ?? MODELOS.at(-1);
  const titulo = refazer?.titulo ?? (modelo.id === 'outra' ? `Pedido do CEO: ${obs.slice(0, 60)}` : modelo.titulo);
  const pedido = refazer?.pedido ?? [modelo.pedido, obs && `Detalhes do CEO: ${obs}`].filter(Boolean).join('\n');

  entregaAtual.rodando = true;
  entregaAtual.ctl = new AbortController();
  escritorio.registrar({
    de: 'ceo', para: agenteId, tipo: 'pedido', profundidade: 3,
    texto: refazer ? `Ajuste em "${titulo}": ${obs}` : `Pedi uma entrega: ${titulo}.${obs && modelo.id !== 'outra' ? ` ${obs}` : ''}`,
  });
  escritorio.atualizarAgente(agenteId, { status: 'pensando', atividade: `Escrevendo: ${titulo}`.slice(0, 60) });
  const rascunho = mostrarRascunho(titulo, agenteId);
  desenharPedidoEntrega('Escrevendo… o texto aparece abaixo enquanto é escrito.');
  try {
    const { conteudo, cortada } = await gerarEntrega(ia.sample, escritorio, {
      agenteId, titulo, pedido,
      anterior: refazer?.conteudo, ajuste: refazer ? obs : undefined,
      signal: entregaAtual.ctl.signal,
      onText: (texto) => rascunho.atualizar(texto),
    });
    const agora = Date.now();
    escritorio.registrarEntrega({
      id: refazer?.id ?? `entrega_${agora.toString(36)}`,
      autor: agenteId, titulo, pedido, conteudo, cortada,
      versao: (refazer?.versao ?? 0) + 1,
      origem: 'pedido',
      ts: refazer?.ts ?? agora,
      atualizadoEm: agora,
    });
    desenharPedidoEntrega(cortada ? 'Pronto, mas o texto ficou longo e foi cortado no fim. Peça um ajuste para completar.' : 'Pronto! A entrega está salva abaixo.');
  } catch (e) {
    desenharPedidoEntrega(mensagemDeErro(e, 'entrega'));
  } finally {
    rascunho.remover();
    entregaAtual.rodando = false;
    escritorio.atualizarAgente(agenteId, { status: 'trabalhando', atividade: `Acompanhando: ${titulo}`.slice(0, 60) });
    desenharPedidoEntrega();
  }
}

function receber(tipo, dados) {
  if (tipo === 'foto') {
    estado = dados;
    montarTudo();
    return;
  }
  if (!estado) return;
  if (tipo === 'agente') {
    Object.assign(estado.agentes[dados.id], dados);
    desenharAgente(dados.id);
  } else if (tipo === 'mensagem') {
    estado.mensagens.push(dados);
    if (estado.mensagens.length > 400) estado.mensagens.shift();
    adicionarAoFeed(dados, true);
    animarEnvio(dados);
    atualizarNumeros();
  } else if (tipo === 'ideia') {
    const i = estado.ideias.findIndex((x) => x.id === dados.id);
    if (i >= 0) estado.ideias[i] = dados;
    else estado.ideias.push(dados);
    desenharIdeias();
    atualizarNumeros();
  } else if (tipo === 'entrega') {
    const i = estado.entregas.findIndex((x) => x.id === dados.id);
    if (i >= 0) estado.entregas[i] = dados;
    else estado.entregas.push(dados);
    desenharEntregas();
    atualizarNumeros();
  } else if (tipo === 'dados') {
    estado.dados = dados;
    atualizarNumeros();
  } else if (tipo === 'controle') {
    Object.assign(estado, dados);
    desenharControles();
  } else if (tipo === 'aviso') {
    console.warn(dados.texto);
  }
}

// ---------- ajudantes ----------
const setorDe = (id) => estado.setores.find((s) => s.id === id);
const corDe = (id) => (id === 'ceo' ? 'var(--ceo)' : setorDe(estado.agentes[id]?.setor ?? id)?.cor ?? 'var(--tinta-3)');
const nomeDe = (id) => {
  if (id === 'todos') return 'Todos';
  if (id === 'ceo') return 'Você (CEO)';
  return estado.agentes[id]?.nome ?? setorDe(id)?.nome ?? id;
};
const hora = (ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const iniciais = (nome) => nome.slice(0, 1).toUpperCase();

// ---------- montagem ----------
function montarTudo() {
  $('#nome-empresa').textContent = estado.empresa.nome;
  $('#objetivo').textContent = estado.empresa.objetivo_do_trimestre;
  estado.entregas ??= [];
  if (ia.escritorio) desenharIA();
  else {
    const modo = $('#modo');
    modo.dataset.modo = estado.modo;
    modo.textContent = estado.modo === 'claude' ? 'Agentes Claude ao vivo' : 'Agentes simulados';
  }
  montarPlanta();
  montarFiltros();
  montarDestinos();
  desenharFeed();
  desenharIdeias();
  montarPedidoEntrega();
  desenharEntregas();
  montarDados();
  desenharControles();
  atualizarNumeros();
}

function montarPlanta() {
  const planta = $('#planta');
  planta.replaceChildren();
  estado.setores.forEach((setor, indice) => {
    if (indice === 2) planta.append(corredor());
    const agentes = setor.agentes.map((id) => estado.agentes[id]);
    planta.append(
      el('div', { class: 'sala', style: `--cor:${setor.cor}`, 'data-setor': setor.id },
        el('div', { class: 'sala-cab' },
          el('h2', {}, setor.nome),
          el('span', { class: 'qtd' }, `${agentes.length} agente${agentes.length === 1 ? '' : 's'}`),
        ),
        el('p', { class: 'sala-missao' }, setor.missao),
        el('div', { class: 'mesas' }, agentes.map(mesaDoAgente)),
      ),
    );
  });
  if (estado.setores.length <= 2) planta.append(corredor());
  for (const id of Object.keys(estado.agentes)) desenharAgente(id);
}

function corredor() {
  return el('div', { class: 'corredor' },
    el('div', { class: 'ceo', id: 'posto-ceo' }, el('span', { class: 'avatar' }, 'CEO'), 'Você'),
    el('button', { class: 'hub', id: 'hub', type: 'button', onclick: () => trocarAba('caixa') },
      el('span', { class: 'hub-icone' }, iconeEnvelope()),
      el('b', {}, 'Caixa de comunicação'),
      el('span', { id: 'hub-total' }, '0'),
    ),
  );
}

function iconeEnvelope() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.innerHTML = '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>';
  return svg;
}

function mesaDoAgente(agente) {
  return el('button', {
    class: 'agente', type: 'button', id: `ag-${agente.id}`, 'data-status': agente.status,
    'aria-pressed': 'false', title: `${agente.nome} — ${agente.perfil}`,
    onclick: () => alternarFiltro('agente', agente.id),
  },
    el('div', { class: 'balao', hidden: true }),
    el('div', { class: 'mesa' }, el('span', { class: 'monitor' })),
    el('span', { class: 'avatar' }, iniciais(agente.nome)),
    el('span', { class: 'nome' }, agente.nome),
    el('span', { class: 'cargo' }, agente.cargo),
    el('span', { class: 'atividade' }, agente.atividade),
  );
}

function desenharAgente(id) {
  const agente = estado.agentes[id];
  const no = document.getElementById(`ag-${id}`);
  if (!no) return;
  no.dataset.status = agente.status;
  no.querySelector('.atividade').textContent = agente.atividade;
  const balao = no.querySelector('.balao');
  if (agente.status === 'pensando') {
    balao.className = 'balao digitando';
    balao.replaceChildren(el('i'), el('i'), el('i'));
    balao.hidden = false;
  } else if (agente.status === 'falando' && agente.balao) {
    balao.className = 'balao';
    balao.replaceChildren(el('span', {}, agente.balao));
    balao.hidden = false;
  } else {
    balao.hidden = true;
  }
}

// ---------- animação das mensagens ----------
function centroDe(no, planta) {
  const a = no.getBoundingClientRect();
  const p = planta.getBoundingClientRect();
  return { x: a.left - p.left + a.width / 2 + planta.scrollLeft, y: a.top - p.top + a.height / 2 + planta.scrollTop };
}

function pontoDe(id) {
  if (id === 'ceo') return $('#posto-ceo');
  if (estado.agentes[id]) return document.querySelector(`#ag-${id} .avatar`);
  if (setorDe(id)) return document.querySelector(`.sala[data-setor="${id}"] h2`);
  return null;
}

function animarEnvio(msg) {
  const planta = $('#planta');
  const hub = $('#hub');
  if (!hub) return;
  hub.classList.remove('pulso');
  void hub.offsetWidth;
  hub.classList.add('pulso');
  $('#hub-total').textContent = estado.mensagens.length;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const origem = pontoDe(msg.de);
  if (!origem) return;
  const destinos = msg.para === 'todos'
    ? estado.setores.map((s) => pontoDe(s.id))
    : [pontoDe(msg.para === 'ceo' ? 'ceo' : msg.para)];
  const a = centroDe(origem, planta);
  const h = centroDe(hub, planta);
  const duracao = 1500 / (estado.velocidade || 1);
  for (const destino of destinos.filter(Boolean)) {
    const b = centroDe(destino, planta);
    const env = el('div', { class: 'envelope', style: `--cor:${corDe(msg.de)};left:0;top:0` });
    planta.append(env);
    env.animate(
      [
        { transform: `translate(${a.x}px, ${a.y}px) scale(0.6)`, opacity: 0 },
        { transform: `translate(${a.x}px, ${a.y - 20}px) scale(1)`, opacity: 1, offset: 0.1 },
        { transform: `translate(${h.x}px, ${h.y}px) scale(1.1)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${b.x}px, ${b.y}px) scale(0.8)`, opacity: 1, offset: 0.92 },
        { transform: `translate(${b.x}px, ${b.y}px) scale(0.4)`, opacity: 0 },
      ],
      { duration: duracao, easing: 'ease-in-out' },
    ).onfinish = () => env.remove();
  }
}

// ---------- caixa de comunicação ----------
function montarFiltros() {
  const box = $('#filtros');
  box.replaceChildren(
    el('button', { class: 'chip', type: 'button', 'data-filtro': 'todos', onclick: () => definirFiltro('todos', null) }, 'Tudo'),
    ...estado.setores.map((s) =>
      el('button', { class: 'chip', type: 'button', 'data-filtro': `setor:${s.id}`, onclick: () => alternarFiltro('setor', s.id) },
        el('span', { class: 'ponto', style: `--cor:${s.cor}` }), s.nome),
    ),
    el('button', { class: 'chip', type: 'button', 'data-filtro': 'ceo', onclick: () => alternarFiltro('ceo', null) }, 'Com o CEO'),
  );
  box.append(el('span', { id: 'filtro-agente' }));
}

function alternarFiltro(tipo, valor) {
  if (filtro.tipo === tipo && filtro.valor === valor) definirFiltro('todos', null);
  else definirFiltro(tipo, valor);
}

function definirFiltro(tipo, valor) {
  filtro = { tipo, valor };
  const chave = tipo === 'setor' ? `setor:${valor}` : tipo;
  for (const c of document.querySelectorAll('#filtros .chip[data-filtro]')) c.setAttribute('aria-pressed', String(c.dataset.filtro === chave));
  for (const a of document.querySelectorAll('.agente')) a.setAttribute('aria-pressed', String(tipo === 'agente' && a.id === `ag-${valor}`));
  const extra = $('#filtro-agente');
  extra.replaceChildren();
  if (tipo === 'agente') {
    extra.append(el('button', { class: 'chip', type: 'button', 'aria-pressed': 'true', onclick: () => definirFiltro('todos', null) },
      el('span', { class: 'ponto', style: `--cor:${corDe(valor)}` }), `${nomeDe(valor)} ×`));
  }
  trocarAba('caixa');
  desenharFeed();
}

function passaNoFiltro(msg) {
  const { tipo, valor } = filtro;
  if (tipo === 'todos') return true;
  if (tipo === 'ceo') return msg.de === 'ceo' || msg.para === 'ceo';
  if (tipo === 'agente') return msg.de === valor || msg.para === valor;
  if (tipo === 'setor') {
    const setorDoId = (id) => estado.agentes[id]?.setor ?? id;
    return setorDoId(msg.de) === valor || setorDoId(msg.para) === valor || msg.para === 'todos';
  }
  return true;
}

function desenharFeed() {
  const feed = $('#feed');
  const lista = estado.mensagens.filter(passaNoFiltro).slice(-MAX_FEED);
  feed.replaceChildren(...lista.map(itemDoFeed));
  if (!lista.length) {
    feed.append(el('p', { class: 'vazio' }, ia.ativa
      ? 'O escritório está pronto. Mande uma mensagem como CEO, peça uma entrega ou clique em Rodada da equipe para os agentes começarem.'
      : 'Nenhuma mensagem aqui ainda.'));
  }
  feed.scrollTop = feed.scrollHeight;
}

function adicionarAoFeed(msg) {
  if (!passaNoFiltro(msg)) return;
  const feed = $('#feed');
  feed.querySelector('.vazio')?.remove();
  const colado = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 80;
  feed.append(itemDoFeed(msg));
  while (feed.children.length > MAX_FEED) feed.firstChild.remove();
  if (colado) feed.scrollTop = feed.scrollHeight;
}

function itemDoFeed(msg) {
  const ideia = msg.ideiaId ? estado.ideias.find((i) => i.id === msg.ideiaId) : null;
  let etiqueta = null;
  let ref = null;
  if (msg.tipo === 'ideia') {
    etiqueta = el('span', { class: 'etiqueta ideia' }, 'Nova ideia');
    ref = ideia && el('div', { class: 'ref' }, el('b', {}, ideia.titulo));
  } else if (msg.tipo === 'voto') {
    etiqueta = el('span', { class: `etiqueta ${msg.voto}` }, msg.voto === 'apoiar' ? 'Apoiou' : 'Questionou');
    ref = ideia && el('div', { class: 'ref' }, 'sobre ', el('b', {}, ideia.titulo));
  } else if (msg.tipo === 'decisao') {
    etiqueta = el('span', { class: `etiqueta ${msg.decisao}` }, msg.decisao === 'aprovada' ? 'Aprovou' : 'Descartou');
  } else if (msg.tipo === 'entrega') {
    etiqueta = el('span', { class: 'etiqueta aprovada' }, 'Entrega');
    ref = el('button', { class: 'link', type: 'button', onclick: () => abrirEntrega(msg.entregaId) }, 'Abrir a entrega');
  } else if (msg.tipo === 'pedido') {
    etiqueta = el('span', { class: 'etiqueta discussao' }, 'Pedido');
  }
  return el('article', { class: 'msg', 'data-tipo': msg.tipo },
    el('div', { class: 'msg-cab' },
      el('span', { class: 'ponto', style: `--cor:${corDe(msg.de)}` }),
      el('b', {}, nomeDe(msg.de)),
      el('span', { class: 'seta' }, '→'),
      el('span', { class: 'para' }, nomeDe(msg.para)),
      etiqueta,
      el('time', { datetime: new Date(msg.ts).toISOString() }, hora(msg.ts)),
    ),
    msg.tipo === 'entrega' ? null : ref,
    el('p', {}, msg.texto),
    msg.tipo === 'entrega' ? el('div', { class: 'ref' }, ref) : null,
  );
}

function montarDestinos() {
  const select = $('#para');
  select.replaceChildren(
    el('option', { value: 'todos' }, 'Todos os setores'),
    el('optgroup', { label: 'Setores' }, estado.setores.map((s) => el('option', { value: s.id }, s.nome))),
    el('optgroup', { label: 'Agentes' },
      Object.values(estado.agentes).map((a) => el('option', { value: a.id }, `${a.nome} · ${a.cargo}`))),
  );
}

$('#compositor').addEventListener('submit', async (e) => {
  e.preventDefault();
  const campo = $('#texto');
  const texto = campo.value.trim();
  if (!texto || !conexao) return;
  campo.value = '';
  await conexao.postar({ texto, para: $('#para').value });
});
$('#texto').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    $('#compositor').requestSubmit();
  }
});

// ---------- mural de ideias ----------
const ORDEM = { 'aguardando CEO': 0, 'em discussão': 1, aprovada: 2, descartada: 3 };

function desenharIdeias() {
  const box = $('#ideias');
  const ideias = [...estado.ideias].sort((a, b) => ORDEM[a.status] - ORDEM[b.status] || b.ts - a.ts);
  box.replaceChildren(...ideias.map(cartaoDeIdeia));
  if (!ideias.length) box.append(el('p', { class: 'vazio' }, 'Nenhuma ideia ainda. Quando um agente propuser algo, aparece aqui.'));
  const pendentes = estado.ideias.filter((i) => i.status === 'aguardando CEO').length;
  const badge = $('#badge-ideias');
  badge.hidden = !pendentes;
  badge.textContent = pendentes;
}

function cartaoDeIdeia(ideia) {
  const classeStatus = { 'aguardando CEO': 'ideia', 'em discussão': 'discussao', aprovada: 'aprovada', descartada: 'descartada' }[ideia.status];
  const aberta = ideia.status === 'em discussão' || ideia.status === 'aguardando CEO';
  const autor = estado.agentes[ideia.autor];
  return el('article', { class: 'ideia', 'data-status': ideia.status },
    el('div', {}, el('span', { class: `etiqueta ${classeStatus}` }, ideia.status === 'aguardando CEO' ? 'Aguardando você' : ideia.status)),
    el('h3', {}, ideia.titulo),
    el('div', { class: 'autor' }, el('span', { class: 'ponto', style: `--cor:${corDe(ideia.autor)}` }),
      `${autor?.nome ?? ideia.autor} · ${setorDe(autor?.setor)?.nome ?? ''}`),
    el('p', {}, ideia.descricao),
    el('div', { class: 'apoios' },
      ideia.apoios.map((id) => el('span', { class: 'mini', style: `--cor:${corDe(id)}`, title: nomeDe(id) }, iniciais(nomeDe(id)))),
      ` ${ideia.apoios.length} apoio${ideia.apoios.length === 1 ? '' : 's'}`),
    ideia.comentarios.length
      ? el('ul', { class: 'comentarios' }, ideia.comentarios.slice(-3).map((c) =>
          el('li', {}, el('span', { class: `etiqueta ${c.voto}` }, c.voto === 'apoiar' ? 'Apoia' : 'Questiona'),
            el('div', {}, el('b', {}, `${nomeDe(c.agente)}: `), el('span', {}, c.texto)))))
      : null,
    aberta
      ? el('div', { class: 'acoes-ideia' },
          el('button', { class: 'btn btn-descartar', type: 'button', onclick: () => conexao.decidir(ideia.id, 'descartada') }, 'Descartar'),
          el('button', { class: 'btn btn-aprovar', type: 'button', onclick: () => conexao.decidir(ideia.id, 'aprovada') }, 'Aprovar'))
      : null,
  );
}

// ---------- abas, controles e números ----------
function trocarAba(aba) {
  for (const b of document.querySelectorAll('.abas button')) {
    b.setAttribute('aria-selected', String(b.dataset.aba === aba));
    $(`#vista-${b.dataset.aba}`).hidden = b.dataset.aba !== aba;
  }
}
for (const b of document.querySelectorAll('.abas button')) b.addEventListener('click', () => trocarAba(b.dataset.aba));

function desenharControles() {
  $('#btn-pausa').textContent = estado.pausado ? 'Retomar' : 'Pausar';
  for (const b of document.querySelectorAll('.velocidades button')) b.setAttribute('aria-pressed', String(Number(b.dataset.vel) === estado.velocidade));
}
$('#btn-pausa').addEventListener('click', () => conexao?.controle({ pausado: !estado.pausado }));
for (const b of document.querySelectorAll('.velocidades button')) {
  b.addEventListener('click', () => conexao?.controle({ velocidade: Number(b.dataset.vel) }));
}

const reais = (n) => `R$ ${Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
const temNumero = (v) => v !== '' && v != null && !Number.isNaN(Number(v));

function atualizarNumeros() {
  const meta = estado.empresa.meta ?? {};
  const dados = estado.dados ?? {};
  const mrr = temNumero(dados.mrr) ? Number(dados.mrr) : temNumero(dados.clientes) && meta.ticket ? Number(dados.clientes) * meta.ticket : null;
  $('#n-mrr').textContent = mrr == null ? '—' : reais(mrr);
  $('#meta-mrr').textContent = meta.mrr ? `de ${reais(meta.mrr)} de MRR` : 'MRR';
  $('#barra-mrr').style.width = mrr == null || !meta.mrr ? '0%' : `${Math.min(100, (mrr / meta.mrr) * 100)}%`;
  $('#n-vendas').textContent = temNumero(dados.vendas_mes) ? dados.vendas_mes : '—';
  $('#meta-vendas').textContent = meta.vendas_mes ? `de ${meta.vendas_mes} vendas no mês` : 'vendas no mês';
  $('#n-entregas').textContent = estado.entregas?.length ?? 0;
  $('#n-aprovadas').textContent = estado.ideias.filter((i) => i.status === 'aprovada').length;
    const total = $('#hub-total');
  if (total) total.textContent = estado.mensagens.length;
}

// ---------- entregas (aba) ----------
let statusEntrega = '';

async function montarPedidoEntrega() {
  const disponivel = Boolean(conexao?.recursos ?? ia.escritorio);
  $('#aba-entregas').hidden = !disponivel;
  $('#aba-numeros').hidden = !disponivel;
  if (!disponivel) return;
  const { MODELOS } = await import('./entregas.js');
  const modelo = $('#modelo-entrega');
  if (!modelo.options.length) {
    modelo.replaceChildren(...MODELOS.map((m) => el('option', { value: m.id }, m.titulo)));
    $('#agente-entrega').replaceChildren(
      ...estado.setores.map((s) => el('optgroup', { label: s.nome }, s.agentes.map((id) => el('option', { value: id }, `${estado.agentes[id].nome} · ${estado.agentes[id].cargo}`)))),
    );
    const sugerir = () => {
      const m = MODELOS.find((x) => x.id === modelo.value);
      $('#agente-entrega').value = m.agente;
      $('#obs-entrega').placeholder = m.id === 'outra'
        ? 'Descreva o que você precisa. Ex.: uma mensagem para reativar buffets que pararam de responder.'
        : 'Detalhes (opcional). Ex.: foco em buffets de BH, tom mais informal.';
    };
    modelo.addEventListener('change', sugerir);
    sugerir();
  }
  desenharPedidoEntrega();
}

function desenharPedidoEntrega(status) {
  if (status !== undefined) statusEntrega = status;
  const botao = $('#btn-entrega');
  if (!botao) return;
  const semIA = !ia.sample;
  botao.disabled = semIA || entregaAtual.rodando;
  botao.textContent = entregaAtual.rodando ? 'Escrevendo…' : 'Pedir entrega';
  $('#btn-parar-entrega').hidden = !entregaAtual.rodando;
  $('#status-entrega').textContent = semIA ? 'As entregas são escritas pelo Claude e só funcionam com a IA ligada (abrindo esta página pelo Claude).' : statusEntrega;
}

$('#form-entrega').addEventListener('submit', (e) => {
  e.preventDefault();
  const modeloId = $('#modelo-entrega').value;
  const obs = $('#obs-entrega').value.trim();
  if (modeloId === 'outra' && !obs) {
    desenharPedidoEntrega('Descreva o que você precisa na caixa de detalhes.');
    $('#obs-entrega').focus();
    return;
  }
  $('#obs-entrega').value = '';
  pedirEntrega({ modeloId, agenteId: $('#agente-entrega').value, obs });
});
$('#btn-parar-entrega').addEventListener('click', () => entregaAtual.ctl?.abort());

function mostrarRascunho(titulo, agenteId) {
  const corpo = el('div', { class: 'entrega-corpo' }, el('p', { class: 'pensando' }, 'Pensando…'));
  const cartao = el('article', { class: 'entrega rascunho' },
    el('div', { class: 'entrega-cab' },
      el('span', { class: 'etiqueta discussao' }, 'Escrevendo'),
      el('h3', {}, titulo),
      el('div', { class: 'autor' }, el('span', { class: 'ponto', style: `--cor:${corDe(agenteId)}` }), nomeDe(agenteId))),
    corpo);
  trocarAba('entregas');
  $('#entregas').prepend(cartao);
  let pronto = null;
  return {
    atualizar: async (texto) => {
      pronto ??= (await import('./entregas.js')).renderizarMarkdown;
      corpo.replaceChildren(pronto(texto));
    },
    remover: () => cartao.remove(),
  };
}

async function desenharEntregas() {
  const box = $('#entregas');
  if (!box || !estado.entregas) return;
  const { renderizarMarkdown } = await import('./entregas.js');
  const lista = [...estado.entregas].sort((a, b) => (b.atualizadoEm ?? b.ts) - (a.atualizadoEm ?? a.ts));
  const rascunho = box.querySelector('.rascunho');
  box.replaceChildren(...(rascunho ? [rascunho] : []), ...lista.map((e, i) => cartaoDeEntrega(e, i === 0, renderizarMarkdown)));
  if (!lista.length && !rascunho) {
    box.append(el('p', { class: 'vazio' }, 'Nenhuma entrega ainda. Peça acima o primeiro material: por exemplo, as mensagens de prospecção no WhatsApp.'));
  }
}

function cartaoDeEntrega(entrega, aberta, renderizarMarkdown) {
  const ajuste = el('textarea', { rows: 2, placeholder: 'O que mudar? Ex.: mais curto, tom mais informal, incluir preço.' });
  const areaAjuste = el('div', { class: 'ajuste', hidden: true },
    ajuste,
    el('button', { class: 'btn btn-forte', type: 'button', onclick: () => {
      const obs = ajuste.value.trim();
      if (!obs) return ajuste.focus();
      pedirEntrega({ agenteId: entrega.autor, obs, refazer: entrega });
    } }, 'Refazer com o ajuste'));
  const copiar = el('button', { class: 'btn', type: 'button' }, 'Copiar texto');
  copiar.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(entrega.conteudo);
      copiar.textContent = 'Copiado';
    } catch {
      const faixa = document.createRange();
      faixa.selectNodeContents(corpo);
      getSelection().removeAllRanges();
      getSelection().addRange(faixa);
      copiar.textContent = 'Texto selecionado: use Ctrl+C';
    }
    setTimeout(() => (copiar.textContent = 'Copiar texto'), 2500);
  });
  const corpo = el('div', { class: 'entrega-corpo' }, renderizarMarkdown(entrega.conteudo));
  const quando = new Date(entrega.atualizadoEm ?? entrega.ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return el('details', { class: 'entrega', id: `entrega-${entrega.id}`, open: aberta },
    el('summary', { class: 'entrega-cab' },
      el('h3', {}, entrega.titulo),
      el('div', { class: 'autor' },
        el('span', { class: 'ponto', style: `--cor:${corDe(entrega.autor)}` }),
        `${nomeDe(entrega.autor)} · versão ${entrega.versao ?? 1} · ${quando}`)),
    corpo,
    entrega.cortada ? el('p', { class: 'dica-linha' }, 'O texto foi cortado no fim. Peça um ajuste para completar.') : null,
    ia.sample
      ? el('div', { class: 'acoes-ideia' },
          copiar,
          el('button', { class: 'btn', type: 'button', onclick: () => { areaAjuste.hidden = !areaAjuste.hidden; if (!areaAjuste.hidden) ajuste.focus(); } }, 'Pedir ajuste'))
      : el('div', { class: 'acoes-ideia' }, copiar),
    areaAjuste,
  );
}

function abrirEntrega(id) {
  trocarAba('entregas');
  const cartao = document.getElementById(`entrega-${id}`);
  if (!cartao) return;
  cartao.open = true;
  cartao.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- números reais (aba) ----------
async function montarDados() {
  const form = $('#form-dados');
  if (!form || !(conexao?.recursos ?? ia.escritorio)) return;
  const { CAMPOS_DADOS } = await import('./prompts.js');
  const campos = $('#campos-dados');
  if (!campos.children.length) {
    campos.replaceChildren(...CAMPOS_DADOS.map((c) => el('label', { class: c.tipo === 'texto' ? 'campo campo-largo' : 'campo', for: `dado-${c.id}` },
      el('span', {}, c.rotulo),
      c.tipo === 'texto'
        ? el('textarea', { id: `dado-${c.id}`, rows: 5, placeholder: 'Ex.: objeções que ouviu, trechos de conversas da IA, o que funcionou nesta semana.' })
        : el('input', { id: `dado-${c.id}`, type: 'number', min: 0, step: 'any', inputmode: 'decimal' }))));
  }
  for (const c of CAMPOS_DADOS) $(`#dado-${c.id}`).value = estado.dados?.[c.id] ?? '';
  $('#status-dados').textContent = estado.dados?.atualizadoEm
    ? `Última atualização: ${new Date(estado.dados.atualizadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
    : 'Nenhum número salvo ainda.';
}

$('#form-dados').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!conexao?.salvarDados) return;
  const { CAMPOS_DADOS } = await import('./prompts.js');
  const dados = { atualizadoEm: Date.now() };
  for (const c of CAMPOS_DADOS) {
    const valor = $(`#dado-${c.id}`).value.trim();
    dados[c.id] = c.tipo === 'numero' ? (valor === '' ? '' : Number(valor)) : valor;
  }
  conexao.salvarDados(dados);
  $('#status-dados').textContent = 'Salvo. Os agentes já usam estes números nas próximas rodadas e entregas.';
});

$('#btn-apagar').addEventListener('click', () => {
  $('#confirma-apagar').hidden = false;
  $('#btn-apagar').hidden = true;
});
$('#btn-cancelar-apagar').addEventListener('click', () => {
  $('#confirma-apagar').hidden = true;
  $('#btn-apagar').hidden = false;
});
$('#btn-confirmar-apagar').addEventListener('click', () => {
  conexao?.apagarConversa?.();
  $('#confirma-apagar').hidden = true;
  $('#btn-apagar').hidden = false;
  trocarAba('caixa');
});

conexao = await conectar();
