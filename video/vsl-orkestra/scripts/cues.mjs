// Gera os efeitos sonoros (cues do SFX Kit) a partir de src/tempos.json.
// Os sons acompanham as animações, que nascem no começo de cada cena e de cada frase;
// por isso, quando os tempos mudam (narração real), basta rodar de novo.
// Uso: node scripts/cues.mjs saida.json
import { readFileSync, writeFileSync } from 'node:fs';

const tempos = JSON.parse(readFileSync(new URL('../src/tempos.json', import.meta.url), 'utf8'));
const frases = tempos.frases;
const ids = [...new Set(frases.map((f) => f.cena))];
const da = (cena) => frases.filter((f) => f.cena === cena);
const inicioCena = (cena, i) => (i === 0 ? 0 : da(cena)[0].inicio - 0.15);

const cues = [];
const som = (at, id, gain = 0) => cues.push({ at: Math.max(0, +at.toFixed(3)), id, gain });

ids.forEach((cena, i) => {
  const ini = inicioCena(cena, i);
  const fs = da(cena);
  // transição entre cenas (menos na primeira)
  if (i > 0) som(ini + 0.2, 'whoosh-medium-soft', 2);
  switch (cena) {
    case 'gancho':
      // perguntas chegando no WhatsApp
      fs.slice(1).forEach((f) => som(f.inicio + 0.1, 'notification-message-in-soft', 5));
      break;
    case 'agitacao':
      // um "x" por cartão
      fs.forEach((f) => som(f.inicio + 0.25, 'notification-failure-minor', 4));
      break;
    case 'virada':
      som(fs[0].inicio + 1.2, 'writing-pen-draw', 4); // risco no "falta de cliente"
      som(fs[1].inicio + 0.3, 'impact-medium-hard', 3); // "É falta de caminho."
      break;
    case 'orcamento':
      som(fs[1].inicio + 1.0, 'data-tick', 4); // total contando
      break;
    case 'negociacao':
      som(fs[0].inicio + 0.3, 'pop-small-in', 5); // cartão do lead
      som(fs[2].inicio + 0.4, 'notification-message-out-soft', 5); // mensagem pronta
      break;
    case 'fechamento':
      som(fs[0].inicio + 3.0, 'click-toggle-on-soft', 5); // Reservado
      som(fs[1].inicio + 0.3, 'notification-success-soft', 4); // falta receber
      break;
    case 'oferta':
      som(fs[0].inicio + 0.6, 'shimmer-medium-soft', 2); // 14 dias
      break;
    case 'chamada':
      som(fs[0].inicio + 0.3, 'riser-1s-soft', 0); // chega com a logo (sfx.py desconta o sync)
      som(fs[0].inicio + 1.2, 'click-button-soft', 5); // botão
      break;
  }
});

writeFileSync(process.argv[2] ?? 'cues.json', JSON.stringify(cues, null, 2));
console.log(`${cues.length} sons`);
