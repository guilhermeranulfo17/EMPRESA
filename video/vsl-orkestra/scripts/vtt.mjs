// Legenda WebVTT (pt-BR) a partir de src/tempos.json, para o <track> da landing.
// Uso: node scripts/vtt.mjs saida.vtt
import { readFileSync, writeFileSync } from 'node:fs';

const tempos = JSON.parse(readFileSync(new URL('../src/tempos.json', import.meta.url), 'utf8'));

const hms = (s) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const seg = Math.floor((ms % 60_000) / 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(h)}:${p(m)}:${p(seg)}.${p(ms % 1000, 3)}`;
};

// quebra em linhas de até ~42 caracteres (no máximo 2 por bloco: frases longas viram 2 blocos)
const blocos = (texto) => {
  const palavras = texto.split(' ');
  const linhas = [];
  let atual = '';
  for (const p of palavras) {
    if ((atual + ' ' + p).trim().length > 42 && atual) {
      linhas.push(atual);
      atual = p;
    } else atual = (atual + ' ' + p).trim();
  }
  if (atual) linhas.push(atual);
  const out = [];
  for (let i = 0; i < linhas.length; i += 2) out.push(linhas.slice(i, i + 2).join('\n'));
  return out;
};

let n = 0;
const partes = ['WEBVTT', ''];
for (const f of tempos.frases) {
  const bs = blocos(f.texto);
  // divide o tempo da frase pelo tamanho de cada bloco
  const total = bs.reduce((s, b) => s + b.length, 0);
  let t = f.inicio;
  for (const b of bs) {
    const fim = t + ((f.fim - f.inicio) * b.length) / total;
    partes.push(String(++n), `${hms(t)} --> ${hms(fim)}`, b, '');
    t = fim;
  }
}
writeFileSync(process.argv[2] ?? 'legenda.vtt', partes.join('\n'));
console.log(`${n} blocos`);
