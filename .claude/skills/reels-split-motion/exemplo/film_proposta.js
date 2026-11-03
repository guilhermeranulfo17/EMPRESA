// Proposta split: motion panel (top 1080x960) over the speaker (bottom half, composited in ffmpeg).
// Pure function of time. Grid is 1 beat = 1 second, so u == seconds of the clip.
import * as M from './lib/motion.js';

const { W, E, prog, lerp, clamp, springU, SPRING, wobble, font, layout, glyph, text, rrect, hash01, shake } = M;

const PH = 960;                       // motion panel height (top half)
const C = {
  bg: '#0E1116', card: '#171C24', card2: '#222A35', line: '#2E3846',
  paper: '#F4F1EA', ink: '#14171C', grey: '#8A93A3', grey2: '#C9CED6', accent: '#FFD60A',
};
const D = 'Display', UI = 'UI';
const fD = (s) => font(s, 400, D);
const fU = (s, w = 600) => font(s, w, UI);

// ------------------------------------------------------------ timing (clip seconds, from the transcript)
const T = {
  pages: Array.from({ length: 10 }, (_, i) => 0.55 + i * 0.25),
  file: 3.75, typeA: 4.5, typeB: 6.2, send: 6.95,
  meterA: 8.0, meterB: 11.6,
  slots: Array.from({ length: 9 }, (_, i) => 12.35 + i * 0.36),
  pdfIn: 16.2, pdfHit: 16.75, pdfFall: 17.15,
  nlIn: 18.6, stamp: 20.15,
  stackIn: 22.55, flyA: 24.0, flyB: 25.35, chip2: 25.45,
  pageIn: 26.15, b1: 27.6, b2: 30.35, b3: 32.3, b4: 36.2, b5: 39.15, done: 40.0,
};
const SCENES = [
  ['stack', 0, 3.45], ['chat', 3.45, 7.7], ['meter', 7.7, 12.1], ['agenda', 12.1, 18.4],
  ['unread', 18.4, 22.4], ['shrink', 22.4, 26.0], ['build', 26.0, 41.5],
];

const HITS = [
  ...T.pages.map((t, i) => [t + 0.12, `page ${i + 1}`, 'click', { gain: 0.6, pitch: 900 + i * 60 }]),
  [T.pages[9] + 0.2, 'counter 10', 'pop', { pitch: 'A5' }],
  [3.45, 'whip to chat', 'whoosh', { len: 0.35, from: 500, to: 2600, gain: 0.7 }],
  [T.file + 0.05, 'file bubble', 'pop', { pitch: 'E5' }],
  [T.typeA, 'typing', 'type', { len: T.typeB - T.typeA, gain: 0.7 }],
  [T.send, 'message sent', 'blip', { pitch: 'C6' }],
  [7.7, 'whip to meter', 'whoosh', { len: 0.35, from: 2600, to: 500, gain: 0.7 }],
  [T.meterB, 'meter maxed', 'riser', { len: T.meterB - T.meterA, gain: 0.6 }],
  [T.meterB, 'meter max hit', 'thud'],
  [12.1, 'whip to agenda', 'whoosh', { len: 0.35, from: 500, to: 2600, gain: 0.7 }],
  ...T.slots.map((t, i) => [t + 0.08, `slot ${i + 1}`, 'tick', { gain: 0.7 }]),
  [T.pdfHit, 'pdf bounces off', 'boing', { pitch: 'G4', to: 'C4' }],
  [T.pdfFall + 0.25, 'pdf falls', 'whoosh', { len: 0.5, from: 1800, to: 300, gain: 0.6 }],
  [18.4, 'whip to unread', 'whoosh', { len: 0.35, from: 2600, to: 500, gain: 0.7 }],
  [T.stamp, 'NAO LIDO stamp', 'thud+crash', { gain: 0.8, len: 0.6 }],
  [22.4, 'whip to shrink', 'whoosh', { len: 0.35, from: 500, to: 2600, gain: 0.7 }],
  ...Array.from({ length: 8 }, (_, i) => [T.flyA + i * ((T.flyB - T.flyA) / 8), `page off ${i + 1}`, 'whoosh', { len: 0.18, from: 2400, to: 900, gain: 0.35 }]),
  [T.chip2, '1 a 2 paginas', 'bell', { pitch: 'E6' }],
  [26.0, 'whip to build', 'whoosh', { len: 0.35, from: 2600, to: 500, gain: 0.7 }],
  [T.b1, 'titulo', 'pop', { pitch: 'C5' }],
  [T.b2, 'subtitulo', 'pop', { pitch: 'D5' }],
  [T.b3, 'contexto', 'pop', { pitch: 'E5' }],
  [T.b4, 'valor', 'pop', { pitch: 'G5' }],
  [T.b5, 'proximo passo', 'pop', { pitch: 'A5' }],
  [T.done, 'page done', 'bell', { pitch: 'C6' }],
];

