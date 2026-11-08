// Refaz só alguns passos de um capítulo e troca os quadros deles no manifesto (o resto fica igual).
// uso: node scripts/onboarding/recapturar.cjs CAP passo1,passo2 [URL_INICIAL]
// Mesmas variáveis de ambiente do capturar.cjs. Os quadros novos ganham números a partir de 500.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const roteiro = require('./roteiro.cjs');
const { Gravador, NAVEGADOR } = require('./motor.cjs');

const [capId, lista, url] = process.argv.slice(2);
const ids = lista.split(',');
const saida = path.join(__dirname, '../../public/onboarding');
const cap = roteiro.find((c) => c.id === capId);

(async () => {
  const g = new Gravador(saida);
  g.n = Number(process.env.INICIO_N || 500);
  const browser = await chromium.launch(NAVEGADOR);
  g.capitulo(cap.id, cap.titulo);
  const { ctx, p } = await g.contexto(browser);
  if (cap.preparar) await cap.preparar(g, p);
  if (url) await g.ir(url);
  for (const passo of cap.passos.filter((x) => ids.includes(x.id))) {
    g.inicioPasso(passo.id, passo.texto, passo.fala);
    await passo.fazer(g, p);
    if (!g.passo.quadros.length) await g.foto();
    console.log(`  ${passo.id}: ${g.passo.quadros.map((q) => q.arquivo + (q.foco ? '' : ' (sem foco)')).join(', ')}`);
  }
  await ctx.close();
  await browser.close();

  const arq = path.join(saida, 'manifesto.json');
  const m = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const alvo = m.capitulos.find((c) => c.id === capId);
  for (const novo of g.cap.passos) {
    const i = alvo.passos.findIndex((x) => x.id === novo.id);
    alvo.passos[i] = novo;
  }
  fs.writeFileSync(arq, JSON.stringify(m, null, 1));
})();
