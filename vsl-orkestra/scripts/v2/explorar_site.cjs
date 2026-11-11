// Explora a landing (celular) para achar a demonstração: lista títulos, botões e tira fotos.
const { chromium } = require('playwright');
(async () => {
  const S = process.argv[2];
  const b = await chromium.launch({ env: { ...process.env, LANG: 'pt_BR.UTF-8', LANGUAGE: 'pt_BR:pt', LC_ALL: 'pt_BR.UTF-8' } });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage();
  const falhas = [];
  p.on('requestfailed', (r) => falhas.push(r.url().slice(0, 90)));
  await p.goto('https://www.sistemaorkestra.com.br/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1500);
  const alt = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log('altura', alt);
  const hs = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].map((h) => `${h.tagName} y=${Math.round(h.getBoundingClientRect().top + scrollY)} ${h.innerText.replace(/\n/g, ' ').slice(0, 80)}`));
  console.log(hs.join('\n'));
  const bs = await p.evaluate(() => [...document.querySelectorAll('button,a,[role=button],input,select,label')].map((e) => `${e.tagName}${e.type ? '[' + e.type + ']' : ''} y=${Math.round(e.getBoundingClientRect().top + scrollY)} ${(e.innerText || e.getAttribute('aria-label') || e.name || '').replace(/\n/g, ' ').slice(0, 60)}`).filter((t) => !/ y=0 /.test(t)));
  console.log(bs.join('\n'));
  for (let y = 0, i = 0; y < alt && i < 30; y += 800, i++) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(350); await p.screenshot({ path: `${S}/pg-${String(i).padStart(2, '0')}.png` }); }
  console.log('falhas', [...new Set(falhas)].slice(0, 15));
  await b.close();
})();
