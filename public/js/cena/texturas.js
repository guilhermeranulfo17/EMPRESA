// Texturas desenhadas na hora (sem baixar imagens): madeira, carpete, concreto, asfalto, grama,
// fachadas da cidade e telas. Cada uma ganha um mapa de relevo (normal map) tirado da própria
// imagem, para a luz bater de um jeito realista.

import * as THREE from 'three';

export function semente(texto) {
  let h = 2166136261;
  for (const c of String(texto)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function canvasDe(largura, altura, desenhar) {
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  desenhar(canvas.getContext('2d', { willReadFrequently: true }), largura, altura);
  return canvas;
}

export function textura(canvas, { repetir, srgb = true, anisotropia = 8 } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repetir) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repetir);
  }
  t.anisotropy = anisotropia;
  return t;
}

export function texturaDeCanvas(largura, altura, desenhar, opcoes) {
  return textura(canvasDe(largura, altura, desenhar), opcoes);
}

// Relevo a partir do brilho: o que é mais escuro (juntas, veios, fibras) fica mais fundo.
export function relevo(canvas, forca = 2, { repetir, inverter = false } = {}) {
  const w = canvas.width;
  const h = canvas.height;
  const origem = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  const altura = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const v = (origem[i * 4] * 0.299 + origem[i * 4 + 1] * 0.587 + origem[i * 4 + 2] * 0.114) / 255;
    altura[i] = inverter ? 1 - v : v;
  }
  const saida = document.createElement('canvas');
  saida.width = w;
  saida.height = h;
  const ctx = saida.getContext('2d');
  const img = ctx.createImageData(w, h);
  const a = (x, y) => altura[((y + h) % h) * w + ((x + w) % w)];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (a(x + 1, y) - a(x - 1, y)) * forca;
      const dy = (a(x, y + 1) - a(x, y - 1)) * forca;
      const inv = 1 / Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      img.data[i] = (-dx * inv * 0.5 + 0.5) * 255;
      img.data[i + 1] = (dy * inv * 0.5 + 0.5) * 255;
      img.data[i + 2] = (inv * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return textura(saida, { repetir, srgb: false });
}

// Aspereza: superfícies mais escuras (juntas) ficam mais foscas.
export function aspereza(canvas, base = 0.5, variacao = 0.3, { repetir } = {}) {
  const w = canvas.width;
  const h = canvas.height;
  const origem = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  const saida = document.createElement('canvas');
  saida.width = w;
  saida.height = h;
  const ctx = saida.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const v = (origem[i * 4] + origem[i * 4 + 1] + origem[i * 4 + 2]) / 765;
    const r = Math.max(0, Math.min(1, base + (0.5 - v) * variacao * 2)) * 255;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = r;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return textura(saida, { repetir, srgb: false });
}

function ruido(ctx, w, h, quantidade, alfa, r, tamanho = 2) {
  for (let i = 0; i < quantidade; i++) {
    const claro = r() < 0.5;
    ctx.fillStyle = claro ? `rgba(255,255,255,${r() * alfa})` : `rgba(0,0,0,${r() * alfa})`;
    ctx.fillRect(r() * w, r() * h, tamanho, tamanho);
  }
}

// ---------- piso de madeira (tábuas de carvalho) ----------
export function desenharMadeira(ctx, w, h) {
  const r = semente('piso de madeira');
  const linhas = 8;
  const alt = h / linhas;
  for (let l = 0; l < linhas; l++) {
    let x = r() * w;
    let usado = 0;
    while (usado < w) {
      let comp = 300 + r() * 380;
      if (w - usado - comp < 200) comp = w - usado;
      const tom = 0.84 + r() * 0.24;
      const base = [178 * tom, 136 * tom, 94 * tom].map(Math.round);
      const veios = Array.from({ length: 22 }, () => ({
        y: r() * alt, a: 0.03 + r() * 0.1, larg: 0.6 + r() * 1.8, onda: 30 + r() * 80, fase: r() * 6, amp: 0.8 + r() * 3,
      }));
      const nos = r() < 0.35 ? [{ x: r() * comp, y: alt * (0.25 + r() * 0.5), rx: 6 + r() * 10 }] : [];
      for (const dx of [0, -w]) {
        const x0 = (x % w) + dx;
        const g = ctx.createLinearGradient(x0, 0, x0 + comp, 0);
        g.addColorStop(0, `rgb(${base})`);
        g.addColorStop(0.5, `rgb(${base.map((v) => Math.round(v * (0.95 + r() * 0.1)))})`);
        g.addColorStop(1, `rgb(${base})`);
        ctx.fillStyle = g;
        ctx.fillRect(x0, l * alt, comp, alt);
        for (const v of veios) {
          ctx.strokeStyle = `rgba(88, 52, 28, ${v.a})`;
          ctx.lineWidth = v.larg;
          ctx.beginPath();
          for (let px = 0; px <= comp; px += 12) ctx.lineTo(x0 + px, l * alt + v.y + Math.sin(px / v.onda + v.fase) * v.amp);
          ctx.stroke();
        }
        for (const n of nos) {
          const rg = ctx.createRadialGradient(x0 + n.x, l * alt + n.y, 1, x0 + n.x, l * alt + n.y, n.rx);
          rg.addColorStop(0, 'rgba(70,40,20,0.55)');
          rg.addColorStop(1, 'rgba(70,40,20,0)');
          ctx.fillStyle = rg;
          ctx.fillRect(x0 + n.x - n.rx, l * alt + n.y - n.rx, n.rx * 2, n.rx * 2);
        }
        ctx.fillStyle = 'rgba(40, 24, 12, 0.7)';
        ctx.fillRect(x0, l * alt, 3, alt);
      }
      x += comp;
      usado += comp;
    }
    ctx.fillStyle = 'rgba(40, 24, 12, 0.65)';
    ctx.fillRect(0, l * alt, w, 3);
  }
  ruido(ctx, w, h, 30000, 0.04, r, 1);
}

