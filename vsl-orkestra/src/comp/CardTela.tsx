import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COR, FPS } from "../tema";

/** Larguras e alturas das capturas em px CSS (viewport 390x844, capturadas a 3x). */
const VW = 390;
const VH = 844;

export type Shot = { src: string; at: number; alturaCss?: number };
export type Camera = { at: number; fy: number; zoom: number; dur: number; fx?: number };
export type Tap = { at: number; x: number; y: number; rapido?: boolean };
export type Destaque = { de: number; ate: number; x: number; y: number; w: number; h: number };

export type DadosCard = {
  shots: Shot[];
  camera: Camera[];
  taps: Tap[];
  destaques: Destaque[];
};

/** Janela do card na tela 1080x1920 (fica entre a área segura do topo e a legenda). */
export const CARD = { x: 100, y: 262, w: 880, h: 1068 };

const suave = Easing.bezier(0.45, 0, 0.2, 1);

/** Câmera (ponto focal em px CSS + zoom) no instante t, com movimentos que podem se encadear. */
function cameraEm(cams: Camera[], t: number) {
  let cur = { fx: cams[0].fx ?? VW / 2, fy: cams[0].fy, zoom: cams[0].zoom };
  for (let i = 1; i < cams.length; i++) {
    const c = cams[i];
    if (t < c.at) break;
    const p = interpolate(t, [c.at, c.at + c.dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: suave,
    });
    const alvo = { fx: c.fx ?? VW / 2, fy: c.fy, zoom: c.zoom };
    cur = {
      fx: cur.fx + (alvo.fx - cur.fx) * p,
      fy: cur.fy + (alvo.fy - cur.fy) * p,
      zoom: cur.zoom + (alvo.zoom - cur.zoom) * p,
    };
  }
  return cur;
}

/** Posição e escala da imagem dentro do card (px do card) para uma captura de altura hCss. */
function enquadrar(cam: { fx: number; fy: number; zoom: number }, hCss: number) {
  const k = (CARD.w * cam.zoom) / VW;
  const imgW = VW * k;
  const imgH = hCss * k;
  const left = Math.min(0, Math.max(CARD.w - imgW, CARD.w / 2 - cam.fx * k));
  const top = Math.min(0, Math.max(CARD.h - imgH, CARD.h / 2 - cam.fy * k));
  return { k, imgW, imgH, left, top };
}

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const CardTela: React.FC<{
  dados: DadosCard;
  /** segundo absoluto em que a Sequence começa */
  inicio: number;
  entrada: { at: number; de: "baixo" | "direita" };
  saida: { at: number; para: "esquerda" | "encolhe" };
}> = ({ dados, inicio, entrada, saida }) => {
  const frame = useCurrentFrame();
  const t = inicio + frame / FPS;
  const cam = cameraEm(dados.camera, t);

  // captura atual e a anterior (para o crossfade curto)
  let idx = 0;
  dados.shots.forEach((s, i) => {
    if (s.at <= t) idx = i;
  });
  const atual = dados.shots[idx];
  const anterior = idx > 0 ? dados.shots[idx - 1] : null;
  const fade = Math.min(0.16, anterior ? (atual.at - anterior.at) * 0.8 : 0.16);
  const opAtual = anterior ? interpolate(t, [atual.at, atual.at + fade], [0, 1], lim) : 1;

  // entrada com spring e saída por deslize
  const ent = spring({
    frame: Math.round((t - entrada.at) * FPS),
    fps: FPS,
    config: { damping: 18, stiffness: 120, mass: 0.9 },
  });
  const sai = interpolate(t, [saida.at, saida.at + 0.38], [0, 1], {
    ...lim,
    easing: Easing.bezier(0.5, 0, 0.75, 0),
  });
  const flutua = Math.sin(t * 1.1) * 5;
  const entX = entrada.de === "direita" ? (1 - ent) * 700 : 0;
  const entY = entrada.de === "baixo" ? (1 - ent) * 260 : 0;
  const saiX = saida.para === "esquerda" ? -sai * 760 : 0;
  const saiS = saida.para === "encolhe" ? 1 - sai * 0.12 : 1;

  const camada = (s: Shot, opacidade: number) => {
    const e = enquadrar(cam, s.alturaCss ?? VH);
    return (
      <Img
        key={s.src}
        src={staticFile(`capturas/${s.src}`)}
        style={{
          position: "absolute",
          left: e.left,
          top: e.top,
          width: e.imgW,
          height: e.imgH,
          opacity: opacidade,
        }}
      />
    );
  };

  const e = enquadrar(cam, atual.alturaCss ?? VH);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          borderRadius: 52,
          overflow: "hidden",
          backgroundColor: "#111111",
          border: `2px solid ${COR.borda}`,
          boxShadow:
            "0 50px 120px rgba(0,0,0,0.65), 0 0 80px rgba(178,247,89,0.06)",
          opacity: Math.min(ent * 1.4, 1) * (1 - sai),
          translate: `${entX + saiX}px ${entY + flutua}px`,
          scale: `${(0.94 + 0.06 * ent) * saiS}`,
        }}
      >
        {anterior && opAtual < 1 ? camada(anterior, 1) : null}
        {camada(atual, opAtual)}

        {dados.destaques.map((d, i) => {
          const op = interpolate(t, [d.de, d.de + 0.18, d.ate - 0.15, d.ate], [0, 1, 1, 0], lim);
          if (op <= 0) return null;
          const c = cameraEm(dados.camera, t);
          const q = enquadrar(c, atual.alturaCss ?? VH);
          const s = interpolate(t, [d.de, d.de + 0.3], [1.06, 1], {
            ...lim,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: q.left + d.x * q.k,
                top: q.top + d.y * q.k,
                width: d.w * q.k,
                height: d.h * q.k,
                borderRadius: 20,
                border: `5px solid ${COR.limao}`,
                boxShadow: `0 0 36px rgba(178,247,89,0.55), 0 0 0 3000px rgba(0,0,0,${0.2 * op})`,
                opacity: op,
                scale: `${s}`,
              }}
            />
          );
        })}

        {dados.taps.map((tp, i) => {
          const r = tp.rapido ? 0.4 : 1;
          const a = tp.at;
          if (t < a - 0.22 * r || t > a + 0.5 * r) return null;
          const x = e.left + tp.x * e.k;
          const y = e.top + tp.y * e.k;
          const press = interpolate(
            t,
            [a - 0.22 * r, a - 0.06 * r, a, a + 0.12 * r],
            [1.3, 1, 0.74, 1],
            lim,
          );
          const opDedo = interpolate(
            t,
            [a - 0.22 * r, a - 0.1 * r, a + 0.22 * r, a + 0.4 * r],
            [0, 1, 1, 0],
            lim,
          );
          const onda = interpolate(t, [a, a + 0.48 * r], [0, 1], {
            ...lim,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  position: "absolute",
                  left: x - 46,
                  top: y - 46,
                  width: 92,
                  height: 92,
                  borderRadius: 999,
                  border: `5px solid ${COR.limao}`,
                  opacity: (1 - onda) * (t >= a ? 0.9 : 0),
                  scale: `${1 + onda * 1.6}`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: x - 38,
                  top: y - 38,
                  width: 76,
                  height: 76,
                  borderRadius: 999,
                  backgroundColor: "rgba(244,244,242,0.55)",
                  border: "3px solid rgba(255,255,255,0.95)",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
                  opacity: opDedo,
                  scale: `${press}`,
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
