// Escritório em 3D (Three.js). Cada agente é uma pessoa com mesa própria: trabalha sentado,
// levanta, anda até quem recebe a mensagem, conversa e volta para a mesa.
// A página carrega este módulo só quando o navegador tem WebGL; se falhar, a planta 2D continua valendo.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------- medidas do andar (metros) ----------
const PASSO_MESA = 1.9;
const VAO_SETOR = 1.4;
const Z_MESA = 4.35;
const Z_ASSENTO = 3.8;
const Z_PASSAGEM = 2.75;
const FUNDO = 6.1;
const X_ESQ = -16.4;
const X_DIR = 13.4;
const X_FILAS = -10.3;
const X_SALA_CEO = -12.0;
const ALTURA_PAREDE = 3.0;
const VELOCIDADE_ANDAR = 1.25;
const PASSADA = 0.75;

const PELES = ['#f3cfb0', '#e6b793', '#d29b76', '#b57b56', '#8f5a3c', '#65402a'];
const CABELOS = ['#1d1510', '#2e1f16', '#4a3020', '#6b4527', '#9a6b3f', '#c49a63', '#2a2a2c', '#77706a'];
const CAMISAS_NEUTRAS = ['#f4f4f2', '#dfe6ee', '#9fb3c8', '#2f3a4a', '#e8dccb', '#b9c2b0', '#3c3f45'];
const CALCAS = ['#1f2a3d', '#2b2d31', '#3a4a63', '#6e5f4b', '#44484f', '#23262b'];
const SAPATOS = ['#1b1b1c', '#3a2a1f', '#e9e9e7', '#5a4332'];

const suave = (k) => k * k * (3 - 2 * k);
const angulo = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const reduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function semente(texto) {
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

// ---------- texturas desenhadas na hora ----------
function texturaDeCanvas(largura, altura, desenhar, { repetir, srgb = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  desenhar(canvas.getContext('2d'), largura, altura);
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repetir) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repetir);
  }
  t.anisotropy = 8;
  return t;
}

function desenharMadeira(ctx, w, h) {
  const r = semente('piso de madeira');
  const linhas = 8;
  const alt = h / linhas;
  const tabua = (x, y, comp, cor, veios) => {
    for (const dx of [0, -w, w]) {
      ctx.fillStyle = cor;
      ctx.fillRect(x + dx, y, comp, alt);
      for (const v of veios) {
        ctx.strokeStyle = v.cor;
        ctx.lineWidth = v.largura;
        ctx.beginPath();
        for (let px = 0; px <= comp; px += 16) ctx.lineTo(x + dx + px, y + v.y + Math.sin(px / v.onda + v.fase) * v.amp);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(46, 28, 16, 0.55)';
      ctx.fillRect(x + dx, y, 2, alt);
    }
  };
  for (let l = 0; l < linhas; l++) {
    let x = r() * w;
    let usado = 0;
    while (usado < w) {
      let comp = 240 + r() * 320;
      if (w - usado - comp < 160) comp = w - usado;
      const tom = 0.86 + r() * 0.22;
      const cor = `rgb(${Math.round(176 * tom)}, ${Math.round(132 * tom)}, ${Math.round(90 * tom)})`;
      const veios = Array.from({ length: 12 }, () => ({
        y: r() * alt, cor: `rgba(92, 56, 30, ${0.04 + r() * 0.09})`, largura: 0.8 + r() * 1.6,
        onda: 24 + r() * 50, fase: r() * 6, amp: 1 + r() * 2.5,
      }));
      tabua(x % w, l * alt, comp, cor, veios);
      x += comp;
      usado += comp;
    }
    ctx.fillStyle = 'rgba(46, 28, 16, 0.5)';
    ctx.fillRect(0, l * alt, w, 2);
  }
}

function desenharCidade(ctx, w, h, escuro) {
  const r = semente('horizonte');
  const ceu = ctx.createLinearGradient(0, 0, 0, h);
  if (escuro) {
    ceu.addColorStop(0, '#070b18');
    ceu.addColorStop(0.7, '#1a2340');
    ceu.addColorStop(1, '#39406a');
  } else {
    ceu.addColorStop(0, '#7fb2e6');
    ceu.addColorStop(0.65, '#cfe2f3');
    ceu.addColorStop(1, '#eef3f6');
  }
  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, w, h);
  if (!escuro) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 9; i++) {
      const cx = r() * w, cy = h * (0.08 + r() * 0.3), rx = 80 + r() * 160;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, rx * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const camada of [0, 1]) {
    let x = -20;
    while (x < w) {
      const larg = 50 + r() * 130;
      const alt = h * (camada ? 0.18 + r() * 0.34 : 0.3 + r() * 0.42);
      const y = h - alt;
      const tom = camada ? (escuro ? 22 : 150) : escuro ? 34 : 176;
      const azul = escuro ? 12 : 16;
      ctx.fillStyle = `rgb(${tom}, ${tom + 6}, ${tom + azul})`;
      ctx.fillRect(x, y, larg, alt);
      for (let jy = y + 10; jy < h - 8; jy += 14) {
        for (let jx = x + 6; jx < x + larg - 8; jx += 12) {
          if (escuro) {
            if (r() < 0.32) {
              ctx.fillStyle = `rgba(255, ${200 + r() * 40}, ${120 + r() * 60}, ${0.55 + r() * 0.4})`;
              ctx.fillRect(jx, jy, 6, 8);
            }
          } else {
            ctx.fillStyle = `rgba(255,255,255,${0.12 + r() * 0.18})`;
            ctx.fillRect(jx, jy, 6, 8);
          }
        }
      }
      x += larg + r() * 12;
    }
  }
}