export function desenharTapete(ctx, w, h, cor, nome, textoEmBaixo) {
  const base = new THREE.Color(cor).lerp(new THREE.Color('#5d636d'), 0.72);
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, w, h);
  const r = semente(nome);
  // fibras do carpete em laçada
  for (let y = 0; y < h; y += 3) {
    for (let x = (y / 3) % 2 ? 0 : 1.5; x < w; x += 3) {
      const v = r();
      ctx.fillStyle = v < 0.5 ? `rgba(0,0,0,${0.05 + v * 0.1})` : `rgba(255,255,255,${(v - 0.5) * 0.12})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  const tamanho = Math.round(Math.min(h * 0.12, 54));
  ctx.font = `700 ${tamanho}px "Familjen Grotesk", "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.textBaseline = textoEmBaixo ? 'bottom' : 'top';
  const texto = nome.toUpperCase().split('').join(String.fromCharCode(8202));
  ctx.fillText(texto, 40, textoEmBaixo ? h - 34 : 34);
  ctx.fillStyle = cor;
  ctx.fillRect(40, textoEmBaixo ? h - 34 - tamanho - 16 : 34 + tamanho + 10, 90, 8);
}

export function desenharConcreto(ctx, w, h, { tom = 200, placas = 4, nome = 'concreto' } = {}) {
  const r = semente(nome);
  ctx.fillStyle = `rgb(${tom},${tom - 3},${tom - 9})`;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const x = r() * w, y = r() * h, raio = 40 + r() * 140;
    const g = ctx.createRadialGradient(x, y, 0, x, y, raio);
    const c = r() < 0.5 ? '0,0,0' : '255,255,255';
    g.addColorStop(0, `rgba(${c},${r() * 0.06})`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2);
  }
  ruido(ctx, w, h, (w * h) / 6, 0.08, r, 1.5);
  if (placas) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    const passo = w / placas;
    for (let i = 0; i <= placas; i++) {
      ctx.fillRect(i * passo - 1.5, 0, 3, h);
      ctx.fillRect(0, i * passo - 1.5, w, 3);
    }
  }
}

