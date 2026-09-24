// Memória do escritório na página publicada: guarda conversa, ideias, entregas e números
// no armazenamento do artefato, para tudo continuar de onde parou na próxima visita.

const LIMITE_BYTES = 230_000; // cada documento aceita até 256 KiB

export async function abrirMemoria({ aoErro } = {}) {
  const db = await window.claude?.use?.('db').catch(() => null);
  if (!db) return null;

  const refEstado = db.doc('escritorio/estado');
  const refDados = db.doc('escritorio/dados');
  const colEntregas = db.collection('entregas');
  let fila = Promise.resolve();
  let timer = null;

  // Uma escrita por vez; falhas avisam a página, mas não travam as próximas.
  const escrever = (fn) => {
    fila = fila.then(fn).catch((erro) => aoErro?.(erro));
    return fila;
  };

  return {
    async carregar() {
      const [estado, dados, entregas] = await Promise.all([refEstado.get(), refDados.get(), colEntregas.orderBy('ts').limit(300).get()]);
      // O que vem do armazenamento é congelado: clona antes de o escritório mexer.
      return {
        estado: estado.exists ? structuredClone(estado.data()) : null,
        dados: dados.exists ? structuredClone(dados.data()) : null,
        entregas: entregas.docs.map((d) => structuredClone(d.data())),
      };
    },

    // Junta várias mudanças seguidas numa escrita só.
    salvarEstado(obter) {
      clearTimeout(timer);
      timer = setTimeout(() => escrever(() => refEstado.set(compactar(obter()))), 1500);
    },

    salvarEntrega: (entrega) => escrever(() => colEntregas.doc(entrega.id).set(entrega)),
    salvarDados: (dados) => escrever(() => refDados.set(dados)),
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