function desenharTapete(ctx, w, h, cor, nome, textoEmBaixo) {
  const base = new THREE.Color(cor).lerp(new THREE.Color('#5a616c'), 0.74);
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, w, h);
  const r = semente(nome);
  for (let i = 0; i < (w * h) / 5; i++) {
    const claro = r() < 0.5;
    ctx.fillStyle = claro ? `rgba(255,255,255,${r() * 0.05})` : `rgba(0,0,0,${r() * 0.06})`;
    ctx.fillRect(r() * w, r() * h, 2, 2);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, w - 28, h - 28);
  const tamanho = Math.round(Math.min(h * 0.13, 58));
  ctx.font = `700 ${tamanho}px "Familjen Grotesk", "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.textBaseline = textoEmBaixo ? 'bottom' : 'top';
  const texto = nome.toUpperCase().split('').join(String.fromCharCode(8202));
  ctx.fillText(texto, 40, textoEmBaixo ? h - 34 : 34);
  ctx.fillStyle = cor;
  ctx.fillRect(40, textoEmBaixo ? h - 34 - tamanho - 16 : 34 + tamanho + 10, 90, 8);
}

function desenharTela(ctx, w, h, cor, variante) {
  const r = semente(`tela ${cor} ${variante}`);
  ctx.fillStyle = '#0f141b';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = cor;
  ctx.fillRect(0, 0, w, 14);
  ctx.fillStyle = '#1b2430';
  ctx.fillRect(0, 14, 46, h - 14);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(8, 26 + i * 18, 30, 6);
  }
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = `rgba(230,236,245,${0.35 + r() * 0.4})`;
    ctx.fillRect(58, 26 + i * 12, 60 + r() * 120, 5);
  }
  ctx.strokeStyle = cor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= 180; x += 12) ctx.lineTo(62 + x, h - 20 - r() * 40 - x * 0.12);
  ctx.stroke();
}

function desenharPainel(ctx, w, h, { total, ultimas }) {
  const fundo = ctx.createLinearGradient(0, 0, w, h);
  fundo.addColorStop(0, '#0f141c');
  fundo.addColorStop(1, '#1a2230');
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#D98A1E';
  ctx.fillRect(56, 60, 36, 36);
  ctx.fillStyle = '#e8edf4';
  ctx.font = '700 46px "Familjen Grotesk", "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Caixa de comunicação', 112, 80);
  ctx.font = '500 28px "IBM Plex Mono", Menlo, monospace';
  ctx.fillStyle = '#8fa0b5';
  const rotulo = `${total} ${total === 1 ? 'mensagem' : 'mensagens'}`;
  ctx.fillText(rotulo, w - 56 - ctx.measureText(rotulo).width, 80);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(56, 128, w - 112, 2);
  let y = 180;
  if (!ultimas.length) {
    ctx.font = '400 30px "IBM Plex Sans", "Segoe UI", sans-serif';
    ctx.fillStyle = '#8fa0b5';
    ctx.fillText('Nenhuma mensagem ainda.', 56, y);
  }
  for (const m of ultimas) {
    ctx.fillStyle = m.cor;
    ctx.beginPath();
    ctx.arc(66, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '600 30px "IBM Plex Sans", "Segoe UI", sans-serif';
    ctx.fillStyle = '#e8edf4';
    ctx.fillText(m.cabecalho, 92, y);
    ctx.font = '400 27px "IBM Plex Sans", "Segoe UI", sans-serif';
    ctx.fillStyle = '#aab6c6';
    let texto = m.texto.replace(/\s+/g, ' ');
    const limite = w - 148;
    if (ctx.measureText(texto).width > limite) {
      while (texto.length > 4 && ctx.measureText(`${texto}…`).width > limite) texto = texto.slice(0, -2);
      texto = `${texto.trimEnd()}…`;
    }
    ctx.fillText(texto, 92, y + 40);
    y += 100;
  }
}

// ---------- materiais ----------
function criarMateriais() {
  const pad = (cor, rough = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: rough, ...extra });
  return {
    parede: pad('#ebe7e1', 0.93),
    rodape: pad('#d6d1c9', 0.8),
    laje: pad('#b8b4ad', 0.95),
    chao: pad('#c9c5bd', 1),
    vidro: new THREE.MeshStandardMaterial({ color: '#dcebf2', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }),
    vidroFosco: new THREE.MeshStandardMaterial({ color: '#f2f5f6', roughness: 0.55, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide }),
    aluminio: pad('#8f969e', 0.35, { metalness: 0.85 }),
    grafite: pad('#2a2d33', 0.5, { metalness: 0.4 }),
    preto: pad('#16181c', 0.35, { metalness: 0.3 }),
    carvalho: pad('#c79f76', 0.55),
    branco: pad('#f2f0eb', 0.5),
    tecido: pad('#30353c', 0.95),
    sofa: pad('#6f7f8f', 0.95),
    teclado: pad('#d8dadd', 0.6),
    papel: pad('#fbfbf8', 0.9),
    folha: pad('#3d7a3a', 0.7, { side: THREE.DoubleSide }),
    folha2: pad('#2d6a35', 0.7, { side: THREE.DoubleSide }),
    vaso: pad('#d9d3c7', 0.85),
    terra: pad('#3a2b20', 1),
    pedra: pad('#3b3d42', 0.35),
    telaDesligada: pad('#0b0d10', 0.25, { metalness: 0.3 }),
  };
}

// ---------- pessoas ----------
function criarGeometrias() {
  const perna = new THREE.BoxGeometry(0.05, 0.03, 0.34).translate(0, 0.07, 0.17);
  const rodinha = new THREE.SphereGeometry(0.03, 8, 6).translate(0, 0.03, 0.33);
  const estrela = mergeGeometries(
    Array.from({ length: 5 }, (_, i) => mergeGeometries([perna.clone(), rodinha.clone()]).rotateY((i * Math.PI * 2) / 5)),
  );
  return {
    pelve: new THREE.SphereGeometry(0.16, 20, 14),
    tronco: new THREE.CapsuleGeometry(0.155, 0.3, 8, 18),
    pescoco: new THREE.CylinderGeometry(0.046, 0.052, 0.12, 14),
    cabeca: new THREE.SphereGeometry(0.112, 28, 20),
    calota: new THREE.SphereGeometry(0.121, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.52),
    cabeloLongo: new THREE.CapsuleGeometry(0.1, 0.2, 6, 14),
    coque: new THREE.SphereGeometry(0.058, 14, 10),
    cacho: new THREE.SphereGeometry(0.05, 10, 8),
    olho: new THREE.SphereGeometry(0.0125, 10, 8),
    nariz: new THREE.SphereGeometry(0.019, 10, 8),
    orelha: new THREE.SphereGeometry(0.026, 10, 8),
    aro: new THREE.TorusGeometry(0.026, 0.004, 6, 18),
    braco: new THREE.CapsuleGeometry(0.047, 0.2, 6, 12),
    antebraco: new THREE.CapsuleGeometry(0.041, 0.19, 6, 12),
    mao: new THREE.SphereGeometry(0.043, 12, 10),
    coxa: new THREE.CapsuleGeometry(0.073, 0.3, 6, 14),
    canela: new THREE.CapsuleGeometry(0.057, 0.32, 6, 12),
    sapato: new RoundedBoxGeometry(0.1, 0.075, 0.26, 3, 0.03),
    anel: new THREE.RingGeometry(0.42, 0.52, 40).rotateX(-Math.PI / 2),
    estrela,
    envelope: new THREE.BoxGeometry(0.26, 0.02, 0.18),
  };
}

const POSES = {
  em_pe: { y: 0.94, coxa: 0, joelho: 0.03, abertura: 0.02, ombroX: 0.06, ombroZ: 0.08, cotovelo: -0.18, troncoX: 0, cabecaX: 0 },
  sentado: { y: 0.57, coxa: -1.5, joelho: 1.47, abertura: 0.07, ombroX: -0.28, ombroZ: 0.1, cotovelo: -1.3, troncoX: 0.08, cabecaX: 0.1 },
};

function misturarPose(a, b, k) {
  const p = {};
  for (const chave of Object.keys(a)) p[chave] = a[chave] + (b[chave] - a[chave]) * k;
  return p;
}

class Pessoa {
  constructor(agente, setor, casa, cena) {
    this.id = agente.id;
    this.agente = agente;
    this.setor = setor;
    this.casa = casa;
    this.cena = cena;
    this.estado = 'sentado';
    this.status = agente.status;
    this.fila = [];
    this.caminho = [];
    this.fase = 0;
    this.tempo = 0;
    this.olhar = null;
    this.juntas = null;
    this.construir();
    this.raiz.position.set(casa.assento.x, 0, casa.assento.z);
    this.raiz.rotation.y = casa.rumo;
    this.poseAtual = { ...POSES.sentado };
    this.alvoJuntas = null;
  }

  construir() {
    const { G, cena } = this;
    const r = semente(this.id);
    const escolha = (lista) => lista[Math.floor(r() * lista.length)];
    const aparencia = this.agente.aparencia ?? {};
    const pele = aparencia.pele ?? escolha(PELES);
    const corCabelo = aparencia.corCabelo ?? escolha(CABELOS);
    const estilo = aparencia.cabelo ?? escolha(['curto', 'curto', 'longo', 'coque', 'cacheado', 'raspado', 'longo', 'curto']);
    const corSetor = new THREE.Color(this.setor.cor);
    const camisa = aparencia.camisa ?? (r() < 0.5
      ? `#${corSetor.clone().lerp(new THREE.Color(r() < 0.5 ? '#ffffff' : '#20242b'), 0.2 + r() * 0.35).getHexString()}`
      : escolha(CAMISAS_NEUTRAS));
    const calca = escolha(CALCAS);
    const sapato = escolha(SAPATOS);
    const mangaLonga = r() < 0.6;
    const oculos = r() < 0.28;
    this.altura = (0.94 + r() * 0.08);

    const mat = (cor, rough) => cena.material(cor, rough);
    const mPele = mat(pele, 0.62);
    const mCabelo = mat(corCabelo, 0.75);
    const mCamisa = mat(camisa, 0.88);
    const mCalca = mat(calca, 0.9);
    const mSapato = mat(sapato, 0.5);
    const mOlho = mat('#1a1410', 0.3);

    const g = cena.G;
    const malhas = [];
    const malha = (geo, material, pai, pos = [0, 0, 0], escala, sombra = true) => {
      const m = new THREE.Mesh(geo, material);
      m.position.set(...pos);
      if (escala) m.scale.set(...escala);
      m.castShadow = sombra;
      m.userData.agente = this.id;
      pai.add(m);
      malhas.push(m);
      return m;
    };
    const grupo = (pai, x, y, z) => {
      const n = new THREE.Group();
      n.position.set(x, y, z);
      pai.add(n);
      return n;
    };

    const raiz = new THREE.Group();
    raiz.scale.setScalar(this.altura);
    const quadril = grupo(raiz, 0, POSES.sentado.y, 0);
    malha(g.pelve, mCalca, quadril, [0, 0.02, 0], [1.05, 0.62, 0.76]);
    const tronco = grupo(quadril, 0, 0.04, 0);
    malha(g.tronco, mCamisa, tronco, [0, 0.3, 0], [1.13, 1, 0.66]);
    malha(g.pescoco, mPele, tronco, [0, 0.645, 0]);
    const cabeca = grupo(tronco, 0, 0.69, 0);
    malha(g.cabeca, mPele, cabeca, [0, 0.11, 0.005], [0.93, 1.08, 1]);
    for (const lado of [-1, 1]) {
      malha(g.olho, mOlho, cabeca, [lado * 0.037, 0.125, 0.1], null, false);
      malha(g.orelha, mPele, cabeca, [lado * 0.104, 0.11, -0.005], [0.6, 1, 0.9], false);
      if (oculos) {
        const aro = malha(g.aro, cena.M.preto, cabeca, [lado * 0.038, 0.125, 0.112], null, false);
        aro.scale.set(1, 0.8, 1);
      }
    }
    malha(g.nariz, mPele, cabeca, [0, 0.095, 0.112], [0.8, 1, 1], false);

    const calota = malha(g.calota, mCabelo, cabeca, [0, 0.115, -0.004], [0.97, 1.1, 1.04]);
    calota.rotation.x = -0.38;
    if (estilo === 'longo') malha(g.cabeloLongo, mCabelo, cabeca, [0, 0.02, -0.06], [1.08, 1, 0.55]);
    if (estilo === 'coque') malha(g.coque, mCabelo, cabeca, [0, 0.215, -0.085]);
    if (estilo === 'cacheado') {
      calota.scale.multiplyScalar(1.1);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        malha(g.cacho, mCabelo, cabeca, [Math.cos(a) * 0.085, 0.2 + Math.sin(i) * 0.02, Math.sin(a) * 0.075 - 0.02]);
      }
    }
    if (estilo === 'raspado') calota.scale.set(0.93, 1.02, 0.97);

    const ombros = [];
    const cotovelos = [];
    const pernas = [];
    const joelhos = [];
    for (const lado of [-1, 1]) {
      const ombro = grupo(tronco, lado * 0.205, 0.53, 0);
      malha(g.braco, mCamisa, ombro, [0, -0.145, 0]);
      const cotovelo = grupo(ombro, 0, -0.29, 0);
      malha(g.antebraco, mangaLonga ? mCamisa : mPele, cotovelo, [0, -0.125, 0]);
      malha(g.mao, mPele, cotovelo, [0, -0.28, 0.005], [0.85, 1.1, 0.7]);
      ombros.push(ombro);
      cotovelos.push(cotovelo);
      const perna = grupo(quadril, lado * 0.092, -0.03, 0);
      malha(g.coxa, mCalca, perna, [0, -0.21, 0]);
      const joelho = grupo(perna, 0, -0.43, 0);
      malha(g.canela, mCalca, joelho, [0, -0.2, 0]);
      malha(g.sapato, mSapato, joelho, [0, -0.445, 0.045]);
      pernas.push(perna);
      joelhos.push(joelho);
    }

    this.raiz = raiz;
    this.malhas = malhas;
    this.juntas = { quadril, tronco, cabeca, ombros, cotovelos, pernas, joelhos };
    this.valores = null;
  }

  get G() {
    return this.cena.G;
  }

  // Posição da cabeça no mundo, para balões e rótulos.
  topo(alvo) {
    return alvo.set(this.raiz.position.x, this.raiz.position.y + this.juntas.quadril.position.y * this.altura + 0.95 * this.altura, this.raiz.position.z);
  }

  visitar(destino) {
    if (this.estado !== 'sentado') {
      this.fila = [destino];
      return false;
    }
    this.destino = destino;
    this.estado = 'levantando';
    this.tempo = 0;
    return true;
  }

  iniciarCaminho(pontos, aoChegar) {
    this.caminho = pontos.map((p) => ({ x: p.x, z: p.z }));
    this.aoChegar = aoChegar;
    this.estado = 'andando';
  }

  atualizar(dt, t, fator) {
    const casa = this.casa;
    const pos = this.raiz.position;
    let base;
    let andando = false;

    if (this.estado === 'levantando' || this.estado === 'sentando') {
      this.tempo += dt * Math.min(fator, 2);
      const k = suave(Math.min(1, this.tempo / 0.9));
      const de = this.estado === 'levantando' ? casa.assento : casa.passagem;
      const para = this.estado === 'levantando' ? casa.passagem : casa.assento;
      pos.x = de.x + (para.x - de.x) * k;
      pos.z = de.z + (para.z - de.z) * k;
      this.raiz.rotation.y = angulo(this.raiz.rotation.y + angulo(casa.rumo - this.raiz.rotation.y) * Math.min(1, dt * 6));
      base = this.estado === 'levantando' ? misturarPose(POSES.sentado, POSES.em_pe, k) : misturarPose(POSES.em_pe, POSES.sentado, k);
      casa.cadeira.position.z = casa.cadeiraZ - 0.3 * (this.estado === 'levantando' ? k : 1 - k);
      if (k >= 1) {
        if (this.estado === 'levantando') {
          const destino = this.destino;
          this.iniciarCaminho(this.cena.rota(casa, destino), () => this.chegou(destino));
        } else {
          this.estado = 'sentado';
          this.raiz.rotation.y = casa.rumo;
          if (this.fila.length) this.visitar(this.fila.shift());
        }
      }
    } else if (this.estado === 'andando') {
      andando = this.mover(dt, fator);
      base = POSES.em_pe;
    } else if (this.estado === 'conversando') {
      this.tempo -= dt * fator;
      this.raiz.rotation.y = angulo(this.raiz.rotation.y + angulo(this.destino.rumo - this.raiz.rotation.y) * Math.min(1, dt * 5));
      base = POSES.em_pe;
      if (this.tempo <= 0) this.voltar();
    } else {
      base = POSES.sentado;
    }

    // Ângulos-alvo das juntas: pose de base + o que a pessoa está fazendo.
    const alvo = {
      y: base.y, troncoX: base.troncoX, troncoY: 0, cabecaX: base.cabecaX, cabecaY: 0,
      coxa: [base.coxa, base.coxa], joelho: [base.joelho, base.joelho], abertura: base.abertura,
      ombroX: [base.ombroX, base.ombroX], ombroZ: base.ombroZ, cotovelo: [base.cotovelo, base.cotovelo],
    };
    if (andando) {
      for (let e = 0; e < 2; e++) {
        const f = this.fase + e * Math.PI;
        alvo.coxa[e] = -Math.sin(f) * 0.44;
        alvo.joelho[e] = 0.08 + Math.max(0, Math.cos(f)) * 0.85;
        alvo.ombroX[e] = Math.sin(f) * 0.36;
        alvo.cotovelo[e] = -0.28 - Math.max(0, -Math.sin(f)) * 0.3;
      }
      alvo.y = 0.925 + Math.abs(Math.cos(this.fase)) * 0.028;
      alvo.troncoY = Math.sin(this.fase) * 0.07;
      alvo.troncoX = 0.03;
    } else if (this.estado === 'conversando') {
      alvo.ombroX[1] = -0.5 + Math.sin(t * 2.3) * 0.22;
      alvo.cotovelo[1] = -1.25 + Math.sin(t * 3.1) * 0.25;
      alvo.ombroX[0] = 0.02 + Math.sin(t * 1.7) * 0.05;
      alvo.cabecaX = Math.sin(t * 2.6) * 0.07;
      alvo.y = 0.94 + Math.sin(t * 1.3) * 0.004;
    } else if (this.estado === 'sentado') {
      if (this.status === 'pensando') {
        alvo.ombroX[1] = -1.15;
        alvo.cotovelo[1] = -2.15;
        alvo.cabecaX = 0.02 + Math.sin(t * 0.8) * 0.04;
        alvo.troncoX = 0.02;
      } else if (this.status === 'falando') {
        alvo.ombroX[1] = -0.7 + Math.sin(t * 2.4) * 0.18;
        alvo.cotovelo[1] = -1.3 + Math.sin(t * 3.3) * 0.2;
        alvo.cabecaX = Math.sin(t * 2.8) * 0.06;
      } else if (!reduzido()) {
        for (let e = 0; e < 2; e++) {
          alvo.cotovelo[e] += Math.sin(t * 13 + e * 1.7) * 0.035;
          alvo.ombroX[e] += Math.sin(t * 8.5 + e) * 0.02;
        }
        alvo.cabecaX = 0.12 + Math.sin(t * 0.6 + this.altura * 9) * 0.03;
      }
      alvo.troncoY = Math.sin(t * 0.35 + this.altura * 20) * 0.05;
    }
    if (this.olhar) {
      const rel = angulo(Math.atan2(this.olhar.x - pos.x, this.olhar.z - pos.z) - this.raiz.rotation.y);
      const lim = Math.max(-1.25, Math.min(1.25, rel));
      alvo.cabecaY = lim * 0.65;
      alvo.troncoY = lim * 0.35;
    }

    // Aproxima as juntas do alvo (transições sem trancos).
    const taxa = Math.min(1, dt * (andando ? 16 : 7));
    if (!this.valores) this.valores = JSON.parse(JSON.stringify(alvo));
    const v = this.valores;
    const chegar = (atual, desejado) => atual + (desejado - atual) * taxa;
    for (const chave of ['y', 'troncoX', 'troncoY', 'cabecaX', 'cabecaY', 'abertura', 'ombroZ']) v[chave] = chegar(v[chave], alvo[chave]);
    for (const chave of ['coxa', 'joelho', 'ombroX', 'cotovelo']) for (let e = 0; e < 2; e++) v[chave][e] = chegar(v[chave][e], alvo[chave][e]);
    if (this.estado === 'levantando' || this.estado === 'sentando') {
      v.y = alvo.y;
      for (const chave of ['coxa', 'joelho']) for (let e = 0; e < 2; e++) v[chave][e] = alvo[chave][e];
    }

    const j = this.juntas;
    j.quadril.position.y = v.y;
    j.tronco.rotation.x = v.troncoX;
    j.tronco.rotation.y = v.troncoY;
    j.cabeca.rotation.x = v.cabecaX;
    j.cabeca.rotation.y = v.cabecaY;
    for (let e = 0; e < 2; e++) {
      const lado = e === 0 ? -1 : 1;
      j.pernas[e].rotation.x = v.coxa[e];
      j.pernas[e].rotation.z = lado * v.abertura * 0.5;
      j.joelhos[e].rotation.x = v.joelho[e];
      j.ombros[e].rotation.x = v.ombroX[e];
      j.ombros[e].rotation.z = lado * v.ombroZ;
      j.cotovelos[e].rotation.x = v.cotovelo[e];
    }
  }

  mover(dt, fator) {
    const pos = this.raiz.position;
    let restante = VELOCIDADE_ANDAR * Math.min(fator, 2.5) * dt;
    while (restante > 0 && this.caminho.length) {
      const alvo = this.caminho[0];
      const dx = alvo.x - pos.x;
      const dz = alvo.z - pos.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.001) this.rumoAndando = Math.atan2(dx, dz);
      if (d <= restante) {
        pos.x = alvo.x;
        pos.z = alvo.z;
        restante -= d;
        this.fase += (d / PASSADA) * Math.PI;
        this.caminho.shift();
      } else {
        pos.x += (dx / d) * restante;
        pos.z += (dz / d) * restante;
        this.fase += (restante / PASSADA) * Math.PI;
        restante = 0;
      }
    }
    if (this.rumoAndando != null) this.raiz.rotation.y = angulo(this.raiz.rotation.y + angulo(this.rumoAndando - this.raiz.rotation.y) * Math.min(1, dt * 9));
    if (!this.caminho.length) {
      const fim = this.aoChegar;
      this.aoChegar = null;
      fim?.();
      return false;
    }
    return true;
  }

  chegou(destino) {
    this.estado = 'conversando';
    this.tempo = destino.duracao;
    for (const ouvinte of destino.ouvintes ?? []) {
      if (ouvinte !== this) ouvinte.olhar = this.raiz.position;
    }
  }

  voltar() {
    const destino = this.destino;
    for (const ouvinte of destino.ouvintes ?? []) if (ouvinte.olhar === this.raiz.position) ouvinte.olhar = null;
    this.iniciarCaminho(this.cena.rotaDeVolta(destino, this.casa), () => {
      this.estado = 'sentando';
      this.tempo = 0;
    });
  }
}

