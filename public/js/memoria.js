// Memória do escritório na página publicada: guarda conversa, ideias, entregas e números
// no armazenamento do artefato, para tudo continuar de onde parou na próxima visita.

const LIMITE_BYTES = 230_000; // cada documento aceita até 256 KiB

export async function abrirMemoria({ aoErro } = {}) {
  const db = await window.claude?.use?.('db').catch(() => null);
  if (!db) return null;

  const refEstado = db.doc('escritorio/estado');
  const refDados = db.doc('escritorio/dados');
  const refBacklog = db.doc('produto/backlog');
  const refPerfil = db.doc('escritorio/empresa');
  const refTarefasCeo = db.doc('escritorio/ceo');
  const colEntregas = db.collection('entregas');
  const colPesquisas = db.collection('pesquisas');
  let fila = Promise.resolve();
  let timer = null;
  let timerBacklog = null;
  let timerCeo = null;

  // Uma escrita por vez; falhas avisam a página, mas não travam as próximas.
  const escrever = (fn) => {
    fila = fila.then(fn).catch((erro) => aoErro?.(erro));
    return fila;
  };

  return {
    async carregar() {
      const [estado, dados, entregas, pesquisas, backlog, perfil, tarefasCeo] = await Promise.all([
        refEstado.get(),
        refDados.get(),
        colEntregas.orderBy('ts').limit(300).get(),
        colPesquisas.orderBy('criadoEm').limit(300).get(),
        refBacklog.get(),
        refPerfil.get(),
        refTarefasCeo.get(),
      ]);
      // O que vem do armazenamento é congelado: clona antes de o escritório mexer.
      return {
        estado: estado.exists ? structuredClone(estado.data()) : null,
        dados: dados.exists ? structuredClone(dados.data()) : null,
        entregas: entregas.docs.map((d) => structuredClone(d.data())),
        pesquisas: pesquisas.docs.map((d) => structuredClone(d.data())),
        backlog: backlog.exists ? structuredClone(backlog.data()).itens ?? [] : null,
        // Perfil privado da empresa (estratégia, metas): fica só aqui, fora do código publicado.
        perfil: perfil.exists ? structuredClone(perfil.data()) : null,
        tarefasCeo: tarefasCeo.exists ? structuredClone(tarefasCeo.data()).itens ?? [] : [],
      };
    },

    // Junta várias mudanças seguidas numa escrita só.
    salvarEstado(obter) {
      clearTimeout(timer);
      timer = setTimeout(() => escrever(() => refEstado.set(compactar(obter()))), 1500);
    },

    salvarEntrega: (entrega) => escrever(() => colEntregas.doc(entrega.id).set(entrega)),
    salvarDados: (dados) => escrever(() => refDados.set(dados)),
    salvarBacklog(itens) {
      clearTimeout(timerBacklog);
      timerBacklog = setTimeout(() => escrever(() => refBacklog.set({ itens, atualizadoEm: Date.now() })), 800);
    },
    salvarTarefasCeo(itens) {
      clearTimeout(timerCeo);
      timerCeo = setTimeout(() => escrever(() => refTarefasCeo.set({ itens, atualizadoEm: Date.now() })), 800);
    },
    salvarPesquisa: (pesquisa) => escrever(() => colPesquisas.doc(pesquisa.id).set(pesquisa)),

    // A equipe de pesquisa grava os resultados direto no armazenamento; a página recebe na hora.
    ouvirPesquisas(aoMudar) {
      return colPesquisas.onSnapshot(
        (snap) => {
          for (const mudanca of snap.docChanges()) {
            if (mudanca.type !== 'removed') aoMudar(structuredClone(mudanca.doc.data()));
          }
        },
        () => {},
      );
    },
    apagarEntrega: (id) => escrever(() => colEntregas.doc(id).delete()),
  };
}

function compactar(dados) {
  const copia = { ...dados, mensagens: dados.mensagens.slice(-250), salvoEm: Date.now() };
  while (JSON.stringify(copia).length > LIMITE_BYTES && copia.mensagens.length > 20) {
    copia.mensagens = copia.mensagens.slice(Math.floor(copia.mensagens.length / 4));
  }
  const ids = new Set(copia.mensagens.map((m) => m.id));
  copia.pendencias = (copia.pendencias ?? []).filter((p) => ids.has(p.mensagemId));
  return copia;
}
