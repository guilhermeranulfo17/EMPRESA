// Pessoas da cena: corpo articulado (quadril, tronco, cabeça, braços e pernas), aparência própria
// por pessoa e animações de sentar, digitar, pensar, andar, conversar, ouvir e comemorar.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { semente } from './texturas.js';

export const VELOCIDADE_ANDAR = 1.25;
const PASSADA = 0.75;

const PELES = ['#f3cfb0', '#ebbf9b', '#d9a47e', '#bf8560', '#9a6444', '#6e452d', '#4f3020'];
const CABELOS = ['#1d1510', '#2e1f16', '#4a3020', '#6b4527', '#9a6b3f', '#c49a63', '#2a2a2c', '#8a837c'];
const CAMISAS_NEUTRAS = ['#f4f4f2', '#dfe6ee', '#9fb3c8', '#2f3a4a', '#e8dccb', '#b9c2b0', '#3c3f45', '#7d8fa3', '#c9b8a6'];
const CALCAS = ['#1f2a3d', '#2b2d31', '#3a4a63', '#6e5f4b', '#44484f', '#23262b', '#4b5a72'];
const SAPATOS = ['#1b1b1c', '#3a2a1f', '#e9e9e7', '#5a4332', '#2a2f38'];

export const suave = (k) => k * k * (3 - 2 * k);
export const angulo = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export const reduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const POSES = {
  em_pe: { y: 0.94, coxa: 0, joelho: 0.03, abertura: 0.02, ombroX: 0.06, ombroZ: 0.08, cotovelo: -0.18, troncoX: 0, cabecaX: 0 },
  sentado: { y: 0.57, coxa: -1.5, joelho: 1.47, abertura: 0.07, ombroX: -0.28, ombroZ: 0.1, cotovelo: -1.3, troncoX: 0.08, cabecaX: 0.1 },
};

function misturarPose(a, b, k) {
  const p = {};
  for (const chave of Object.keys(a)) p[chave] = a[chave] + (b[chave] - a[chave]) * k;
  return p;
}

const torno = (pontos, segmentos = 22) => new THREE.LatheGeometry(pontos.map(([r, y]) => new THREE.Vector2(r, y)), segmentos);

let G = null;
function geometrias() {
  if (G) return G;
  G = {
    tronco: torno([[0.001, -0.02], [0.124, 0], [0.128, 0.08], [0.142, 0.18], [0.158, 0.3], [0.165, 0.4], [0.158, 0.47], [0.13, 0.545], [0.085, 0.595], [0.001, 0.612]]),
    pelve: torno([[0.001, -0.155], [0.085, -0.145], [0.128, -0.1], [0.143, -0.02], [0.134, 0.05], [0.001, 0.06]]),
    cinto: new THREE.CylinderGeometry(0.137, 0.137, 0.032, 26, 1, true),
    gola: new THREE.TorusGeometry(0.058, 0.015, 8, 22),
    pescoco: new THREE.CylinderGeometry(0.046, 0.054, 0.12, 14),
    cabeca: new THREE.SphereGeometry(0.112, 28, 20),
    queixo: new THREE.SphereGeometry(0.084, 20, 14),
    nariz: new THREE.SphereGeometry(0.02, 10, 8),
    orelha: new THREE.SphereGeometry(0.026, 10, 8),
    olho: new THREE.SphereGeometry(0.0125, 10, 8),
    sobrancelha: new THREE.BoxGeometry(0.034, 0.008, 0.008),
    boca: new THREE.BoxGeometry(0.038, 0.007, 0.006),
    calota: new THREE.SphereGeometry(0.121, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.53),
    nuca: new THREE.SphereGeometry(0.1, 18, 12),
    cabeloLongo: new THREE.CapsuleGeometry(0.1, 0.2, 6, 14),
    rabo: new THREE.CapsuleGeometry(0.034, 0.17, 4, 10),
    coque: new THREE.SphereGeometry(0.058, 14, 10),
    cacho: new THREE.SphereGeometry(0.05, 10, 8),
    barba: new THREE.SphereGeometry(0.09, 20, 14, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55),
    aro: new THREE.TorusGeometry(0.026, 0.004, 6, 18),
    tiara: new THREE.TorusGeometry(0.125, 0.009, 6, 26, Math.PI),
    concha: new THREE.CylinderGeometry(0.034, 0.034, 0.024, 16),
    microfone: new THREE.CylinderGeometry(0.004, 0.004, 0.13, 6),
    deltoide: new THREE.SphereGeometry(0.06, 16, 12),
    braco: new THREE.CylinderGeometry(0.05, 0.043, 0.29, 14),
    manga: new THREE.CylinderGeometry(0.06, 0.055, 0.15, 14),
    cotovelo: new THREE.SphereGeometry(0.043, 12, 10),
    antebraco: new THREE.CylinderGeometry(0.042, 0.032, 0.25, 12),
    palma: new RoundedBoxGeometry(0.07, 0.09, 0.03, 2, 0.012),
    dedos: new RoundedBoxGeometry(0.066, 0.065, 0.022, 2, 0.01),
    polegar: new THREE.CapsuleGeometry(0.012, 0.035, 4, 8),
    coxa: new THREE.CylinderGeometry(0.079, 0.058, 0.43, 16),
    joelho: new THREE.SphereGeometry(0.058, 14, 10),
    canela: new THREE.CylinderGeometry(0.055, 0.04, 0.43, 14),
    sapato: new RoundedBoxGeometry(0.1, 0.075, 0.26, 3, 0.03),
    sola: new RoundedBoxGeometry(0.106, 0.022, 0.272, 2, 0.008),
  };
  return G;
}

