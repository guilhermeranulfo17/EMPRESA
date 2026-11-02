// Tempos reais das frases a partir da narração (public/audio/narracao.mp3).
// Detecta as pausas com o silencedetect do ffmpeg e, para cada fronteira entre frases da
// estimativa (scripts/tempos-estimados.mjs), escolhe a pausa mais próxima. Pausas que sobram
// ficam dentro das frases (vírgulas, "Dono de buffet:").
// Uso: node --experimental-strip-types scripts/tempos-estimados.mjs && node scripts/tempos.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const caminho = new URL('../src/tempos.json', import.meta.url);
const audio = new URL('../public/audio/narracao.mp3', import.meta.url).pathname;
const est = JSON.parse(readFileSync(caminho, 'utf8'));
if (est.origem !== 'estimado') {
  throw new Error('Rode antes scripts/tempos-estimados.mjs (a base é a estimativa).');
}

const ff = spawnSync(
  'ffmpeg',
  ['-v', 'info', '-i', audio, '-af', 'silencedetect=noise=-38dB:d=0.22', '-f', 'null', '-'],
  { encoding: 'utf8' },
);
const log = ff.stderr;
const duracao = +log.match(/Duration: (\d+):(\d+):([\d.]+)/).slice(1).reduce((s, v) => s * 60 + +v, 0);
const inicios = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
const fins = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
const pausas = inicios.map((ini, i) => ({ ini, fim: fins[i] ?? duracao }));

const fs = est.frases;
// fronteira i (entre a frase i e a i+1) recebe uma pausa, em ordem crescente, com a menor soma
// de distâncias até a estimativa (programação dinâmica: a escolha gulosa troca pausas vizinhas)
const alvos = fs.slice(0, -1).map((f, i) => (f.fim + fs[i + 1].inicio) / 2);
const cand = pausas.filter((p) => p.ini >= 0.5);
const meio = (p) => (p.ini + p.fim) / 2;
const n = alvos.length;
const m = cand.length;
if (m < n) throw new Error(`Só ${m} pausas para ${n} fronteiras.`);
// custo[i][j]: melhor soma com a fronteira i na pausa j
const custo = alvos.map(() => new Array(m).fill(Infinity));
const de = alvos.map(() => new Array(m).fill(-1));
for (let j = 0; j < m; j++) custo[0][j] = Math.abs(meio(cand[j]) - alvos[0]);
for (let i = 1; i < n; i++) {
  let melhor = Infinity;
  let arg = -1;
  for (let j = 1; j < m; j++) {
    if (custo[i - 1][j - 1] < melhor) {
      melhor = custo[i - 1][j - 1];
      arg = j - 1;
    }
    custo[i][j] = melhor + Math.abs(meio(cand[j]) - alvos[i]);
    de[i][j] = arg;
  }
}
let j = custo[n - 1].indexOf(Math.min(...custo[n - 1]));
const fronteiras = new Array(n);
for (let i = n - 1; i >= 0; i--) {
  fronteiras[i] = cand[j];
  j = de[i][j];
}

const inicioFala = pausas[0] && pausas[0].ini < 0.05 ? pausas[0].fim : 0;
const frases = fs.map((f, i) => ({
  cena: f.cena,
  texto: f.texto,
  inicio: +(i === 0 ? inicioFala : fronteiras[i - 1].fim - 0.05).toFixed(3),
  fim: +(i === fs.length - 1 ? duracao : fronteiras[i].ini).toFixed(3),
}));

writeFileSync(caminho, JSON.stringify({ origem: 'narracao', duracao: +duracao.toFixed(3), frases }, null, 2) + '\n');
for (const f of frases) console.log(f.cena.padEnd(11), f.inicio.toFixed(2), f.fim.toFixed(2), f.texto.slice(0, 50));
