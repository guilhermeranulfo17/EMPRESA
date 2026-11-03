// Captura o Orkestra LOCAL (http://localhost:3000) para o vídeo de vendas.
// Pré-requisitos: Supabase local + seed do vídeo (TRIMFLOW/supabase/seed-video.sql e
// scripts/seed-video-midia.mjs) e o app rodando (pnpm build && pnpm start).
// Credenciais do painel: ficam no seed (TRIMFLOW/supabase/seed-video.sql); passe por env:
//   PAINEL_EMAIL=... PAINEL_SENHA=... node scripts/capturar.cjs
//
// Saída: public/capturas/*.png (1170x2532) + public/capturas/manifesto.json, com o ponto de
// toque (px CSS, viewport 390x844) que leva de cada captura à seguinte.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
if (!/^http:\/\/(localhost|127\.0\.0\.1)/.test(BASE)) throw new Error('Só capture o sistema local.');
const EMAIL = process.env.PAINEL_EMAIL;
const SENHA = process.env.PAINEL_SENHA;
if (!EMAIL || !SENHA) throw new Error('Defina PAINEL_EMAIL e PAINEL_SENHA (estão no seed).');

const OUT = path.join(__dirname, '..', 'public', 'capturas');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const VIEW = { width: 390, height: 844 };
const manifesto = { viewport: VIEW, escala: 3, capturas: [] };
let seq = 0;

const CSS_LIMPO = `
  ::-webkit-scrollbar { display: none !important; }
  * { scrollbar-width: none !important; caret-color: transparent !important; }
  nextjs-portal, [data-nextjs-toast] { display: none !important; }
`;

async function novoContexto(browser) {
  const ctx = await browser.newContext({
    viewport: VIEW,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  });
  await ctx.addInitScript((css) => {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = css;
      document.head.appendChild(s);
    });
  }, CSS_LIMPO);
  return ctx;
}

function nomeArq(grupo, nome) {
  seq += 1;
  return `${grupo}${String(seq).padStart(2, '0')}-${nome}.png`;
}

async function centro(loc) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  if (!b) throw new Error('elemento sem caixa');
  return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) };
}

/** Fotografa o estado atual; se `alvo` vier, registra o toque nele e clica. */
async function passo(page, grupo, nome, alvo, opts = {}) {
  await page.waitForTimeout(opts.espera ?? 700);
  let toque = null;
  if (alvo) toque = await centro(alvo);
  const arquivo = nomeArq(grupo, nome);
  await page.screenshot({ path: path.join(OUT, arquivo) });
  const item = { arquivo, nome, toque };
  if (opts.extra) Object.assign(item, opts.extra);
  manifesto.capturas.push(item);
  if (alvo && !opts.semClique) await alvo.click();
  return item;
}

/** Página inteira (para pan), com âncoras em px CSS do topo da página. */
async function paginaInteira(page, grupo, nome, ancoras) {
  await page.waitForTimeout(800);
  const pos = {};
  for (const [k, loc] of Object.entries(ancoras)) {
    const b = await loc.first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { y: Math.round(r.top + window.scrollY), h: Math.round(r.height), x: Math.round(r.left), w: Math.round(r.width) };
    });
    pos[k] = b;
  }
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  const arquivo = nomeArq(grupo, nome);
  await page.screenshot({ path: path.join(OUT, arquivo), fullPage: true });
  manifesto.capturas.push({ arquivo, nome, paginaInteira: true, altura, ancoras: pos });
}