// Junta várias peças do mesmo material num só objeto (menos trabalho para a placa de vídeo).
class Montador {
  constructor(pessoa) {
    this.pessoa = pessoa;
    this.grupos = new Map();
  }

  peca(grupo, geo, material, pos = [0, 0, 0], escala, rot) {
    if (!this.grupos.has(grupo)) this.grupos.set(grupo, new Map());
    const porMaterial = this.grupos.get(grupo);
    if (!porMaterial.has(material)) porMaterial.set(material, []);
    const g = geo.clone();
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot ?? [0, 0, 0]))),
      new THREE.Vector3(...(escala ?? [1, 1, 1])),
    );
    g.applyMatrix4(m);
    porMaterial.get(material).push(g.index ? g.toNonIndexed() : g);
  }

  montar() {
    const malhas = [];
    for (const [grupo, porMaterial] of this.grupos) {
      for (const [material, geos] of porMaterial) {
        for (const g of geos) for (const nome of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(nome)) g.deleteAttribute(nome);
        const geo = geos.length === 1 ? geos[0] : mergeGeometries(geos);
        const malha = new THREE.Mesh(geo, material);
        malha.castShadow = true;
        malha.userData.agente = this.pessoa.id;
        grupo.add(malha);
        malhas.push(malha);
      }
    }
    return malhas;
  }
}

const materiais = new Map();
function material(tipo, cor) {
  const chave = `${tipo}|${cor}`;
  if (materiais.has(chave)) return materiais.get(chave);
  const c = new THREE.Color(cor);
  const brilho = c.clone().lerp(new THREE.Color('#ffffff'), 0.45);
  let m;
  // Materiais padrão (mais leves que os físicos); o brilho suave vem da luz ambiente da cena.
  if (tipo === 'pele') m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, emissive: c.clone().multiplyScalar(0.05) });
  else if (tipo === 'cabelo') m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0.08 });
  else if (tipo === 'tecido') m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, emissive: brilho.multiplyScalar(0.015) });
  else if (tipo === 'couro') m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.38, metalness: 0.05 });
  else m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 });
  materiais.set(chave, m);
  return m;
}

export class Pessoa {
  constructor(agente, setor, casa, opcoes = {}) {
    this.id = agente.id;
    this.agente = agente;
    this.setor = setor;
    this.casa = casa;
    this.mundo = opcoes.mundo;
    this.estado = 'sentado';
    this.status = agente.status;
    this.fila = [];
    this.caminho = [];
    this.fase = Math.random() * 6;
    this.tempo = 0;
    this.olhar = null;
    this.ausente = false;
    this.falaLocal = null;
    this.proximaPiscada = 2 + Math.random() * 4;
    this.construir(opcoes);
    this.raiz.position.set(casa.assento.x, 0, casa.assento.z);
    this.raiz.rotation.y = casa.rumo;
    this.valores = null;
  }