// ------------------------------------------------------------ helpers
function shadow(ctx, blur = 30, y = 14, a = 0.45) { ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = y; }
function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }

// A document page: cream sheet with a header bar and text lines.
function page(ctx, cx, cy, w, h, rot = 0, a = 1, seed = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy); ctx.rotate(rot);
  shadow(ctx, 24, 10, 0.4); rrect(ctx, -w / 2, -h / 2, w, h, w * 0.04); ctx.fillStyle = C.paper; ctx.fill(); noShadow(ctx);
  const px = -w / 2 + w * 0.1, pw = w * 0.8;
  ctx.fillStyle = '#B9BDC4'; rrect(ctx, px, -h / 2 + h * 0.08, pw * 0.6, h * 0.05, 4); ctx.fill();
  ctx.fillStyle = '#D9DCE1';
  for (let i = 0; i < 9; i++) {
    const lw = pw * (0.7 + 0.3 * hash01(i, seed));
    rrect(ctx, px, -h / 2 + h * (0.2 + i * 0.075), lw, h * 0.022, 3); ctx.fill();
  }
  ctx.restore();
}

function kicker(ctx, str, t, t0) {
  const k = E.outCubic(prog(t, t0, t0 + 0.35));
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const x = 72, y = 168 + (1 - k) * 18;
  ctx.fillStyle = C.accent; ctx.fillRect(x, y - 26, 8, 32);
  text(ctx, str.toUpperCase(), x + 24, y, fU(30, 800), C.grey2, 'left', 2);
  ctx.restore();
}

function chip(ctx, str, cx, cy, k, on) {
  if (k <= 0) return;
  const f = fU(40, 800); ctx.font = f;
  const w = ctx.measureText(str).width + 56, h = 72;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = on ? C.accent : C.card2; ctx.fill();
  text(ctx, str, 0, 14, f, on ? C.ink : '#FFFFFF', 'center');
  ctx.restore();
}

// ------------------------------------------------------------ S1 headline + the 10-page pile (0..3.45)
function sStack(ctx, t) {
  const n = T.pages.filter((p) => t >= p).length;
  T.pages.forEach((p, i) => {
    const k = springU(t, p, SPRING.snappy);
    if (k <= 0) return;
    const rot = (hash01(i, 7) - 0.5) * 0.12;
    page(ctx, 360 + (hash01(i, 3) - 0.5) * 26, 700 - i * 9 - (1 - k) * 760, 300, 390, rot, 1, i + 1);
  });
  const ck = springU(t, T.pages[0], SPRING.bouncy);
  const pulse = n === 10 ? 1 + 0.12 * wobble(t - T.pages[9] - 0.2, 3, 6) : 1;
  chip(ctx, `${n} ${n === 1 ? 'página' : 'páginas'}`, 800, 640, ck * pulse, n === 10);
  const lines = [['NUNCA MANDE', '#FFFFFF'], ['PROPOSTA ASSIM', C.accent]];
  ctx.save(); shadow(ctx, 18, 6, 0.6);
  lines.forEach(([str, col], li) => {
    const f = fD(92), L = layout(ctx, str, f, -1);
    L.glyphs.forEach((g, j) => {
      const k = springU(t, -0.2 + li * 0.18 + j * 0.022, SPRING.bouncy);
      if (k <= 0) return;
      glyph(ctx, g.ch, 72 + g.cx, 250 + li * 104 + (1 - k) * 70, f, col, 1, k);
    });
  });
  ctx.restore();
}