(async () => {
  const browser = await chromium.launch();
  globalThis.__browser = browser;

  // ------------------------------------------------------------------ A: cliente final
  seq = 0;
  const ctxA = await novoContexto(browser);
  const a = await ctxA.newPage();
  await a.goto(`${BASE}/b/buffet-estrela`, { waitUntil: 'networkidle' });
  await a.waitForTimeout(1500);
  await passo(a, 'A', 'vitrine', a.getByRole('link', { name: 'Montar meu orçamento' }).last(), { semClique: true });
  await a.goto(`${BASE}/b/buffet-estrela/orcamento`, { waitUntil: 'networkidle' });
  await a.waitForTimeout(1500);
  await passo(a, 'A', 'tipo', a.getByText('Aniversário infantil', { exact: true }).first());
  await passo(a, 'A', 'tipo-escolhido', a.getByRole('button', { name: 'Continuar' }));
  await passo(a, 'A', 'data-novembro', a.getByRole('button', { name: 'Próximo mês' }), { espera: 1500 });
  await passo(a, 'A', 'data-dezembro', a.locator('[data-testid="data-2026-12-05"]'), { espera: 1500 });
  await passo(a, 'A', 'data-05-12', a.getByRole('radio', { name: /Tarde/ }).first(), { espera: 1200 });
  const maisAdultos = a.getByRole('button', { name: 'Aumentar adultos' });
  await passo(a, 'A', 'turno-tarde', null, { espera: 900 });
  for (let i = 1; i <= 40; i++) {
    if (i % 5 === 1) await passo(a, 'A', `adultos-${i - 1}`, maisAdultos, { espera: 250 });
    else await maisAdultos.click();
  }
  const maisCriancas = a.getByRole('button', { name: 'Aumentar crianças de 6 a 10 anos' });
  await passo(a, 'A', 'adultos-40', maisCriancas, { espera: 500 });
  for (let i = 2; i <= 10; i++) {
    if (i === 6) await passo(a, 'A', 'criancas-5', maisCriancas, { espera: 250 });
    else await maisCriancas.click();
  }
  await passo(a, 'A', 'convidados-50', a.getByRole('button', { name: 'Continuar' }), { espera: 900 });
  await passo(a, 'A', 'contato', a.locator('#nome'), { espera: 1200 });
  await a.locator('#nome').pressSequentially('Mar', { delay: 120 });
  await passo(a, 'A', 'nome-mar', null, { espera: 200 });
  await a.locator('#nome').pressSequentially('iana', { delay: 120 });
  await passo(a, 'A', 'nome-mariana', a.locator('#whatsapp'), { espera: 300 });
  await a.locator('#whatsapp').pressSequentially('349920', { delay: 110 });
  await passo(a, 'A', 'whats-parcial', null, { espera: 200 });
  await a.locator('#whatsapp').pressSequentially('00107', { delay: 110 });
  await passo(a, 'A', 'whats-completo', a.getByRole('checkbox').first(), { espera: 300 });
  await a.waitForTimeout(1500); // proteção anti-robô: ninguém envia em menos de 2,5 s
  await passo(a, 'A', 'consentimento', a.getByRole('button', { name: 'Ver pacotes e valores' }), { espera: 400 });
  await passo(a, 'A', 'pacotes', a.getByRole('radio', { name: /Super/ }).first(), { espera: 2200 });
  await passo(a, 'A', 'pacote-super', a.getByRole('button', { name: 'Continuar' }), { espera: 1500 });
  await passo(a, 'A', 'extras', a.getByText('Mesa temática', { exact: true }).first(), { espera: 2200 });
  await passo(a, 'A', 'extras-mesa', a.getByRole('button', { name: 'Ver minha proposta' }), { espera: 1500 });
  await a.waitForTimeout(3000);
  await passo(a, 'A', 'proposta-total', null, { espera: 300 });
  await paginaInteira(a, 'A', 'proposta-inteira', {
    total: a.getByText(/^total$/i),
    investimento: a.getByText(/^investimento$/i),
    ajusteSabado: a.getByText('Ajuste sábado', { exact: true }),
    condicoes: a.getByText(/^condições$/i),
    sinal: a.getByText(/^Sinal de R\$/),
    reservar: a.getByRole('button', { name: 'Quero reservar esta data' }),
  });
  await a.getByText(/^investimento$/i).first().evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 90));
  await passo(a, 'A', 'proposta-investimento', null, { espera: 600 });
  const reservar = a.getByRole('button', { name: 'Quero reservar esta data' });
  await reservar.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 520));
  await passo(a, 'A', 'proposta-reservar', reservar, { espera: 600 });
  await a.waitForTimeout(2500);
  await passo(a, 'A', 'pre-reserva-confirmada', null, { espera: 300 });
  await ctxA.close();

  // ------------------------------------------------------------------ B: painel do dono
  seq = 0;
  const ctxB = await novoContexto(browser);
  const b = await ctxB.newPage();
  await b.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await b.waitForTimeout(1000);
  await b.locator('input[type=email]').fill(EMAIL);
  await b.locator('input[type=password]').fill(SENHA);
  await b.getByRole('button', { name: /Entrar/ }).first().click();
  await b.waitForURL(/\/app/, { timeout: 30000 });
  await b.goto(`${BASE}/app/leads`, { waitUntil: 'networkidle' });
  await b.waitForTimeout(1500);
  const sino = b.getByRole('button', { name: /^Avisos/ }).first();
  await passo(b, 'B', 'caixa-leads', sino, { espera: 600 });
  await passo(b, 'B', 'aviso-mariana', b.getByText('Pré-reserva: Mariana', { exact: true }).first(), { espera: 1200 });
  await b.waitForURL(/\/app\/leads\/[0-9a-f-]{36}/, { timeout: 15000 }).catch(async () => {
    await b.goto(`${BASE}/app/leads`, { waitUntil: 'networkidle' });
    await b.getByText('Mariana', { exact: true }).first().click();
    await b.waitForURL(/\/app\/leads\/[0-9a-f-]{36}/);
  });
  await b.waitForLoadState('networkidle');
  await passo(b, 'B', 'ficha', null, { espera: 1500 });
  await paginaInteira(b, 'B', 'ficha-inteira', {
    preReserva: b.getByText('Confirmar (sinal pago)'),
    orcamento: b.getByText('Nº 0007').or(b.getByText(/^Nº \d{4}$/)),
    total: b.getByText('Total', { exact: true }),
  });
  await b.getByText(/^Nº \d{4}$/).first().evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 90));
  await passo(b, 'B', 'ficha-orcamento', null, { espera: 700 });
  await b.evaluate(() => window.scrollTo(0, 0));
  const zap = b.getByRole('button', { name: 'WhatsApp' }).last();
  await passo(b, 'B', 'ficha-topo', zap, { espera: 700 });
  await passo(b, 'B', 'mensagem-pronta', b.getByRole('link', { name: 'Abrir WhatsApp' }), { espera: 1200, semClique: true });
  await b.keyboard.press('Escape');

  // proposta em PDF (a mesma rota do botão "PDF" do painel), primeira página em PNG
  const pdfHref = await b.getByRole('link', { name: 'PDF' }).first().getAttribute('href');
  const resp = await ctxB.request.get(new URL(pdfHref, BASE).toString());
  if (!resp.ok()) throw new Error(`PDF: ${resp.status()}`);
  const pdfPath = path.join(OUT, 'proposta.pdf');
  fs.writeFileSync(pdfPath, await resp.body());
  const nomePdf = nomeArq('B', 'proposta-pdf').replace(/\.png$/, '');
  execFileSync('pdftoppm', ['-png', '-r', '220', '-f', '1', '-l', '1', '-singlefile', pdfPath, path.join(OUT, nomePdf)]);
  manifesto.capturas.push({ arquivo: `${nomePdf}.png`, nome: 'proposta-pdf', pdf: true, toque: null });

  await b.goto(`${BASE}/app/agenda?mes=2026-12`, { waitUntil: 'networkidle' });
  await b.waitForTimeout(1500);
  const dia05 = b.getByText(/^05\/12\/2026/).first();
  await passo(b, 'B', 'agenda', dia05, { espera: 600 });
  await passo(b, 'B', 'agenda-05-12', null, { espera: 1500 });
  await ctxB.close();

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'manifesto.json'), JSON.stringify(manifesto, null, 2));
  console.log(`${manifesto.capturas.length} capturas em ${OUT}`);
})().catch(async (e) => {
  console.error(e);
  for (const ctx of (globalThis.__browser?.contexts() ?? [])) for (const pg of ctx.pages()) {
    await pg.screenshot({ path: path.join(OUT, 'ERRO.png') }).catch(() => {});
    console.error('TEXTO NA TELA:', (await pg.evaluate(() => document.body.innerText).catch(() => '')).slice(0, 800));
  }
  process.exit(1);
});