export function desenharAsfalto(ctx, w, h) {
  const r = semente('asfalto');
  ctx.fillStyle = '#4a4d52';
  ctx.fillRect(0, 0, w, h);
  ruido(ctx, w, h, (w * h) / 3, 0.12, r, 1.5);
  for (let i = 0; i < 25; i++) {
    const x = r() * w, y = r() * h, raio = 30 + r() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, raio);
    g.addColorStop(0, `rgba(0,0,0,${0.04 + r() * 0.08})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2);
  }
  // faixas: bordas contínuas e tracejado central
  ctx.fillStyle = 'rgba(238,234,220,0.85)';
  for (let x = 0; x < w; x += 128) ctx.fillRect(x + 22, h / 2 - 4, 64, 8);
  ctx.fillStyle = 'rgba(238,234,220,0.7)';
  ctx.fillRect(0, 14, w, 6);
  ctx.fillRect(0, h - 20, w, 6);
}

export function desenharGrama(ctx, w, h) {
  const r = semente('grama');
  ctx.fillStyle = '#5d7d3f';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    const x = r() * w, y = r() * h, raio = 40 + r() * 160;
    const g = ctx.createRadialGradient(x, y, 0, x, y, raio);
    g.addColorStop(0, r() < 0.5 ? 'rgba(120,140,60,0.25)' : 'rgba(40,70,30,0.25)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2);
  }
  for (let i = 0; i < (w * h) / 5; i++) {
    const v = r();
    ctx.strokeStyle = v < 0.5 ? `rgba(30,55,20,${0.2 + r() * 0.3})` : `rgba(150,175,90,${0.15 + r() * 0.25})`;
    ctx.lineWidth = 1;
    const x = r() * w, y = r() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 3, y - 2 - r() * 4);
    ctx.stroke();
  }
}

// Fachada de prédio da vizinhança: janelas em grade, algumas acesas à noite.
export function desenharFachadaCidade(ctx, w, h, { nome, noite, tom }) {
  const r = semente(nome);
  ctx.fillStyle = noite ? '#0d1016' : `rgb(${tom[0]},${tom[1]},${tom[2]})`;
  ctx.fillRect(0, 0, w, h);
  const colunas = 6;
  const linhas = 16;
  const cw = w / colunas;
  const lh = h / linhas;
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      const x = c * cw + cw * 0.15;
      const y = l * lh + lh * 0.2;
      if (noite) {
        const aceso = r() < 0.36;
        ctx.fillStyle = aceso ? `rgba(255,${205 + r() * 40},${130 + r() * 60},${0.7 + r() * 0.3})` : 'rgba(0,0,0,0)';
      } else {
        const v = 60 + r() * 50;
        ctx.fillStyle = `rgb(${v * 0.75},${v * 0.9},${v * 1.1})`;
      }
      ctx.fillRect(x, y, cw * 0.7, lh * 0.6);
    }
  }
}

export function desenharTela(ctx, w, h, cor, variante) {
  const r = semente(`tela ${cor} ${variante}`);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#121821');
  g.addColorStop(1, '#0c1016');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = cor;
  ctx.fillRect(0, 0, w, 14);
  ctx.fillStyle = '#1b2430';
  ctx.fillRect(0, 14, 46, h - 14);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(8, 26 + i * 18, 30, 6);
  }
  if (variante === 0) {
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = `rgba(230,236,245,${0.35 + r() * 0.4})`;
      ctx.fillRect(58, 26 + i * 12, 60 + r() * 120, 5);
    }
    ctx.strokeStyle = cor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= 180; x += 12) ctx.lineTo(62 + x, h - 20 - r() * 40 - x * 0.12);
    ctx.stroke();
  } else if (variante === 1) {
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = cor;
      const alt = 20 + r() * 70;
      ctx.fillRect(62 + i * 20, h - 14 - alt, 12, alt);
    }
    ctx.fillStyle = 'rgba(230,236,245,0.6)';
    ctx.fillRect(58, 24, 140, 6);
  } else {
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = i % 3 ? 'rgba(230,236,245,0.18)' : 'rgba(230,236,245,0.32)';
      ctx.fillRect(56, 22 + i * 15, 190, 12);
      ctx.fillStyle = cor;
      ctx.fillRect(60, 26 + i * 15, 4, 4);
    }
  }
}

export function desenharPainel(ctx, w, h, { titulo, total, ultimas, destaque, corMarca = '#D98A1E' }) {
  const fundo = ctx.createLinearGradient(0, 0, w, h);
  fundo.addColorStop(0, '#0f141c');
  fundo.addColorStop(1, '#1a2230');
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = corMarca;
  ctx.fillRect(56, 60, 36, 36);
  ctx.fillStyle = '#e8edf4';
  ctx.font = '700 46px "Familjen Grotesk", "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(titulo, 112, 80);
  if (total != null) {
    ctx.font = '500 28px "IBM Plex Mono", Menlo, monospace';
    ctx.fillStyle = '#8fa0b5';
    ctx.fillText(total, w - 56 - ctx.measureText(total).width, 80);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(56, 128, w - 112, 2);
  let y = 180;
  if (destaque) {
    ctx.font = '700 120px "Familjen Grotesk", "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = corMarca;
    ctx.fillText(destaque, 56, 260);
    y = 380;
  }
  for (const m of ultimas) {
    if (m.cor) {
      ctx.fillStyle = m.cor;
      ctx.beginPath();
      ctx.arc(66, y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.font = '600 30px "IBM Plex Sans", "Segoe UI", sans-serif';
    ctx.fillStyle = '#e8edf4';
    ctx.fillText(cortar(ctx, m.cabecalho, w - 148), 92, y);
    if (m.texto) {
      ctx.font = '400 27px "IBM Plex Sans", "Segoe UI", sans-serif';
      ctx.fillStyle = '#aab6c6';
      ctx.fillText(cortar(ctx, m.texto.replace(/\s+/g, ' '), w - 148), 92, y + 40);
    }
    y += m.texto ? 100 : 60;
    if (y > h - 30) break;
  }
}

export function cortar(ctx, texto, limite) {
  if (ctx.measureText(texto).width <= limite) return texto;
  let t = texto;
  while (t.length > 4 && ctx.measureText(`${t}…`).width > limite) t = t.slice(0, -2);
  return `${t.trimEnd()}…`;
}

// Folhagem para árvores e plantas: um cacho de folhas com transparência.
export function desenharFolhas(ctx, w, h, { escuro = '#2f5a2a', claro = '#6c9c48', nome = 'folhas' } = {}) {
  const r = semente(nome);
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const x = w * (0.15 + r() * 0.7);
    const y = h * (0.12 + r() * 0.76);
    const tam = w * (0.05 + r() * 0.06);
    const ang = r() * Math.PI * 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(-tam, 0, tam, 0);
    g.addColorStop(0, escuro);
    g.addColorStop(1, r() < 0.5 ? claro : escuro);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, tam, tam * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,40,15,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-tam, 0);
    ctx.lineTo(tam, 0);
    ctx.stroke();
    ctx.restore();
  }
}
