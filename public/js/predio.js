// O prédio ligado aos dados reais, sem gastar IA: lê a planilha do funil (Google Drive) e as tarefas
// do CEO (armazenamento da página) e transforma isso em coisas na cena: pilhas de papel, pinos no
// mapa, placar do prédio, reunião das 9h, comemoração de venda e sprint de prospecção.

import { horaLocal } from './escritorio3d.js';
import { definirContextoSimulado } from './cerebro-simulado.js';

const ENCERRADOS = ['Pagando', 'Recusou'];
const EM_TESTE = ['Aceitou o teste', 'Catálogo montado', 'Link na bio'];
const EM_CONVERSA = ['Abordado', 'Conversou', 'Proposta enviada'];
const DURACAO_SPRINT = 25 * 60;

const hojeISO = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
const dataBR = (iso) => new Date(`${iso}T12:00:00-03:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const lembrar = (chave, valor) => {
  try {
    if (valor === undefined) return localStorage.getItem(chave);
    localStorage.setItem(chave, valor);
  } catch {
    return null;
  }
  return valor;
};

export function iniciarPredio({ api, usar, lerPlanilha, normalizarStatus, $ }) {
  let dados = null;
  let lidoEm = null;
  let sprint = null;
  let intervaloSprint = null;
  const botoes = {
    mapa: $('#btn-mapa'), reuniao: $('#btn-reuniao'), sprint: $('#btn-sprint'), filmar: $('#btn-filmar'), som: $('#btn-som'),
    planilha: $('#btn-planilha3d'), horario: $('#btn-horario'), qualidade: $('#btn-qualidade'), comemorar: $('#btn-comemorar'),
  };

  // ---------- avisos e cartões ----------
  let timerAviso = null;
  function avisar(texto) {
    const caixa = $('#aviso3d');
    caixa.textContent = texto;
    caixa.hidden = false;
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => {
      caixa.hidden = true;
    }, 7000);
  }
  function mostrarCartao(info) {
    const cartao = $('#cartao3d');
    $('#cartao3d-titulo').textContent = info.titulo;
    $('#cartao3d-sub').textContent = info.sub ?? '';
    const lista = $('#cartao3d-lista');
    lista.replaceChildren(...(info.itens ?? []).map((item) => {
      const li = document.createElement('li');
      const b = document.createElement('b');
      b.textContent = item.titulo;
      li.append(b);
      if (item.texto) {
        const span = document.createElement('span');
        span.textContent = item.texto;
        li.append(span);
      }
      if (item.copiar && /\d{4}/.test(item.copiar)) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'btn btn-mini';
        botao.textContent = `Copiar ${item.copiar}`;
        botao.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(item.copiar);
            botao.textContent = 'Copiado';
          } catch {
            const r = document.createRange();
            r.selectNodeContents(botao);
            getSelection().removeAllRanges();
            getSelection().addRange(r);
          }
        });
        li.append(botao);
      }
      return li;
    }));
    if (!info.itens?.length) {
      const li = document.createElement('li');
      li.textContent = 'Nada por aqui agora.';
      lista.append(li);
    }
    cartao.hidden = false;
  }
  $('#cartao3d-fechar').addEventListener('click', () => {
    $('#cartao3d').hidden = true;
  });

  // ---------- dados reais ----------
  async function lerDoc(db, caminho) {
    try {
      const snap = await db.doc(caminho).get();
      return snap.exists ? snap.data() : null;
    } catch {
      return null;
    }
  }

  function resumir(linhas, perfil, tarefas) {
    const coluna = (linha, inicio) => {
      const chave = Object.keys(linha).find((k) => k.toLowerCase().startsWith(inicio));
      return chave ? String(linha[chave]).trim() : '';
    };
    const sim = (valor) => /^(sim|s|yes|x|ok)\b/i.test(valor);
    const validacao = { abordados: 0, aceitaram: 0, pagando: 0 };
    const leads = [];
    const pendentes = [];
    for (const l of linhas ?? []) {
      const status = normalizarStatus(l.Status);
      const lead = {
        buffet: l.Buffet, cidade: coluna(l, 'cidade'), status, prioridade: coluna(l, 'prioridade'),
        telefone: coluna(l, 'whatsapp'), proximo: coluna(l, 'próximo passo'),
      };
      leads.push(lead);
      if (status !== 'A abordar' && status !== 'Sem status') validacao.abordados++;
      if ([...EM_TESTE, 'Proposta enviada', 'Pagando'].includes(status) || sim(coluna(l, 'aceitou'))) validacao.aceitaram++;
      if (status === 'Pagando' || sim(coluna(l, 'pagou'))) validacao.pagando++;
      const esperando = !ENCERRADOS.includes(status) && !EM_TESTE.includes(status) && (/quente/i.test(lead.prioridade) || EM_CONVERSA.includes(status));
      if (esperando) pendentes.push(lead);
    }
    const pendentesCeo = (tarefas ?? []).filter((t) => !t.feita);
    return { validacao, leads, pendentes, tarefas: pendentesCeo, perfil, total: linhas?.length ?? 0 };
  }

  async function carregar({ silencioso = false } = {}) {
    botoes.planilha.disabled = true;
    const status = $('#status-predio');
    if (!silencioso) status.textContent = 'Lendo a planilha e as tarefas…';
    try {
      const db = await usar('db');
      const [perfil, ceo] = db ? await Promise.all([lerDoc(db, 'escritorio/empresa'), lerDoc(db, 'escritorio/ceo')]) : [null, null];
      const planilhaId = perfil?.planilha_funil?.id;
      let linhas = null;
      let erro = null;
      if (!planilhaId) erro = 'A planilha do funil ainda não está ligada a esta página.';
      else {
        const mcp = await usar('mcp');
        if (!mcp) erro = 'A leitura do Google Drive só funciona com a página aberta pelo Claude.';
        else {
          try {
            ({ linhas } = await lerPlanilha(mcp, planilhaId));
          } catch (e) {
            erro = e?.code === 'server_not_connected' || e?.code === 'needs_reauth'
              ? 'O Google Drive não está conectado. Conecte em claude.ai, Configurações, Conectores.'
              : 'Não consegui ler a planilha agora. Tente Atualizar planilha de novo.';
          }
        }
      }
      const anterior = dados;
      dados = resumir(linhas, perfil, ceo?.itens);
      lidoEm = new Date();
      api.definirDados(dados);
      definirContextoSimulado({ pendentes: dados.pendentes });
      status.textContent = erro ?? `Planilha lida às ${lidoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}: ${dados.total} buffets, ${dados.pendentes.length} esperando retorno, ${dados.validacao.pagando} pagando.`;
      if (linhas) await conferirConquistas(db, anterior);
    } finally {
      botoes.planilha.disabled = false;
    }
  }

  // Comemora quando a planilha mostra um buffet novo pagando (ou aceitando o teste) desde a última visita.
  async function conferirConquistas(db) {
    const atual = dados.validacao;
    let visto = null;
    if (db) {
      try {
        const snap = await db.doc('predio/placar').get();
        visto = snap.exists ? snap.data() : null;
      } catch {
        visto = null;
      }
    }
    if (!visto) {
      const local = lembrar('orkestra-placar');
      visto = local ? JSON.parse(local) : null;
    }
    if (visto) {
      if (atual.pagando > (visto.pagando ?? 0)) {
        api.comemorar('venda');
        avisar(`Buffet pagando! Agora são ${atual.pagando}. O escritório inteiro está comemorando.`);
      } else if (atual.aceitaram > (visto.aceitaram ?? 0)) {
        api.comemorar('aceite');
        avisar(`Mais um buffet aceitou o teste. Agora são ${atual.aceitaram}.`);
      }
    }
    const novo = { pagando: atual.pagando, aceitaram: atual.aceitaram, atualizadoEm: Date.now() };
    lembrar('orkestra-placar', JSON.stringify(novo));
    try {
      await db?.doc('predio/placar').set(novo);
    } catch {
      // sem armazenamento compartilhado: vale o do navegador
    }
  }

  // ---------- reunião da manhã ----------
  function pautaDoDia() {
    const itens = [];
    const tarefas = [...(dados?.tarefas ?? [])].sort((a, b) => (a.prazo ?? '9999').localeCompare(b.prazo ?? '9999'));
    const hoje = hojeISO();
    for (const t of tarefas.slice(0, 3)) {
      const texto = t.texto.length > 70 ? `${t.texto.slice(0, 68).trimEnd()}…` : t.texto;
      const prazo = t.prazo ? `Prazo ${dataBR(t.prazo)}${t.prazo < hoje ? ', atrasada' : ''}` : 'Sem prazo';
      itens.push({ titulo: texto, texto: prazo });
    }
    if (dados?.pendentes.length) itens.push({ titulo: `${dados.pendentes.length} buffets esperando retorno`, texto: 'São as pilhas de papel nas mesas do Comercial.' });
    const validacao = dados?.perfil?.validacao;
    if (validacao?.prazo) {
      const meta = validacao.metas?.pagando ?? 3;
      const pagando = dados.validacao.pagando;
      const encerrado = validacao.prazo < hoje;
      itens.push({ titulo: `Validação: ${pagando} de ${meta} buffets pagando`, texto: encerrado ? `O prazo era ${dataBR(validacao.prazo)}.` : `Prazo ${dataBR(validacao.prazo)}.` });
    }
    if (!itens.length) itens.push({ titulo: 'Sem tarefas abertas', texto: 'Atualize a planilha para trazer os números.' });
    return itens.slice(0, 4);
  }
  function fazerReuniao() {
    if (!api.reuniao(pautaDoDia())) avisar('Ninguém no escritório agora para a reunião.');
    else if (api.modo !== 'dentro') avisar('A reunião começou lá dentro. Entre no prédio para ver.');
  }
  setInterval(() => {
    const { h, fimDeSemana } = horaLocal();
    if (fimDeSemana || h < 9 || h >= 9.1 || api.horario !== 'real') return;
    if (lembrar('orkestra-reuniao') === hojeISO()) return;
    lembrar('orkestra-reuniao', hojeISO());
    fazerReuniao();
  }, 30000);

  // ---------- sprint de prospecção ----------
  async function salvarSprint(abordagens) {
    if (!abordagens) return;
    const db = await usar('db');
    if (!db) return;
    try {
      const ref = db.doc('predio/sprints');
      const snap = await ref.get();
      const atual = snap.exists ? snap.data() : { dias: {} };
      const dia = hojeISO();
      atual.dias = { ...(atual.dias ?? {}), [dia]: (atual.dias?.[dia] ?? 0) + abordagens };
      atual.atualizadoEm = Date.now();
      await ref.set(atual);
    } catch {
      // o número fica só no aviso desta vez
    }
  }
  function desenharSprint() {
    const m = Math.floor(sprint.restante / 60);
    const s = String(sprint.restante % 60).padStart(2, '0');
    $('#hud-tempo').textContent = `${m}:${s}`;
    $('#hud-abordagens').textContent = `${sprint.abordagens} ${sprint.abordagens === 1 ? 'abordagem' : 'abordagens'}`;
    api.definirSprint({ restante: sprint.restante, abordagens: sprint.abordagens });
  }
  function iniciarSprint() {
    if (sprint) return;
    sprint = { restante: DURACAO_SPRINT, abordagens: 0 };
    $('#hud-sprint').hidden = false;
    botoes.sprint.disabled = true;
    desenharSprint();
    intervaloSprint = setInterval(() => {
      sprint.restante--;
      if (sprint.restante <= 0) encerrarSprint();
      else desenharSprint();
    }, 1000);
  }
  function encerrarSprint() {
    if (!sprint) return;
    clearInterval(intervaloSprint);
    const feitas = sprint.abordagens;
    sprint = null;
    $('#hud-sprint').hidden = true;
    botoes.sprint.disabled = false;
    api.definirSprint(null);
    if (feitas) api.comemorar('aceite');
    salvarSprint(feitas);
    avisar(feitas
      ? `Sprint encerrado: ${feitas} ${feitas === 1 ? 'abordagem' : 'abordagens'}. Registre cada conversa na planilha para os números subirem.`
      : 'Sprint encerrado sem abordagens registradas.');
  }
  $('#hud-mais').addEventListener('click', () => {
    if (!sprint) return;
    sprint.abordagens++;
    desenharSprint();
    if (sprint.abordagens % 5 === 0) api.comemorar('aceite');
  });
  $('#hud-encerrar').addEventListener('click', encerrarSprint);

  // ---------- filmagem ----------
  function filmar(ligar) {
    document.body.classList.toggle('filmando', ligar);
    $('#btn-parar-filmagem').hidden = !ligar;
    api.filmar(ligar);
    if (ligar) avisar('Modo filmagem: a câmera passeia sozinha. Grave a tela; para sair, aperte Esc.');
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('filmando')) filmar(false);
  });
  $('#btn-parar-filmagem').addEventListener('click', () => filmar(false));

  // ---------- botões ----------
  const rotular = () => {
    botoes.som.textContent = api.somLigado ? 'Som: ligado' : 'Som: desligado';
    botoes.som.setAttribute('aria-pressed', String(api.somLigado));
    botoes.horario.textContent = api.horario === 'real' ? 'Horário: real' : 'Horário: sempre dia';
    botoes.qualidade.textContent = api.qualidade === 'alta' ? 'Qualidade: alta' : 'Qualidade: leve';
  };
  botoes.mapa.addEventListener('click', () => api.irParaMapa());
  botoes.reuniao.addEventListener('click', fazerReuniao);
  botoes.sprint.addEventListener('click', iniciarSprint);
  botoes.filmar.addEventListener('click', () => filmar(true));
  botoes.som.addEventListener('click', () => {
    api.alternarSom();
    rotular();
  });
  botoes.planilha.addEventListener('click', () => carregar());
  botoes.horario.addEventListener('click', () => {
    api.definirHorario(api.horario === 'real' ? 'dia' : 'real');
    lembrar('orkestra-horario', api.horario);
    rotular();
  });
  botoes.qualidade.addEventListener('click', () => {
    api.definirQualidade(api.qualidade === 'alta' ? 'leve' : 'alta');
    lembrar('orkestra-qualidade', api.qualidade);
    rotular();
  });
  botoes.comemorar.addEventListener('click', () => {
    api.comemorar('venda');
    if (api.modo !== 'dentro') avisar('A comemoração é lá dentro. Entre no prédio para ver.');
  });
  if (lembrar('orkestra-horario') === 'dia') api.definirHorario('dia');
  const q = lembrar('orkestra-qualidade');
  if (q === 'alta' || q === 'leve') api.definirQualidade(q);
  rotular();

  carregar();
  setInterval(() => {
    if (!document.hidden) carregar({ silencioso: true });
  }, 10 * 60 * 1000);

  return {
    avisar,
    mostrarCartao,
    rotular,
    aoMudarModo(modo) {
      botoes.mapa.hidden = modo !== 'dentro';
      if (modo !== 'dentro') $('#cartao3d').hidden = true;
    },
  };
}
