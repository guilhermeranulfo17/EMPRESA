import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { COR, FPS, MANROPE } from "../tema";
import manifesto from "../../public/onboarding/manifesto.json";
import tempos from "../../public/onboarding/tempos.json";

/** Vídeo de onboarding (horizontal 1920x1080, tema claro): um capítulo por área de Minha empresa + o dia a dia. */

export const W_ON = 1920;
export const H_ON = 1080;
const ESC = 1920 / 1440; // px CSS do viewport capturado -> px do vídeo
const INTRO = 1.6; // cartão do capítulo antes da fala
const FIM = 0.8; // respiro depois da fala

type Caixa = { x: number; y: number; w: number; h: number };
type Quadro = { arquivo: string; foco: Caixa | null; cursor: { x: number; y: number } | null; clique: boolean };
type Passo = { id: string; texto: string; fala: string; quadros: Quadro[] };
type Capitulo = { id: string; titulo: string; passos: Passo[] };
type Tempos = Record<string, { duracao: number; passos: [number, number][] }>;

const CAPS = (manifesto as { capitulos: Capitulo[] }).capitulos;
const TEMPOS = tempos as unknown as Tempos;

export const duracaoCapitulo = (id: string) => INTRO + (TEMPOS[id]?.duracao ?? 10) + FIM;
export const capitulosOnboarding = CAPS.map((c, i) => ({ id: c.id, titulo: c.titulo, numero: i }));

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.bezier(0.45, 0, 0.2, 1);

/** Câmera que enquadra o foco (zoom moderado, nunca mostrando fora da captura). */
function camera(foco: Caixa | null) {
  if (!foco) return { s: 1, cx: W_ON / 2, cy: H_ON / 2 };
  const r = { x: foco.x * ESC, y: foco.y * ESC, w: foco.w * ESC, h: foco.h * ESC };
  const sW = (W_ON * 0.82) / Math.max(r.w, 1);
  const sH = (H_ON * 0.7) / Math.max(r.h, 1);
  // bloco alto (uma coluna inteira): aproxima pela largura e mostra a parte de cima
  const s = Math.max(1, Math.min(1.7, sW, Math.max(sH, Math.min(sW, 1.45))));
  const alto = r.h * s > H_ON * 0.9;
  return { s, cx: r.x + r.w / 2, cy: alto ? r.y + (H_ON * 0.45) / s : r.y + r.h / 2 };
}
/** Transforma um ponto da captura (px do vídeo) em ponto da tela com a câmera. */
function aplicar(cam: { s: number; cx: number; cy: number }, x: number, y: number) {
  const s = cam.s;
  // deslocamento que centraliza o foco, preso nas bordas
  let tx = W_ON / 2 - cam.cx * s;
  let ty = H_ON / 2 - cam.cy * s;
  tx = Math.min(0, Math.max(W_ON - W_ON * s, tx));
  ty = Math.min(0, Math.max(H_ON - H_ON * s, ty));
  return { x: x * s + tx, y: y * s + ty, tx, ty };
}

type Linha = { inicio: number; fim: number; q: Quadro; passo: Passo; idxPasso: number };

/** Linha do tempo de um capítulo: cada quadro com seu início e fim (segundos desde o começo da fala). */
function linhaDoTempo(cap: Capitulo): Linha[] {
  const t = TEMPOS[cap.id];
  const linhas: Linha[] = [];
  cap.passos.forEach((passo, i) => {
    const [a, b0] = t?.passos[i] ?? [i * 6, i * 6 + 6];
    const b = i < cap.passos.length - 1 ? (t?.passos[i + 1]?.[0] ?? b0) : b0 + FIM;
    const n = passo.quadros.length;
    passo.quadros.forEach((q, k) => {
      linhas.push({ inicio: a + ((b - a) * k) / n, fim: a + ((b - a) * (k + 1)) / n, q, passo, idxPasso: i });
    });
  });
  return linhas;
}

const Cursor: React.FC<{ x: number; y: number; aperta: number; onda: number }> = ({ x, y, aperta, onda }) => (
  <>
    {onda > 0 && onda < 1 ? (
      <div
        style={{
          position: "absolute",
          left: x - 34,
          top: y - 34,
          width: 68,
          height: 68,
          borderRadius: 999,
          border: `4px solid ${COR.limao}`,
          backgroundColor: "rgba(178,247,89,0.18)",
          opacity: 1 - onda,
          scale: `${0.6 + onda * 1.4}`,
        }}
      />
    ) : null}
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      style={{ position: "absolute", left: x - 6, top: y - 3, scale: `${1 - aperta * 0.18}`, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))" }}
    >
      <path d="M4 2l15 10.5-6.6 1.2 3.9 7.4-2.9 1.5-3.9-7.4L4.6 20z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  </>
);

