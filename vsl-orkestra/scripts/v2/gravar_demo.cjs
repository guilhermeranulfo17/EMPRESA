// Grava a demonstração REAL da landing (www.sistemaorkestra.com.br) em viewport de celular 390x844 @3x.
// O recordVideo do Playwright fica ligado (cópia em 390 px, a resolução que ele grava), e a gravação usada no
// vídeo sai em pixels reais (1170x2532) a 30 qps: o relógio da página é avançado 1/30 s por quadro
// (Emulation.setVirtualTimePolicy) e cada quadro é fotografado, então as animações do site saem inteiras.
// Saída em PASTA: quadros/NNNNN.jpg, eventos.json (toques e marcos, em quadros), pedido.png e video-playwright/.
// uso: node scripts/v2/gravar_demo.cjs PASTA
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const SAIDA = process.argv[2];
const URL_SITE = 'https://www.sistemaorkestra.com.br/';
const FPS = 30;

(async () => {
  fs.rmSync(SAIDA, { recursive: true, force: true });
  fs.mkdirSync(path.join(SAIDA, 'quadros'), { recursive: true });
  const browser = await chromium.launch({ env: { ...process.env, LANG: 'pt_BR.UTF-8', LANGUAGE: 'pt_BR:pt', LC_ALL: 'pt_BR.UTF-8' } });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    recordVideo: { dir: path.join(SAIDA, 'video-playwright'), size: { width: 390, height: 844 } },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const p = await ctx.newPage();
  await p.goto(URL_SITE, { waitUntil: 'networkidle', timeout: 60000 });
  await p.addStyleTag({ content: '::-webkit-scrollbar{display:none!important} html{scroll-behavior:auto!important}' });
  await p.waitForTimeout(800);

  // estado inicial fora da gravação: 40 convidados e o pacote Alegria, para as escolhas aparecerem no vídeo
  await p.getByRole('heading', { name: /Agora o cliente/ }).scrollIntoViewIfNeeded();
  await p.evaluate(() => scrollTo({ top: 1085, behavior: 'instant' }));
  await p.getByRole('button', { name: 'Diminuir convidados' }).tap();
  await p.waitForTimeout(300);
  await p.locator('button', { hasText: 'Alegria' }).first().tap();
  await p.waitForTimeout(600);
  await p.evaluate(() => scrollTo({ top: 870, behavior: 'instant' }));
  await p.waitForTimeout(500);

  const cdp = await ctx.newCDPSession(p);
  const js = async (expr) => (await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value;
  await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' });
  let n = 0;
  const eventos = [];
  const avancar = () => new Promise((ok) => {
    cdp.once('Emulation.virtualTimeBudgetExpired', ok);
    cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pauseIfNetworkFetchesPending', budget: 1000 / FPS, maxVirtualTimeTaskStarvationCount: 200 });
  });
  const quadro = async () => {
    await avancar();
    const sy = await js('scrollY');
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 94, clip: { x: 0, y: sy, width: 390, height: 844, scale: 3 } });
    fs.writeFileSync(path.join(SAIDA, 'quadros', `${String(n).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'));
    n += 1;
  };
  const esperar = async (q) => { for (let i = 0; i < q; i++) await quadro(); };
  const rolar = async (ate, q) => {
    const de = await js('scrollY');
    for (let i = 1; i <= q; i++) {
      const k = i / q; const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      await js(`scrollTo(0, ${de + (ate - de) * e})`);
      await quadro();
    }
  };
  const CAIXA = (sel) => `(() => { const e = ${sel}; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; })()`;
  const tocar = async (nome, sel) => {
    const caixa = await js(CAIXA(sel));
    eventos.push({ nome, quadro: n, x: Math.round(caixa.x + caixa.w / 2), y: Math.round(caixa.y + caixa.h / 2), caixa, scrollY: await js('scrollY') });
    await js(`${sel}.click()`);
  };
  const BOTAO = (txt) => `[...document.querySelectorAll('button')].find((b) => (b.innerText || b.getAttribute('aria-label') || '').includes(${JSON.stringify(txt)}) || b.getAttribute('aria-label') === ${JSON.stringify(txt)})`;

  eventos.push({ nome: 'inicio', quadro: 0, scrollY: await js('scrollY') });
  await esperar(24);
  eventos.push({ nome: 'rolar-pacotes', quadro: n });
  await rolar(1085, 26);
  await esperar(16);
  await tocar('pacote', BOTAO('Mais pedido'));
  await esperar(42);
  await tocar('convidados', BOTAO('Aumentar convidados'));
  await esperar(42);
  await tocar('continuar', BOTAO('Continuar'));
  await esperar(40);
  eventos.push({ nome: 'passo2', quadro: n, scrollY: await js('scrollY') });
  await tocar('mesa', BOTAO('Mesa temática'));
  await esperar(60);
  eventos.push({ nome: 'total', quadro: n, scrollY: await js('scrollY'), texto: await js(`(document.body.innerText.match(/Total\\s*R\\$\\s*[\\d.,]+/) || [''])[0]`) });
  await tocar('ver', BOTAO('Ver como o buffet recebe'));
  await esperar(20);
  const yPedido = await js(`(() => { const h = [...document.querySelectorAll('h2')].find((x) => /pedido/.test(x.innerText)); return Math.round(h.getBoundingClientRect().top + scrollY); })()`);
  eventos.push({ nome: 'depois-ver', quadro: n, scrollY: await js('scrollY'), yPedido });
  if (Math.abs((await js('scrollY')) - (yPedido + 150)) > 200) await rolar(yPedido + 190, 34);
  await esperar(50);
  eventos.push({ nome: 'fim', quadro: n, scrollY: await js('scrollY') });
  await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: 5000 }).catch(() => {});
  await p.waitForTimeout(300);

  // cartão do pedido, sozinho, em 3x
  const zap = p.locator('text=Nova pré-reserva pelo link').first().locator('xpath=ancestor::div[3]');
  await zap.screenshot({ path: path.join(SAIDA, 'pedido.png') }).catch((e) => console.log('sem pedido', e.message.split('\n')[0]));
  console.log((await zap.innerText().catch(() => '')).replace(/\n+/g, ' | '));
  fs.writeFileSync(path.join(SAIDA, 'eventos.json'), JSON.stringify({ fps: FPS, quadros: n, eventos }, null, 1));
  console.log(`${n} quadros (${(n / FPS).toFixed(1)} s)`);
  console.log(eventos.map((e) => `${e.nome}@${e.quadro}${e.x ? ` (${e.x},${e.y})` : ''}${e.scrollY !== undefined ? ` y=${Math.round(e.scrollY)}` : ''}${e.texto ? ' ' + e.texto : ''}`).join(' | '));
  await ctx.close();
  await browser.close();
})();