  construir({ fone = false } = {}) {
    const g = geometrias();
    const r = semente(this.id);
    const escolha = (lista) => lista[Math.floor(r() * lista.length)];
    const ap = this.agente.aparencia ?? {};
    const pele = ap.pele ?? escolha(PELES);
    const corCabelo = ap.corCabelo ?? escolha(CABELOS);
    const estilo = ap.cabelo ?? escolha(['curto', 'curto', 'longo', 'coque', 'cacheado', 'raspado', 'longo', 'rabo', 'curto', 'careca']);
    const barba = ap.barba ?? (estilo !== 'longo' && estilo !== 'coque' && estilo !== 'rabo' && r() < 0.3);
    const corSetor = new THREE.Color(this.setor.cor);
    const camisa = ap.camisa ?? (r() < 0.45
      ? `#${corSetor.clone().lerp(new THREE.Color(r() < 0.5 ? '#ffffff' : '#20242b'), 0.2 + r() * 0.35).getHexString()}`
      : escolha(CAMISAS_NEUTRAS));
    const calca = ap.calca ?? escolha(CALCAS);
    const sapato = escolha(SAPATOS);
    const manga = r() < 0.6 ? 'longa' : 'curta';
    const gola = r() < 0.55;
    const cinto = r() < 0.5;
    const oculos = r() < 0.26;
    this.altura = ap.altura ?? 0.94 + r() * 0.08;
    this.fone = fone;

    const mPele = material('pele', pele);
    const mCabelo = material('cabelo', corCabelo);
    const mCamisa = material('tecido', camisa);
    const mCalca = material('tecido', calca);
    const mSapato = material('couro', sapato);
    const mSola = material('couro', '#24262a');
    const mOlho = material('liso', '#17110d');
    const mBoca = material('pele', new THREE.Color(pele).lerp(new THREE.Color('#7a2f2a'), 0.45).getStyle());
    const mPreto = material('liso', '#1a1c20');
    const mCouro = material('couro', '#2c2118');

    const grupo = (pai, x, y, z) => {
      const n = new THREE.Group();
      n.position.set(x, y, z);
      pai.add(n);
      return n;
    };
    const raiz = new THREE.Group();
    raiz.scale.setScalar(this.altura);
    const quadril = grupo(raiz, 0, POSES.sentado.y, 0);
    const tronco = grupo(quadril, 0, 0.04, 0);
    const cabeca = grupo(tronco, 0, 0.69, 0);
    const olhos = grupo(cabeca, 0, 0.125, 0);
    const m = new Montador(this);

    m.peca(quadril, g.pelve, mCalca, [0, 0.02, 0], [1.1, 1, 0.78]);
    if (cinto) m.peca(quadril, g.cinto, mCouro, [0, 0.065, 0], [1.1, 1, 0.8]);
    m.peca(tronco, g.tronco, mCamisa, [0, 0, 0], [1.18, 1, 0.7]);
    m.peca(tronco, g.pescoco, mPele, [0, 0.645, 0]);
    if (gola) m.peca(tronco, g.gola, mCamisa, [0, 0.6, 0.004], [1.15, 1, 0.85], [Math.PI / 2 + 0.25, 0, 0]);

    m.peca(cabeca, g.cabeca, mPele, [0, 0.115, 0], [0.9, 1.07, 0.98]);
    m.peca(cabeca, g.queixo, mPele, [0, 0.048, 0.022], [0.92, 0.72, 0.95]);
    m.peca(cabeca, g.nariz, mPele, [0, 0.096, 0.109], [0.62, 1.05, 1]);
    m.peca(cabeca, g.boca, mBoca, [0, 0.055, 0.1]);
    for (const lado of [-1, 1]) {
      m.peca(olhos, g.olho, mOlho, [lado * 0.036, 0, 0.097]);
      m.peca(cabeca, g.sobrancelha, mCabelo, [lado * 0.037, 0.147, 0.104], null, [0, 0, -lado * 0.1]);
      m.peca(cabeca, g.orelha, mPele, [lado * 0.101, 0.11, -0.005], [0.55, 1, 0.85]);
      if (oculos) m.peca(cabeca, g.aro, mPreto, [lado * 0.037, 0.125, 0.11], [1, 0.82, 1]);
    }
    if (oculos) m.peca(cabeca, g.sobrancelha, mPreto, [0, 0.127, 0.113], [0.45, 0.6, 0.6]);
    if (estilo !== 'careca') m.peca(cabeca, g.calota, mCabelo, [0, 0.118, -0.006], estilo === 'cacheado' ? [1.08, 1.18, 1.12] : estilo === 'raspado' ? [0.93, 1.03, 0.97] : [0.97, 1.1, 1.04], [-0.38, 0, 0]);
    if (estilo === 'curto' || estilo === 'raspado') m.peca(cabeca, g.nuca, mCabelo, [0, 0.085, -0.045], [0.98, 0.7, 0.75]);
    if (estilo === 'longo') m.peca(cabeca, g.cabeloLongo, mCabelo, [0, 0.0, -0.06], [1.1, 1.05, 0.55]);
    if (estilo === 'coque') m.peca(cabeca, g.coque, mCabelo, [0, 0.215, -0.085]);
    if (estilo === 'rabo') m.peca(cabeca, g.rabo, mCabelo, [0, 0.04, -0.125], null, [0.35, 0, 0]);
    if (estilo === 'cacheado') {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        m.peca(cabeca, g.cacho, mCabelo, [Math.cos(a) * 0.088, 0.19 + Math.sin(i * 1.7) * 0.025, Math.sin(a) * 0.08 - 0.025]);
      }
    }
    if (barba) m.peca(cabeca, g.barba, mCabelo, [0, 0.07, 0.012], [0.98, 0.95, 1.02]);
    if (fone) {
      m.peca(cabeca, g.tiara, mPreto, [0, 0.12, 0], [0.92, 1.05, 1], [0, Math.PI / 2, 0]);
      for (const lado of [-1, 1]) m.peca(cabeca, g.concha, mPreto, [lado * 0.11, 0.11, 0], null, [0, 0, Math.PI / 2]);
      m.peca(cabeca, g.microfone, mPreto, [0.07, 0.07, 0.06], null, [Math.PI / 2 - 0.3, 0.6, 0]);
    }

