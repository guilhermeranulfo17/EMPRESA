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

async function conectarLocal() {
  const [{ Escritorio }, { CerebroSimulado }, config] = await Promise.all([
    import('./engine.js'),
    import('./cerebro-simulado.js'),
    fetch('config/empresa.json').then((r) => r.json()),
  ]);
  const escritorio = new Escritorio(config, new CerebroSimulado(), { intervaloBase: 3500 });
  $('#aviso-demo').hidden = false;

  // Aquece o escritório para a tela já abrir com conversa acontecendo.
  escritorio.estado.velocidade = 200;
  for (let i = 0; i < 7; i++) await escritorio.passo();
  escritorio.estado.velocidade = 1;
  for (const a of Object.values(escritorio.estado.agentes)) Object.assign(a, { status: 'trabalhando', balao: null });

  receber('foto', escritorio.foto());
  escritorio.ouvir(receber);
  escritorio.iniciar();
  return {
    postar: (dados) => escritorio.postarDoCEO(dados),
    decidir: (id, decisao) => escritorio.decidirIdeia(id, decisao),
    controle: (dados) => escritorio.definirControle(dados),
  };
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
  const modo = $('#modo');
  modo.dataset.modo = estado.modo;
  modo.textContent = estado.modo === 'claude' ? 'Agentes Claude ao vivo' : 'Agentes simulados';
  montarPlanta();
  montarFiltros();
  montarDestinos();
  desenharFeed();
  desenharIdeias();
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
  if (!lista.length) feed.append(el('p', { class: 'vazio' }, 'Nenhuma mensagem aqui ainda. Os agentes já vão começar a conversar.'));
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
    ref,
    el('p', {}, msg.texto),
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
  for (const b of document.querySelectorAll('.abas button')) b.setAttribute('aria-selected', String(b.dataset.aba === aba));
  $('#vista-caixa').hidden = aba !== 'caixa';
  $('#vista-ideias').hidden = aba !== 'ideias';
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

function atualizarNumeros() {
  $('#n-mensagens').textContent = estado.mensagens.length;
  $('#n-ideias').textContent = estado.ideias.length;
  $('#n-aprovadas').textContent = estado.ideias.filter((i) => i.status === 'aprovada').length;
  const total = $('#hub-total');
  if (total) total.textContent = estado.mensagens.length;
}

conexao = await conectar();
