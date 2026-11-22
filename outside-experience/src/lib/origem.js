// Guarda de onde a pessoa veio para mandar junto com a inscrição:
//   ?ref=pela-cruz        link de igreja/líder (página /lideres)
//   ?convite=AB12CD34     convite de quem já se inscreveu (vira ref "convite-AB12CD34")
//   ?utm_source=...       anúncios e campanhas
const CHAVE = "oe-origem";
const UTM = ["utm_source", "utm_medium", "utm_campaign"];

const limpar = (v) => v.trim().slice(0, 60).replace(/[^\p{L}\p{N}._-]/gu, "");

export function guardarOrigem() {
  try {
    const params = new URLSearchParams(window.location.search);
    const origem = {};
    for (const c of UTM) if (params.get(c)) origem[c] = limpar(params.get(c));
    const convite = params.get("convite");
    const ref = params.get("ref");
    if (convite) origem.ref = `convite-${limpar(convite).toUpperCase().replace(/^OE-?/, "")}`;
    else if (ref) origem.ref = limpar(ref).toLowerCase();

    if (Object.keys(origem).length) sessionStorage.setItem(CHAVE, JSON.stringify(origem));
    else if (!sessionStorage.getItem(CHAVE) && document.referrer && !document.referrer.startsWith(window.location.origin)) {
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