// ------------------------------------------------------------ S2 the chat: PDF + "me sinaliza" (3.45..7.7)
function bubble(ctx, x, y, w, h, k) {
  ctx.save(); ctx.translate(x + w, y + h); ctx.scale(k, k); ctx.translate(-(x + w), -(y + h));
  rrect(ctx, x, y, w, h, 30); ctx.fillStyle = C.accent; ctx.fill();
  ctx.restore();
}
function ticks(ctx, x, y, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const dx of [0, 14]) { ctx.beginPath(); ctx.moveTo(x + dx, y); ctx.lineTo(x + dx + 8, y + 8); ctx.lineTo(x + dx + 22, y - 8); ctx.stroke(); }
}
function sChat(ctx, t) {
  kicker(ctx, 'O jeito errado', t, 3.5);
  const cx = 90, cy = 210, cw = 900, ch = 690;
  rrect(ctx, cx, cy, cw, ch, 44); ctx.fillStyle = C.card; ctx.fill();
  // header
  ctx.fillStyle = C.card2; ctx.beginPath(); ctx.arc(cx + 70, cy + 64, 32, 0, M.TAU); ctx.fill();
  text(ctx, 'C', cx + 70, cy + 78, fU(34, 800), C.grey2, 'center');
  text(ctx, 'Cliente', cx + 124, cy + 60, fU(36, 700), '#FFFFFF');
  text(ctx, 'online', cx + 124, cy + 96, fU(26, 500), C.grey);
  ctx.fillStyle = C.line; ctx.fillRect(cx, cy + 128, cw, 2);
  // file bubble
  const k1 = springU(t, T.file, SPRING.bouncy);
  if (k1 > 0) {
    const bw = 560, bh = 150, bx = cx + cw - 40 - bw, by = cy + 170;
    bubble(ctx, bx, by, bw, bh, k1);
    if (k1 > 0.6) {
      ctx.save(); ctx.globalAlpha = clamp((k1 - 0.6) / 0.4);
      rrect(ctx, bx + 26, by + 24, 78, 102, 10); ctx.fillStyle = C.ink; ctx.fill();
      text(ctx, 'PDF', bx + 65, by + 88, fU(26, 900), C.accent, 'center');
      text(ctx, 'Proposta_comercial.pdf', bx + 126, by + 70, fU(32, 800), C.ink);
      text(ctx, '10 páginas', bx + 126, by + 112, fU(30, 600), '#5A4A00');
      ctx.restore();
    }
  }
  // typing then the message
  const msg = 'Quando visualizar, me sinaliza';
  const bx2 = cx + 40, by2 = cy + 360, bw2 = cw - 80, bh2 = 110;
  if (t >= T.typeA && t < T.send) {
    // composer field filling with the typed text
    const n = Math.floor(msg.length * clamp((t - T.typeA) / (T.typeB - T.typeA)));
    rrect(ctx, cx + 40, cy + ch - 120, cw - 80, 84, 42); ctx.fillStyle = C.card2; ctx.fill();
    text(ctx, msg.slice(0, n) + (Math.floor(t * 4) % 2 ? '|' : ''), cx + 80, cy + ch - 66, fU(34, 600), '#FFFFFF');
  } else if (t < T.typeA) {
    rrect(ctx, cx + 40, cy + ch - 120, cw - 80, 84, 42); ctx.fillStyle = C.card2; ctx.fill();
    text(ctx, 'Mensagem', cx + 80, cy + ch - 66, fU(34, 500), C.grey);
  }
  const k2 = springU(t, T.send, SPRING.bouncy);
  if (k2 > 0) {
    const y = lerp(cy + ch - 120, by2, E.outCubic(prog(t, T.send, T.send + 0.3)));
    bubble(ctx, bx2 + 60, y, bw2 - 60, bh2, Math.min(1, 0.7 + 0.3 * k2));
    text(ctx, msg, bx2 + 100, y + 68, fU(40, 800), C.ink);
    if (t > T.send + 0.3) ticks(ctx, bx2 + bw2 - 70, y + bh2 + 30, C.grey);
    rrect(ctx, cx + 40, cy + ch - 120, cw - 80, 84, 42); ctx.fillStyle = C.card2; ctx.fill();
    text(ctx, 'Mensagem', cx + 80, cy + ch - 66, fU(34, 500), C.grey);
  }
}

