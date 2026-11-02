// Tempos provisórios (sem o áudio): divide a duração da narração pelas frases, pelo número de
// caracteres, com pausa entre frases e um respiro maior entre cenas. Substituído por
// scripts/tempos.mjs quando o áudio estiver em public/audio/narracao.mp3.
import { writeFileSync } from 'node:fs';
import { ROTEIRO } from '../src/roteiro.ts';

const TOTAL = Number(process.argv[2] ?? 83.44);
const PAUSA_FRASE = 0.35;
const PAUSA_CENA = 0.7;
const frases = ROTEIRO.flatMap((c, ic) => c.frases.map((t, i) => ({ cena: c.id, t, ic, i })));
const pausas = frases.reduce((s, f, k) => s + (k === 0 ? 0 : f.i === 0 ? PAUSA_CENA : PAUSA_FRASE), 0);
const chars = frases.reduce((s, f) => s + f.t.length, 0);
const porChar = (TOTAL - pausas) / chars;
let t = 0;
const saida = [];
frases.forEach((f, k) => {
  if (k > 0) t += f.i === 0 ? PAUSA_CENA : PAUSA_FRASE;
  const ini = t;
  t += f.t.length * porChar;
  saida.push({ cena: f.cena, texto: f.t, inicio: +ini.toFixed(2), fim: +t.toFixed(2) });
});
writeFileSync(
  new URL('../src/tempos.json', import.meta.url),
  JSON.stringify({ origem: 'estimado', duracao: TOTAL, frases: saida }, null, 2),
);
console.log('tempos estimados:', saida.length, 'frases,', TOTAL, 's');
