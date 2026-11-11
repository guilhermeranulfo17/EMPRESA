// Fotografa (sem salvar nada) a tela de ajuste do orçamento no sistema LOCAL, conta Buffet Estrela.
// uso: ESTRELA_EMAIL=... ESTRELA_SENHA=... node scripts/v2/capturar_ajuste.cjs PASTA ORCAMENTO_ID
const { chromium } = require('playwright');
(async () => {
  const [S, id] = process.argv.slice(2);
  const b = await chromium.launch({ env: { ...process.env, LANG: 'pt_BR.UTF-8', LANGUAGE: 'pt_BR:pt', LC_ALL: 'pt_BR.UTF-8' } });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
  const p = await ctx.newPage();
  p.setDefaultTimeout(20000);
  await p.goto('http://localhost:3000/login');
  await p.locator('input[type=email]').fill(process.env.ESTRELA_EMAIL);
  await p.locator('input[type=password]').fill(process.env.ESTRELA_SENHA);
  await p.getByRole('button', { name: /Entrar/ }).first().click();
  await p.waitForURL(/\/app/, { timeout: 30000 });
  await p.goto(`http://localhost:3000/app/orcamentos/${id}/editar`, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '::-webkit-scrollbar{display:none!important}' });
  await p.waitForTimeout(1200);
  const alt = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log('url', p.url(), 'altura', alt);
  console.log((await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3,label,legend')].map((e) => `${e.tagName} y=${Math.round(e.getBoundingClientRect().top + scrollY)} ${e.innerText.replace(/\n/g, ' ').slice(0, 70)}`))).join('\n'));
  await p.screenshot({ path: `${S}/ajuste-inteira.png`, fullPage: true });
  await b.close();
})();