export const OnboardingCapitulo: React.FC<{ capId: string; mostrarNumero?: boolean }> = ({ capId }) => {
  const frame = useCurrentFrame();
  const cap = CAPS.find((c) => c.id === capId)!;
  const numero = CAPS.findIndex((c) => c.id === capId);
  const t = frame / FPS - INTRO;
  const linhas = linhaDoTempo(cap);

  let i = linhas.findIndex((l) => t >= l.inicio && t < l.fim);
  if (i < 0) i = t < 0 ? 0 : linhas.length - 1;
  const atual = linhas[i];
  const anterior = i > 0 ? linhas[i - 1] : null;

  // câmera: transição suave do quadro anterior para o atual
  const camA = camera(anterior?.q.foco ?? null);
  const camB = camera(atual.q.foco);
  const p = anterior ? interpolate(t, [atual.inicio, atual.inicio + 0.55], [0, 1], { ...lim, easing: suave }) : 1;
  const cam = { s: camA.s + (camB.s - camA.s) * p, cx: camA.cx + (camB.cx - camA.cx) * p, cy: camA.cy + (camB.cy - camA.cy) * p };
  const origem = aplicar(cam, 0, 0);
  const fade = anterior ? interpolate(t, [atual.inicio, atual.inicio + 0.22], [0, 1], lim) : 1;

  // cursor: vai do último ponto até o alvo e clica perto do fim do quadro
  let cursor: React.ReactNode = null;
  if (atual.q.cursor) {
    const ult = [...linhas.slice(0, i)].reverse().find((l) => l.q.cursor)?.q.cursor ?? { x: 1440 * 0.62, y: 810 * 0.9 };
    const dur = atual.fim - atual.inicio;
    const tClique = atual.inicio + Math.max(0.45, dur * 0.62);
    const mv = interpolate(t, [atual.inicio + 0.1, tClique - 0.12], [0, 1], { ...lim, easing: suave });
    const px = (ult.x + (atual.q.cursor.x - ult.x) * mv) * ESC;
    const py = (ult.y + (atual.q.cursor.y - ult.y) * mv) * ESC;
    const pt = aplicar(cam, px, py);
    const aperta = atual.q.clique ? interpolate(t, [tClique - 0.06, tClique, tClique + 0.12], [0, 1, 0], lim) : 0;
    const onda = atual.q.clique ? interpolate(t, [tClique, tClique + 0.5], [0, 1], lim) : 0;
    cursor = <Cursor x={pt.x} y={pt.y} aperta={aperta} onda={onda} />;
  }

  const img = (q: Quadro, op: number) => (
    <Img
      key={q.arquivo}
      src={staticFile(`onboarding/${q.arquivo}`)}
      style={{
        position: "absolute",
        left: origem.tx,
        top: origem.ty,
        width: W_ON * cam.s,
        height: H_ON * cam.s,
        opacity: op,
      }}
    />
  );

  // barra de instrução: troca de texto a cada passo
  const inicioPasso = linhas.find((l) => l.idxPasso === atual.idxPasso)!.inicio;
  const entraTexto = interpolate(t, [inicioPasso, inicioPasso + 0.3], [0, 1], { ...lim, easing: suave });
  const introOp = interpolate(frame / FPS, [0, 0.25, INTRO - 0.35, INTRO], [0, 1, 1, 0], lim);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F4F4F2", fontFamily: MANROPE }}>
      {anterior && fade < 1 ? img(anterior.q, 1) : null}
      {img(atual.q, fade)}
      {cursor}

      {/* barra de instrução */}
      <div
        style={{
          position: "absolute",
          left: 48,
          bottom: 40,
          maxWidth: 1500,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "18px 30px 18px 18px",
          borderRadius: 22,
          backgroundColor: "#141414",
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          opacity: t < 0 ? 0 : 1,
        }}
      >
        <div
          style={{
            backgroundColor: COR.limao,
            color: "#141414",
            fontWeight: 800,
            fontSize: 30,
            borderRadius: 14,
            padding: "8px 16px",
            whiteSpace: "nowrap",
          }}
        >
          {numero + 1}.{atual.idxPasso + 1}
        </div>
        <div
          style={{
            color: COR.texto,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: -0.5,
            opacity: entraTexto,
            translate: `${(1 - entraTexto) * 16}px 0px`,
          }}
        >
          {atual.passo.texto}
        </div>
      </div>

      {/* cartão do capítulo */}
      {introOp > 0 ? (
        <AbsoluteFill
          style={{
            backgroundColor: "#141414",
            opacity: introOp,
            justifyContent: "center",
            paddingLeft: 160,
          }}
        >
          <div style={{ color: COR.limao, fontSize: 44, fontWeight: 800 }}>Parte {numero + 1}</div>
          <div style={{ color: COR.texto, fontSize: 104, fontWeight: 800, letterSpacing: -3 }}>{cap.titulo}</div>
        </AbsoluteFill>
      ) : null}

      <Sequence from={Math.round(INTRO * FPS)} layout="none">
        <Audio src={staticFile(`onboarding/audio/${capId}.wav`)} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Todos os capítulos em sequência. */
export const OnboardingCompleto: React.FC = () => {
  let inicio = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#F4F4F2" }}>
      {CAPS.map((c) => {
        const d = Math.round(duracaoCapitulo(c.id) * FPS);
        const s = (
          <Sequence key={c.id} from={inicio} durationInFrames={d} name={c.titulo}>
            <OnboardingCapitulo capId={c.id} />
          </Sequence>
        );
        inicio += d;
        return s;
      })}
    </AbsoluteFill>
  );
};

export const duracaoCompleto = () => CAPS.reduce((a, c) => a + Math.round(duracaoCapitulo(c.id) * FPS), 0);