    const ombros = [];
    const cotovelos = [];
    const pernas = [];
    const joelhos = [];
    for (const lado of [-1, 1]) {
      const ombro = grupo(tronco, lado * 0.205, 0.53, 0);
      m.peca(ombro, g.deltoide, mCamisa, [0, -0.015, 0], [1, 1, 0.95]);
      m.peca(ombro, g.braco, manga === 'longa' ? mCamisa : mPele, [0, -0.145, 0]);
      if (manga === 'curta') m.peca(ombro, g.manga, mCamisa, [0, -0.07, 0]);
      const cotovelo = grupo(ombro, 0, -0.29, 0);
      m.peca(cotovelo, g.cotovelo, manga === 'longa' ? mCamisa : mPele, [0, 0, 0]);
      m.peca(cotovelo, g.antebraco, manga === 'longa' ? mCamisa : mPele, [0, -0.125, 0]);
      m.peca(cotovelo, g.palma, mPele, [0, -0.295, 0.004]);
      m.peca(cotovelo, g.dedos, mPele, [0, -0.365, 0.012], null, [0.28, 0, 0]);
      m.peca(cotovelo, g.polegar, mPele, [lado * -0.038, -0.29, 0.02], null, [0.3, 0, lado * 0.5]);
      ombros.push(ombro);
      cotovelos.push(cotovelo);
      const perna = grupo(quadril, lado * 0.092, -0.03, 0);
      m.peca(perna, g.coxa, mCalca, [0, -0.215, 0]);
      const joelho = grupo(perna, 0, -0.43, 0);
      m.peca(joelho, g.joelho, mCalca, [0, 0, 0.004]);
      m.peca(joelho, g.canela, mCalca, [0, -0.215, 0]);
      m.peca(joelho, g.sapato, mSapato, [0, -0.448, 0.05]);
      m.peca(joelho, g.sola, mSola, [0, -0.488, 0.05]);
      pernas.push(perna);
      joelhos.push(joelho);
    }