// ------------------------------------------------------------ S3 effort meter (7.7..12.1)
function sMeter(ctx, t) {
  kicker(ctx, 'O que isso faz com o cliente', t, 7.8);
  const f = fD(84);
  text(ctx, 'ESFORÇO', 72, 330, f, '#FFFFFF');
  text(ctx, 'DO CLIENTE', 72, 430, f, '#FFFFFF');
  const p = E.inOutCubic(prog(t, T.meterA, T.meterB));
  ctx.save();
  if (t >= T.meterB) shake(ctx, t, T.meterB, 14);
  const x = 72, y = 540, w = 936, h = 110;
  rrect(ctx, x, y, w, h, 24); ctx.fillStyle = C.card2; ctx.fill();
  const segs = 20, gap = 8, sw = (w - 24 - gap * (segs - 1)) / segs;
  for (let i = 0; i < segs; i++) {
    const on = p * segs > i + 0.5;
    if (!on) continue;
    const hot = i >= 14;
    ctx.fillStyle = hot ? C.accent : '#5E6B80';
    rrect(ctx, x + 12 + i * (sw + gap), y + 14, sw, h - 28, 8); ctx.fill();
  }
  const pct = Math.round(p * 100);
  text(ctx, `${pct}%`, x + w, y + h + 110, fD(96), pct >= 100 ? C.accent : '#FFFFFF', 'right');
  const mk = springU(t, T.meterB, SPRING.bouncy);
  if (mk > 0) {
    ctx.save(); ctx.translate(x + 150, y + h + 80); ctx.rotate(-0.06); ctx.scale(mk, mk);
    rrect(ctx, -140, -52, 280, 84, 14); ctx.fillStyle = C.accent; ctx.fill();
    text(ctx, 'MÁXIMO', 0, 8, fD(52), C.ink, 'center');
    ctx.restore();
  }
  ctx.restore();
}

// ------------------------------------------------------------ S4 the client's packed agenda (12.1..18.4)
const TASKS = ['Reunião com equipe', 'Visita a fornecedor', 'Ligações', 'Financeiro', 'Cliente', 'Entrega', 'Reunião', 'Estoque', 'WhatsApp'];
function sAgenda(ctx, t) {
  kicker(ctx, 'A agenda do seu cliente', t, 12.2);
  const x0 = 72, y0 = 230, rh = 72, rows = 9;
  for (let i = 0; i < rows; i++) {
    const y = y0 + i * rh;
    text(ctx, `${String(8 + i).padStart(2, '0')}h`, x0, y + 46, fU(28, 600), C.grey);
    ctx.fillStyle = C.line; ctx.fillRect(x0 + 80, y, 860, 2);
    const k = springU(t, T.slots[i], SPRING.snappy);
    if (k > 0) {
      const bx = x0 + 96 + (1 - k) * 900;
      rrect(ctx, bx, y + 8, 840, rh - 16, 14); ctx.fillStyle = i % 3 === 1 ? '#3A4556' : C.card2; ctx.fill();
      text(ctx, TASKS[i], bx + 28, y + 47, fU(30, 700), '#FFFFFF');
    }
  }
  // the 10-page PDF tries to squeeze in, bounces off the full agenda and falls out
  if (t >= T.pdfIn) {
    const a = E.outCubic(prog(t, T.pdfIn, T.pdfHit));
    let px = lerp(-260, 470, a), py = 560, rot = -0.1;
    if (t >= T.pdfHit) {
      const b = t - T.pdfHit;
      px = 470 - 260 * E.outCubic(clamp(b / 0.4)) - (t > T.pdfFall ? 0 : 0);
      rot = -0.1 - 0.4 * wobble(b, 2, 4);
      if (t > T.pdfFall) { const f = t - T.pdfFall; py = 560 + 1400 * f * f; rot -= 2.2 * f; }
    }
    page(ctx, px, py, 240, 312, rot, 1, 4);
    ctx.save(); ctx.translate(px, py); ctx.rotate(rot);
    rrect(ctx, -90, -30, 180, 60, 30); ctx.fillStyle = C.accent; ctx.fill();
    text(ctx, '10 págs', 0, 12, fU(30, 900), C.ink, 'center');
    ctx.restore();
  }
}

