// Prédio do grupo em 3D (Three.js). Por fora: o prédio na rua, com céu e sol no horário de Brasília.
// Por dentro: o térreo com a equipe; cada agente trabalha sentado, levanta, anda até quem recebe a
// mensagem, conversa e volta. Nada aqui chama IA: tudo é desenhado e animado no navegador.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Pessoa, suave, reduzido } from './cena/pessoas.js';
import {
  semente, canvasDe, textura, texturaDeCanvas, relevo, aspereza, desenharMadeira, desenharTapete, desenharConcreto,
  desenharAsfalto, desenharGrama, desenharFachadaCidade, desenharTela, desenharPainel, desenharFolhas,
} from './cena/texturas.js';
import { criarSom } from './cena/som.js';
import { ESTADOS } from './cena/brasil.js';

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
const X_PORTA = 11;
const X_TELAO = 11.45;
const MAPA = { x: 11.35, z: 2.0, lado: 1.5 };
const REUNIAO = { x: 1.4, z: 0, rx: 2.9, rz: 1.45 };

// Hora de Brasília, para o céu, o sol e quem está no escritório.
export function horaLocal(agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false }).formatToParts(agora);
  const v = (t) => partes.find((p) => p.type === t)?.value;
  return { h: (Number(v('hour')) % 24) + Number(v('minute')) / 60, fimDeSemana: ['Sat', 'Sun'].includes(v('weekday')) };
}

const CEUS = {
  dia: { sol: '#fff2de', intSol: 2.9, hemi: 0.42, env: 0.85, fog: '#b8b4aa', exp: 1.0 },
  tarde: { sol: '#ffb06a', intSol: 1.8, hemi: 0.28, env: 0.6, fog: '#918481', exp: 1.05 },
  noite: { sol: '#9fb3ff', intSol: 0.25, hemi: 0.07, env: 0.24, fog: '#33281a', exp: 1.3 },
};