    this.raiz = raiz;
    this.malhas = m.montar();
    this.juntas = { quadril, tronco, cabeca, olhos, ombros, cotovelos, pernas, joelhos };
  }

  // Posição da cabeça no mundo, para balões e rótulos.
  topo(alvo) {
    return alvo.set(this.raiz.position.x, this.raiz.position.y + this.juntas.quadril.position.y * this.altura + 0.95 * this.altura, this.raiz.position.z);
  }

  livre() {
    return this.estado === 'sentado' && !this.ausente;
  }

  visitar(destino) {
    if (this.ausente) return false;
    if (this.estado !== 'sentado') {
      if (!destino.descartavel) this.fila = [destino];
      return false;
    }
    this.destino = destino;
    this.estado = 'levantando';
    this.tempo = 0;
    return true;
  }

  // Encerra a visita atual antes da hora (ex.: fim da reunião).
  encerrar() {
    if (this.estado === 'conversando') this.tempo = 0;
    else if (this.destino) this.destino.duracao = 0;
  }

  iniciarCaminho(pontos, aoChegar) {
    this.caminho = pontos.map((p) => ({ x: p.x, z: p.z }));
    this.aoChegar = aoChegar;
    this.estado = 'andando';
  }

  definirAusente(ausente) {
    if (ausente === this.ausente) return;
    if (ausente && this.estado !== 'sentado') return;
    this.ausente = ausente;
    this.raiz.visible = !ausente;
  }

  atualizar(dt, t, fator) {
    if (this.ausente) return;
    const casa = this.casa;
    const pos = this.raiz.position;
    let base;
    let andando = false;
    pos.y = 0;

    if (this.estado === 'levantando' || this.estado === 'sentando') {
      this.tempo += dt * Math.min(fator, 2);
      const k = suave(Math.min(1, this.tempo / 0.9));
      const emPe = this.destino?.naMesa ? casa.pe ?? casa.passagem : casa.passagem;
      const de = this.estado === 'levantando' ? casa.assento : emPe;
      const para = this.estado === 'levantando' ? emPe : casa.assento;
      pos.x = de.x + (para.x - de.x) * k;
      pos.z = de.z + (para.z - de.z) * k;
      this.raiz.rotation.y = angulo(this.raiz.rotation.y + angulo(casa.rumo - this.raiz.rotation.y) * Math.min(1, dt * 6));
      base = this.estado === 'levantando' ? misturarPose(POSES.sentado, POSES.em_pe, k) : misturarPose(POSES.em_pe, POSES.sentado, k);
      if (casa.cadeira) casa.cadeira.position.z = (casa.cadeiraZ ?? 0) - 0.3 * (this.estado === 'levantando' ? k : 1 - k);
      if (k >= 1) {
        if (this.estado === 'levantando') {
          const destino = this.destino;
          if (destino.naMesa) this.chegou(destino);
          else this.iniciarCaminho(this.mundo.rota(casa, destino), () => this.chegou(destino));
        } else {
          this.estado = 'sentado';
          this.destino = null;
          this.raiz.rotation.y = casa.rumo;
          if (this.fila.length) this.visitar(this.fila.shift());
        }
      }
    } else if (this.estado === 'andando') {
      andando = this.mover(dt, fator);
      base = POSES.em_pe;
    } else if (this.estado === 'conversando') {
      this.tempo -= dt * Math.min(fator, 2);
      const rumo = this.destino.rumo ?? casa.rumo;
      this.raiz.rotation.y = angulo(this.raiz.rotation.y + angulo(rumo - this.raiz.rotation.y) * Math.min(1, dt * 5));
      base = POSES.em_pe;
      if (this.tempo <= 0) this.voltar();
    } else {
      base = POSES.sentado;
    }

    const alvo = {
      y: base.y, troncoX: base.troncoX, troncoY: 0, cabecaX: base.cabecaX, cabecaY: 0,
      coxa: [base.coxa, base.coxa], joelho: [base.joelho, base.joelho], abertura: base.abertura,
      ombroX: [base.ombroX, base.ombroX], ombroZ: [base.ombroZ, base.ombroZ], cotovelo: [base.cotovelo, base.cotovelo],
    };
    const gesto = this.estado === 'conversando' ? this.destino.gesto ?? 'falar' : null;
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
    } else if (gesto === 'falar') {
      alvo.ombroX[1] = -0.5 + Math.sin(t * 2.3) * 0.22;
      alvo.cotovelo[1] = -1.25 + Math.sin(t * 3.1) * 0.25;
      alvo.ombroX[0] = 0.02 + Math.sin(t * 1.7) * 0.05;
      alvo.cabecaX = Math.sin(t * 2.6) * 0.07;
    } else if (gesto === 'ouvir') {
      for (let e = 0; e < 2; e++) {
        alvo.ombroX[e] = -0.32;
        alvo.ombroZ[e] = -0.18;
        alvo.cotovelo[e] = -1.05;
      }
      alvo.cabecaX = 0.04 + Math.max(0, Math.sin(t * 0.9 + this.altura * 30)) * 0.1;
      alvo.troncoY = Math.sin(t * 0.3 + this.altura * 11) * 0.06;
    } else if (gesto === 'comemorar') {
      const pulo = Math.max(0, Math.sin(t * 7 + this.altura * 20));
      pos.y = pulo * 0.1;
      for (let e = 0; e < 2; e++) {
        alvo.ombroX[e] = -2.75 + Math.sin(t * 7 + e) * 0.12;
        alvo.ombroZ[e] = 0.35;
        alvo.cotovelo[e] = -0.25;
      }
      alvo.cabecaX = -0.2;
      alvo.joelho = [pulo * 0.35, pulo * 0.35];
      alvo.coxa = [-pulo * 0.2, -pulo * 0.2];
    } else if (gesto === 'aplaudir') {
      const bate = Math.sin(t * 16 + this.altura * 20);
      for (let e = 0; e < 2; e++) {
        alvo.ombroX[e] = -1.15;
        alvo.ombroZ[e] = -0.32 + bate * 0.1;
        alvo.cotovelo[e] = -1.1;
      }
      alvo.cabecaX = -0.05;
    } else if (this.estado === 'sentado') {
      if (this.status === 'pensando') {
        alvo.ombroX[1] = -1.15;
        alvo.cotovelo[1] = -2.15;
        alvo.cabecaX = 0.02 + Math.sin(t * 0.8) * 0.04;
        alvo.troncoX = 0.02;
      } else if (this.status === 'falando' || this.falaLocal) {
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

    const taxa = Math.min(1, dt * (andando || gesto === 'comemorar' || gesto === 'aplaudir' ? 16 : 7));
    if (!this.valores) this.valores = JSON.parse(JSON.stringify(alvo));
    const v = this.valores;
    const chegar = (atual, desejado) => atual + (desejado - atual) * taxa;
    for (const chave of ['y', 'troncoX', 'troncoY', 'cabecaX', 'cabecaY', 'abertura']) v[chave] = chegar(v[chave], alvo[chave]);
    for (const chave of ['coxa', 'joelho', 'ombroX', 'ombroZ', 'cotovelo']) for (let e = 0; e < 2; e++) v[chave][e] = chegar(v[chave][e], alvo[chave][e]);
    if (this.estado === 'levantando' || this.estado === 'sentando') {
      v.y = alvo.y;
      for (const chave of ['coxa', 'joelho']) for (let e = 0; e < 2; e++) v[chave][e] = alvo[chave][e];
    }

    const j = this.juntas;
    j.quadril.position.y = v.y;
    j.tronco.rotation.x = v.troncoX;
    j.tronco.rotation.y = v.troncoY;
    j.tronco.scale.y = 1 + Math.sin(t * 1.6 + this.altura * 40) * 0.006;
    j.cabeca.rotation.x = v.cabecaX;
    j.cabeca.rotation.y = v.cabecaY;
    for (let e = 0; e < 2; e++) {
      const lado = e === 0 ? -1 : 1;
      j.pernas[e].rotation.x = v.coxa[e];
      j.pernas[e].rotation.z = lado * v.abertura * 0.5;
      j.joelhos[e].rotation.x = v.joelho[e];
      j.ombros[e].rotation.x = v.ombroX[e];
      j.ombros[e].rotation.z = lado * v.ombroZ[e];
      j.cotovelos[e].rotation.x = v.cotovelo[e];
    }

    // piscar
    this.proximaPiscada -= dt;
    if (this.proximaPiscada < 0) {
      j.olhos.scale.y = 0.15;
      if (this.proximaPiscada < -0.12) {
        j.olhos.scale.y = 1;
        this.proximaPiscada = 2.5 + Math.random() * 4.5;
      }
    }
  }

  mover(dt, fator) {
    const pos = this.raiz.position;
    let restante = VELOCIDADE_ANDAR * (this.velocidadePropria ?? 1) * Math.min(fator, 2.5) * dt;
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
      return this.estado === 'andando';
    }
    return true;
  }

  chegou(destino) {
    this.estado = 'conversando';
    this.tempo = destino.duracao ?? 5;
    for (const ouvinte of destino.ouvintes ?? []) {
      if (ouvinte !== this && !ouvinte.ausente) ouvinte.olhar = this.raiz.position;
    }
  }

  voltar() {
    const destino = this.destino;
    for (const ouvinte of destino.ouvintes ?? []) if (ouvinte.olhar === this.raiz.position) ouvinte.olhar = null;
    if (destino.naMesa) {
      this.estado = 'sentando';
      this.tempo = 0;
      return;
    }
    this.iniciarCaminho(this.mundo.rotaDeVolta(destino, this.casa), () => {
      this.estado = 'sentando';
      this.tempo = 0;
    });
  }
}