// ------------------------------------------------------------ S5 "não lido" (18.4..22.4)
function sUnread(ctx, t) {
  kicker(ctx, 'O resultado', t, 18.5);
  const k = springU(t, T.nlIn, SPRING.gentle);
  page(ctx, 540, 560 + (1 - k) * 500, 380, 500, 0.03, 1, 9);
  const s = springU(t, T.stamp, { stiffness: 520, damping: 26 });
  if (s > 0) {
    ctx.save();
    shake(ctx, t, T.stamp, 16);
    ctx.translate(540, 560); ctx.rotate(-0.2); const sc = lerp(2.4, 1, s); ctx.scale(sc, sc);
    ctx.globalAlpha = clamp(s * 1.6);
    ctx.lineWidth = 12; ctx.strokeStyle = C.accent; rrect(ctx, -300, -80, 600, 160, 18); ctx.stroke();
    ctx.fillStyle = 'rgba(14,17,22,0.82)'; ctx.fill();
    text(ctx, 'NÃO LIDO', 0, 36, fD(104), C.accent, 'center');
    ctx.restore();
  }
}

// ------------------------------------------------------------ S6 10 pages shrink to 2 (22.4..26.0)
function sShrink(ctx, t) {
  kicker(ctx, 'O jeito certo', t, 22.5);
  const off = Array.from({ length: 8 }, (_, i) => T.flyA + i * ((T.flyB - T.flyA) / 8));
  let left = 10;
  for (let i = 9; i >= 0; i--) {
    const k = springU(t, T.stackIn + (9 - i) * 0.03, SPRING.snappy);
    const oi = 9 - i;                       // top pages leave first
    let dx = 0, dy = 0, rot = (hash01(i, 7) - 0.5) * 0.12, a = 1;
    if (oi < 8 && t >= off[oi]) {
      const f = E.inCubic(clamp((t - off[oi]) / 0.35));
      const dir = oi % 2 ? 1 : -1;
      dx = dir * 900 * f; dy = -300 * f; rot += dir * 1.2 * f; a = 1 - f * 0.3;
      left -= 1;
    }
    if (k <= 0) continue;
    if (i < 2) { const fan = E.outBack(prog(t, T.chip2 - 0.1, T.chip2 + 0.35)); dx += (i ? 90 : -90) * fan; rot += (i ? 0.1 : -0.1) * fan; }
    page(ctx, 400 + (hash01(i, 3) - 0.5) * 26 + dx, 620 - i * 9 + (1 - k) * 600 + dy, 300, 390, rot, a, i + 1);
  }
  const done = t >= T.chip2;
  const pulse = done ? 1 + 0.14 * wobble(t - T.chip2, 3, 6) : 1;
  chip(ctx, done ? '1 a 2 páginas' : `${Math.max(2, left)} páginas`, 800, 500, springU(t, T.stackIn, SPRING.bouncy) * pulse, done);
}

