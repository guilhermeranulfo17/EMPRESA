import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import roteiro from "./roteiro.json";

/** Manrope (a fonte do sistema), arquivo variável local em public/fontes (licença OFL). */
export const MANROPE = "Manrope";
for (const [arq, faixa] of [
  ["manrope-latin.woff2", "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"],
  ["manrope-latin-ext.woff2", "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"],
] as const) {
  loadFont({ family: MANROPE, url: staticFile(`fontes/${arq}`), weight: "400 800", unicodeRange: faixa });
}

export const COR = {
  fundo: "#0C0C0C",
  card: "#1A1A1A",
  borda: "#2C2C2C",
  texto: "#F4F4F2",
  texto2: "#A0A09C",
  limao: "#B2F759",
};

export const FPS = roteiro.fps;
export const W = 1080;
export const H = 1920;
/** Área segura do WhatsApp: livres 250px no topo e 320px na base. */
export const SEGURO = { topo: 250, base: 320, lado: 80 };
/** segundos → quadros */
export const f = (s: number) => Math.round(s * FPS);
export { roteiro };