export async function criarEscritorio3D(container, opcoes) {
  const {
    setores, agentes, aoClicarAgente, aoClicarCaixa, aoMudarModo, aoInfo, aoAviso,
    grupo = 'Pro Hunter Comercial', empresas = [], base = '',
  } = opcoes;
  await document.fonts?.ready;

  // ---------- renderização ----------
  const celular = matchMedia('(max-width: 700px)').matches || /Mobi|Android/i.test(navigator.userAgent);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, celular ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Prédio do grupo em 3D. Arraste para girar, role para aproximar.');
  renderer.domElement.setAttribute('role', 'img');
  container.append(renderer.domElement);
  const camadaRotulos = document.createElement('div');
  camadaRotulos.className = 'camada-rotulos';
  container.append(camadaRotulos);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 600);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envReserva = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environment = envReserva;

  let qualidade = celular ? 'leve' : 'alta';
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  const passeAO = new GTAOPass(cena, camera, 1, 1);
  passeAO.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.5, thickness: 1.4, scale: 1.15, samples: 16 });
  passeAO.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
  passeAO.blendIntensity = 0.85;
  const passeBrilho = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.5, 0.92);
  composer.addPass(new RenderPass(cena, camera));
  composer.addPass(passeAO);
  composer.addPass(passeBrilho);
  composer.addPass(new OutputPass());

  const controles = new OrbitControls(camera, renderer.domElement);
  controles.enableDamping = true;
  controles.dampingFactor = 0.08;
  controles.screenSpacePanning = false;
  const ALVO_INICIAL = new THREE.Vector3(-1.4, 0, 0.3);

  // ---------- materiais e ajudantes ----------
  const cache = new Map();
  const mat = (cor, rough = 0.8, extra = {}) => {
    const chave = `${cor}|${rough}|${JSON.stringify(extra)}`;
    if (!cache.has(chave)) cache.set(chave, new THREE.MeshStandardMaterial({ color: cor, roughness: rough, ...extra }));
    return cache.get(chave);
  };
  const paredeCanvas = canvasDe(512, 512, (c, w, h) => desenharConcreto(c, w, h, { tom: 238, placas: 0, nome: 'reboco' }));
  const M = {
    parede: new THREE.MeshStandardMaterial({ map: textura(paredeCanvas, { repetir: [6, 1] }), normalMap: relevo(paredeCanvas, 0.8, { repetir: [6, 1] }), roughness: 0.92 }),
    rodape: mat('#d6d1c9', 0.8),
    vidro: new THREE.MeshPhysicalMaterial({ color: '#e2eef3', roughness: 0.03, metalness: 0, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.4 }),
    vidroFosco: new THREE.MeshStandardMaterial({ color: '#f2f5f6', roughness: 0.5, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }),
    aluminio: mat('#9aa1a8', 0.3, { metalness: 0.9 }),
    grafite: mat('#2a2d33', 0.45, { metalness: 0.5 }),
    preto: mat('#141619', 0.3, { metalness: 0.3 }),
    carvalho: new THREE.MeshStandardMaterial({ color: '#c9a27a', roughness: 0.45 }),
    branco: mat('#f2f0eb', 0.45),
    tecido: new THREE.MeshPhysicalMaterial({ color: '#2f343b', roughness: 0.92, sheen: 0.5, sheenColor: '#6b7480', sheenRoughness: 0.8 }),
    sofa: new THREE.MeshPhysicalMaterial({ color: '#6f7f8f', roughness: 0.95, sheen: 0.6, sheenColor: '#b5c2cf', sheenRoughness: 0.7 }),
    teclado: mat('#d8dadd', 0.6),
    papel: mat('#fbfbf8', 0.9),
    folha: mat('#3d7a3a', 0.6, { side: THREE.DoubleSide }),
    folha2: mat('#2d6a35', 0.6, { side: THREE.DoubleSide }),
    vaso: new THREE.MeshPhysicalMaterial({ color: '#dcd6ca', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
    terra: mat('#3a2b20', 1),
    pedra: new THREE.MeshPhysicalMaterial({ color: '#30333a', roughness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.1 }),
    inox: mat('#c3c8cc', 0.22, { metalness: 1 }),
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
  const cilindro = (rt, rb, h, material, pos, { pai = cena, seg = 20, rot, sombra = true } = {}) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    m.castShadow = sombra;
    m.receiveShadow = true;
    return add(m, pai);
  };
  const clicaveis = [];
  const aoTrocarCeu = [];

  // ---------- luz ----------
  const sol = new THREE.DirectionalLight('#fff1dc', 2.6);
  sol.castShadow = true;
  sol.shadow.mapSize.set(celular ? 1024 : 2048, celular ? 1024 : 2048);
  Object.assign(sol.shadow.camera, { left: -30, right: 30, top: 24, bottom: -24, near: 1, far: 120 });
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.03;
  sol.shadow.radius = 5;
  add(sol);
  add(sol.target);
  const ceu = new THREE.HemisphereLight('#e2ecff', '#b7a184', 0.45);
  add(ceu);
  const luminarias = [];
  for (const x of [-8, -2, 4, 10]) {
    for (const z of [-3, 3]) {
      const luz = new THREE.PointLight('#ffd9a8', 0, 11, 1.6);
      luz.position.set(x, 2.75, z);
      luminarias.push(add(luz));
    }
  }

  // ---------- piso, laje e entorno ----------
  const largura = X_DIR - X_ESQ;
  const centroX = (X_DIR + X_ESQ) / 2;
  const madeiraCanvas = canvasDe(1024, 1024, desenharMadeira);
  const repMadeira = [largura / 1.8, (FUNDO * 2) / 1.8];
  const piso = new THREE.Mesh(
    new THREE.PlaneGeometry(largura, FUNDO * 2),
    new THREE.MeshStandardMaterial({
      map: textura(madeiraCanvas, { repetir: repMadeira, anisotropia: renderer.capabilities.getMaxAnisotropy() }),
      normalMap: relevo(madeiraCanvas, 2.5, { repetir: repMadeira }),
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughnessMap: aspereza(madeiraCanvas, 0.36, 0.35, { repetir: repMadeira }),
      roughness: 1,
    }),
  );
  piso.rotation.x = -Math.PI / 2;
  piso.position.set(centroX, 0, 0);
  piso.receiveShadow = true;
  add(piso);
  const concretoCanvas = canvasDe(512, 512, (c, w, h) => desenharConcreto(c, w, h, { tom: 196, placas: 0, nome: 'laje' }));
  const matLaje = new THREE.MeshStandardMaterial({ map: textura(concretoCanvas, { repetir: [8, 1] }), normalMap: relevo(concretoCanvas, 1.2, { repetir: [8, 1] }), roughness: 0.9 });
  caixa(largura + 0.6, 0.36, FUNDO * 2 + 0.6, matLaje, [centroX, -0.18, 0]);
  const chaoCanvas = canvasDe(512, 512, (c, w, h) => desenharConcreto(c, w, h, { tom: 186, placas: 2, nome: 'chão' }));
  const matChao = new THREE.MeshStandardMaterial({ map: textura(chaoCanvas, { repetir: [80, 80] }), normalMap: relevo(chaoCanvas, 1, { repetir: [80, 80] }), roughness: 0.95 });
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), matChao);
  chao.rotation.x = -Math.PI / 2;
  chao.position.y = -0.375;
  chao.receiveShadow = true;
  add(chao);
  const gramaCanvas = canvasDe(512, 512, desenharGrama);
  for (const [x0, x1, z0, z1] of [[-60, 40, -60, -FUNDO - 0.3], [-60, X_ESQ - 0.3, -FUNDO - 0.3, FUNDO + 0.3], [X_DIR + 0.3, 40, -FUNDO - 0.3, FUNDO + 0.3]]) {
    const w = x1 - x0;
    const d = z1 - z0;
    const rep = [w / 6, d / 6];
    const grama = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: textura(gramaCanvas, { repetir: rep }), normalMap: relevo(gramaCanvas, 2, { repetir: rep }), roughness: 0.95 }));
    grama.rotation.x = -Math.PI / 2;
    grama.position.set((x0 + x1) / 2, -0.37, (z0 + z1) / 2);
    grama.receiveShadow = true;
    add(grama);
  }

  // ---------- paredes com janelas ----------
  function paredeComJanelas(comprimento, pos, rotY) {
    const g = new THREE.Group();
    g.position.set(...pos);
    g.rotation.y = rotY;
    caixa(comprimento, 0.9, 0.2, M.parede, [comprimento / 2, 0.45, 0], { pai: g });
    caixa(comprimento, 0.1, 0.28, M.aluminio, [comprimento / 2, 0.93, 0.02], { pai: g });
    caixa(comprimento, ALTURA_PAREDE - 2.7, 0.2, M.parede, [comprimento / 2, (2.7 + ALTURA_PAREDE) / 2, 0], { pai: g });
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(comprimento, 1.72), M.vidro);
    vidro.position.set(comprimento / 2, 1.85, 0);
    g.add(vidro);
    const vaos = Math.round(comprimento / 1.6);
    for (let i = 0; i <= vaos; i++) caixa(0.07, 1.76, 0.12, M.aluminio, [(i * comprimento) / vaos, 1.85, 0], { pai: g });
    caixa(comprimento, 0.06, 0.12, M.aluminio, [comprimento / 2, 2.7, 0], { pai: g });
    add(g);
  }
  paredeComJanelas(largura + 0.2, [X_ESQ - 0.1, 0, -FUNDO - 0.1], 0);
  paredeComJanelas(FUNDO * 2 + 0.2, [X_ESQ - 0.1, 0, FUNDO + 0.1], Math.PI / 2);
  caixa(0.22, ALTURA_PAREDE, FUNDO * 2 + 0.4, M.parede, [X_DIR + 0.11, ALTURA_PAREDE / 2, 0]);
  caixa(0.04, 0.1, FUNDO * 2, M.rodape, [X_DIR - 0.01, 0.05, 0], { sombra: false });

  // ---------- móveis ----------
  const texturasTela = new Map();
  const telaDe = (setor, variante) => {
    const chave = `${setor.id}${variante}`;
    if (!texturasTela.has(chave)) texturasTela.set(chave, texturaDeCanvas(256, 160, (c, w, h) => desenharTela(c, w, h, setor.cor, variante)));
    return texturasTela.get(chave);
  };
  const perna = new THREE.BoxGeometry(0.05, 0.03, 0.34).translate(0, 0.07, 0.17);
  const rodinha = new THREE.SphereGeometry(0.03, 8, 6).translate(0, 0.03, 0.33);
  const geoEstrela = mergeGeometries(Array.from({ length: 5 }, (_, i) => mergeGeometries([perna.clone(), rodinha.clone()]).rotateY((i * Math.PI * 2) / 5)));

  function criarCadeira(pai, escala = 1) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(geoEstrela, M.grafite);
    base.castShadow = true;
    g.add(base);
    caixa(0.05, 0.3, 0.05, M.inox, [0, 0.25, 0], { pai: g });
    caixa(0.5, 0.08, 0.48, M.tecido, [0, 0.44, 0], { raio: 0.035, pai: g });
    caixa(0.46, 0.56, 0.07, M.tecido, [0, 0.8, -0.25], { raio: 0.035, pai: g, rot: [-0.1, 0, 0] });
    caixa(0.06, 0.32, 0.03, M.grafite, [0, 0.57, -0.27], { pai: g });
    for (const lado of [-1, 1]) {
      caixa(0.05, 0.04, 0.3, M.grafite, [lado * 0.27, 0.62, -0.02], { pai: g, raio: 0.015 });
      caixa(0.03, 0.16, 0.03, M.grafite, [lado * 0.27, 0.53, -0.1], { pai: g });
    }
    g.scale.setScalar(escala);
    pai.add(g);
    return g;
  }

  function criarMesa(setor, variante, r, { comercial = false } = {}) {
    const g = new THREE.Group();
    caixa(1.55, 0.035, 0.76, M.carvalho, [0, 0.74, 0], { raio: 0.012, pai: g });
    for (const lado of [-1, 1]) {
      caixa(0.05, 0.72, 0.05, M.grafite, [lado * 0.72, 0.36, 0.3], { pai: g });
      caixa(0.05, 0.72, 0.05, M.grafite, [lado * 0.72, 0.36, -0.3], { pai: g });
      caixa(0.05, 0.05, 0.62, M.grafite, [lado * 0.72, 0.05, 0], { pai: g });
    }
    caixa(1.4, 0.3, 0.02, M.grafite, [0, 0.5, -0.32], { pai: g });
    caixa(1.0, 0.06, 0.12, M.grafite, [0, 0.66, -0.25], { pai: g, sombra: false });
    caixa(0.22, 0.012, 0.15, M.grafite, [0, 0.763, -0.2], { pai: g, raio: 0.005 });
    caixa(0.035, 0.32, 0.03, M.inox, [0, 0.9, -0.22], { pai: g });
    caixa(0.64, 0.38, 0.03, M.preto, [0, 1.13, -0.2], { raio: 0.012, pai: g });
    const telaMat = new THREE.MeshStandardMaterial({ color: '#000000', emissive: '#ffffff', emissiveMap: telaDe(setor, variante), emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.2 });
    const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.345), telaMat);
    tela.position.set(0, 1.13, -0.183);
    g.add(tela);
    caixa(0.44, 0.018, 0.14, M.teclado, [0, 0.765, 0.14], { raio: 0.006, pai: g, sombra: false });
    caixa(0.06, 0.022, 0.1, M.teclado, [0.33, 0.766, 0.15], { raio: 0.01, pai: g, sombra: false });
    caixa(0.24, 0.003, 0.2, mat('#2b2f36', 0.9), [0.33, 0.758, 0.15], { pai: g, sombra: false });
    if (comercial) {
      // telefone de mesa: o time comercial liga para os buffets
      caixa(0.2, 0.05, 0.18, M.preto, [-0.48, 0.78, -0.05], { pai: g, raio: 0.02, rot: [0, 0.3, 0] });
      caixa(0.2, 0.04, 0.05, M.preto, [-0.48, 0.82, -0.1], { pai: g, raio: 0.02, rot: [0, 0.3, 0] });
    } else if (r() < 0.45) {
      caixa(0.32, 0.015, 0.22, M.aluminio, [-0.45, 0.765, 0.02], { pai: g, raio: 0.006, rot: [0, 0.2, 0] });
      caixa(0.32, 0.21, 0.01, M.aluminio, [-0.45, 0.87, -0.08], { pai: g, raio: 0.006, rot: [-0.25, 0.2, 0] });
    }
    if (r() < 0.7) cilindro(0.04, 0.036, 0.1, mat(['#f2f0eb', '#2d3a4a', setor.cor, '#c7563f'][Math.floor(r() * 4)], 0.3), [-0.58, 0.81, 0.15], { pai: g, seg: 16 });
    if (r() < 0.6) caixa(0.21, 0.02 + r() * 0.03, 0.3, M.papel, [-0.22, 0.77, -0.02], { pai: g, rot: [0, r() - 0.5, 0], sombra: false });
    if (r() < 0.3) {
      cilindro(0.06, 0.05, 0.1, M.vaso, [0.62, 0.81, -0.25], { pai: g, seg: 14 });
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
    cilindro(0.24, 0.18, 0.46, M.vaso, [0, 0.23, 0], { pai: g, seg: 28 });
    cilindro(0.22, 0.22, 0.02, M.terra, [0, 0.45, 0], { pai: g, seg: 20, sombra: false });
    cilindro(0.018, 0.024, altura - 0.4, mat('#5b4a36', 0.9), [0, 0.45 + (altura - 0.4) / 2, 0], { pai: g, seg: 8 });
    const folhaGeo = new THREE.SphereGeometry(1, 10, 8);
    const n = 18;
    for (let i = 0; i < n; i++) {
      const piv = new THREE.Group();
      piv.position.y = 0.78 + (i / n) * (altura - 0.78);
      piv.rotation.set(0.55 + r() * 0.6, i * 2.4, 0);
      const folha = new THREE.Mesh(folhaGeo, i % 2 ? M.folha : M.folha2);
      folha.scale.set(0.075, 0.014, 0.26 - (i / n) * 0.08);
      folha.position.z = 0.24;
      folha.castShadow = true;
      piv.add(folha);
      g.add(piv);
    }
    add(g);
  }

  // ---------- setores, mesas e pessoas ----------
  const mundo = {};
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
  const malhasPessoas = [];
  const mesasComerciais = [];
  fileiras.forEach((fileira, indiceFila) => {
    const sinal = indiceFila === 0 ? -1 : 1;
    let x = X_FILAS;
    fileira.forEach((setor, i) => {
      const xIni = x;
      const xFim = x + setor.agentes.length * PASSO_MESA;
      const tapeteLarg = xFim - xIni + 0.3;
      const tapeteProf = FUNDO - 1.95 - 0.35;
      const tapeteCanvas = canvasDe(1024, Math.round((1024 * tapeteProf) / tapeteLarg), (c, w, h) => desenharTapete(c, w, h, setor.cor, setor.nome, sinal < 0));
      const tapete = new THREE.Mesh(new THREE.PlaneGeometry(tapeteLarg, tapeteProf), new THREE.MeshStandardMaterial({ map: textura(tapeteCanvas), normalMap: relevo(tapeteCanvas, 1.6), roughness: 0.98 }));
      tapete.rotation.x = -Math.PI / 2;
      tapete.position.set((xIni + xFim) / 2, 0.004, sinal * (1.95 + tapeteProf / 2));
      tapete.receiveShadow = true;
      add(tapete);

      const pessoasDoSetor = [];
      setor.agentes.forEach((id, k) => {
        const agente = agentes[id];
        if (!agente) return;
        const r = semente(`mesa ${id}`);
        const comercial = setor.id === 'comercial';
        const xm = xIni + (k + 0.5) * PASSO_MESA;
        const { grupo: mesa, telaMat } = criarMesa(setor, k % 3, r, { comercial });
        mesa.position.set(xm, 0, sinal * Z_MESA);
        mesa.rotation.y = sinal < 0 ? 0 : Math.PI;
        add(mesa);
        const cadeiraPai = new THREE.Group();
        cadeiraPai.position.set(xm, 0, sinal * Z_ASSENTO);
        cadeiraPai.rotation.y = sinal < 0 ? Math.PI : 0;
        add(cadeiraPai);
        const cadeira = criarCadeira(cadeiraPai);
        cadeira.position.z = -0.08;
        const assento = { x: xm, z: sinal * (Z_ASSENTO - 0.02) };
        const passagem = { x: xm, z: sinal * Z_PASSAGEM };
        const casa = {
          assento, passagem, pe: { x: xm, z: (assento.z + passagem.z) / 2 },
          rumo: sinal < 0 ? Math.PI : 0, anexo: xm, sinal, cadeira, cadeiraZ: -0.08, telaMat, mesa,
        };
        const pessoa = new Pessoa(agente, setor, casa, { mundo, fone: comercial });
        add(pessoa.raiz);
        malhasPessoas.push(...pessoa.malhas);
        pessoas.set(id, pessoa);
        pessoasDoSetor.push(pessoa);
        if (comercial) mesasComerciais.push({ pessoa, mesa });
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

  // ---------- sala do CEO, com você ----------
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
  const wCEO = X_SALA_CEO - X_ESQ;
  const vidroFrente = new THREE.Mesh(new THREE.BoxGeometry(wCEO, 2.6, 0.03), M.vidro);
  vidroFrente.position.set((X_ESQ + X_SALA_CEO) / 2, 1.3, cantoCEO.z);
  add(vidroFrente);
  caixa(wCEO, 0.07, 0.07, M.aluminio, [(X_ESQ + X_SALA_CEO) / 2, 2.62, cantoCEO.z]);
  const tapeteCEO = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.8), mat('#8a8174', 0.98));
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
  caixa(0.34, 0.015, 0.24, M.aluminio, [0.5, 0.78, 0.05], { pai: mesaCEO, raio: 0.006 });
  caixa(0.34, 0.23, 0.01, M.aluminio, [0.5, 0.89, -0.06], { pai: mesaCEO, raio: 0.006, rot: [-0.3, 0, 0] });
  const placa = texturaDeCanvas(256, 64, (c, w, h) => {
    c.fillStyle = '#1c1f24';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#e9e4da';
    c.font = '700 36px "Familjen Grotesk", "Helvetica Neue", Arial, sans-serif';
    c.textBaseline = 'middle';
    c.fillText('CEO', 22, h / 2 + 2);
  });
  const plaqueta = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.03), [M.preto, M.preto, M.preto, M.preto, new THREE.MeshStandardMaterial({ map: placa, roughness: 0.4 }), M.preto]);
  plaqueta.position.set(-0.55, 0.81, -0.32);
  plaqueta.rotation.y = Math.PI;
  mesaCEO.add(plaqueta);
  add(mesaCEO);
  const cadeiraCEOPai = new THREE.Group();
  cadeiraCEOPai.position.set(ceo.x - 0.78, 0, ceo.z);
  cadeiraCEOPai.rotation.y = Math.PI / 2;
  add(cadeiraCEOPai);
  const cadeiraCEO = criarCadeira(cadeiraCEOPai, 1.08);
  const sofa = new THREE.Group();
  sofa.position.set(-15.75, 0, -0.5);
  sofa.rotation.y = Math.PI / 2;
  caixa(2.0, 0.42, 0.86, M.sofa, [0, 0.25, 0], { raio: 0.08, pai: sofa });
  caixa(2.0, 0.5, 0.22, M.sofa, [0, 0.62, -0.33], { raio: 0.08, pai: sofa });
  for (const lado of [-1, 1]) caixa(0.2, 0.34, 0.86, M.sofa, [lado * 0.92, 0.55, 0], { raio: 0.08, pai: sofa });
  for (const lado of [-0.5, 0.5]) caixa(0.85, 0.12, 0.7, M.sofa, [lado, 0.5, 0.04], { raio: 0.05, pai: sofa });
  add(sofa);
  criarPlanta([-15.85, 0, -5.6], 1.5, 'planta ceo');
  const voce = new Pessoa(
    { id: 'ceo', nome: 'Você', cargo: 'CEO', status: 'trabalhando', aparencia: { camisa: '#1d2633', calca: '#2b2d31', cabelo: 'curto', altura: 1.0 } },
    { id: 'ceo', nome: 'CEO', cor: '#1A2130' },
    {
      assento: { x: ceo.x - 0.76, z: ceo.z }, passagem: { x: -15.6, z: -2.2 }, pe: { x: -15.5, z: -3.0 },
      rumo: Math.PI / 2, anexo: -11.2, sinal: -1, cadeira: cadeiraCEO, cadeiraZ: 0,
    },
    { mundo },
  );
  add(voce.raiz);

  // ---------- recepção, totem, elevador, copa e mesa do mapa ----------
  const figurantes = [voce];
  {
    const setorRecepcao = { id: 'recepcao', nome: 'Recepção', cor: '#7a8794' };
    const { grupo: balcao } = criarMesa(setorRecepcao, 0, semente('recepção'));
    balcao.position.set(9.4, 0, 4.15);
    balcao.rotation.y = Math.PI;
    add(balcao);
    caixa(1.75, 1.08, 0.06, M.branco, [9.4, 0.54, 4.6], { raio: 0.01 });
    caixa(1.8, 0.04, 0.22, M.carvalho, [9.4, 1.1, 4.62], { raio: 0.01 });
    const cadeiraPai = new THREE.Group();
    cadeiraPai.position.set(9.4, 0, 3.55);
    add(cadeiraPai);
    const cadeira = criarCadeira(cadeiraPai);
    const recepcionista = new Pessoa(
      { id: 'recepção do prédio', nome: 'Recepção', cargo: '', status: 'trabalhando' },
      setorRecepcao,
      { assento: { x: 9.4, z: 3.57 }, passagem: { x: 9.4, z: 3.0 }, rumo: 0, anexo: 9.4, sinal: 1, cadeira, cadeiraZ: 0 },
      { mundo },
    );
    add(recepcionista.raiz);
    figurantes.push(recepcionista);
  }
  const diretorio = texturaDeCanvas(512, 1024, (c, w) => {
    c.fillStyle = '#18202b';
    c.fillRect(0, 0, w, 1024);
    c.fillStyle = '#D98A1E';
    c.fillRect(48, 70, 70, 8);
    c.fillStyle = '#eef2f7';
    c.font = '700 52px "Familjen Grotesk", "Helvetica Neue", Arial, sans-serif';
    const [l1, ...resto] = grupo.toUpperCase().split(' ');
    c.fillText(l1, 48, 150);
    c.fillText(resto.join(' '), 48, 210);
    c.font = '500 24px "IBM Plex Mono", Menlo, monospace';
    c.fillStyle = '#8fa0b5';
    c.fillText('EMPRESAS DO GRUPO', 48, 300);
    let y = 380;
    for (const nome of empresas) {
      c.fillStyle = '#D98A1E';
      c.fillRect(48, y - 30, 10, 40);
      c.fillStyle = '#eef2f7';
      c.font = '600 40px "IBM Plex Sans", "Segoe UI", sans-serif';
      c.fillText(nome, 76, y);
      c.font = '400 24px "IBM Plex Sans", "Segoe UI", sans-serif';
      c.fillStyle = '#aab6c6';
      c.fillText('Térreo', 76, y + 36);
      y += 120;
    }
    c.font = '400 26px "IBM Plex Sans", "Segoe UI", sans-serif';
    c.fillStyle = '#6f7d90';
    c.fillText('1º e 2º andares: em breve', 48, y + 10);
  });
  const totem = new THREE.Group();
  totem.position.set(12.75, 0, 4.25);
  totem.rotation.y = -0.55;
  caixa(1.0, 2.1, 0.14, M.preto, [0, 1.05, 0], { raio: 0.02, pai: totem });
  const painelTotem = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.8), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: diretorio, emissiveIntensity: 0.95, roughness: 0.2 }));
  painelTotem.position.set(0, 1.1, 0.075);
  totem.add(painelTotem);
  add(totem);

  // elevador na parede da direita
  const elevador = new THREE.Group();
  elevador.position.set(X_DIR - 0.02, 0, 0.0);
  caixa(0.06, 2.45, 1.5, M.inox, [-0.03, 1.22, 0], { pai: elevador });
  const portasElevador = [-1, 1].map((lado) => caixa(0.04, 2.15, 0.58, M.inox, [-0.08, 1.08, lado * 0.29], { pai: elevador }));
  const visor = texturaDeCanvas(128, 64, (c, w, h) => {
    c.fillStyle = '#05070a';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#ff9b3d';
    c.font = '700 40px "IBM Plex Mono", Menlo, monospace';
    c.textBaseline = 'middle';
    c.fillText('T ▲', 18, h / 2 + 2);
  });
  const visorMalha = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: visor, emissiveIntensity: 1.2 }));
  visorMalha.position.set(-0.07, 2.32, 0);
  visorMalha.rotation.y = -Math.PI / 2;
  elevador.add(visorMalha);
  const botaoElevador = caixa(0.03, 0.18, 0.08, M.preto, [-0.07, 1.1, 0.85], { pai: elevador });
  add(elevador);
  for (const m of [...portasElevador, botaoElevador]) {
    m.userData.tipo = 'elevador';
    clicaveis.push(m);
  }
  let aberturaElevador = 0;
  let elevadorAlvo = 0;

  const xCopa = X_DIR - 0.34;
  caixa(0.62, 0.88, 2.3, M.branco, [xCopa, 0.44, -2.6], { raio: 0.01 });
  caixa(0.66, 0.04, 2.36, M.pedra, [xCopa, 0.9, -2.6], { raio: 0.005 });
  caixa(0.34, 0.42, 0.34, M.preto, [xCopa, 1.13, -3.3], { raio: 0.03 });
  caixa(0.1, 0.08, 0.12, M.inox, [xCopa - 0.18, 0.99, -3.3]);
  for (let i = 0; i < 4; i++) cilindro(0.035, 0.03, 0.09, M.branco, [xCopa + 0.04, 0.965, -2.5 + i * 0.12], { seg: 14 });
  criarPlanta([12.95, 0, 2.95], 1.35, 'planta copa');
  criarPlanta([-11.35, 0, 5.5], 1.45, 'planta frente');

  // ---------- telão da caixa de comunicação ----------
  const telaoCanvas = document.createElement('canvas');
  telaoCanvas.width = 1024;
  telaoCanvas.height = 576;
  const telaoTextura = new THREE.CanvasTexture(telaoCanvas);
  telaoTextura.colorSpace = THREE.SRGBColorSpace;
  telaoTextura.anisotropy = 8;
  caixa(3.75, 2.15, 0.08, M.preto, [X_TELAO, 1.75, -FUNDO + 0.06], { raio: 0.02 });
  const telao = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.02), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: telaoTextura, emissiveIntensity: 1.05, roughness: 0.2 }));
  telao.position.set(X_TELAO, 1.75, -FUNDO + 0.105);
  telao.userData.tipo = 'caixa';
  add(telao);
  clicaveis.push(telao);

  // ---------- mesa do mapa dos leads ----------
  const mapaGrupo = new THREE.Group();
  mapaGrupo.position.set(MAPA.x, 0, MAPA.z);
  caixa(MAPA.lado + 0.2, 0.06, MAPA.lado + 0.2, M.pedra, [0, 0.95, 0], { pai: mapaGrupo, raio: 0.02 });
  caixa(0.5, 0.9, 0.5, M.grafite, [0, 0.45, 0], { pai: mapaGrupo, raio: 0.03 });
  const escalaMapa = 1.32 / 40;
  const projetar = (lon, lat) => [(lon + 54) * escalaMapa, -(lat + 14.5) * escalaMapa];
  const geosEstados = [];
  const geosMinas = [];
  for (const estado of ESTADOS) {
    for (const anel of estado.a) {
      const forma = new THREE.Shape(anel.map(([lon, lat]) => {
        const [x, z] = projetar(lon, lat);
        return new THREE.Vector2(x, -z);
      }));
      const g = new THREE.ExtrudeGeometry(forma, { depth: 0.012, bevelEnabled: false });
      g.rotateX(-Math.PI / 2);
      (estado.s === 'MG' ? geosMinas : geosEstados).push(g);
    }
  }
  for (const [geos, cor] of [[geosEstados, '#d9d2c3'], [geosMinas, '#e7c79a']]) {
    if (!geos.length) continue;
    const malha = new THREE.Mesh(mergeGeometries(geos), new THREE.MeshStandardMaterial({ color: cor, roughness: 0.7 }));
    malha.position.y = 0.982;
    malha.receiveShadow = true;
    mapaGrupo.add(malha);
    const bordas = new THREE.LineSegments(new THREE.EdgesGeometry(malha.geometry, 30), new THREE.LineBasicMaterial({ color: '#8a8070' }));
    bordas.position.y = 0.9825;
    mapaGrupo.add(bordas);
  }
  const pinos = new THREE.Group();
  mapaGrupo.add(pinos);
  add(mapaGrupo);

  // ---------- telão: modos ----------
  const historico = [];
  let totalMensagens = 0;
  let nomeDe = (id) => agentes[id]?.nome ?? id;
  let corDe = (id) => pessoas.get(id)?.setor.cor ?? '#8a93a3';
  let modoTelao = 'mensagens';
  let pauta = [];
  let sprint = null;
  let dados = null;
  const horaTexto = () => new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  function desenharTelao() {
    const ctx = telaoCanvas.getContext('2d');
    const w = telaoCanvas.width;
    const h = telaoCanvas.height;
    if (modoTelao === 'reuniao') {
      desenharPainel(ctx, w, h, { titulo: 'Reunião da manhã', total: horaTexto(), ultimas: pauta.map((p, i) => ({ cabecalho: `${i + 1}. ${p.titulo}`, texto: p.texto, cor: '#D98A1E' })) });
    } else if (modoTelao === 'sprint' && sprint) {
      const m = Math.floor(sprint.restante / 60);
      const s = String(Math.floor(sprint.restante % 60)).padStart(2, '0');
      desenharPainel(ctx, w, h, {
        titulo: 'Sprint de prospecção', total: `${sprint.abordagens} abordagens`, destaque: `${m}:${s}`,
        ultimas: [{ cabecalho: 'Foco total: a equipe fica em silêncio até o fim.', texto: 'Cada abordagem feita é um clique em +1 abordagem.' }],
      });
    } else {
      desenharPainel(ctx, w, h, {
        titulo: 'Caixa de comunicação', total: `${totalMensagens} ${totalMensagens === 1 ? 'mensagem' : 'mensagens'}`,
        ultimas: historico.slice(-4).reverse(),
      });
    }
    telaoTextura.needsUpdate = true;
  }
  desenharTelao();

  // ---------- o prédio por fora ----------
  const C = {
    concreto: new THREE.MeshStandardMaterial({ map: textura(concretoCanvas, { repetir: [10, 1] }), normalMap: relevo(concretoCanvas, 1, { repetir: [10, 1] }), color: '#ece8e0', roughness: 0.85, transparent: true }),
    vidroAzul: new THREE.MeshPhysicalMaterial({ color: '#3d6680', roughness: 0.04, metalness: 0.7, envMapIntensity: 1.6, transparent: true }),
    vidroClaro: new THREE.MeshPhysicalMaterial({ color: '#dcebf2', roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.5 }),
    aluminio: new THREE.MeshStandardMaterial({ color: '#a3aab1', roughness: 0.3, metalness: 0.9, transparent: true }),
    escuro: new THREE.MeshStandardMaterial({ color: '#1b222d', roughness: 0.45, transparent: true }),
  };
  for (const m of Object.values(C)) m.userData.base = m.opacity;
  const marca = texturaDeCanvas(2048, 256, (c, w, h) => {
    c.fillStyle = '#1b222d';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#D98A1E';
    c.fillRect(70, 88, 80, 80);
    c.fillStyle = '#f4f1ea';
    const texto = grupo.toUpperCase();
    let tamanho = 150;
    do {
      c.font = `700 ${tamanho}px "Familjen Grotesk", "Helvetica Neue", Arial, sans-serif`;
      tamanho -= 6;
    } while (c.measureText(texto).width > w - 196 - 70 && tamanho > 40);
    c.textBaseline = 'middle';
    c.fillText(texto, 196, h / 2 + 8);
  });
  const matMarca = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: marca, emissiveIntensity: 0.9, transparent: true });
  matMarca.userData.base = 1;
  const placarCanvas = document.createElement('canvas');
  placarCanvas.width = 2048;
  placarCanvas.height = 96;
  const placarTextura = new THREE.CanvasTexture(placarCanvas);
  placarTextura.colorSpace = THREE.SRGBColorSpace;
  const matPlacar = new THREE.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: placarTextura, emissiveIntensity: 1.2, transparent: true });
  matPlacar.userData.base = 1;
  function desenharPlacar() {
    const c = placarCanvas.getContext('2d');
    const w = placarCanvas.width;
    const h = placarCanvas.height;
    c.fillStyle = '#07090c';
    c.fillRect(0, 0, w, h);
    const v = dados?.validacao;
    const texto = v
      ? `ABORDADOS ${v.abordados ?? 0}   ·   ACEITARAM O TESTE ${v.aceitaram ?? 0}   ·   PAGANDO ${v.pagando ?? 0}`
      : `${grupo.toUpperCase()}   ·   ORKESTRA NO TÉRREO`;
    c.font = '700 58px "IBM Plex Mono", Menlo, monospace';
    c.textBaseline = 'middle';
    c.fillStyle = '#ff9b3d';
    c.fillText(texto, Math.max(30, (w - c.measureText(texto).width) / 2), h / 2 + 3);
    c.fillStyle = 'rgba(0,0,0,0.35)';
    for (let x = 0; x < w; x += 6) c.fillRect(x, 0, 2, h);
    for (let y = 0; y < h; y += 6) c.fillRect(0, y, w, 2);
    placarTextura.needsUpdate = true;
  }
  desenharPlacar();
  const materiaisCasca = [...Object.values(C), matMarca, matPlacar];

  const casca = new THREE.Group();
  const andares = new THREE.Group();
  const fachada = new THREE.Group();
  const frente = new THREE.Group();
  casca.add(andares, fachada, frente);
  add(casca);
  const bloco = (w, h, d, material, pos, pai) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(...pos);
    m.castShadow = true;
    m.receiveShadow = true;
    pai.add(m);
    return m;
  };
  const L = largura + 0.6;
  const P = FUNDO * 2 + 0.6;
  const ALT_ANDAR = 3.3;
  const N_ANDARES = 2;
  const montantes = [];
  for (let k = 0; k < N_ANDARES; k++) {
    const y0 = ALTURA_PAREDE + k * ALT_ANDAR;
    bloco(L, 0.5, P, C.concreto, [centroX, y0 + 0.25, 0], andares);
    bloco(L - 0.2, ALT_ANDAR - 0.5, P - 0.2, C.vidroAzul, [centroX, y0 + 0.5 + (ALT_ANDAR - 0.5) / 2, 0], andares);
    const yM = y0 + 0.5 + (ALT_ANDAR - 0.5) / 2;
    for (let x = X_ESQ; x <= X_DIR + 0.01; x += (X_DIR - X_ESQ) / 18) montantes.push([x, yM, P / 2 - 0.08], [x, yM, -P / 2 + 0.08]);
    for (let z = -FUNDO; z <= FUNDO + 0.01; z += (FUNDO * 2) / 8) montantes.push([X_ESQ - 0.22, yM, z], [X_DIR + 0.22, yM, z]);
  }
  const yTopo = ALTURA_PAREDE + N_ANDARES * ALT_ANDAR;
  const instancias = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, ALT_ANDAR - 0.5, 0.12), C.aluminio, montantes.length);
  const matriz = new THREE.Matrix4();
  montantes.forEach((p, i) => instancias.setMatrixAt(i, matriz.makeTranslation(...p)));
  instancias.castShadow = true;
  andares.add(instancias);
  bloco(L, 0.45, P, C.concreto, [centroX, yTopo + 0.22, 0], andares);
  for (const [w, d, x, z] of [[L, 0.25, centroX, P / 2 - 0.12], [L, 0.25, centroX, -P / 2 + 0.12], [0.25, P, X_ESQ - 0.18, 0], [0.25, P, X_DIR + 0.18, 0]]) {
    bloco(w, 0.7, d, C.concreto, [x, yTopo + 0.8, z], andares);
  }
  bloco(3.2, 1.3, 2.2, C.aluminio, [-6, yTopo + 1.1, -2.5], andares);
  bloco(2.2, 1.0, 1.8, C.aluminio, [4, yTopo + 0.95, -3.2], andares);
  bloco(1.6, 2.4, 1.6, C.escuro, [8.5, yTopo + 1.6, -1], andares);
  for (let i = 0; i < 6; i++) bloco(1.7, 0.05, 1.0, C.escuro, [-12 + i * 1.9, yTopo + 0.75, 2.4], andares).rotation.x = -0.35;
  const letreiro = new THREE.Group();
  letreiro.position.set(centroX, yTopo + 2.35, P / 2 - 0.3);
  bloco(16.4, 2.1, 0.3, C.escuro, [0, 0, 0], letreiro);
  const letras = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.0), matMarca);
  letras.position.z = 0.16;
  letreiro.add(letras);
  for (const x of [-6, 6]) bloco(0.15, 1.2, 0.15, C.aluminio, [x, -1.4, -0.1], letreiro);
  andares.add(letreiro);

  // fachada de vidro do térreo, portas, marquise e placar de LED
  const zFachada = FUNDO + 0.14;
  for (const [x0, x1] of [[X_ESQ - 0.2, X_PORTA - 0.72], [X_PORTA + 0.72, X_DIR + 0.2]]) {
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, ALTURA_PAREDE - 0.4), C.vidroClaro);
    vidro.position.set((x0 + x1) / 2, (ALTURA_PAREDE - 0.4) / 2 + 0.05, zFachada);
    fachada.add(vidro);
  }
  for (let x = X_ESQ - 0.2; x <= X_DIR + 0.21; x += 1.6) {
    if (Math.abs(x - X_PORTA) < 0.9) continue;
    bloco(0.07, ALTURA_PAREDE - 0.35, 0.1, C.aluminio, [x, (ALTURA_PAREDE - 0.35) / 2, zFachada], fachada);
  }
  for (const x of [X_PORTA - 0.74, X_PORTA + 0.74]) bloco(0.1, 2.62, 0.14, C.aluminio, [x, 1.31, zFachada], fachada);
  bloco(L, 0.4, 0.3, C.concreto, [centroX, ALTURA_PAREDE - 0.2, zFachada], fachada);
  const placar = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.3), matPlacar);
  placar.position.set(centroX - 3, ALTURA_PAREDE - 0.2, zFachada + 0.16);
  fachada.add(placar);
  bloco(L, 0.06, 0.14, C.aluminio, [centroX, 0.03, zFachada], fachada);
  bloco(4.4, 0.22, 2.2, C.escuro, [X_PORTA, 2.72, zFachada + 1.1], fachada);
  for (const dx of [-1.2, 0, 1.2]) {
    const spot = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff4dc', emissiveIntensity: 0.4 }));
    spot.rotation.x = Math.PI / 2;
    spot.position.set(X_PORTA + dx, 2.6, zFachada + 1.3);
    fachada.add(spot);
    aoTrocarCeu.push((noite) => {
      spot.material.emissiveIntensity = noite ? 3 : 0.4;
    });
  }
  const portas = [-1, 1].map((lado) => {
    const g = new THREE.Group();
    g.position.set(X_PORTA + lado * 0.36, 0, zFachada + 0.05);
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 2.5), C.vidroClaro);
    vidro.position.y = 1.27;
    g.add(vidro);
    for (const y of [0.03, 2.52]) bloco(0.72, 0.05, 0.05, C.aluminio, [0, y, 0], g);
    bloco(0.04, 0.9, 0.04, C.aluminio, [lado * -0.28, 1.1, 0.05], g);
    fachada.add(g);
    return { g, lado, fechado: X_PORTA + lado * 0.36 };
  });
  let aberturaPorta = 0;
  let portaAlvo = 0;

  // calçada, rua, faixa de pedestres
  const yCalcada = -0.24;
  const calcadaCanvas = canvasDe(512, 512, (c, w, h) => desenharConcreto(c, w, h, { tom: 205, placas: 4, nome: 'calçada' }));
  const repCalcada = [70 / 2.4, 4.4 / 2.4];
  const matCalcada = new THREE.MeshStandardMaterial({ map: textura(calcadaCanvas, { repetir: repCalcada }), normalMap: relevo(calcadaCanvas, 2, { repetir: repCalcada }), roughness: 0.9 });
  const calcada = new THREE.Mesh(new THREE.BoxGeometry(70, 0.14, 4.4), matCalcada);
  calcada.position.set(centroX, yCalcada - 0.07, FUNDO + 0.3 + 2.2);
  calcada.receiveShadow = true;
  add(calcada);
  const calcada2 = calcada.clone();
  calcada2.position.z = FUNDO + 12.7 + 2.2;
  add(calcada2);
  caixa(70, 0.15, 0.2, mat('#bdb7ad', 0.85), [centroX, -0.3, FUNDO + 4.6], { sombra: false });
  caixa(4.4, 0.13, 1.1, mat('#bdb7ad', 0.85), [X_PORTA, -0.11, FUNDO + 0.85], { sombra: false });
  const asfaltoCanvas = canvasDe(1024, 256, desenharAsfalto);
  const rua = new THREE.Mesh(new THREE.PlaneGeometry(70, 8), new THREE.MeshStandardMaterial({
    map: textura(asfaltoCanvas, { repetir: [7, 1] }), normalMap: relevo(asfaltoCanvas, 2, { repetir: [7, 1] }),
    roughnessMap: aspereza(asfaltoCanvas, 0.85, 0.2, { repetir: [7, 1] }), roughness: 1,
  }));
  rua.rotation.x = -Math.PI / 2;
  rua.position.set(centroX, -0.355, FUNDO + 4.7 + 4);
  rua.receiveShadow = true;
  add(rua);
  for (let i = 0; i < 8; i++) caixa(0.45, 0.01, 3.2, mat('#eeeae0', 0.7), [X_PORTA - 6.5 + i * 0.85, -0.348, FUNDO + 8.7], { sombra: false });

  // árvores com folhagem de verdade (cartões de folhas com transparência)
  const folhas = texturaDeCanvas(256, 256, (c, w, h) => desenharFolhas(c, w, h, {}));
  const matFolhas = new THREE.MeshStandardMaterial({ map: folhas, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75 });
  const profFolhas = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: folhas, alphaTest: 0.45 });
  const geoCartao = new THREE.PlaneGeometry(1.1, 1.1);
  const matTronco = new THREE.MeshStandardMaterial({ color: '#5b4634', roughness: 0.95 });
  function arvore(x, z, nome, escala = 1, pai = frente) {
    const r = semente(nome);
    const g = new THREE.Group();
    g.position.set(x, yCalcada, z);
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * escala, 0.17 * escala, 2.8 * escala, 10), matTronco);
    tronco.position.y = 1.4 * escala;
    tronco.castShadow = true;
    g.add(tronco);
    for (const a of [0.6, -0.8, 2.2]) {
      const galho = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 1.2 * escala, 6), matTronco);
      galho.position.set(Math.cos(a) * 0.3 * escala, 2.6 * escala, Math.sin(a) * 0.3 * escala);
      galho.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
      g.add(galho);
    }
    const n = 110;
    const copa = new THREE.InstancedMesh(geoCartao, matFolhas, n);
    copa.castShadow = true;
    copa.customDepthMaterial = profFolhas;
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const cor = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const u = r() * Math.PI * 2;
      const v = Math.acos(2 * r() - 1);
      const raio = (0.6 + r() * 0.9) * escala;
      const p = new THREE.Vector3(Math.sin(v) * Math.cos(u) * raio * 1.35, 3.6 * escala + Math.cos(v) * raio * 0.95, Math.sin(v) * Math.sin(u) * raio * 1.35);
      q.setFromEuler(new THREE.Euler(r() * Math.PI, r() * Math.PI, r() * Math.PI));
      const s = (0.8 + r() * 0.6) * escala;
      copa.setMatrixAt(i, m4.compose(p, q, new THREE.Vector3(s, s, s)));
      copa.setColorAt(i, cor.setHSL(0.26 + r() * 0.05, 0.35 + r() * 0.2, 0.32 + r() * 0.16));
    }
    g.add(copa);
    pai.add(g);
  }
  function poste(x, z) {
    const g = new THREE.Group();
    g.position.set(x, yCalcada, z);
    bloco(0.1, 4.6, 0.1, C.escuro, [0, 2.3, 0], g);
    bloco(0.9, 0.08, 0.14, C.escuro, [0.4, 4.6, 0], g);
    const luz = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.2), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffe2b0', emissiveIntensity: 0.2 }));
    luz.position.set(0.7, 4.55, 0);
    g.add(luz);
    aoTrocarCeu.push((noite) => {
      luz.material.emissiveIntensity = noite ? 4 : 0.2;
    });
    frente.add(g);
  }
  for (const x of [-14, -7.5, -1, 5.5]) arvore(x, FUNDO + 3.7, `árvore ${x}`);
  arvore(15.5, FUNDO + 3.7, 'árvore canto');
  for (const [x, z, s] of [[-20, -3, 1.2], [-21, 4, 1.0], [-19.5, -10, 1.3], [17, -4, 1.1], [18, 3, 1.25], [-8, -10, 1.2], [3, -11, 1.0], [12, -10, 1.3], [26, -14, 1.4], [-28, -16, 1.3]]) {
    arvore(x, z, `árvore ${x} ${z}`, s, cena);
  }
  for (const x of [-11, -4, 2.5, 8.2]) poste(x, FUNDO + 4.1);
  for (const x of [-12.5, -5.5, 1.5]) {
    const banco = new THREE.Group();
    banco.position.set(x, yCalcada, FUNDO + 2.4);
    caixa(1.6, 0.05, 0.45, M.carvalho, [0, 0.45, 0], { pai: banco });
    caixa(1.6, 0.4, 0.05, M.carvalho, [0, 0.7, -0.2], { pai: banco });
    for (const lado of [-0.7, 0.7]) caixa(0.06, 0.45, 0.45, M.grafite, [lado, 0.22, 0], { pai: banco });
    frente.add(banco);
  }

  // carros (pintura com verniz, vidros, rodas com aro, faróis que acendem à noite)
  const perfil = new THREE.Shape();
  perfil.moveTo(-2.15, 0.3);
  perfil.lineTo(-2.2, 0.72);
  perfil.lineTo(-1.95, 0.92);
  perfil.lineTo(-1.55, 0.96);
  perfil.lineTo(-1.0, 1.4);
  perfil.lineTo(0.5, 1.42);
  perfil.lineTo(1.2, 0.98);
  perfil.lineTo(1.95, 0.86);
  perfil.lineTo(2.22, 0.7);
  perfil.lineTo(2.18, 0.3);
  perfil.lineTo(1.75, 0.3);
  perfil.absarc(1.35, 0.3, 0.4, 0, Math.PI, false);
  perfil.lineTo(-0.95, 0.3);
  perfil.absarc(-1.35, 0.3, 0.4, 0, Math.PI, false);
  perfil.lineTo(-2.15, 0.3);
  const geoLataria = new THREE.ExtrudeGeometry(perfil, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 4, curveSegments: 16 });
  geoLataria.translate(0, 0, -0.8);
  const vidroPerfil = new THREE.Shape();
  vidroPerfil.moveTo(-1.48, 0.98);
  vidroPerfil.lineTo(-0.98, 1.36);
  vidroPerfil.lineTo(0.48, 1.38);
  vidroPerfil.lineTo(1.12, 1.0);
  const geoVidro = new THREE.ExtrudeGeometry(vidroPerfil, { depth: 1.86, bevelEnabled: false });
  geoVidro.translate(0, 0, -0.93);
  const matVidroCarro = new THREE.MeshPhysicalMaterial({ color: '#1b2430', roughness: 0.05, metalness: 0.4, envMapIntensity: 1.5 });
  const geoPneu = new THREE.CylinderGeometry(0.36, 0.36, 0.26, 24).rotateX(Math.PI / 2);
  const geoAro = new THREE.CylinderGeometry(0.22, 0.22, 0.28, 18).rotateX(Math.PI / 2);
  const matPneu = mat('#141517', 0.85);
  const carrosEmMovimento = [];
  function carro(x, z, cor, rot, velocidade = 0) {
    const g = new THREE.Group();
    g.position.set(x, -0.36, z);
    g.rotation.y = rot;
    const lataria = new THREE.Mesh(geoLataria, new THREE.MeshPhysicalMaterial({ color: cor, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.04 }));
    lataria.castShadow = true;
    g.add(lataria);
    g.add(new THREE.Mesh(geoVidro, matVidroCarro));
    for (const [rx, rz] of [[-1.35, 0.86], [1.35, 0.86], [-1.35, -0.86], [1.35, -0.86]]) {
      const pneu = new THREE.Mesh(geoPneu, matPneu);
      pneu.position.set(rx, 0.36, rz);
      pneu.castShadow = true;
      g.add(pneu);
      const aro = new THREE.Mesh(geoAro, M.inox);
      aro.position.set(rx, 0.36, rz);
      g.add(aro);
    }
    const farol = new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff6e0', emissiveIntensity: 0.2 });
    const lanterna = new THREE.MeshStandardMaterial({ color: '#600', emissive: '#ff2a1a', emissiveIntensity: 0.2 });
    for (const lado of [-0.62, 0.62]) {
      caixa(0.06, 0.12, 0.32, farol, [2.27, 0.66, lado], { pai: g, sombra: false });
      caixa(0.06, 0.1, 0.32, lanterna, [-2.25, 0.7, lado], { pai: g, sombra: false });
    }
    aoTrocarCeu.push((noite) => {
      farol.emissiveIntensity = noite ? 3 : 0.2;
      lanterna.emissiveIntensity = noite ? 2 : 0.2;
    });
    frente.add(g);
    if (velocidade) carrosEmMovimento.push({ g, velocidade });
  }
  carro(-5, FUNDO + 6.0, '#e8e6e1', 0);
  carro(3.5, FUNDO + 6.0, '#8a1c24', 0);
  carro(-20, FUNDO + 7.4, '#2d3e55', 0, 8.5);
  carro(25, FUNDO + 10.5, '#c9ccd1', Math.PI, -7);
  carro(-40, FUNDO + 10.5, '#1f2226', Math.PI, -9.5);
  const monumento = new THREE.Group();
  monumento.position.set(6.4, yCalcada, FUNDO + 1.6);
  caixa(3.6, 0.95, 0.5, C.concreto, [0, 0.47, 0], { pai: monumento });
  const placaMonumento = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.41), matMarca);
  placaMonumento.position.set(0, 0.58, 0.26);
  monumento.add(placaMonumento);
  fachada.add(monumento);

  // prédios da vizinhança, com janelas acesas à noite
  const vizinhos = [];
  {
    const r = semente('vizinhança');
    const tons = [[150, 156, 164], [182, 176, 166], [120, 132, 146], [196, 192, 184], [110, 118, 128]];
    const lotes = [];
    for (let x = -60; x <= 50; x += 11 + r() * 5) lotes.push([x, -30 - r() * 22]);
    for (let z = -22; z <= 36; z += 12 + r() * 4) lotes.push([-40 - r() * 18, z], [36 + r() * 16, z]);
    for (const p of [[-48, 46], [-30, 52], [44, 48], [58, 30]]) lotes.push(p);
    lotes.forEach(([x, z], i) => {
      const w = 7 + r() * 7;
      const d = 7 + r() * 7;
      const h = 9 + r() * 34;
      const nome = `vizinho ${i}`;
      const tom = tons[i % tons.length];
      const dia = texturaDeCanvas(256, 512, (c, cw, ch) => desenharFachadaCidade(c, cw, ch, { nome, noite: false, tom }));
      const noite = texturaDeCanvas(256, 512, (c, cw, ch) => desenharFachadaCidade(c, cw, ch, { nome, noite: true, tom }));
      for (const t of [dia, noite]) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(h / 12)));
      }
      const lado = new THREE.MeshStandardMaterial({ map: dia, roughness: 0.6, metalness: 0.2, emissive: '#000' });
      const topo = mat('#5d6168', 0.9);
      const predio = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [lado, lado, topo, topo, lado, lado]);
      predio.position.set(x, h / 2 - 0.37, z);
      predio.receiveShadow = true;
      add(predio);
      vizinhos.push({ lado, dia, noite });
    });
  }
  aoTrocarCeu.push((noite) => {
    for (const v of vizinhos) {
      v.lado.map = noite ? v.noite : v.dia;
      v.lado.emissiveMap = noite ? v.noite : null;
      v.lado.emissive.set(noite ? '#ffffff' : '#000000');
      v.lado.emissiveIntensity = noite ? 0.9 : 0;
      v.lado.needsUpdate = true;
    }
    C.vidroAzul.emissive.set(noite ? '#3a2a14' : '#000000');
    matMarca.emissiveIntensity = noite ? 1.8 : 0.9;
    matPlacar.emissiveIntensity = noite ? 2 : 1.2;
  });

  // pedestres na calçada
  const pedestres = [];
  {
    const cores = ['#7a8794', '#a35d3d', '#3d6680', '#6b7a1f', '#8e5a8c'];
    for (let i = 0; i < 5; i++) {
      const z = FUNDO + 2.25 + (i % 3) * 0.42;
      const x = -30 + i * 13;
      const p = new Pessoa({ id: `pedestre ${i}`, nome: '', cargo: '', status: 'trabalhando' }, { id: 'rua', nome: '', cor: cores[i] }, { assento: { x, z }, passagem: { x, z }, rumo: Math.PI / 2 }, { mundo });
      p.velocidadePropria = 0.8 + (i % 3) * 0.12;
      const vaiVolta = (indo) => p.iniciarCaminho([{ x: indo ? 30 : -32, z }], () => vaiVolta(!indo));
      vaiVolta(i % 2 === 0);
      frente.add(p.raiz);
      pedestres.push(p);
    }
  }

  let abertura = 0;
  function aplicarAbertura(a) {
    abertura = a;
    casca.visible = a < 0.999;
    andares.position.y = suave(a) * 24;
    fachada.position.y = -suave(Math.min(1, a * 1.15)) * 3.6;
    frente.visible = a < 0.45;
    for (const m of materiaisCasca) m.opacity = m.userData.base * (1 - suave(a));
  }

  // ---------- céu e sol no horário de Brasília ----------
  const carregador = new THREE.TextureLoader();
  const ceus = {};
  async function carregarCeu(nome) {
    if (ceus[nome]) return ceus[nome];
    const tex = await carregador.loadAsync(`${base}ceus/ceu-${nome}.jpg`);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    ceus[nome] = { tex, env: pmrem.fromEquirectangular(tex).texture };
    return ceus[nome];
  }
  let horario = 'real';
  let ceuAtual = null;
  let noite = false;
  async function aplicarHorario() {
    const { h } = horario === 'real' ? horaLocal() : { h: 10.5 };
    const a = ((h - 6) / 12) * Math.PI;
    const elevacao = Math.asin(Math.max(-1, Math.min(1, Math.sin(a) * 0.96))) * (180 / Math.PI);
    const nome = elevacao > 12 ? 'dia' : elevacao > -4 ? 'tarde' : 'noite';
    const p = CEUS[nome];
    noite = nome === 'noite';
    sol.target.position.set(-1, 0, 1);
    if (noite) sol.position.set(-24, 30, -20).add(sol.target.position);
    else {
      const dir = new THREE.Vector3(Math.cos(a), Math.max(0.12, Math.sin(a)), -0.32).normalize();
      sol.position.copy(sol.target.position).addScaledVector(dir, 60);
    }
    sol.color.set(p.sol);
    sol.intensity = p.intSol;
    ceu.intensity = p.hemi;
    renderer.toneMappingExposure = p.exp;
    cena.fog = new THREE.Fog(p.fog, 90, 230);
    for (const luz of luminarias) luz.intensity = noite ? 8 : nome === 'tarde' ? 2.5 : 0;
    for (const f of aoTrocarCeu) f(noite);
    if (ceuAtual !== nome) {
      try {
        const c = await carregarCeu(nome);
        cena.background = c.tex;
        cena.environment = c.env;
        ceuAtual = nome;
      } catch {
        cena.background = new THREE.Color(p.fog);
        cena.environment = envReserva;
      }
    }
    cena.environmentIntensity = p.env;
    atualizarPresenca();
  }

  // Quem está no escritório: no expediente, todos; à noite e no fim de semana, só quem está de plantão.
  function atualizarPresenca() {
    const { h, fimDeSemana } = horario === 'real' ? horaLocal() : { h: 10.5, fimDeSemana: false };
    const expediente = !fimDeSemana && h >= 7.5 && h < 19.5;
    const plantao = new Set();
    for (const setor of setores) if (['suporte', 'ti'].includes(setor.id) && setor.agentes[0]) plantao.add(setor.agentes[0]);
    for (const [id, pessoa] of pessoas) {
      const presente = expediente || plantao.has(id);
      pessoa.definirAusente(!presente);
      if (pessoa.ausente) pessoa.casa.cadeira.position.z = pessoa.casa.cadeiraZ + 0.12;
      else if (pessoa.estado === 'sentado') pessoa.casa.cadeira.position.z = pessoa.casa.cadeiraZ;
    }
  }

  // ---------- pilhas de papel: buffets esperando retorno ----------
  const geoPapel = new THREE.BoxGeometry(0.21, 0.004, 0.297);
  const pilhas = mesasComerciais.map(({ pessoa, mesa }, i) => {
    const g = new THREE.Group();
    g.position.set(0.5, 0.76, -0.02);
    mesa.add(g);
    const alvo = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.36), new THREE.MeshBasicMaterial({ visible: false }));
    alvo.position.y = 0.06;
    alvo.userData = { tipo: 'pilha', indice: i };
    g.add(alvo);
    clicaveis.push(alvo);
    return { g, pessoa, itens: [], folhas: [] };
  });
  function montarPilhas(pendentes) {
    for (const p of pilhas) {
      for (const f of p.folhas) p.g.remove(f);
      p.folhas = [];
      p.itens = [];
    }
    if (!pilhas.length) return;
    (pendentes ?? []).forEach((lead, i) => pilhas[i % pilhas.length].itens.push(lead));
    for (const p of pilhas) {
      const r = semente(`pilha ${p.pessoa.id} ${p.itens.length}`);
      const n = Math.min(26, p.itens.length * 2);
      for (let k = 0; k < n; k++) {
        const folha = new THREE.Mesh(geoPapel, k % 7 === 6 ? mat('#f6e7a6', 0.9) : M.papel);
        folha.position.set((r() - 0.5) * 0.02, 0.003 + k * 0.0045, (r() - 0.5) * 0.02);
        folha.rotation.y = (r() - 0.5) * 0.25;
        folha.castShadow = k === n - 1;
        folha.receiveShadow = true;
        p.g.add(folha);
        p.folhas.push(folha);
      }
    }
  }

  // ---------- pinos do mapa ----------
  const CIDADES = {
    'fortaleza': [-38.52, -3.73], 'belo horizonte': [-43.94, -19.92], 'brasília': [-47.88, -15.79], 'campinas': [-47.06, -22.91],
    'teresina': [-42.8, -5.09], 'goiânia': [-49.25, -16.68], 'betim': [-44.2, -19.97], 'aparecida de goiânia': [-49.24, -16.82],
    'anápolis': [-48.95, -16.33], 'uberlândia': [-48.28, -18.92], 'uberaba': [-47.93, -19.75], 'araguari': [-48.19, -18.65],
    'monte carmelo': [-47.5, -18.72], 'patos de minas': [-46.52, -18.58], 'ituiutaba': [-49.46, -18.97], 'contagem': [-44.05, -19.93],
    'são paulo': [-46.63, -23.55], 'rio de janeiro': [-43.17, -22.91], 'salvador': [-38.5, -12.97], 'recife': [-34.88, -8.05],
    'curitiba': [-49.27, -25.43], 'porto alegre': [-51.22, -30.03], 'manaus': [-60.02, -3.12], 'belém': [-48.5, -1.46],
    'são luís': [-44.3, -2.53], 'natal': [-35.21, -5.79], 'joão pessoa': [-34.86, -7.12], 'maceió': [-35.73, -9.66],
    'aracaju': [-37.07, -10.91], 'vitória': [-40.31, -20.32], 'florianópolis': [-48.55, -27.6], 'campo grande': [-54.62, -20.44],
    'cuiabá': [-56.1, -15.6], 'palmas': [-48.33, -10.25], 'porto velho': [-63.9, -8.76], 'rio branco': [-67.81, -9.97],
    'macapá': [-51.07, 0.03], 'boa vista': [-60.67, 2.82], 'ribeirão preto': [-47.81, -21.18], 'sorocaba': [-47.46, -23.5],
    'juiz de fora': [-43.35, -21.76], 'montes claros': [-43.86, -16.73], 'londrina': [-51.16, -23.31], 'santos': [-46.33, -23.96],
  };
  const geoPino = new THREE.CylinderGeometry(0.008, 0.008, 1, 10);
  const geoCabeca = new THREE.SphereGeometry(0.02, 14, 10);
  const pinosPorCidade = new Map();
  function montarPinos(leads) {
    for (const filho of [...pinos.children]) {
      pinos.remove(filho);
      const i = clicaveis.indexOf(filho);
      if (i >= 0) clicaveis.splice(i, 1);
    }
    pinosPorCidade.clear();
    for (const lead of leads ?? []) {
      const chave = (lead.cidade || '').trim().toLowerCase();
      if (!pinosPorCidade.has(chave)) pinosPorCidade.set(chave, []);
      pinosPorCidade.get(chave).push(lead);
    }
    for (const [cidade, lista] of pinosPorCidade) {
      const coord = CIDADES[cidade];
      if (!coord) continue;
      const [x, z] = projetar(...coord);
      const quente = lista.some((l) => /quente/i.test(l.prioridade));
      const altura = 0.05 + Math.min(0.35, lista.length * 0.025);
      const cor = quente ? '#ff8a2a' : '#2fb5a3';
      const material = new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.7, roughness: 0.3 });
      const haste = new THREE.Mesh(geoPino, material);
      haste.scale.y = altura;
      haste.position.set(x, 0.995 + altura / 2, z);
      const topo = new THREE.Mesh(geoCabeca, material);
      topo.position.set(x, 0.995 + altura, z);
      for (const m of [haste, topo]) {
        m.userData = { tipo: 'pino', cidade };
        m.castShadow = true;
        pinos.add(m);
        clicaveis.push(m);
      }
    }
  }

  // ---------- confete da comemoração ----------
  const N_CONFETE = 500;
  const confete = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.06, 0.035), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), N_CONFETE);
  confete.visible = false;
  confete.frustumCulled = false;
  const pecasConfete = Array.from({ length: N_CONFETE }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), w: new THREE.Vector3() }));
  {
    const cores = ['#D98A1E', '#C8406F', '#12897C', '#4A5BD0', '#f4f1ea', '#ffd84a'];
    const c = new THREE.Color();
    for (let i = 0; i < N_CONFETE; i++) confete.setColorAt(i, c.set(cores[i % cores.length]));
  }
  add(confete);
  let confeteAte = 0;
  function soltarConfete() {
    for (const k of pecasConfete) {
      k.p.set(X_FILAS + Math.random() * 20, 3.2 + Math.random() * 3, -5 + Math.random() * 10);
      k.v.set((Math.random() - 0.5) * 0.4, -0.5 - Math.random() * 0.6, (Math.random() - 0.5) * 0.4);
      k.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      k.w.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    }
    confete.visible = true;
    confeteAte = performance.now() + 9000;
  }

  // ---------- pontos de destino ----------
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
      return { ponto: { x: -13.35, z: -3.2 }, acesso: [{ x: -12.7, z: -0.2 }, { x: -13.35, z: -3.2 }], anexo: -11.2, rumo: -Math.PI / 2 - 0.25, ouvintes: [voce] };
    },
  };
  mundo.rota = (casa, destino) => {
    const z = faixa();
    const saida = casa === voce.casa ? [{ x: -12.7, z: -0.2 }] : [];
    return [...saida, { x: casa.anexo, z }, { x: destino.anexo, z }, ...destino.acesso];
  };
  mundo.rotaDeVolta = (destino, casa) => {
    const z = faixa();
    const entrada = casa === voce.casa ? [{ x: -12.7, z: -0.2 }] : [];
    return [...destino.acesso.slice(0, -1).reverse(), { x: destino.anexo, z }, { x: casa.anexo, z }, ...entrada, casa.passagem];
  };

  // ---------- envelopes voando ----------
  const envelopes = [];
  const geoEnvelope = new THREE.BoxGeometry(0.26, 0.02, 0.18);
  function lancarEnvelope(de, para, cor) {
    const m = new THREE.Mesh(geoEnvelope, new THREE.MeshStandardMaterial({ color: '#fbfaf6', emissive: cor, emissiveIntensity: 0.35, roughness: 0.6 }));
    m.castShadow = true;
    add(m);
    envelopes.push({ m, de: de.clone(), para: para.clone(), t: 0 });
  }

  // ---------- rótulos e balões (HTML sobre o canvas) ----------
  const rotulos = new Map();
  const todosComRotulo = [...pessoas.values(), voce];
  for (const pessoa of todosComRotulo) {
    const a = pessoa.agente;
    const rotulo = document.createElement('div');
    rotulo.className = pessoa === voce ? 'rotulo3d voce' : 'rotulo3d';
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
    rotulos.set(pessoa.id, { rotulo, balao, textoAtual: null });
  }
  let foco = false;
  function textoDoBalao(pessoa) {
    if (pessoa.ausente) return null;
    if (pessoa.falaLocal && pessoa.falaLocal.ate > performance.now()) return pessoa.falaLocal.texto;
    if (foco || pessoa === voce) return null;
    const a = pessoa.agente;
    if (a.status === 'pensando') return '…';
    if (a.status === 'falando' && a.balao) return a.balao;
    return null;
  }
  function desenharBalao(pessoa) {
    const r = rotulos.get(pessoa.id);
    const chave = textoDoBalao(pessoa);
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
  function falar(pessoa, texto, segundos = 6) {
    pessoa.falaLocal = { texto, ate: performance.now() + segundos * 1000 };
    desenharBalao(pessoa);
  }

  // ---------- seleção, clique e hover ----------
  const anel = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.52, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 }));
  anel.position.y = 0.012;
  anel.visible = false;
  add(anel);
  let selecionado = null;
  let sobre = null;
  const raio = new THREE.Raycaster();
  const ponteiro = new THREE.Vector2();
  let inicioToque = null;

  // estado da câmera (declarado aqui porque o clique depende dele)
  let modo = 'fora';
  let voo = null;
  let enquadrado = false;
  let filmando = false;

  function acharAlvo(evento) {
    if (modo !== 'dentro' || filmando) return null;
    const r = renderer.domElement.getBoundingClientRect();
    ponteiro.set(((evento.clientX - r.left) / r.width) * 2 - 1, -((evento.clientY - r.top) / r.height) * 2 + 1);
    raio.setFromCamera(ponteiro, camera);
    const alvos = raio.intersectObjects([...malhasPessoas, ...voce.malhas, ...clicaveis], false);
    if (!alvos.length) return null;
    const o = alvos[0].object;
    if (o.userData.tipo) return o.userData;
    return { tipo: 'pessoa', id: o.userData.agente };
  }
  function clicar(alvo) {
    if (alvo.tipo === 'caixa') aoClicarCaixa?.();
    else if (alvo.tipo === 'pessoa' && alvo.id !== 'ceo') {
      aoClicarAgente?.(alvo.id);
      const p = pessoas.get(alvo.id);
      if (p && !p.ausente && voce.livre() && !foco && !reduzido()) {
        const d = destinos.agente(p, voce);
        d.duracao = 6;
        d.gesto = 'falar';
        if (voce.visitar(d)) {
          const frases = [`Oi, ${p.agente.nome}! Como está o dia?`, `${p.agente.nome}, me conta o que está travando.`, `${p.agente.nome}, o que você precisa de mim hoje?`];
          setTimeout(() => falar(voce, frases[Math.floor(Math.random() * frases.length)], 5), 3500);
        }
      }
    } else if (alvo.tipo === 'pilha') {
      const p = pilhas[alvo.indice];
      aoInfo?.({
        titulo: `${p.itens.length} ${p.itens.length === 1 ? 'buffet esperando' : 'buffets esperando'} retorno`,
        sub: `Na mesa de ${p.pessoa.agente.nome}. A pilha diminui quando você atualiza o status na planilha.`,
        itens: p.itens.map((l) => ({ titulo: l.buffet, texto: [l.cidade, l.proximo].filter(Boolean).join(' · '), copiar: l.telefone })),
      });
    } else if (alvo.tipo === 'pino') {
      const lista = pinosPorCidade.get(alvo.cidade) ?? [];
      aoInfo?.({
        titulo: `${lista[0]?.cidade ?? alvo.cidade}: ${lista.length} ${lista.length === 1 ? 'buffet' : 'buffets'}`,
        sub: 'Da planilha do funil.',
        itens: lista.map((l) => ({ titulo: l.buffet, texto: [l.status, l.proximo].filter(Boolean).join(' · '), copiar: l.telefone })),
      });
    } else if (alvo.tipo === 'elevador') {
      elevadorAlvo = 1;
      setTimeout(() => {
        elevadorAlvo = 0;
      }, 4000);
      aoInfo?.({
        titulo: 'Elevador',
        sub: `Andares do ${grupo}`,
        itens: [
          { titulo: 'Térreo: Orkestra', texto: 'Você está aqui.' },
          { titulo: '1º andar', texto: 'Livre para a próxima empresa do grupo.' },
          { titulo: '2º andar', texto: 'Livre para a próxima empresa do grupo.' },
        ],
      });
    }
  }
  renderer.domElement.addEventListener('pointerdown', (e) => {
    inicioToque = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!inicioToque || Math.hypot(e.clientX - inicioToque.x, e.clientY - inicioToque.y) > 6) return;
    if (filmando) return;
    if (modo === 'fora') return entrar();
    const alvo = acharAlvo(e);
    if (alvo) clicar(alvo);
  });
  let ultimoHover = 0;
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (e.buttons || performance.now() - ultimoHover < 60) return;
    ultimoHover = performance.now();
    const alvo = acharAlvo(e);
    renderer.domElement.style.cursor = alvo || modo === 'fora' ? 'pointer' : '';
    const novo = alvo?.tipo === 'pessoa' ? alvo.id : null;
    if (novo === sobre) return;
    if (sobre) rotulos.get(sobre)?.rotulo.classList.remove('ativo');
    sobre = novo;
    if (sobre) rotulos.get(sobre)?.rotulo.classList.add('ativo');
  });

  // ---------- câmera: fora, entrando, dentro, saindo ----------
  function poseDentro() {
    const aspecto = camera.aspect || 1.5;
    const distancia = Math.min(70, Math.max(24, 41 / Math.min(1.7, aspecto) + 6));
    const direcao = new THREE.Vector3(0, 0.78, 0.63).normalize();
    return { alvo: ALVO_INICIAL.clone(), pos: ALVO_INICIAL.clone().addScaledVector(direcao, distancia) };
  }
  function poseFora() {
    const aspecto = camera.aspect || 1.5;
    const alvo = new THREE.Vector3(-0.5, 3.4, 3);
    const distancia = Math.min(95, Math.max(36, 50 / Math.min(1.7, aspecto) + 14));
    const direcao = new THREE.Vector3(0.32, 0.24, 1).normalize();
    return { alvo, pos: alvo.clone().addScaledVector(direcao, distancia) };
  }
  function configurarControles() {
    const fora = modo === 'fora';
    Object.assign(controles, fora
      ? { minDistance: 18, maxDistance: 110, minPolarAngle: 0.35, maxPolarAngle: 1.5, minAzimuthAngle: -1.15, maxAzimuthAngle: 1.15 }
      : { minDistance: 3, maxDistance: 72, minPolarAngle: 0.15, maxPolarAngle: 1.36, minAzimuthAngle: -1.1, maxAzimuthAngle: 1.1 });
    controles.autoRotate = fora && !reduzido() && !filmando;
    controles.autoRotateSpeed = 0.35;
    camadaRotulos.hidden = modo !== 'dentro' || filmando;
  }
  function irPara(pose) {
    controles.target.copy(pose.alvo);
    camera.position.copy(pose.pos);
    camera.lookAt(pose.alvo);
    controles.update();
  }
  function enquadrar(forcar) {
    if (enquadrado && !forcar) return;
    enquadrado = true;
    if (modo === 'fora' || modo === 'dentro') irPara(modo === 'fora' ? poseFora() : poseDentro());
  }
  function mudarModo(novo) {
    modo = novo;
    configurarControles();
    aoMudarModo?.(modo);
  }
  function voar(pontos, alvos, duracao, aoTerminar) {
    controles.enabled = false;
    controles.autoRotate = false;
    voo = {
      pos: new THREE.CatmullRomCurve3(pontos, false, 'centripetal'),
      alvo: new THREE.CatmullRomCurve3(alvos, false, 'centripetal'),
      inicio: performance.now(), duracao, aoTerminar,
    };
  }
  // O voo segue o relógio de verdade, então dura o mesmo em computador rápido ou lento.
  function atualizarVoo() {
    const k = Math.min(1, (performance.now() - voo.inicio) / 1000 / voo.duracao);
    const u = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    camera.position.copy(voo.pos.getPointAt(u));
    controles.target.copy(voo.alvo.getPointAt(u));
    camera.lookAt(controles.target);
    if (k >= 1) {
      const fim = voo.aoTerminar;
      voo = null;
      controles.enabled = !filmando;
      fim();
      controles.update();
    }
    return u;
  }
  function entrar(aoTerminar) {
    if (modo !== 'fora') return;
    const destino = poseDentro();
    if (reduzido()) {
      aplicarAbertura(1);
      mudarModo('dentro');
      irPara(destino);
      aoTerminar?.();
      return;
    }
    mudarModo('entrando');
    const zPorta = FUNDO + 0.14;
    voar(
      [camera.position.clone(), new THREE.Vector3(X_PORTA + 1.5, 3.2, zPorta + 15), new THREE.Vector3(X_PORTA, 1.75, zPorta + 4.2), new THREE.Vector3(X_PORTA, 1.7, zPorta + 1.4), new THREE.Vector3(X_PORTA - 0.6, 1.7, 2.6), new THREE.Vector3(4, 9, 12), destino.pos],
      [controles.target.clone(), new THREE.Vector3(X_PORTA, 1.8, zPorta), new THREE.Vector3(X_PORTA, 1.6, zPorta - 3), new THREE.Vector3(X_PORTA - 1, 1.5, zPorta - 6), new THREE.Vector3(2, 1.2, -1), new THREE.Vector3(0, 0.5, 0.5), destino.alvo],
      9,
      () => {
        aplicarAbertura(1);
        portaAlvo = 0;
        mudarModo('dentro');
        aoTerminar?.();
      },
    );
  }
  function sair(aoTerminar) {
    if (modo !== 'dentro') return;
    const destino = poseFora();
    if (reduzido()) {
      aplicarAbertura(0);
      mudarModo('fora');
      irPara(destino);
      aoTerminar?.();
      return;
    }
    mudarModo('saindo');
    const meio = camera.position.clone().lerp(destino.pos, 0.5).setY(Math.max(camera.position.y, destino.pos.y) + 6);
    voar([camera.position.clone(), meio, destino.pos], [controles.target.clone(), destino.alvo.clone().lerp(controles.target, 0.5), destino.alvo], 3.6, () => {
      mudarModo('fora');
      aoTerminar?.();
    });
  }

  // ---------- modo filmagem: passeio de câmera em laço, sem nada na tela ----------
  function cenaDeFilmagem() {
    if (!filmando) return;
    const seguir = () => setTimeout(cenaDeFilmagem, 400);
    if (modo === 'fora') {
      const alvo = new THREE.Vector3(-0.5, 3.4, 3);
      const pontos = [0.9, 0.45, 0, -0.45].map((a) => alvo.clone().add(new THREE.Vector3(Math.sin(a) * 48, 14 + Math.cos(a * 2) * 4, Math.cos(a) * 48)));
      voar([camera.position.clone(), ...pontos], [controles.target.clone(), alvo, alvo, alvo, alvo], 14, () => {
        if (!filmando) return;
        entrar(() => {
          if (!filmando) return;
          voar(
            [camera.position.clone(), new THREE.Vector3(-9, 2.2, 1.0), new THREE.Vector3(-2, 1.7, 0.8), new THREE.Vector3(5, 1.9, -0.6), new THREE.Vector3(9, 4, 4), poseDentro().pos],
            [controles.target.clone(), new THREE.Vector3(-6, 1.0, -4.2), new THREE.Vector3(1, 1.0, 4.3), new THREE.Vector3(8, 1.0, -4.3), new THREE.Vector3(2, 0.5, 0), poseDentro().alvo],
            16,
            () => {
              if (filmando) setTimeout(() => filmando && sair(seguir), 3000);
            },
          );
        });
      });
    } else if (modo === 'dentro') sair(seguir);
    else seguir();
  }

  // ---------- reunião da manhã ----------
  let reuniaoAte = 0;
  function reuniao(itens, segundosPorItem = 7) {
    const presentes = [...pessoas.values()].filter((p) => !p.ausente);
    if (!presentes.length) return false;
    pauta = itens;
    modoTelao = 'reuniao';
    desenharTelao();
    const apresentador = presentes[0];
    const duracao = 10 + itens.length * segundosPorItem + 6;
    const roda = [...presentes, voce];
    roda.forEach((p, i) => {
      const a = Math.PI / 2 + (i / roda.length) * Math.PI * 2;
      const ponto = { x: REUNIAO.x + Math.cos(a) * REUNIAO.rx, z: REUNIAO.z + Math.sin(a) * REUNIAO.rz };
      const d = {
        ponto, acesso: [ponto], anexo: ponto.x, duracao,
        rumo: Math.atan2(REUNIAO.x - ponto.x, REUNIAO.z - ponto.z),
        gesto: p === apresentador ? 'falar' : 'ouvir', ouvintes: p === apresentador ? roda : [],
      };
      if (!p.visitar(d)) p.fila = [d];
    });
    const falas = [`Bom dia! Reunião rápida, ${itens.length} ${itens.length === 1 ? 'ponto' : 'pontos'}.`, ...itens.map((it, i) => `${i + 1}. ${it.titulo}`), 'Combinado. Bora trabalhar!'];
    falas.forEach((f, i) => setTimeout(() => falar(apresentador, f, segundosPorItem - 0.5), 9000 + i * segundosPorItem * 1000));
    reuniaoAte = performance.now() + (duracao + 14) * 1000;
    return true;
  }

  // ---------- som e comemorações ----------
  const som = criarSom();
  function comemorar(tipo = 'venda') {
    const presentes = [...pessoas.values(), voce].filter((p) => !p.ausente && p.livre());
    const venda = tipo === 'venda';
    presentes.forEach((p, i) => {
      p.visitar({ naMesa: true, duracao: venda ? 7 : 4, gesto: venda && i % 2 === 0 ? 'comemorar' : 'aplaudir', descartavel: true });
    });
    if (venda) {
      soltarConfete();
      som.gongo();
      som.aplausos(5, 1.3);
    } else som.aplausos(3, 0.7);
  }

  // ---------- tamanho e horário ----------
  function redimensionar() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(w, h);
    passeBrilho.resolution.set(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    enquadrar(false);
  }
  configurarControles();
  const observadorTamanho = new ResizeObserver(redimensionar);
  observadorTamanho.observe(container);
  redimensionar();
  aplicarAbertura(0);
  controles.addEventListener('change', () => {
    if (modo !== 'dentro') return;
    controles.target.x = Math.max(X_ESQ + 1, Math.min(X_DIR - 1, controles.target.x));
    controles.target.z = Math.max(-FUNDO + 0.5, Math.min(FUNDO - 0.5, controles.target.z));
    controles.target.y = Math.max(0, Math.min(2.5, controles.target.y));
  });
  await aplicarHorario();
  const relogioCeu = setInterval(aplicarHorario, 60000);

  // ---------- laço de animação ----------
  let fator = 1;
  let visivel = true;
  const relogio = new THREE.Clock();
  const tmp = new THREE.Vector3();
  const observadorVisivel = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
  });
  observadorVisivel.observe(container);
  const medicao = { inicio: 0, quadros: 0, feita: celular };
  let ultimoSom = 0;
  const m4 = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const um = new THREE.Vector3(1, 1, 1);

  function quadro() {
    const dt = Math.min(0.05, relogio.getDelta());
    if (!visivel) return;
    const t = relogio.elapsedTime;
    const agora = performance.now();
    if (voo) {
      const u = atualizarVoo();
      if (modo === 'entrando') {
        portaAlvo = camera.position.z < FUNDO + 7 ? 1 : 0;
        aplicarAbertura(Math.max(0, Math.min(1, (u - 0.62) / 0.3)));
      } else if (modo === 'saindo') {
        aplicarAbertura(Math.max(0, 1 - u / 0.55));
      }
    } else {
      if (modo === 'fora' && controles.autoRotate) {
        const az = controles.getAzimuthalAngle();
        if (az > 0.95) controles.autoRotateSpeed = Math.abs(controles.autoRotateSpeed);
        if (az < -0.95) controles.autoRotateSpeed = -Math.abs(controles.autoRotateSpeed);
      }
      controles.update();
    }
    aberturaPorta += (portaAlvo - aberturaPorta) * Math.min(1, dt * 3);
    for (const porta of portas) porta.g.position.x = porta.fechado + porta.lado * aberturaPorta * 0.72;
    aberturaElevador += (elevadorAlvo - aberturaElevador) * Math.min(1, dt * 3);
    portasElevador.forEach((p, i) => {
      p.position.z = (i ? 1 : -1) * (0.29 + aberturaElevador * 0.5);
    });
    for (const f of figurantes) f.atualizar(dt, t, 1);
    if (casca.visible && frente.visible) {
      for (const p of pedestres) p.atualizar(dt, t, 1);
      for (const c of carrosEmMovimento) {
        c.g.position.x += c.velocidade * dt;
        if (c.velocidade > 0 && c.g.position.x > 60) c.g.position.x = -60;
        if (c.velocidade < 0 && c.g.position.x < -60) c.g.position.x = 60;
      }
    }
    let digitando = 0;
    for (const pessoa of pessoas.values()) {
      pessoa.atualizar(dt, t, fator);
      const tela = pessoa.casa.telaMat;
      const alvo = pessoa.ausente ? 0.04 : pessoa.estado === 'sentado' ? (pessoa.agente.status === 'pensando' ? 1.05 + Math.sin(t * 5) * 0.12 : 0.95) : 0.18;
      tela.emissiveIntensity += (alvo - tela.emissiveIntensity) * Math.min(1, dt * 4);
      if (!pessoa.ausente && pessoa.estado === 'sentado' && pessoa.agente.status === 'trabalhando') digitando++;
    }
    for (const pessoa of todosComRotulo) {
      if (pessoa.falaLocal && pessoa.falaLocal.ate < agora) {
        pessoa.falaLocal = null;
        desenharBalao(pessoa);
      }
    }
    if (reuniaoAte && agora > reuniaoAte) {
      reuniaoAte = 0;
      modoTelao = sprint ? 'sprint' : 'mensagens';
      desenharTelao();
    }
    if (agora - ultimoSom > 1500) {
      ultimoSom = agora;
      som.ajustar({ digitando: modo === 'dentro' ? digitando : 0, fora: modo !== 'dentro', noite });
    }
    if (selecionado && pessoas.has(selecionado)) {
      const p = pessoas.get(selecionado);
      anel.position.x = p.raiz.position.x;
      anel.position.z = p.raiz.position.z;
      anel.visible = !p.ausente;
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
    if (confete.visible) {
      pecasConfete.forEach((k, i) => {
        k.p.addScaledVector(k.v, dt);
        k.p.x += Math.sin(t * 2 + i) * dt * 0.3;
        if (k.p.y < 0.02) {
          k.p.y = 0.02;
          k.v.set(0, 0, 0);
          k.w.set(0, 0, 0);
          k.r.x = -Math.PI / 2;
        }
        k.r.x += k.w.x * dt;
        k.r.y += k.w.y * dt;
        confete.setMatrixAt(i, m4.compose(k.p, quat.setFromEuler(k.r), um));
      });
      confete.instanceMatrix.needsUpdate = true;
      if (agora > confeteAte) confete.visible = false;
    }

    if (qualidade === 'alta') composer.render();
    else renderer.render(cena, camera);

    // Mede os primeiros segundos: se o computador sofrer, baixa a qualidade sozinho.
    if (!medicao.feita) {
      if (!medicao.inicio) medicao.inicio = agora;
      medicao.quadros++;
      const passou = agora - medicao.inicio;
      if (passou > 5000) {
        medicao.feita = true;
        if (passou / medicao.quadros > 45 && qualidade === 'alta') {
          qualidade = 'leve';
          aoAviso?.('A qualidade foi reduzida para a cena ficar fluida neste computador. Dá para voltar no botão Qualidade.');
        }
      }
    }

    // Rótulos seguem as pessoas na tela.
    if (camadaRotulos.hidden) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const longe = camera.position.distanceTo(controles.target) > 52;
    for (const pessoa of todosComRotulo) {
      const r = rotulos.get(pessoa.id);
      if (pessoa.ausente) {
        r.rotulo.classList.add('oculto');
        r.balao.classList.add('oculto');
        continue;
      }
      pessoa.topo(tmp).project(camera);
      const fora = tmp.z > 1 || tmp.x < -1.1 || tmp.x > 1.1 || tmp.y < -1.1 || tmp.y > 1.1;
      const x = ((tmp.x + 1) / 2) * w;
      const y = ((1 - tmp.y) / 2) * h;
      r.rotulo.style.transform = `translate(${x.toFixed(1)}px, ${(y - 4).toFixed(1)}px) translate(-50%, -100%)`;
      r.rotulo.classList.toggle('oculto', fora || (longe && pessoa.id !== selecionado && pessoa.id !== sobre && pessoa !== voce));
      if (!r.balao.hidden) {
        r.balao.style.transform = `translate(${x.toFixed(1)}px, ${(y - 30).toFixed(1)}px) translate(-50%, -100%)`;
        r.balao.classList.toggle('oculto', fora);
      }
    }
  }
  renderer.setAnimationLoop(quadro);

  // ---------- API usada pela página ----------
  const posicaoDe = (id) => {
    if (pessoas.has(id)) return pessoas.get(id).topo(new THREE.Vector3()).setY(1.3);
    if (zonas.has(id)) {
      const z = zonas.get(id);
      return new THREE.Vector3(z.x, 1.3, z.sinal * 3.6);
    }
    if (id === 'ceo') return voce.topo(new THREE.Vector3()).setY(1.3);
    return new THREE.Vector3(X_TELAO, 1.8, -FUNDO + 0.4);
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
      if (modoTelao === 'mensagens') desenharTelao();
      const remetente = pessoas.get(msg.de);
      if (foco || remetente?.ausente) return;
      let destino = null;
      if (remetente) {
        const alvo = pessoas.get(msg.para);
        if (alvo && msg.para !== msg.de && !alvo.ausente) destino = destinos.agente(alvo, remetente);
        else if (zonas.has(msg.para)) destino = destinos.setor(zonas.get(msg.para));
        else if (msg.para === 'todos') destino = destinos.todos();
        else if (msg.para === 'ceo') destino = destinos.ceo();
      }
      if (destino && !reduzido()) {
        destino.duracao = 4.5 + Math.min(4, (msg.texto?.length ?? 0) / 60);
        if (remetente.visitar(destino)) return;
      }
      if (reduzido() || modo !== 'dentro') return;
      lancarEnvelope(posicaoDe(msg.de), posicaoDe(msg.para), corDe(msg.de) || '#D98A1E');
    },
    destacar(id) {
      if (selecionado) rotulos.get(selecionado)?.rotulo.classList.remove('selecionado');
      selecionado = id && pessoas.has(id) ? id : null;
      anel.visible = !!selecionado;
      if (selecionado) {
        anel.material.color.set(pessoas.get(selecionado).setor.cor);
        rotulos.get(selecionado).rotulo.classList.add('selecionado');
      }
    },
    definirVelocidade(v) {
      fator = Math.max(0.5, Math.min(4, Number(v) || 1));
    },
    recentralizar() {
      if (modo === 'fora' || modo === 'dentro') irPara(modo === 'fora' ? poseFora() : poseDentro());
    },
    entrar: () => entrar(),
    sair: () => sair(),
    get modo() {
      return modo;
    },
    irParaMapa() {
      if (modo !== 'dentro') return;
      const alvo = new THREE.Vector3(MAPA.x, 0.95, MAPA.z);
      voar([camera.position.clone(), alvo.clone().add(new THREE.Vector3(-1.1, 2.1, 1.9))], [controles.target.clone(), alvo], 2.5, () => {});
    },
    // Dados reais (planilha e tarefas): pilhas de papel, pinos no mapa e placar do prédio.
    definirDados(novos) {
      dados = novos;
      montarPilhas(novos.pendentes);
      montarPinos(novos.leads);
      desenharPlacar();
    },
    reuniao,
    comemorar,
    definirSprint(info) {
      sprint = info;
      foco = !!info;
      if (!reuniaoAte) modoTelao = info ? 'sprint' : 'mensagens';
      desenharTelao();
      for (const p of pessoas.values()) desenharBalao(p);
    },
    filmar(ligar) {
      filmando = ligar;
      configurarControles();
      if (ligar) {
        cenaDeFilmagem();
        return;
      }
      voo = null;
      controles.enabled = true;
      if (modo === 'entrando') {
        aplicarAbertura(1);
        mudarModo('dentro');
      } else if (modo === 'saindo') {
        aplicarAbertura(0);
        mudarModo('fora');
      }
      if (modo === 'fora' || modo === 'dentro') irPara(modo === 'fora' ? poseFora() : poseDentro());
    },
    alternarSom: () => som.alternar(),
    get somLigado() {
      return som.ligado;
    },
    definirHorario(h) {
      horario = h;
      aplicarHorario();
    },
    get horario() {
      return horario;
    },
    get noite() {
      return noite;
    },
    definirQualidade(q) {
      qualidade = q;
      medicao.feita = true;
    },
    get qualidade() {
      return qualidade;
    },
    destruir() {
      renderer.setAnimationLoop(null);
      clearInterval(relogioCeu);
      observadorTamanho.disconnect();
      observadorVisivel.disconnect();
      som.destruir();
      controles.dispose();
      composer.dispose();
      renderer.dispose();
      pmrem.dispose();
      renderer.domElement.remove();
      camadaRotulos.remove();
    },
  };
}
