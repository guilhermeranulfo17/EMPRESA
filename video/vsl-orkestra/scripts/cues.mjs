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
  // (a chamada usa o riser no lugar do whoosh)
  if (i > 0 && cena !== 'chamada') som(ini + 0.2, 'whoosh-medium-soft', 6);
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
      som(fs[1].inicio - 0.2, 'writing-pen-draw', -4); // risco no "falta de cliente" (virada.tsx: de - 6)
      som(fs[1].inicio + 0.35, 'impact-medium-hard', 3); // "É falta de caminho." surgindo
      break;
    case 'orcamento':
      som(fs[1].inicio + 1.5, 'pop-medium-in', 6); // total termina de contar (orcamento.tsx: segunda + 45)
      break;
    case 'negociacao':
      som(fs[0].inicio + 0.3, 'pop-small-in', 11); // cartão do lead
      som(fs[2].inicio + 0.4, 'notification-message-out-soft', 2); // mensagem pronta
      break;
    case 'fechamento':
      // Reservado: fechamento.tsx liga em f0 + passo * 0.6, passo = (f1 - f0) / 3
      som(fs[0].inicio + (fs[1].inicio - fs[0].inicio) * 0.2 + 0.1, 'pop-small-in', 11);
      som(fs[1].inicio + 0.3, 'notification-success-soft', 4); // falta receber
      break;
    case 'oferta':
      som(fs[0].inicio + 0.3, 'shimmer-medium-soft', 7); // 14 dias
      break;
    case 'chamada':
      som(fs[0].inicio + 0.15, 'riser-1s-soft', 9); // chega com a logo (sfx.py desconta o sync)
      som(fs[0].inicio + 0.45, 'pop-medium-in', 6); // botão (surgir 8 frames depois da logo)
      break;
  }
});

writeFileSync(process.argv[2] ?? 'cues.json', JSON.stringify(cues, null, 2));
console.log(`${cues.length} sons`);
