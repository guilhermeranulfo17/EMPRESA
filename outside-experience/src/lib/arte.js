// Gera as artes de divulgação no próprio navegador (sem servidor): story 1080x1920 e feed 1080x1350.
import { EVENT, IMAGES, LOGO, SITE_URL } from "@/data/event";

const carregar = (src) =>
  new Promise((ok, falha) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = falha;
    img.src = src;
  });

function cobrir(ctx, img, w, h, focoX = 0.7) {
  const escala = Math.max(w / img.width, h / img.height);
  const iw = img.width * escala;
  const ih = img.height * escala;
  ctx.drawImage(img, (w - iw) * focoX, (h - ih) / 2, iw, ih);
}

function linhas(ctx, texto, largura) {
  const palavras = texto.split(" ");
  const out = [];
  let atual = "";
  for (const p of palavras) {
    const teste = atual ? `${atual} ${p}` : p;
    if (ctx.measureText(teste).width > largura && atual) {
      out.push(atual);
      atual = p;
    } else atual = teste;
  }
  if (atual) out.push(atual);
  return out;
}

export async function gerarArte(formato, igreja = "") {
  await Promise.all([document.fonts.load('120px "Anton"'), document.fonts.load('italic 60px "Instrument Serif"'), document.fonts.load('600 40px "Archivo"')]);
  const [foto, logo] = await Promise.all([carregar(IMAGES.hero), carregar(LOGO)]);
  const w = 1080;
  const h = formato === "story" ? 1920 : 1350;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  const m = 80;

  cobrir(ctx, foto, w, h);
  const g = ctx.createLinearGradient(0, h * 0.25, 0, h);
  g.addColorStop(0, "rgba(12,11,10,0.15)");
  g.addColorStop(0.55, "rgba(12,11,10,0.85)");
  g.addColorStop(1, "rgba(12,11,10,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const lw = 260;
  ctx.drawImage(logo, m, m + (formato === "story" ? 60 : 0), lw, (logo.height / logo.width) * lw);

  // título
  ctx.fillStyle = "#FFFFFF";
  const tam = formato === "story" ? 168 : 140;
  ctx.font = `${tam}px "Anton"`;
  ctx.textBaseline = "alphabetic";
  const titulo = ["A FÉ NÃO FOI", "FEITA PARA", "FICAR DENTRO"];
  const altLinha = tam * 0.98;
  let y = h - (formato === "story" ? 640 : 470) - altLinha * (titulo.length - 1);
  titulo.forEach((l, i) => {
    if (i === titulo.length - 1) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("FICAR ", m, y);
      const x = m + ctx.measureText("FICAR ").width;
      ctx.fillStyle = "#F26A1B";
      ctx.fillText("DENTRO", x, y);
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(l, m, y);
    }
    y += altLinha;
  });

  // dados
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = 'italic 58px "Instrument Serif"';
  ctx.fillText(`Outside Experience, ${EVENT.edition}`, m, y + 20);
  ctx.font = '600 42px "Archivo"';
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`${EVENT.dateLabel} · ${EVENT.cityShort}`, m, y + 90);

  // faixa de chamada
  const fy = h - (formato === "story" ? 300 : 210);
  ctx.fillStyle = "#F26A1B";
  ctx.fillRect(m, fy, w - m * 2, 130);
  ctx.fillStyle = "#0C0B0A";
  ctx.font = '700 44px "Archivo"';
  const chamada = igreja ? `${igreja}: vem com a gente` : "Lista de espera aberta";
  ctx.fillText(linhas(ctx, chamada, w - m * 2 - 60)[0], m + 30, fy + 58);
  ctx.font = '600 34px "Archivo"';
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), m + 30, fy + 106);

  return c.toDataURL("image/png");
}
