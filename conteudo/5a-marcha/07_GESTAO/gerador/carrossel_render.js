// Renderiza os carrosséis no design antigo do @guisilva.vendas (post estilo Twitter, 1080x1350).
// uso: node render.js pasta_json pasta_saida
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [, , SRC, OUT] = process.argv;
const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;overflow:hidden}
.s{width:1080px;height:1350px;display:flex;align-items:flex-start;justify-content:center;padding:400px 92px 0;font-family:Inter,'Segoe UI',Arial,'Noto Color Emoji',sans-serif}
.claro{background:#FFFFFF;color:#0F1419} .claro .muted{color:#536471}
.escuro{background:#000000;color:#E7E9EA} .escuro .muted{color:#71767B}
.t{width:100%}
.head{display:flex;align-items:center;gap:26px}
.av{width:124px;height:124px;border-radius:50%;flex:none;background:#0F1419;background-size:cover;background-position:center}
.escuro .av{background-color:#2F3336}
.name{font-weight:700;font-size:44px;line-height:1.15}
.handle{font-size:38px;line-height:1.2}
.body{margin-top:44px;font-size:52px;line-height:1.36;letter-spacing:-.005em}
.body p+p{margin-top:34px}
.body b{font-weight:700}`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function fmt(t) {
  let n = 0; t = t.replace(/"/g, () => (++n % 2 ? '“' : '”'));
  return t.split('\n\n').map(p => p.trim()).filter(Boolean)
    .map(p => '<p>' + esc(p).replace(/\*(.+?)\*/g, '<b>$1</b>').replace(/\n/g, '<br>') + '</p>').join('');
}
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const av = fs.readFileSync(path.join(__dirname, 'avatar.jpg')).toString('base64');
  const report = [];
  for (const f of fs.readdirSync(SRC).filter(f => f.endsWith('.json')).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(SRC, f)));
    const dir = path.join(OUT, d.numero); fs.mkdirSync(dir, { recursive: true });
    const [y, m, dd] = d.data.split('-'); const mes = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][+m - 1];
    for (let i = 0; i < d.slides.length; i++) {
      const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="s ${d.tema}"><div class="t"><div class="head"><div class="av" style="background-image:url('data:image/jpeg;base64,${av}')"></div><div><div class="name">${esc(d.nome)}</div><div class="handle muted">@${d.handle}</div></div></div><div class="body">${fmt(d.slides[i].texto)}</div></div></div></body></html>`;
      await pg.setContent(html); await pg.evaluate(() => document.fonts.ready);
      // se o texto passar do fim do slide (margem de 90 px), reduz a fonte do corpo aos poucos
      let fs_ = 52;
      while (fs_ > 40 && await pg.evaluate(() => document.querySelector('.t').getBoundingClientRect().bottom > 1260)) {
        fs_ -= 2; await pg.evaluate(v => document.querySelector('.body').style.fontSize = v + 'px', fs_);
      }
      const alone = await pg.evaluate(() => { // 👉 sozinho na última linha?
        const ps = document.querySelectorAll('.body p'); const last = ps[ps.length - 1]; if (!last.textContent.includes('👉')) return false;
        const r = document.createRange(); const tn = [...last.childNodes].pop(); if (tn.nodeType !== 3) return false;
        const txt = tn.textContent; const k = txt.lastIndexOf('👉'); const w = txt.lastIndexOf(' ', k - 2);
        r.setStart(tn, Math.max(0, w)); r.setEnd(tn, txt.length); return r.getClientRects().length > 1; });
      if (fs_ < 52 || alone) report.push(`${d.numero} slide ${i + 1}: fonte ${fs_}${alone ? ' / 👉 sozinho' : ''}`);
      await pg.screenshot({ path: path.join(dir, `carrossel_${dd}${mes}_${String(i + 1).padStart(2, '0')}.png`) });
    }
    fs.writeFileSync(path.join(dir, 'legenda.txt'), d.legenda + '\n');
  }
  await b.close(); console.log(report.join('\n') || 'tudo coube em 52px');
})();