// ---------- cena ----------
export async function criarEscritorio3D(container, { setores, agentes, aoClicarAgente, aoClicarCaixa }) {
  await document.fonts?.ready;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  const celular = matchMedia('(max-width: 700px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, celular ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Escritório em 3D: arraste para girar, role para aproximar, clique numa pessoa para ver as conversas dela');
  renderer.domElement.setAttribute('role', 'img');
  container.append(renderer.domElement);

  const camadaRotulos = document.createElement('div');
  camadaRotulos.className = 'camada-rotulos';
  container.append(camadaRotulos);

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 220);
  const controles = new OrbitControls(camera, renderer.domElement);
  controles.enableDamping = true;
  controles.dampingFactor = 0.08;
  controles.minDistance = 6;
  controles.maxDistance = 72;
  controles.minPolarAngle = 0.2;
  controles.maxPolarAngle = 1.28;
  controles.minAzimuthAngle = -1.0;
  controles.maxAzimuthAngle = 1.0;
  controles.screenSpacePanning = false;
  const ALVO_INICIAL = new THREE.Vector3(-1.4, 0, 0.3);

  const M = criarMateriais();
  const cacheMateriais = new Map();
  const mundo = {
    M,
    G: criarGeometrias(),
    material(cor, rough = 0.8) {
      const chave = `${cor}|${rough}`;
      if (!cacheMateriais.has(chave)) cacheMateriais.set(chave, new THREE.MeshStandardMaterial({ color: cor, roughness: rough }));
      return cacheMateriais.get(chave);
    },
  };

  const add = (obj, pai = cena) => {
    pai.add(obj);
    return obj;
  };
  const caixa = (w, h, d, material, pos, { sombra = true, recebe = true, raio = 0, pai = cena, rot } = {}) => {
    const geo = raio ? new RoundedBoxGeometry(w, h, d, 3, raio) : new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, material);
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    m.castShadow = sombra;
    m.receiveShadow = recebe;
    return add(m, pai);
  };

  // --- luz ---
  const sol = new THREE.DirectionalLight('#fff1dc', 2.6);
  sol.position.set(-20, 22, -18);
  sol.target.position.set(-1, 0, 1);
  sol.castShadow = true;
  sol.shadow.mapSize.set(celular ? 1024 : 2048, celular ? 1024 : 2048);
  Object.assign(sol.shadow.camera, { left: -26, right: 26, top: 22, bottom: -22, near: 1, far: 80 });
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.025;
  sol.shadow.radius = 4;
  add(sol);
  add(sol.target);
  const ceu = new THREE.HemisphereLight('#e2ecff', '#b7a184', 0.55);
  add(ceu);
  const luminarias = [];
  for (const x of [-7, -1, 5]) {
    for (const z of [-3, 3]) {
      const luz = new THREE.PointLight('#ffd9a8', 0, 12, 1.6);
      luz.position.set(x, 2.7, z);
      luminarias.push(add(luz));
    }
  }

  // --- piso, laje e entorno ---
  const largura = X_DIR - X_ESQ;
  const centroX = (X_DIR + X_ESQ) / 2;
  const madeira = texturaDeCanvas(1024, 1024, desenharMadeira, { repetir: [largura / 1.7, (FUNDO * 2) / 1.7] });
  madeira.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(largura, FUNDO * 2), new THREE.MeshStandardMaterial({ map: madeira, roughness: 0.52, metalness: 0 }));
  piso.rotation.x = -Math.PI / 2;
  piso.position.set(centroX, 0, 0);
  piso.receiveShadow = true;
  add(piso);
  caixa(largura + 0.6, 0.36, FUNDO * 2 + 0.6, M.laje, [centroX, -0.18, 0], { sombra: true });
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), M.chao);
  chao.rotation.x = -Math.PI / 2;
  chao.position.y = -0.37;
  chao.receiveShadow = true;
  add(chao);

  const texturasCidade = { claro: texturaDeCanvas(2048, 640, (c, w, h) => desenharCidade(c, w, h, false)), escuro: texturaDeCanvas(2048, 640, (c, w, h) => desenharCidade(c, w, h, true)) };
  const matCidade = new THREE.MeshBasicMaterial({ map: texturasCidade.claro, fog: false });
  const fundoCidade = new THREE.Mesh(new THREE.PlaneGeometry(120, 30), matCidade);
  fundoCidade.position.set(centroX, 12, -34);
  add(fundoCidade);
  const ladoCidade = new THREE.Mesh(new THREE.PlaneGeometry(90, 30), matCidade);
  ladoCidade.position.set(-44, 12, 4);
  ladoCidade.rotation.y = Math.PI / 2;
  add(ladoCidade);

  // --- paredes com janelas ---
  function paredeComJanelas(comprimento, pos, rotY) {
    const g = new THREE.Group();
    g.position.set(...pos);
    g.rotation.y = rotY;
    caixa(comprimento, 0.9, 0.2, M.parede, [comprimento / 2, 0.45, 0], { pai: g });
    caixa(comprimento, 0.12, 0.26, M.aluminio, [comprimento / 2, 0.93, 0.02], { pai: g });
    caixa(comprimento, ALTURA_PAREDE - 2.7, 0.2, M.parede, [comprimento / 2, (2.7 + ALTURA_PAREDE) / 2, 0], { pai: g });
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(comprimento, 1.72), M.vidro);
    vidro.position.set(comprimento / 2, 1.85, 0);
    g.add(vidro);
    const vaos = Math.round(comprimento / 1.6);
    for (let i = 0; i <= vaos; i++) caixa(0.07, 1.76, 0.12, M.aluminio, [(i * comprimento) / vaos, 1.85, 0], { pai: g });
    caixa(comprimento, 0.06, 0.12, M.aluminio, [comprimento / 2, 2.7, 0], { pai: g });
    add(g);
    return g;
  }
  paredeComJanelas(largura + 0.2, [X_ESQ - 0.1, 0, -FUNDO - 0.1], 0);
  paredeComJanelas(FUNDO * 2 + 0.2, [X_ESQ - 0.1, 0, FUNDO + 0.1], Math.PI / 2);
  caixa(0.22, ALTURA_PAREDE, FUNDO * 2 + 0.4, M.parede, [X_DIR + 0.11, ALTURA_PAREDE / 2, 0]);
  caixa(0.04, 0.1, FUNDO * 2, M.rodape, [X_DIR - 0.01, 0.05, 0], { sombra: false });

  // --- mesas por setor ---
  const texturasTela = new Map();
  const telaDe = (setor, variante) => {
    const chave = `${setor.id}${variante}`;
    if (!texturasTela.has(chave)) texturasTela.set(chave, texturaDeCanvas(256, 160, (c, w, h) => desenharTela(c, w, h, setor.cor, variante)));
    return texturasTela.get(chave);
  };

  function criarCadeira(pai) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(mundo.G.estrela, M.grafite);
    base.castShadow = true;
    g.add(base);
    caixa(0.05, 0.3, 0.05, M.aluminio, [0, 0.25, 0], { pai: g });
    caixa(0.5, 0.08, 0.48, M.tecido, [0, 0.44, 0], { raio: 0.03, pai: g });
    caixa(0.46, 0.54, 0.07, M.tecido, [0, 0.8, -0.25], { raio: 0.03, pai: g, rot: [-0.1, 0, 0] });
    for (const lado of [-1, 1]) caixa(0.05, 0.04, 0.3, M.grafite, [lado * 0.27, 0.62, -0.02], { pai: g });
    pai.add(g);
    return g;
  }

  function criarMesa(setor, variante, r) {
    const g = new THREE.Group();
    caixa(1.55, 0.035, 0.76, M.carvalho, [0, 0.74, 0], { raio: 0.012, pai: g });
    for (const lado of [-1, 1]) caixa(0.05, 0.72, 0.66, M.grafite, [lado * 0.72, 0.36, 0], { pai: g });
    caixa(1.4, 0.3, 0.02, M.grafite, [0, 0.5, -0.3], { pai: g });
    caixa(0.22, 0.012, 0.15, M.grafite, [0, 0.763, -0.2], { pai: g });
    caixa(0.035, 0.3, 0.03, M.grafite, [0, 0.9, -0.22], { pai: g });
    caixa(0.64, 0.38, 0.03, M.preto, [0, 1.13, -0.2], { raio: 0.01, pai: g });
    const telaMat = new THREE.MeshStandardMaterial({ color: '#000000', emissive: '#ffffff', emissiveMap: telaDe(setor, variante), emissiveIntensity: 0.9, roughness: 0.25 });
    const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.345), telaMat);
    tela.position.set(0, 1.13, -0.183);
    g.add(tela);
    caixa(0.44, 0.018, 0.14, M.teclado, [0, 0.765, 0.14], { raio: 0.006, pai: g, sombra: false });
    caixa(0.06, 0.022, 0.1, M.teclado, [0.33, 0.766, 0.15], { raio: 0.01, pai: g, sombra: false });
    if (r() < 0.7) {
      const caneca = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.1, 16), mundo.material(['#f2f0eb', '#2d3a4a', setor.cor, '#c7563f'][Math.floor(r() * 4)], 0.4));
      caneca.position.set(-0.55, 0.81, 0.08);
      caneca.castShadow = true;
      g.add(caneca);
    }
    if (r() < 0.6) caixa(0.21, 0.025 + r() * 0.04, 0.3, M.papel, [-0.45, 0.77, -0.12], { pai: g, rot: [0, r() - 0.5, 0], sombra: false });
    if (r() < 0.35) {
      const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 14), M.vaso);
      vaso.position.set(0.62, 0.81, -0.25);
      g.add(vaso);
      for (let i = 0; i < 6; i++) {
        const folha = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), i % 2 ? M.folha : M.folha2);
        folha.scale.set(0.025, 0.012, 0.09);
        const piv = new THREE.Group();
        piv.position.set(0.62, 0.87, -0.25);
        piv.rotation.set(-0.7 - r() * 0.4, i * 1.05, 0);
        folha.position.z = 0.07;
        piv.add(folha);
        g.add(piv);
      }
    }
    return { grupo: g, telaMat };
  }

  function criarPlanta(pos, altura, nome) {
    const r = semente(nome);
    const g = new THREE.Group();
    g.position.set(...pos);
    const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.46, 24), M.vaso);
    vaso.position.y = 0.23;
    vaso.castShadow = vaso.receiveShadow = true;
    g.add(vaso);
    const terra = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 20), M.terra);
    terra.position.y = 0.45;
    g.add(terra);
    const caule = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, altura - 0.4, 8), mundo.material('#5b4a36', 0.9));
    caule.position.y = 0.45 + (altura - 0.4) / 2;
    g.add(caule);
    const folhaGeo = new THREE.SphereGeometry(1, 10, 8);
    const n = 16;
    for (let i = 0; i < n; i++) {
      const piv = new THREE.Group();
      piv.position.y = 0.78 + (i / n) * (altura - 0.78);
      piv.rotation.set(0.55 + r() * 0.6, i * 2.4, 0);
      const folha = new THREE.Mesh(folhaGeo, i % 2 ? M.folha : M.folha2);
      folha.scale.set(0.075, 0.016, 0.26 - (i / n) * 0.08);
      folha.position.z = 0.24;
      folha.castShadow = true;
      piv.add(folha);
      g.add(piv);
    }
    add(g);
  }

  // Distribui os setores em duas fileiras (fundo e frente), com o corredor no meio.
  const totalMesas = setores.reduce((s, x) => s + x.agentes.length, 0);
  const fileiras = [[], []];
  let noFundo = 0;
  for (const setor of setores) {
    if (noFundo + setor.agentes.length / 2 <= totalMesas / 2 || !fileiras[0].length) {
      fileiras[0].push(setor);
      noFundo += setor.agentes.length;
    } else fileiras[1].push(setor);
  }

  const pessoas = new Map();
  const zonas = new Map();
  const listaMalhas = [];
  fileiras.forEach((fileira, indiceFila) => {
    const sinal = indiceFila === 0 ? -1 : 1;
    let x = X_FILAS;
    fileira.forEach((setor, i) => {
      const xIni = x;
      const xFim = x + setor.agentes.length * PASSO_MESA;
      const tapeteLarg = xFim - xIni + 0.3;
      const tapeteProf = FUNDO - 1.95 - 0.35;
      const texturaTapete = texturaDeCanvas(1024, Math.round((1024 * tapeteProf) / tapeteLarg), (c, w, h) =>
        desenharTapete(c, w, h, setor.cor, setor.nome, sinal < 0));
      const tapete = new THREE.Mesh(new THREE.PlaneGeometry(tapeteLarg, tapeteProf), new THREE.MeshStandardMaterial({ map: texturaTapete, roughness: 0.98 }));
      tapete.rotation.x = -Math.PI / 2;
      tapete.position.set((xIni + xFim) / 2, 0.004, sinal * (1.95 + tapeteProf / 2));
      tapete.receiveShadow = true;
      add(tapete);

      const pessoasDoSetor = [];
      setor.agentes.forEach((id, k) => {
        const agente = agentes[id];
        if (!agente) return;
        const r = semente(`mesa ${id}`);
        const xm = xIni + (k + 0.5) * PASSO_MESA;
        const { grupo: mesa, telaMat } = criarMesa(setor, k % 3, r);
        mesa.position.set(xm, 0, sinal * Z_MESA);
        mesa.rotation.y = sinal < 0 ? 0 : Math.PI;
        add(mesa);
        const cadeiraPai = new THREE.Group();
        cadeiraPai.position.set(xm, 0, sinal * Z_ASSENTO);
        cadeiraPai.rotation.y = sinal < 0 ? Math.PI : 0;
        add(cadeiraPai);
        const cadeira = criarCadeira(cadeiraPai);
        cadeira.position.z = -0.08;
        const casa = {
          assento: { x: xm, z: sinal * (Z_ASSENTO - 0.02) },
          passagem: { x: xm, z: sinal * Z_PASSAGEM },
          rumo: sinal < 0 ? Math.PI : 0,
          anexo: xm,
          sinal,
          cadeira,
          cadeiraZ: -0.08,
          telaMat,
        };
        const pessoa = new Pessoa(agente, setor, casa, mundo);
        add(pessoa.raiz);
        listaMalhas.push(...pessoa.malhas);
        pessoas.set(id, pessoa);
        pessoasDoSetor.push(pessoa);
      });
      zonas.set(setor.id, { x: (xIni + xFim) / 2, sinal, pessoas: pessoasDoSetor });

      if (i < fileira.length - 1) {
        const xDiv = xFim + VAO_SETOR / 2;
        const prof = FUNDO - 2.0;
        const vidro = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.2, prof), M.vidroFosco);
        vidro.position.set(xDiv, 0.62, sinal * (2.0 + prof / 2));
        add(vidro);
        caixa(0.06, 0.04, prof, M.aluminio, [xDiv, 1.24, sinal * (2.0 + prof / 2)]);
        caixa(0.06, 0.04, prof, M.aluminio, [xDiv, 0.02, sinal * (2.0 + prof / 2)], { sombra: false });
        criarPlanta([xDiv, 0, sinal * 1.75], 1.25, `planta ${setor.id}`);
      }
      x = xFim + VAO_SETOR;
    });
  });

  // --- sala do CEO ---
  const ceo = { x: -14.7, z: -3.6 };
  const cantoCEO = { x: X_ESQ, z: 1.25 };
  for (const [z0, z1] of [[-FUNDO, -1.35], [0.95, cantoCEO.z]]) {
    const prof = z1 - z0;
    const vidro = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.6, prof), M.vidro);
    vidro.position.set(X_SALA_CEO, 1.3, (z0 + z1) / 2);
    add(vidro);
    caixa(0.07, 2.62, 0.07, M.aluminio, [X_SALA_CEO, 1.31, z1]);
    caixa(0.07, 0.07, prof, M.aluminio, [X_SALA_CEO, 2.62, (z0 + z1) / 2]);
  }
  {
    const w = X_SALA_CEO - X_ESQ;
    const vidro = new THREE.Mesh(new THREE.BoxGeometry(w, 2.6, 0.03), M.vidro);
    vidro.position.set((X_ESQ + X_SALA_CEO) / 2, 1.3, cantoCEO.z);
    add(vidro);
    caixa(w, 0.07, 0.07, M.aluminio, [(X_ESQ + X_SALA_CEO) / 2, 2.62, cantoCEO.z]);
    const tapeteCEO = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.8), mundo.material('#8a8174', 0.98));
    tapeteCEO.rotation.x = -Math.PI / 2;
    tapeteCEO.position.set(-14.3, 0.004, -3.4);
    tapeteCEO.receiveShadow = true;
    add(tapeteCEO);
    const mesaCEO = new THREE.Group();
    mesaCEO.position.set(ceo.x, 0, ceo.z);
    mesaCEO.rotation.y = -Math.PI / 2;
    caixa(2.0, 0.05, 0.9, M.carvalho, [0, 0.75, 0], { raio: 0.015, pai: mesaCEO });
    caixa(1.9, 0.7, 0.05, M.grafite, [0, 0.38, -0.38], { pai: mesaCEO });
    for (const lado of [-1, 1]) caixa(0.06, 0.73, 0.8, M.grafite, [lado * 0.95, 0.365, 0], { pai: mesaCEO });
    caixa(0.9, 0.02, 0.3, M.preto, [0, 0.78, -0.1], { pai: mesaCEO, raio: 0.005 });
    const placa = texturaDeCanvas(256, 64, (c, w2, h2) => {
      c.fillStyle = '#1c1f24';
      c.fillRect(0, 0, w2, h2);
      c.fillStyle = '#e9e4da';
      c.font = '700 36px "Familjen Grotesk", "Helvetica Neue", Arial, sans-serif';
      c.textBaseline = 'middle';
      c.fillText('CEO', 22, h2 / 2 + 2);
    });
    const plaqueta = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.03), [M.preto, M.preto, M.preto, M.preto, new THREE.MeshStandardMaterial({ map: placa, roughness: 0.4 }), M.preto]);
    plaqueta.position.set(0.55, 0.81, -0.32);
    plaqueta.rotation.y = Math.PI;
    mesaCEO.add(plaqueta);
    add(mesaCEO);
    const cadeiraCEO = new THREE.Group();
    cadeiraCEO.position.set(ceo.x - 0.75, 0, ceo.z);
    cadeiraCEO.rotation.y = Math.PI / 2;
    criarCadeira(cadeiraCEO).scale.set(1.08, 1.12, 1.08);
    add(cadeiraCEO);
    const sofa = new THREE.Group();
    sofa.position.set(-15.75, 0, -0.5);
    sofa.rotation.y = Math.PI / 2;
    caixa(2.0, 0.42, 0.86, M.sofa, [0, 0.25, 0], { raio: 0.06, pai: sofa });
    caixa(2.0, 0.5, 0.22, M.sofa, [0, 0.62, -0.33], { raio: 0.06, pai: sofa });
    for (const lado of [-1, 1]) caixa(0.2, 0.34, 0.86, M.sofa, [lado * 0.92, 0.55, 0], { raio: 0.06, pai: sofa });
    add(sofa);
    criarPlanta([-15.85, 0, -5.6], 1.5, 'planta ceo');
  }

  // --- caixa de comunicação (telão) e copa ---
  const telaoCanvas = document.createElement('canvas');
  telaoCanvas.width = 1024;
  telaoCanvas.height = 576;
  const telaoTextura = new THREE.CanvasTexture(telaoCanvas);
  telaoTextura.colorSpace = THREE.SRGBColorSpace;
  telaoTextura.anisotropy = 8;
  const X_TELAO = 11.45;
  caixa(3.75, 2.15, 0.08, M.preto, [X_TELAO, 1.75, -FUNDO + 0.06], { raio: 0.02 });
  const telao = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.02), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: telaoTextura, emissiveIntensity: 1.05, roughness: 0.3 }));
  telao.position.set(X_TELAO, 1.75, -FUNDO + 0.105);
  add(telao);
  const mesaAlta = new THREE.Group();
  mesaAlta.position.set(11.0, 0, 2.5);
  const tampo = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.04, 36), M.branco);
  tampo.position.y = 1.05;
  tampo.castShadow = tampo.receiveShadow = true;
  mesaAlta.add(tampo);
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.03, 12), M.grafite);
  haste.position.y = 0.52;
  haste.castShadow = true;
  mesaAlta.add(haste);
  const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.03, 30), M.grafite);
  pe.position.y = 0.015;
  mesaAlta.add(pe);
  add(mesaAlta);
  const xCopa = X_DIR - 0.34;
  caixa(0.62, 0.88, 2.3, M.branco, [xCopa, 0.44, -2.6], { raio: 0.01 });
  caixa(0.66, 0.04, 2.36, M.pedra, [xCopa, 0.9, -2.6], { raio: 0.005 });
  caixa(0.34, 0.42, 0.34, M.preto, [xCopa, 1.13, -3.3], { raio: 0.03 });
  caixa(0.1, 0.08, 0.12, M.aluminio, [xCopa - 0.18, 0.99, -3.3]);
  for (let i = 0; i < 4; i++) {
    const copo = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.09, 14), M.branco);
    copo.position.set(xCopa + 0.04, 0.965, -2.5 + i * 0.12);
    add(copo);
  }
  criarPlanta([12.85, 0, 5.5], 1.6, 'planta telão');
  criarPlanta([12.95, 0, -0.6], 1.35, 'planta copa');
  criarPlanta([-11.35, 0, 5.5], 1.45, 'planta frente');

  // --- pontos de destino ---
  const faixa = () => (Math.random() - 0.5) * 1.3;
  const destinos = {
    agente(pessoa, visitante) {
      const c = pessoa.casa;
      const lado = visitante.casa.anexo > c.anexo ? 1 : -1;
      const x = c.assento.x + lado * 0.62;
      const z = c.sinal * 3.2;
      return { ponto: { x, z }, acesso: [{ x, z: c.sinal * Z_PASSAGEM }, { x, z }], anexo: x, rumo: Math.atan2(c.assento.x - x, c.assento.z - z), ouvintes: [pessoa] };
    },
    setor(zona) {
      const x = zona.x + (Math.random() - 0.5) * 0.6;
      const z = zona.sinal * 2.3;
      return { ponto: { x, z }, acesso: [{ x, z }], anexo: x, rumo: zona.sinal < 0 ? Math.PI : 0, ouvintes: zona.pessoas };
    },
    todos() {
      const x = 10.35 + Math.random() * 0.5;
      return { ponto: { x, z: -4.75 }, acesso: [{ x, z: -4.75 }], anexo: x, rumo: 0, ouvintes: [] };
    },
    ceo() {
      return { ponto: { x: -13.35, z: -3.2 }, acesso: [{ x: -12.7, z: -0.2 }, { x: -13.35, z: -3.2 }], anexo: -11.2, rumo: -Math.PI / 2 - 0.25, ouvintes: [] };
    },
  };
  mundo.rota = (casa, destino) => {
    const z = faixa();
    return [{ x: casa.anexo, z }, { x: destino.anexo, z }, ...destino.acesso];
  };
  mundo.rotaDeVolta = (destino, casa) => {
    const z = faixa();
    return [...destino.acesso.slice(0, -1).reverse(), { x: destino.anexo, z }, { x: casa.anexo, z }, casa.passagem];
  };

  // --- envelopes voando (mensagens do CEO ou quando a pessoa já está ocupada) ---
  const envelopes = [];
  function lancarEnvelope(de, para, cor) {
    const m = new THREE.Mesh(mundo.G.envelope, new THREE.MeshStandardMaterial({ color: '#fbfaf6', emissive: cor, emissiveIntensity: 0.35, roughness: 0.6 }));
    m.castShadow = true;
    add(m);
    envelopes.push({ m, de: de.clone(), para: para.clone(), t: 0 });
  }

  // --- rótulos e balões (HTML sobre o canvas) ---
  const rotulos = new Map();
  for (const [id, pessoa] of pessoas) {
    const a = pessoa.agente;
    const rotulo = document.createElement('div');
    rotulo.className = 'rotulo3d';
    rotulo.style.setProperty('--cor', pessoa.setor.cor);
    const ponto = document.createElement('span');
    ponto.className = 'ponto';
    const nome = document.createElement('b');
    nome.textContent = a.nome;
    const cargo = document.createElement('small');
    cargo.textContent = a.cargo;
    rotulo.append(ponto, nome, cargo);
    const balao = document.createElement('div');
    balao.className = 'balao3d';
    balao.style.setProperty('--cor', pessoa.setor.cor);
    balao.hidden = true;
    camadaRotulos.append(rotulo, balao);
    rotulos.set(id, { rotulo, balao, textoAtual: null });
  }

  function desenharBalao(pessoa) {
    const r = rotulos.get(pessoa.id);
    const a = pessoa.agente;
    let chave = null;
    if (a.status === 'pensando') chave = '…';
    else if (a.status === 'falando' && a.balao) chave = a.balao;
    if (chave === r.textoAtual) return;
    r.textoAtual = chave;
    if (!chave) {
      r.balao.hidden = true;
      return;
    }
    r.balao.hidden = false;
    if (chave === '…') {
      r.balao.className = 'balao3d digitando';
      r.balao.replaceChildren(...[0, 1, 2].map(() => document.createElement('i')));
    } else {
      r.balao.className = 'balao3d';
      const span = document.createElement('span');
      span.textContent = chave;
      r.balao.replaceChildren(span);
    }
  }

  // --- seleção e hover ---
  const anel = new THREE.Mesh(mundo.G.anel, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 }));
  anel.position.y = 0.012;
  anel.visible = false;
  add(anel);
  let selecionado = null;
  let sobre = null;
  const raio = new THREE.Raycaster();
  const ponteiro = new THREE.Vector2();
  let inicioToque = null;

  function acharAgente(evento) {
    const r = renderer.domElement.getBoundingClientRect();
    ponteiro.set(((evento.clientX - r.left) / r.width) * 2 - 1, -((evento.clientY - r.top) / r.height) * 2 + 1);
    raio.setFromCamera(ponteiro, camera);
    const alvos = raio.intersectObjects([...listaMalhas, telao], false);
    if (!alvos.length) return null;
    return alvos[0].object === telao ? 'caixa' : alvos[0].object.userData.agente;
  }
  renderer.domElement.addEventListener('pointerdown', (e) => {
    inicioToque = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!inicioToque || Math.hypot(e.clientX - inicioToque.x, e.clientY - inicioToque.y) > 6) return;
    const alvo = acharAgente(e);
    if (alvo === 'caixa') aoClicarCaixa?.();
    else if (alvo) aoClicarAgente?.(alvo);
  });
  let ultimoHover = 0;
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (e.buttons || performance.now() - ultimoHover < 60) return;
    ultimoHover = performance.now();
    const alvo = acharAgente(e);
    renderer.domElement.style.cursor = alvo ? 'pointer' : '';
    const novo = alvo && alvo !== 'caixa' ? alvo : null;
    if (novo === sobre) return;
    if (sobre) rotulos.get(sobre)?.rotulo.classList.remove('ativo');
    sobre = novo;
    if (sobre) rotulos.get(sobre)?.rotulo.classList.add('ativo');
  });

  // --- tema claro/escuro ---
  function aplicarTema() {
    const tema = document.documentElement.dataset.theme;
    const escuro = tema === 'dark' || (tema !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    const fundo = new THREE.Color(escuro ? '#0c111b' : '#dfe8f0');
    cena.background = fundo;
    cena.fog = new THREE.Fog(fundo, 55, 120);
    matCidade.map = escuro ? texturasCidade.escuro : texturasCidade.claro;
    matCidade.needsUpdate = true;
    sol.color.set(escuro ? '#9fb3ff' : '#fff1dc');
    sol.intensity = escuro ? 0.35 : 2.6;
    ceu.intensity = escuro ? 0.12 : 0.55;
    cena.environmentIntensity = escuro ? 0.28 : 0.6;
    M.chao.color.set(escuro ? '#23262c' : '#c9c5bd');
    for (const luz of luminarias) luz.intensity = escuro ? 9 : 0;
    renderer.toneMappingExposure = escuro ? 1.15 : 1.0;
  }
  aplicarTema();
  const observadorTema = new MutationObserver(aplicarTema);
  observadorTema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const midiaEscura = matchMedia('(prefers-color-scheme: dark)');
  midiaEscura.addEventListener?.('change', aplicarTema);

  // --- telão ---
  const historico = [];
  let totalMensagens = 0;
  let nomeDe = (id) => agentes[id]?.nome ?? id;
  let corDe = (id) => pessoas.get(id)?.setor.cor ?? '#8a93a3';
  function desenharTelao() {
    desenharPainel(telaoCanvas.getContext('2d'), telaoCanvas.width, telaoCanvas.height, { total: totalMensagens, ultimas: historico.slice(-4).reverse() });
    telaoTextura.needsUpdate = true;
  }
  desenharTelao();

  // --- câmera ---
  let enquadrado = false;
  function enquadrar(forcar) {
    if (enquadrado && !forcar) return;
    enquadrado = true;
    const aspecto = camera.aspect || 1.5;
    const distancia = Math.min(70, Math.max(24, 41 / Math.min(1.7, aspecto) + 6));
    const direcao = new THREE.Vector3(0, 0.78, 0.63).normalize();
    controles.target.copy(ALVO_INICIAL);
    camera.position.copy(ALVO_INICIAL).addScaledVector(direcao, distancia);
    controles.update();
  }
  function redimensionar() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    enquadrar(false);
  }
  const observadorTamanho = new ResizeObserver(redimensionar);
  observadorTamanho.observe(container);
  redimensionar();
  controles.addEventListener('change', () => {
    controles.target.x = Math.max(X_ESQ + 1, Math.min(X_DIR - 1, controles.target.x));
    controles.target.z = Math.max(-FUNDO + 0.5, Math.min(FUNDO - 0.5, controles.target.z));
  });

  // --- laço de animação ---
  let fator = 1;
  let visivel = true;
  const relogio = new THREE.Clock();
  const tmp = new THREE.Vector3();
  const observadorVisivel = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
  });
  observadorVisivel.observe(container);

  function quadro() {
    const dt = Math.min(0.05, relogio.getDelta());
    if (!visivel) return;
    const t = relogio.elapsedTime;
    controles.update();
    for (const pessoa of pessoas.values()) {
      pessoa.atualizar(dt, t, fator);
      const tela = pessoa.casa.telaMat;
      const alvo = pessoa.estado === 'sentado' ? (pessoa.agente.status === 'pensando' ? 1.05 + Math.sin(t * 5) * 0.12 : 0.95) : 0.18;
      tela.emissiveIntensity += (alvo - tela.emissiveIntensity) * Math.min(1, dt * 4);
    }
    if (selecionado && pessoas.has(selecionado)) {
      const p = pessoas.get(selecionado);
      anel.position.x = p.raiz.position.x;
      anel.position.z = p.raiz.position.z;
    }
    for (let i = envelopes.length - 1; i >= 0; i--) {
      const env = envelopes[i];
      env.t += (dt * fator) / 1.8;
      const k = Math.min(1, env.t);
      env.m.position.lerpVectors(env.de, env.para, suave(k));
      env.m.position.y += Math.sin(k * Math.PI) * 2.6;
      env.m.rotation.y += dt * 4;
      if (k >= 1) {
        cena.remove(env.m);
        env.m.material.dispose();
        envelopes.splice(i, 1);
      }
    }
    renderer.render(cena, camera);

    // Rótulos seguem as pessoas na tela.
    const w = container.clientWidth;
    const h = container.clientHeight;
    const longe = camera.position.distanceTo(controles.target) > 52;
    for (const [id, pessoa] of pessoas) {
      const r = rotulos.get(id);
      pessoa.topo(tmp).project(camera);
      const fora = tmp.z > 1 || tmp.x < -1.1 || tmp.x > 1.1 || tmp.y < -1.1 || tmp.y > 1.1;
      const x = ((tmp.x + 1) / 2) * w;
      const y = ((1 - tmp.y) / 2) * h;
      r.rotulo.style.transform = `translate(${x.toFixed(1)}px, ${(y - 4).toFixed(1)}px) translate(-50%, -100%)`;
      r.rotulo.classList.toggle('oculto', fora || (longe && id !== selecionado && id !== sobre));
      if (!r.balao.hidden) {
        r.balao.style.transform = `translate(${x.toFixed(1)}px, ${(y - 30).toFixed(1)}px) translate(-50%, -100%)`;
        r.balao.classList.toggle('oculto', fora);
      }
    }
  }
  renderer.setAnimationLoop(quadro);

  // --- API usada pela página ---
  const posicaoDe = (id) => {
    if (pessoas.has(id)) return pessoas.get(id).topo(new THREE.Vector3()).setY(1.3);
    if (zonas.has(id)) {
      const z = zonas.get(id);
      return new THREE.Vector3(z.x, 1.3, z.sinal * 3.6);
    }
    if (id === 'ceo') return new THREE.Vector3(ceo.x, 1.3, ceo.z);
    return new THREE.Vector3(11.45, 1.8, -FUNDO + 0.4);
  };

  return {
    atualizarAgente(agente) {
      const pessoa = pessoas.get(agente.id);
      if (!pessoa) return;
      Object.assign(pessoa.agente, agente);
      pessoa.status = agente.status;
      desenharBalao(pessoa);
    },
    sincronizar(todos, ajudantes = {}) {
      if (ajudantes.nomeDe) nomeDe = ajudantes.nomeDe;
      if (ajudantes.corDe) corDe = ajudantes.corDe;
      for (const agente of Object.values(todos)) this.atualizarAgente(agente);
      if (ajudantes.mensagens) {
        historico.length = 0;
        for (const m of ajudantes.mensagens.slice(-4)) historico.push({ cabecalho: `${nomeDe(m.de)} → ${nomeDe(m.para)}`, texto: m.texto, cor: corDe(m.de) });
        totalMensagens = ajudantes.mensagens.length;
        desenharTelao();
      }
    },
    mensagem(msg) {
      totalMensagens++;
      historico.push({ cabecalho: `${nomeDe(msg.de)} → ${nomeDe(msg.para)}`, texto: msg.texto, cor: corDe(msg.de) });
      if (historico.length > 8) historico.shift();
      desenharTelao();
      const remetente = pessoas.get(msg.de);
      let destino = null;
      if (remetente) {
        if (pessoas.has(msg.para) && msg.para !== msg.de) destino = destinos.agente(pessoas.get(msg.para), remetente);
        else if (zonas.has(msg.para)) destino = destinos.setor(zonas.get(msg.para));
        else if (msg.para === 'todos') destino = destinos.todos();
        else if (msg.para === 'ceo') destino = destinos.ceo();
      }
      if (destino && !reduzido()) {
        destino.duracao = 4.5 + Math.min(4, (msg.texto?.length ?? 0) / 60);
        if (remetente.visitar(destino)) return;
      }
      if (reduzido()) return;
      const alvos = msg.para === 'todos' ? ['todos'] : [msg.para];
      for (const alvo of alvos) lancarEnvelope(posicaoDe(msg.de), posicaoDe(alvo), corDe(msg.de) || '#D98A1E');
    },
    destacar(id) {
      if (selecionado) rotulos.get(selecionado)?.rotulo.classList.remove('selecionado');
      selecionado = id && pessoas.has(id) ? id : null;
      anel.visible = !!selecionado;
      if (selecionado) {
        const p = pessoas.get(selecionado);
        anel.material.color.set(p.setor.cor);
        rotulos.get(selecionado).rotulo.classList.add('selecionado');
      }
    },
    definirVelocidade(v) {
      fator = Math.max(0.5, Math.min(4, Number(v) || 1));
    },
    recentralizar() {
      enquadrar(true);
    },
    destruir() {
      renderer.setAnimationLoop(null);
      observadorTamanho.disconnect();
      observadorVisivel.disconnect();
      observadorTema.disconnect();
      midiaEscura.removeEventListener?.('change', aplicarTema);
      controles.dispose();
      renderer.dispose();
      pmrem.dispose();
      renderer.domElement.remove();
      camadaRotulos.remove();
    },
  };
}
