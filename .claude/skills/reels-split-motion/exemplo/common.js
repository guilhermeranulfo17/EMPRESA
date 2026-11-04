// Shared look for the 5a Marcha split Reels (top panel 1080x960). Copy into <film>/lib/common.js.
import * as M from './motion.js';
const { W, E, prog, lerp, clamp, springU, SPRING, font, text, rrect } = M;

export const PH = 960;
export const C = {
  bg: '#0E1116', card: '#171C24', card2: '#222A35', line: '#2E3846',
  paper: '#F4F1EA', ink: '#14171C', grey: '#8A93A3', grey2: '#C9CED6', accent: '#FFD60A',
};
export const fD = (s) => font(s, 400, 'Display');
export const fU = (s, w = 600) => font(s, w, 'UI');
export const FONTS = [fD(100), fU(40, 500), fU(40, 600), fU(40, 700), fU(40, 800), fU(40, 900)];

export function shadow(ctx, blur = 30, y = 14, a = 0.45) { ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = y; }
export function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }

// small label at the top of a scene (y >= 130 keeps it clear of the Instagram bar)
export function kicker(ctx, str, t, t0) {
  const k = E.outCubic(prog(t, t0, t0 + 0.35));
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  const x = 72, y = 178 + (1 - k) * 18;
  ctx.fillStyle = C.accent; ctx.fillRect(x, y - 26, 8, 32);
  text(ctx, str.toUpperCase(), x + 24, y, fU(30, 800), C.grey2, 'left', 2);
  ctx.restore();
}

export function chip(ctx, str, cx, cy, k, on, size = 40) {
  if (k <= 0) return;
  const f = fU(size, 800); ctx.font = f;
  const w = ctx.measureText(str).width + size * 1.4, h = size * 1.8;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = on ? C.accent : C.card2; ctx.fill();
  text(ctx, str, 0, size * 0.35, f, on ? C.ink : '#FFFFFF', 'center');
  ctx.restore();
}

// headline in Archivo, letters springing in. lines: [[str, color], ...]
export function headline(ctx, lines, x, y, size, t, t0, align = 'left', lh = 1.12) {
  ctx.save(); shadow(ctx, 18, 6, 0.6);
  lines.forEach(([str, col], li) => {
    const f = fD(size); ctx.font = f;
    const w = ctx.measureText(str).width;
    const x0 = align === 'center' ? x - w / 2 : x;
    const L = M.layout(ctx, str, f, 0);
    L.glyphs.forEach((g, j) => {
      const k = springU(t, t0 + li * 0.14 + j * 0.018, SPRING.bouncy);
      if (k <= 0) return;
      M.glyph(ctx, g.ch, x0 + g.cx, y + li * size * lh + (1 - k) * 60, f, col, 1, k);
    });
  });
  ctx.restore();
}

// wrap a string to a width, returns lines
export function wrap(ctx, str, f, maxW) {
  ctx.font = f; const out = []; let cur = '';
  for (const w of str.split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
  }
  if (cur) out.push(cur); return out;
}

// pop-in scale for an element entering at t0
export const pop = (t, t0, cfg = SPRING.bouncy) => springU(t, t0, cfg);

// "exemplo" tag for illustrative numbers
export function exemplo(ctx, x, y, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= k;
  const f = fU(24, 800); ctx.font = f; const w = ctx.measureText('EXEMPLO').width + 28;
  rrect(ctx, x, y - 26, w, 36, 8); ctx.strokeStyle = C.grey; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, 'EXEMPLO', x + 14, y, f, C.grey, 'left', 2);
  ctx.restore();
}

// check mark drawn progressively (k 0..1)
export function check(ctx, x, y, s, k, col = C.ink, lw = 8) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const p = [[x - s * 0.5, y], [x - s * 0.15, y + s * 0.35], [x + s * 0.55, y - s * 0.4]];
  const l1 = Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]), l2 = Math.hypot(p[2][0] - p[1][0], p[2][1] - p[1][1]);
  const d = k * (l1 + l2);
  ctx.beginPath(); ctx.moveTo(...p[0]);
  if (d <= l1) ctx.lineTo(lerp(p[0][0], p[1][0], d / l1), lerp(p[0][1], p[1][1], d / l1));
  else { ctx.lineTo(...p[1]); const q = (d - l1) / l2; ctx.lineTo(lerp(p[1][0], p[2][0], q), lerp(p[1][1], p[2][1], q)); }
  ctx.stroke(); ctx.restore();
}

// simple generic person icon (head + shoulders)
export function person(ctx, x, y, s, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - s * 0.35, s * 0.28, 0, M.TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x, y + s * 0.38, s * 0.5, s * 0.36, 0, Math.PI, 0); ctx.fill();
}
// generic document icon
export function doc(ctx, x, y, w, h, col, line) {
  rrect(ctx, x - w / 2, y - h / 2, w, h, w * 0.08); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = line; for (let i = 0; i < 4; i++) { rrect(ctx, x - w * 0.32, y - h * 0.28 + i * h * 0.17, w * (i === 3 ? 0.4 : 0.64), h * 0.06, 3); ctx.fill(); }
}
// generic phone handset glyph
export function handset(ctx, x, y, s, col, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, -s * 0.38); ctx.quadraticCurveTo(-s * 0.62, s * 0.05, -s * 0.2, s * 0.45);
  ctx.quadraticCurveTo(s * 0.2, s * 0.8, s * 0.5, s * 0.6); ctx.lineTo(s * 0.62, s * 0.38); ctx.lineTo(s * 0.32, s * 0.16);
  ctx.lineTo(s * 0.14, s * 0.3); ctx.quadraticCurveTo(-s * 0.1, s * 0.12, -s * 0.22, -s * 0.12); ctx.lineTo(-s * 0.06, -s * 0.3);
  ctx.lineTo(-s * 0.24, -s * 0.6); ctx.closePath(); ctx.fill(); ctx.restore();
}

// role tag for simulations ("VENDEDOR" / "CLIENTE"), top right
export function role(ctx, who, t, t0) {
  const k = pop(t, t0, SPRING.snappy); if (k <= 0) return;
  const on = who === 'VENDEDOR';
  ctx.save(); ctx.translate(1008, 168); ctx.scale(k, k);
  const f = fU(28, 900); ctx.font = f; const w = ctx.measureText(who).width + 44;
  rrect(ctx, -w, -30, w, 52, 26); ctx.fillStyle = on ? C.accent : '#FFFFFF'; ctx.fill();
  text(ctx, who, -w / 2, 6, f, C.ink, 'center', 2); ctx.restore();
}

// run scenes with a whip transition. SCENES: [[name, a, b], ...]; DRAW: {name: fn(ctx,t)}
export function runScenes(ctx, u, SCENES, DRAW) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, PH);
  ctx.fillStyle = '#000'; ctx.fillRect(0, PH, W, 1920 - PH);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, PH); ctx.clip();
  SCENES.forEach(([name, a, b], i) => {
    const inK = i === 0 ? 1 : E.inOutCubic(prog(u, a - 0.15, a + 0.2));
    const outK = i === SCENES.length - 1 ? 0 : E.inOutCubic(prog(u, b - 0.15, b + 0.2));
    if (inK <= 0 || outK >= 1) return;
    ctx.save(); ctx.translate(W * (1 - inK) - W * outK, 0);
    DRAW[name](ctx, u);
    ctx.restore();
  });
  ctx.restore();
}
