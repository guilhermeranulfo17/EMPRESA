// Motor de captura do vídeo de onboarding: cada passo do roteiro vira uma lista de quadros
// (capturas 1920x1080 do sistema local, tema claro) com o foco (retângulo para o zoom) e o ponto
// de clique (para o cursor). Tudo em px CSS do viewport 1440x810.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE = 'http://localhost:3000';
const VIEW = { width: 1440, height: 810 };
// campos de data no formato brasileiro (dd/mm/aaaa): o formato vem do idioma do processo
const NAVEGADOR = { env: { ...process.env, LANG: 'pt_BR.UTF-8', LANGUAGE: 'pt_BR:pt', LC_ALL: 'pt_BR.UTF-8' } };

class Gravador {
  constructor(saida) {
    this.saida = saida;
    this.manifesto = { viewport: VIEW, escala: 1920 / 1440, capitulos: [] };
    this.cap = null;
    this.passo = null;
    this.n = 0;
  }

  async contexto(browser) {
    const ctx = await browser.newContext({
      viewport: VIEW,
      deviceScaleFactor: 1920 / 1440,
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
    });
    await ctx.addCookies([{ name: 'orkestra_tema', value: 'claro', url: BASE }]);
    await ctx.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const s = document.createElement('style');
        s.textContent = '::-webkit-scrollbar{display:none!important}*{scrollbar-width:none!important}';
        document.head.appendChild(s);
      });
    });
    const p = await ctx.newPage();
    p.setDefaultTimeout(8000);
    this.p = p;
    return { ctx, p };
  }

  capitulo(id, titulo) {
    this.cap = { id, titulo, passos: [] };
    this.manifesto.capitulos.push(this.cap);
    fs.mkdirSync(path.join(this.saida, id), { recursive: true });
  }

  inicioPasso(id, texto, fala) {
    this.passo = { id, texto, fala, quadros: [] };
    this.cap.passos.push(this.passo);
  }

  async caixa(loc) {
    if (!loc) return null;
    const b = await loc.boundingBox().catch(() => null);
    if (!b) return null;
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  }

  async foto({ foco = null, cursor = null, clique = false, espera = 500 } = {}) {
    await this.p.waitForTimeout(espera);
    this.n += 1;
    const arquivo = `${this.cap.id}/${String(this.n).padStart(3, '0')}.png`;
    await this.p.screenshot({ path: path.join(this.saida, arquivo) });
    this.passo.quadros.push({ arquivo, foco, cursor, clique });
  }

  async mostrar(loc, opts = {}) {
    if (loc) {
      await loc.first().scrollIntoViewIfNeeded().catch(() => {});
      await loc.first().evaluate((el) => el.scrollIntoView({ block: opts.bloco ?? 'center' })).catch(() => {});
    }
    await this.foto({ foco: loc ? await this.caixa(loc.first()) : null, espera: opts.espera ?? 600 });
  }

  async clicar(loc, opts = {}) {
    const alvo = loc.first();
    await alvo.evaluate((el) => el.scrollIntoView({ block: 'center' })).catch(() => {});
    await this.p.waitForTimeout(250);
    const c = await this.caixa(alvo);
    const foco = opts.foco ? await this.caixa(opts.foco.first()) : c;
    const cursor = c ? { x: Math.round(c.x + c.w / 2), y: Math.round(c.y + c.h / 2) } : null;
    await this.foto({ foco, cursor, clique: true, espera: 150 });
    await alvo.click({ force: opts.force }).catch((e) => console.log('   ! clique', e.message.split('\n')[0]));
    await this.p.waitForTimeout(opts.espera ?? 900);
  }

  async digitar(loc, texto, opts = {}) {
    const alvo = loc.first();
    await alvo.evaluate((el) => el.scrollIntoView({ block: 'center' })).catch(() => {});
    await this.p.waitForTimeout(200);
    const c = await this.caixa(alvo);
    const cursor = c ? { x: Math.round(c.x + Math.min(c.w / 2, 120)), y: Math.round(c.y + c.h / 2) } : null;
    const foco = opts.foco ? await this.caixa(opts.foco.first()) : c;
    await this.foto({ foco, cursor, clique: true, espera: 120 });
    await alvo.click().catch(() => {});
    if (opts.limpar !== false) await alvo.fill('').catch(() => {});
    await alvo.pressSequentially(texto, { delay: 18 }).catch((e) => console.log('   ! digitar', e.message.split('\n')[0]));
    await this.foto({ foco, cursor: null, espera: 350 });
  }

  async selecionar(loc, valor) {
    const alvo = loc.first();
    await alvo.evaluate((el) => el.scrollIntoView({ block: 'center' })).catch(() => {});
    const c = await this.caixa(alvo);
    await this.foto({ foco: c, cursor: c ? { x: c.x + c.w / 2, y: c.y + c.h / 2 } : null, clique: true, espera: 150 });
    await alvo.selectOption(valor).catch((e) => console.log('   ! select', e.message.split('\n')[0]));
    await this.foto({ foco: c, espera: 400 });
  }

  async enviar(loc, arquivos, opts = {}) {
    const foco = opts.foco ? await this.caixa(opts.foco.first()) : null;
    if (opts.foco) await opts.foco.first().evaluate((el) => el.scrollIntoView({ block: 'center' })).catch(() => {});
    const f2 = opts.foco ? await this.caixa(opts.foco.first()) : foco;
    const botao = opts.botao ? await this.caixa(opts.botao.first()) : null;
    await this.foto({ foco: f2, cursor: botao ? { x: botao.x + botao.w / 2, y: botao.y + botao.h / 2 } : null, clique: !!botao, espera: 200 });
    await loc.first().setInputFiles(arquivos).catch((e) => console.log('   ! upload', e.message.split('\n')[0]));
    await this.p.waitForTimeout(opts.espera ?? 3500);
    const f3 = opts.foco ? await this.caixa(opts.foco.first()) : null;
    await this.foto({ foco: f3, espera: 300 });
  }

  async ir(url) {
    await this.p.goto(BASE + url, { waitUntil: 'networkidle' });
    await this.p.waitForTimeout(700);
  }

  /** Grava o manifesto mesclando com o que já existe (só troca os capítulos gravados agora). */
  salvar(ordem) {
    const arq = path.join(this.saida, 'manifesto.json');
    let antigo = { capitulos: [] };
    try { antigo = JSON.parse(fs.readFileSync(arq, 'utf8')); } catch {}
    const porId = new Map(antigo.capitulos.map((c) => [c.id, c]));
    for (const c of this.manifesto.capitulos) porId.set(c.id, c);
    const caps = [...porId.values()].sort((a, b) => (ordem ?? []).indexOf(a.id) - (ordem ?? []).indexOf(b.id));
    fs.writeFileSync(arq, JSON.stringify({ ...this.manifesto, capitulos: caps }, null, 1));
  }
}

async function rodar(roteiro, saida, filtro) {
  fs.mkdirSync(saida, { recursive: true });
  const g = new Gravador(saida);
  const browser = await chromium.launch(NAVEGADOR);
  for (const cap of roteiro) {
    if (filtro && !filtro.includes(cap.id)) continue;
    console.log(`# ${cap.id} ${cap.titulo}`);
    g.capitulo(cap.id, cap.titulo);
    const { ctx, p } = await g.contexto(browser);
    if (cap.preparar) await cap.preparar(g, p);
    for (const passo of cap.passos) {
      g.inicioPasso(passo.id, passo.texto, passo.fala);
      try {
        await passo.fazer(g, p);
      } catch (e) {
        console.log(`   ! passo ${passo.id}: ${e.message.split('\n')[0]}`);
      }
      if (!g.passo.quadros.length) await g.foto();
      console.log(`  ${passo.id}: ${g.passo.quadros.length} quadros`);
    }
    await ctx.close();
    g.salvar(roteiro.map((c) => c.id));
  }
  await browser.close();
  g.salvar(roteiro.map((c) => c.id));
  return g.manifesto;
}

module.exports = { rodar, BASE, Gravador, NAVEGADOR };