// ------------------------------------------------------------ S7 the one-page proposal builds (26.0..)
const BLOCKS = [
  ['Título grande', T.b1], ['Subtítulo', T.b2], ['Contexto curto', T.b3], ['Valor e condição', T.b4], ['Próximo passo', T.b5],
];
function sBuild(ctx, t) {
  kicker(ctx, 'Proposta que o cliente lê', t, 26.1);
  const k = springU(t, T.pageIn, SPRING.gentle);
  const z = t >= T.done ? 1 + 0.03 * E.outCubic(prog(t, T.done, T.done + 0.8)) : 1;
  const px = 90, py = 220, pw = 470, ph = 690;
  ctx.save(); ctx.translate(0, (1 - k) * 700);
  ctx.translate(px + pw / 2, py + ph / 2); ctx.scale(z, z); ctx.translate(-(px + pw / 2), -(py + ph / 2));
  shadow(ctx, 30, 14, 0.5); rrect(ctx, px, py, pw, ph, 18); ctx.fillStyle = C.paper; ctx.fill(); noShadow(ctx);
  const ix = px + 40, iw = pw - 80;
  // block geometry inside the page + where its label sits
  const G = [
    { y: py + 48, h: 74, draw: (c) => { rrect(c, ix, py + 48, iw, 74, 10); c.fillStyle = C.ink; c.fill(); } },
    { y: py + 150, h: 34, draw: (c) => { rrect(c, ix, py + 150, iw * 0.72, 34, 8); c.fillStyle = '#8F96A1'; c.fill(); } },
    { y: py + 222, h: 96, draw: (c) => { c.fillStyle = '#CDD1D7'; for (let i = 0; i < 3; i++) { rrect(c, ix, py + 222 + i * 34, iw * (i === 2 ? 0.6 : 0.95), 18, 6); c.fill(); } } },
    { y: py + 360, h: 150, draw: (c) => { rrect(c, ix, py + 360, iw, 150, 16); c.fillStyle = C.accent; c.fill(); c.fillStyle = C.ink; rrect(c, ix + 28, py + 392, iw * 0.45, 36, 8); c.fill(); rrect(c, ix + 28, py + 446, iw * 0.7, 22, 6); c.globalAlpha *= 0.5; c.fill(); c.globalAlpha /= 0.5; } },
    { y: py + 560, h: 84, draw: (c) => { rrect(c, ix, py + 560, iw, 84, 42); c.fillStyle = C.ink; c.fill(); c.strokeStyle = C.accent; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(ix + iw - 110, py + 602); c.lineTo(ix + iw - 50, py + 602); c.moveTo(ix + iw - 72, py + 580); c.lineTo(ix + iw - 50, py + 602); c.lineTo(ix + iw - 72, py + 624); c.stroke(); } },
  ];
  // empty slots (dashed) until each block lands
  G.forEach((g, i) => {
    const b = springU(t, BLOCKS[i][1], SPRING.bouncy);
    if (b < 0.02) {
      ctx.save(); ctx.setLineDash([10, 10]); ctx.strokeStyle = '#C3C7CE'; ctx.lineWidth = 3;
      rrect(ctx, ix, g.y, iw, g.h, 12); ctx.stroke(); ctx.restore();
      return;
    }
    ctx.save();
    const cy = g.y + g.h / 2;
    ctx.translate(ix + iw / 2, cy); ctx.scale(lerp(0.6, 1, b), lerp(0.6, 1, b)); ctx.translate(-(ix + iw / 2), -cy);
    ctx.translate((1 - b) * 260, 0); ctx.globalAlpha *= clamp(b * 2);
    g.draw(ctx); ctx.restore();
  });
  ctx.restore();
  // labels to the right, each with a leader line from its block
  G.forEach((g, i) => {
    const b = E.outCubic(prog(t, BLOCKS[i][1], BLOCKS[i][1] + 0.35));
    if (b <= 0) return;
    const ly = g.y + g.h / 2 + (1 - k) * 700;
    ctx.save(); ctx.globalAlpha = b;
    ctx.strokeStyle = C.accent; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(px + pw + 14, ly); ctx.lineTo(px + pw + 14 + 50 * b, ly); ctx.stroke();
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(px + pw + 98, ly, 24, 0, M.TAU); ctx.fill();
    text(ctx, String(i + 1), px + pw + 98, ly + 11, fU(30, 900), C.ink, 'center');
    text(ctx, BLOCKS[i][0], px + pw + 136 + (1 - b) * 30, ly + 12, fU(34, 800), '#FFFFFF');
    ctx.restore();
  });
  const dk = springU(t, T.done, SPRING.bouncy);
  if (dk > 0) chip(ctx, '1 página', px + pw - 40, py + 6 + (1 - k) * 700, dk, true);
}

const DRAW = { stack: sStack, chat: sChat, meter: sMeter, agenda: sAgenda, unread: sUnread, shrink: sShrink, build: sBuild };

M.film({
  fonts: [fD(100), fU(40, 600), fU(40, 800), fU(40, 900)],
  hits: HITS,
  samples: 6,
  draw(ctx, u, t) {
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, PH);
    ctx.fillStyle = '#000'; ctx.fillRect(0, PH, W, 1920 - PH);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, PH); ctx.clip();
    // whip between scenes: both on screen, A slides out as B slides in
    SCENES.forEach(([name, a, b], i) => {
      const inK = i === 0 ? 1 : E.inOutCubic(prog(u, a - 0.15, a + 0.2));
      const outK = i === SCENES.length - 1 ? 0 : E.inOutCubic(prog(u, b - 0.15, b + 0.2));
      if (inK <= 0 || outK >= 1) return;
      ctx.save(); ctx.translate(W * (1 - inK) - W * outK, 0);
      DRAW[name](ctx, u);
      ctx.restore();
    });
    ctx.restore();
  },
});
