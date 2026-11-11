// Sequência real da tela de ajuste do orçamento (sistema LOCAL, Buffet Estrela, nada é salvo):
// rola até Ajustes, escolhe desconto em R$ e digita 300; o total da barra de baixo muda na hora.
// Quadros 1170x2532 em PASTA/ajuste/NN.png + ajuste.json (rótulo de cada quadro e caixas úteis).
const fs = require('node:fs');
const { chromium } = require('playwright');
(async () => {
  const [S, id] = process.argv.slice(2);
  fs.rmSync(`${S}/ajuste`, { recursive: true, force: true }); fs.mkdirSync(`${S}/ajuste`, { recursive: true });
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
  await p.addStyleTag({ content: '::-webkit-scrollbar{display:none!important} *{caret-color:transparent!important}' });
  await p.waitForTimeout(1000);
  const quadros = [];
  let n = 0;
  const foto = async (rotulo) => {
    const arq = `${String(n++).padStart(2, '0')}.png`;
    await p.screenshot({ path: `${S}/ajuste/${arq}` });
    const total = await p.evaluate(() => (document.body.innerText.match(/nova versão\s*R\$\s*[\d.,]+/) || [''])[0].replace(/\s+/g, ' '));
    quadros.push({ arquivo: arq, rotulo, total });
  };
  const ajustes = p.getByRole('heading', { name: 'Ajustes' });
  const y = await ajustes.evaluate((e) => e.getBoundingClientRect().top + scrollY);
  await p.evaluate((v) => scrollTo(0, v), y - 330);
  await p.waitForTimeout(500);
  await foto('inicio');
  const rs = p.getByRole('button', { name: 'R$', exact: true }).or(p.getByRole('radio', { name: 'R$', exact: true })).first();
  await rs.tap().catch(async () => { await p.locator('text="R$"').first().tap(); });
  await p.waitForTimeout(400);
  await foto('reais');
  const campo = p.locator('fieldset', { has: p.getByText('Desconto', { exact: true }) }).locator('input').last();
  await campo.tap(); await p.waitForTimeout(250);
  for (const parcial of ['3', '30', '300', '300,00']) {
    if (parcial === '300,00') { await p.keyboard.press('Tab'); await p.waitForTimeout(700); }
    else { await campo.press(parcial.slice(-1)); await p.waitForTimeout(450); }
    await foto(`digita-${parcial}`);
  }
  const caixa = await campo.boundingBox();
  fs.writeFileSync(`${S}/ajuste.json`, JSON.stringify({ quadros, campo: caixa }, null, 1));
  console.log(quadros.map((q) => `${q.arquivo} ${q.rotulo} ${q.total}`).join('\n'), '\ncampo', JSON.stringify(caixa));
  await b.close();
})();
