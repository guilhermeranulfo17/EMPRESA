// Guarda de onde a pessoa veio (links com ?utm_source=... ou ?ref=igreja-x)
// para mandar junto com a inscrição.
const CHAVE = "oe-origem";
const CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "ref"];

export function guardarOrigem() {
  try {
    const params = new URLSearchParams(window.location.search);
    const origem = {};
    for (const c of CAMPOS) if (params.get(c)) origem[c] = params.get(c).slice(0, 80);
    if (Object.keys(origem).length) sessionStorage.setItem(CHAVE, JSON.stringify(origem));
    else if (!sessionStorage.getItem(CHAVE) && document.referrer) {
      sessionStorage.setItem(CHAVE, JSON.stringify({ referrer: new URL(document.referrer).hostname }));
    }
  } catch (_) {
    /* sem armazenamento disponível: segue sem origem */
  }
}

export function lerOrigem() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE)) || {};
  } catch (_) {
    return {};
  }
}
