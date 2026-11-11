const { chromium } = require('playwright');
(async () => {
  const S = process.argv[2];
  const b = await chromium.launch({ env: { ...process.env, LANG: 'pt_BR.UTF-8', LANGUAGE: 'pt_BR:pt', LC_ALL: 'pt_BR.UTF-8' } });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo',
    recordVideo: { dir: `${S}/video-teste`, size: { width: 1170, height: 2532 } },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage();
  await p.goto('https://www.sistemaorkestra.com.br/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(800);
  const demo = p.getByRole('heading', { name: /Agora o cliente/ });
  await demo.scrollIntoViewIfNeeded();
  await p.evaluate(() => scrollTo({ top: 1085, behavior: 'instant' }));
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${S}/d1.png` });
  const inp = p.locator('input[type=number]').first();
  console.log('convidados', await inp.inputValue(), 'min', await inp.getAttribute('min'), 'max', await inp.getAttribute('max'), 'step', await inp.getAttribute('step'));
  await p.getByRole('button', { name: 'Aumentar convidados' }).tap(); await p.waitForTimeout(400);
  console.log('depois de +', await inp.inputValue());
  await p.locator('button', { hasText: 'Alegria' }).first().tap(); await p.waitForTimeout(500);
  await p.screenshot({ path: `${S}/d2.png` });
  await p.locator('summary').first().tap().catch(() => {}); await p.waitForTimeout(400);
  await p.screenshot({ path: `${S}/d2b.png` });
  await p.getByRole('button', { name: 'Continuar' }).scrollIntoViewIfNeeded();
  await p.getByRole('button', { name: 'Continuar' }).tap(); await p.waitForTimeout(900);
  await p.screenshot({ path: `${S}/d3.png` });
  const bs = await p.evaluate(() => [...document.querySelectorAll('button,a,input,label,summary')].map((e) => ({ t: e.tagName, y: Math.round(e.getBoundingClientRect().top + scrollY), x: (e.innerText || e.getAttribute('aria-label') || '').replace(/\n/g, ' ').slice(0, 70) })).filter((e) => e.y > 900 && e.y < 2400));
  console.log(bs.map((e) => `${e.t} y=${e.y} ${e.x}`).join('\n'));
  await p.evaluate(() => scrollBy(0, 500)); await p.waitForTimeout(400);
  await p.screenshot({ path: `${S}/d4.png` });
  const ver = p.getByRole('button', { name: /Ver como o buffet recebe/ });
  console.log('ver', await ver.count());
  if (await ver.count()) { await ver.scrollIntoViewIfNeeded(); await ver.tap(); await p.waitForTimeout(1500); await p.screenshot({ path: `${S}/d5.png` }); await p.evaluate(() => scrollBy(0, 420)); await p.waitForTimeout(600); await p.screenshot({ path: `${S}/d6.png` }); console.log('scrollY', await p.evaluate(() => scrollY)); }
  await ctx.close(); await b.close();
})();
