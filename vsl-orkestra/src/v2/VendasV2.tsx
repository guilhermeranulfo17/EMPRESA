import React from "react";
import { loadFont } from "@remotion/fonts";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import linha from "./linha.json";

/**
 * Vídeo de vendas v2 ("Conheça o Orkestra"), 1080x1920, 30 qps.
 * Fundo: vídeos reais do Mixkit escurecidos; por cima, motion graphics da marca e telas reais do sistema
 * como cartões flutuantes. Áudio pronto em public/v2/audio/mix.wav (scripts/v2/mixar.py).
 * Tempos de fala, legenda e cenas: src/v2/linha.json (scripts/v2/linha.py).
 */

export const FPS2 = 30;
export const W2 = 1080;
export const H2 = 1920;
export const DURACAO_V2 = Math.round(linha.duracao * FPS2);

const C = {
  limao: "#C0F05A",
  verde: "#6FD36A",
  verdeEscuro: "#1E7A3F",
  preto: "#0A0A0A",
  off: "#F4F4EE",
};

const BRICOLAGE = "Bricolage Grotesque";
const SERIF = "Instrument Serif";
loadFont({ family: BRICOLAGE, url: staticFile("v2/fontes/Bricolage-800.woff2"), weight: "800" });
loadFont({ family: BRICOLAGE, url: staticFile("v2/fontes/Bricolage-600.woff2"), weight: "600" });
loadFont({ family: SERIF, url: staticFile("v2/fontes/InstrumentSerif-italic.woff2"), weight: "400", style: "italic" });

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const useT = () => useCurrentFrame() / FPS2;

/** 0→1 com mola a partir do segundo `de`. */
const mola = (t: number, de: number, rigidez = 170, amortecimento = 20) =>
  t < de ? 0 : spring({ frame: Math.round((t - de) * FPS2), fps: FPS2, config: { stiffness: rigidez, damping: amortecimento } });
const fade = (t: number, de: number, dur = 0.25) => interpolate(t, [de, de + dur], [0, 1], lim);

// ---------------------------------------------------------------------------------------------
// Fundo: um plano por arquivo, com aproximação lenta e camada escura

const ESCURO: Record<string, number> = { c1: 0.5, c2: 0.55, c3: 0.52, c4: 0.38, c5: 0.55, c6: 0.5, c7: 0.55, c8: 0.56, c9: 0.35, c10: 0.55 };

const Fundo: React.FC = () => {
  const t = useT();
  const planos = linha.cenas.flatMap((c, ic) =>
    c.planos.map((p, ip) => {
      const prox = c.planos[ip + 1]?.ini ?? linha.cenas[ic + 1]?.ini ?? linha.duracao;
      return { ...p, fim: prox, cena: c.id };
    }),
  );
  const atual = linha.cenas.find((c) => t >= c.ini && t < c.fim) ?? linha.cenas[linha.cenas.length - 1];
  const escuro = ESCURO[atual.id] ?? 0.5;
  return (
    <AbsoluteFill style={{ backgroundColor: C.preto }}>
      {planos.map((p, i) => {
        const de = Math.round(p.ini * FPS2);
        const dur = Math.round((p.fim - p.ini) * FPS2);
        const k = interpolate(t, [p.ini, p.fim], [0, 1], lim);
        const zoom = 1.04 + 0.07 * k;
        const desloca = (i % 2 === 0 ? -1 : 1) * 18 * k;
        return (
          <Sequence key={p.arq + i} from={de} durationInFrames={dur} layout="none">
            <AbsoluteFill style={{ scale: `${zoom}`, translate: `${desloca}px 0px` }}>
              <OffthreadVideo src={staticFile(`v2/fundos/${p.arq}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {/* cena 9: fundo verde da marca em movimento */}
      {atual.id === "c9" ? (
        <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.verdeEscuro} 0%, rgba(10,10,10,0.6) 55%, ${C.verdeEscuro} 100%)`, mixBlendMode: "multiply", opacity: 0.95 }} />
      ) : null}
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${escuro})` }} />
      {/* vinheta e área da legenda */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 78%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Peças

/** Título: Bricolage ExtraBold; trechos entre * saem em Instrument Serif itálico verde-limão. */
const Titulo: React.FC<{ texto: string; de: number; t: number; top: number; tamanho?: number; ate?: number; centro?: boolean }> = ({
  texto,
  de,
  t,
  top,
  tamanho = 112,
  ate,
  centro = true,
}) => {
  const linhas = texto.split("\n");
  const sumir = ate ? interpolate(t, [ate - 0.25, ate], [1, 0], lim) : 1;
  let n = 0;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, textAlign: centro ? "center" : "left", opacity: sumir }}>
      {linhas.map((l, il) => (
        <div key={il} style={{ fontFamily: BRICOLAGE, fontWeight: 800, fontSize: tamanho, lineHeight: 1.0, letterSpacing: -tamanho * 0.035, color: C.off, textShadow: "0 6px 30px rgba(0,0,0,0.45)" }}>
          {l.split(/(\*[^*]+\*)/).filter(Boolean).map((parte, ip) => {
            const destaque = parte.startsWith("*");
            const palavras = parte.replace(/\*/g, "").split(/(\s+)/);
            return (
              <span key={ip}>
                {palavras.map((p, iw) => {
                  if (/^\s+$/.test(p)) return p;
                  const k = mola(t, de + 0.07 * n++, 190, 19);
                  return (
                    <span
                      key={iw}
                      style={{
                        display: "inline-block",
                        opacity: interpolate(k, [0, 0.6], [0, 1], lim),
                        translate: `0px ${(1 - k) * 46}px`,
                        ...(destaque
                          ? { fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: C.limao, fontSize: tamanho * 1.12, letterSpacing: -tamanho * 0.01 }
                          : {}),
                      }}
                    >
                      {p}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Ícone de app de mensagens genérico (sem marca de terceiros). */
const IconeMsg: React.FC<{ tam?: number }> = ({ tam = 64 }) => (
  <div style={{ width: tam, height: tam, borderRadius: tam * 0.26, backgroundColor: "#25D366", display: "grid", placeItems: "center", flexShrink: 0 }}>
    <svg width={tam * 0.58} height={tam * 0.58} viewBox="0 0 24 24">
      <path d="M12 3.2c-4.9 0-8.8 3.6-8.8 8.1 0 1.6.5 3.1 1.4 4.3L3.8 20l4.6-1.2c1.1.5 2.3.7 3.6.7 4.9 0 8.8-3.6 8.8-8.1S16.9 3.2 12 3.2z" fill="#fff" />
    </svg>
  </div>
);

const Notificacao: React.FC<{ t: number; de: number; top: number; titulo: string; texto: string; hora: string; apagada?: boolean; ate?: number; sobe?: number }> = ({
  t,
  de,
  top,
  titulo,
  texto,
  hora,
  apagada,
  ate,
  sobe = 0,
}) => {
  const k = mola(t, de, 160, 18);
  const sumir = ate ? interpolate(t, [ate, ate + 0.3], [1, 0], lim) : 1;
  if (t < de) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: top + sobe,
        padding: "26px 30px",
        borderRadius: 44,
        backgroundColor: apagada ? "rgba(30,30,28,0.72)" : "rgba(44,44,42,0.78)",
        backdropFilter: "blur(30px) saturate(1.4)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        opacity: interpolate(k, [0, 0.5], [0, 1], lim) * sumir * (apagada ? 0.72 : 1),
        translate: `0px ${(1 - k) * -90}px`,
        scale: `${0.94 + 0.06 * k}`,
      }}
    >
      <IconeMsg />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: BRICOLAGE, fontWeight: 800, fontSize: 38, color: C.off }}>{titulo}</span>
          <span style={{ fontFamily: BRICOLAGE, fontWeight: 600, fontSize: 28, color: "rgba(244,244,238,0.6)" }}>{hora}</span>
        </div>
        <div style={{ fontFamily: BRICOLAGE, fontWeight: 600, fontSize: 36, lineHeight: 1.26, color: "rgba(244,244,238,0.92)", marginTop: 4 }}>{texto}</div>
      </div>
    </div>
  );
};

/** Cartão com tela real do sistema: cantos arredondados, sombra suave, entra com movimento. */
const Cartao: React.FC<{
  t: number;
  de: number;
  x: number;
  y: number;
  w: number;
  h: number;
  raio?: number;
  ate?: number;
  children: React.ReactNode;
  escala?: number;
  inclina?: number;
}> = ({ t, de, x, y, w, h, raio = 44, ate, children, escala = 1, inclina = 0 }) => {
  const k = mola(t, de, 120, 17);
  const sumir = ate ? interpolate(t, [ate, ate + 0.3], [1, 0], lim) : 1;
  if (t < de - 0.05) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, perspective: 1800, opacity: interpolate(k, [0, 0.4], [0, 1], lim) * sumir }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: raio,
          overflow: "hidden",
          boxShadow: "0 40px 90px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35)",
          outline: "1px solid rgba(255,255,255,0.10)",
          transform: `translateY(${(1 - k) * 160}px) rotateX(${(1 - k) * 14 + inclina}deg) scale(${(0.9 + 0.1 * k) * escala})`,
          transformOrigin: "50% 100%",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Toque: círculo verde-limão que aperta e expande no ponto (coordenadas do cartão). */
const Toque: React.FC<{ t: number; em: number; x: number; y: number }> = ({ t, em, x, y }) => {
  const k = interpolate(t, [em - 0.18, em, em + 0.5], [0, 1, 2], lim);
  if (t < em - 0.2 || t > em + 0.55) return null;
  const aperta = k < 1 ? k : 1;
  const onda = k > 1 ? k - 1 : 0;
  return (
    <>
      <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 99, backgroundColor: "rgba(192,240,90,0.55)", border: `3px solid ${C.limao}`, scale: `${0.7 + 0.3 * aperta - 0.15 * onda}`, opacity: 1 - onda }} />
      {onda > 0 ? <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 99, border: `4px solid ${C.limao}`, scale: `${1 + onda * 1.6}`, opacity: 1 - onda }} /> : null}
    </>
  );
};

/** Anel de destaque sobre um trecho da tela. */
const Anel: React.FC<{ t: number; de: number; ate: number; x: number; y: number; w: number; h: number; raio?: number }> = ({ t, de, ate, x, y, w, h, raio = 18 }) => {
  const k = mola(t, de, 200, 16);
  const s = interpolate(t, [ate - 0.2, ate], [1, 0], lim);
  if (t < de || t > ate) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 10,
        top: y - 10,
        width: w + 20,
        height: h + 20,
        borderRadius: raio,
        border: `5px solid ${C.limao}`,
        boxShadow: `0 0 0 9999px rgba(0,0,0,${0.28 * k * s})`,
        opacity: k * s,
        scale: `${1.08 - 0.08 * k}`,
      }}
    />
  );
};

/** Selo pequeno (pílula) acima dos cartões. */
const Selo: React.FC<{ t: number; de: number; top: number; texto: string; ate?: number }> = ({ t, de, top, texto, ate }) => {
  const k = mola(t, de, 180, 18);
  const s = ate ? interpolate(t, [ate - 0.2, ate], [1, 0], lim) : 1;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: k * s, translate: `0px ${(1 - k) * 20}px` }}>
      <div style={{ fontFamily: BRICOLAGE, fontWeight: 600, fontSize: 34, color: C.preto, backgroundColor: C.limao, padding: "12px 30px", borderRadius: 99 }}>{texto}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Legenda: pequena, embaixo, no máximo 2 linhas, palavra falada em verde-limão

const Legenda: React.FC = () => {
  const t = useT();
  const pg = linha.legenda.find((p) => t >= p.ini - 0.08 && t < p.fim + 0.25);
  if (!pg) return null;
  const k = fade(t, pg.ini - 0.08, 0.12) * interpolate(t, [pg.fim + 0.12, pg.fim + 0.25], [1, 0], lim);
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 1668, height: 130, display: "flex", alignItems: "flex-start", justifyContent: "center", opacity: k }}>
      <div style={{ textAlign: "center", fontFamily: BRICOLAGE, fontWeight: 600, fontSize: 42, lineHeight: 1.28, color: "rgba(244,244,238,0.94)", textShadow: "0 2px 12px rgba(0,0,0,0.8)", letterSpacing: -0.3 }}>
        {pg.palavras.map((w, i) => {
          const ativa = t >= w.ini - 0.03 && t < w.fim + 0.05;
          return (
            <span key={i} style={{ color: ativa ? C.limao : undefined }}>
              {w.t}
              {i < pg.palavras.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Cenas

const Cena1: React.FC<{ t: number }> = ({ t }) => {
  if (t > 5.7) return null;
  const sumir = interpolate(t, [5.4, 5.65], [1, 0], lim);
  return (
    <AbsoluteFill style={{ opacity: sumir }}>
      <div style={{ position: "absolute", top: 760, width: "100%", textAlign: "center", opacity: fade(t, 0.1, 0.5) * interpolate(t, [1.85, 2.05], [1, 0], lim) }}>
        <div style={{ fontFamily: BRICOLAGE, fontWeight: 600, fontSize: 42, color: "rgba(244,244,238,0.8)" }}>sexta-feira</div>
        <div style={{ fontFamily: BRICOLAGE, fontWeight: 800, fontSize: 250, letterSpacing: -10, lineHeight: 1, color: C.off, textShadow: "0 10px 40px rgba(0,0,0,0.5)", scale: `${1.04 - 0.04 * mola(t, 0.1, 80, 20)}` }}>
          23:00
        </div>
      </div>
      <Notificacao t={t} de={1.9} top={1180} titulo="Mariana" hora="agora" texto="Oi! Quanto fica pra 50 pessoas no sábado?" />
    </AbsoluteFill>
  );
};

const Cena2: React.FC<{ t: number }> = ({ t }) => {
  if (t < 5.5 || t > 8.6) return null;
  return (
    <AbsoluteFill>
      <Titulo t={t} de={5.62} top={1040} texto={"Você tá\n*ocupado.*"} tamanho={140} ate={8.5} />
      <div style={{ position: "absolute", top: 1370, width: "100%", textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 76, color: "rgba(244,244,238,0.85)", opacity: fade(t, 7.7, 0.3) * interpolate(t, [8.25, 8.5], [1, 0], lim) }}>
        ou dormindo.
      </div>
    </AbsoluteFill>
  );
};

const Cena3: React.FC<{ t: number }> = ({ t }) => {
  if (t < 8.4 || t > 14.3) return null;
  const notif = interpolate(t, [12.2, 12.45], [1, 0], lim);
  const sumir = interpolate(t, [13.95, 14.15], [1, 0], lim);
  return (
    <AbsoluteFill style={{ opacity: sumir }}>
      <div style={{ opacity: notif }}>
        <div style={{ position: "absolute", top: 820, width: "100%", textAlign: "center", fontFamily: BRICOLAGE, fontWeight: 600, fontSize: 40, color: "rgba(244,244,238,0.85)", opacity: fade(t, 8.5) }}>
          sábado, 09:12
        </div>
        <Notificacao t={t} de={10.35} top={900} titulo="Outro buffet" hora="ontem, 23:06" texto="Temos o sábado livre! Quer que eu já reserve?" />
        <Notificacao t={t} de={8.65} top={900 + mola(t, 10.35, 160, 18) * 250} apagada titulo="Seu buffet" hora="09:12" texto="Bom dia, Mariana! Desculpa a demora..." />
      </div>
      <Titulo t={t} de={12.4} top={1020} texto={"Quem responde\n*primeiro,* fecha."} tamanho={104} />
    </AbsoluteFill>
  );
};

const Cena4: React.FC<{ t: number }> = ({ t }) => {
  if (t < 14.0 || t > 15.8) return null;
  const flash = interpolate(t, [14.12, 14.2, 14.6], [0, 0.85, 0], lim);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: `rgba(255,252,240,${flash})` }} />
      <Titulo t={t} de={14.25} top={720} texto={"Agora imagina\no *contrário.*"} tamanho={120} ate={15.65} />
    </AbsoluteFill>
  );
};

// demo real da landing: quadro da gravação para cada momento do vídeo (pontos casados com a fala)
const DEMO_CHAVES: [number, number][] = [
  [15.65, 0],
  [17.6, 57],
  [17.95, 66],
  [18.5, 108],
  [19.05, 150],
  [19.75, 190],
  [20.3, 215],
  [22.7, 249],
];
const quadroDemo = (t: number) => Math.round(interpolate(t, DEMO_CHAVES.map((c) => c[0]), DEMO_CHAVES.map((c) => c[1]), lim));
const TOQUES_DEMO: [number, number, number][] = [
  [17.95, 195, 445],
  [18.5, 312, 140],
  [19.05, 195, 818],
  [19.75, 195, 216],
];

const Cena5: React.FC<{ t: number }> = ({ t }) => {
  if (t < 15.5 || t > 22.8) return null;
  const W = 600;
  const esc = W / 390;
  const H = 844 * esc;
  const x = (1080 - W) / 2;
  const y = 330;
  const q = quadroDemo(t);
  return (
    <AbsoluteFill>
      <Selo t={t} de={15.75} top={232} texto="o link do seu buffet" ate={22.6} />
      <Cartao t={t} de={15.7} x={x} y={y} w={W} h={interpolate(t, [19.1, 19.45], [H, 702 * esc], { ...lim, easing: (v) => v * v * (3 - 2 * v) })} ate={22.45}>
        <Img src={staticFile(`v2/demo/quadros/${String(q).padStart(5, "0")}.jpg`)} style={{ width: W, height: H, position: "absolute", top: 0, left: 0 }} />
        {TOQUES_DEMO.map(([em, tx, ty]) => (
          <Toque key={em} t={t} em={em} x={tx * esc} y={ty * esc} />
        ))}
        <Anel t={t} de={20.9} ate={22.4} x={192 * esc} y={594 * esc} w={168 * esc} h={32 * esc} raio={14} />
      </Cartao>
    </AbsoluteFill>
  );
};

const Cena6: React.FC<{ t: number }> = ({ t }) => {
  if (t < 22.5 || t > 27.8) return null;
  const W = 800;
  const esc = W / 1062;
  const H = 1158 * esc;
  const x = (1080 - W) / 2;
  const recua = mola(t, 26.55, 140, 20);
  const linhas: [number, number, number][] = [
    [24.62, 423, 25.4],
    [25.4, 606, 25.95],
    [25.95, 879, 26.55],
  ];
  return (
    <AbsoluteFill style={{ opacity: interpolate(t, [27.45, 27.7], [1, 0], lim) }}>
      <Selo t={t} de={22.85} top={232} texto="Nova pré-reserva" />
      <Cartao t={t} de={22.85} x={x} y={330 - recua * 60} w={W} h={H} raio={40} escala={1 - 0.06 * recua}>
        <Img src={staticFile("v2/telas/pedido.png")} style={{ width: "100%", height: "100%" }} />
        {linhas.map(([de, yy, ate]) => (
          <Anel key={de} t={t} de={de} ate={ate} x={40 * esc} y={(yy - 42) * esc} w={980 * esc} h={84 * esc} raio={16} />
        ))}
      </Cartao>
      <Cartao t={t} de={26.55} x={(1080 - 800) / 2} y={1200} w={800} h={(416 * 800) / 1067} raio={46}>
        <Img src={staticFile("v2/telas/sinal.png")} style={{ width: "100%", height: "100%" }} />
      </Cartao>
    </AbsoluteFill>
  );
};

const AJUSTE: [number, string][] = [
  [27.7, "00"],
  [29.6, "01"],
  [29.95, "02"],
  [30.1, "03"],
  [30.25, "04"],
  [30.6, "05"],
];
const Cena7: React.FC<{ t: number }> = ({ t }) => {
  if (t < 27.6 || t > 32.2) return null;
  const W = 600;
  const esc = W / 390;
  const H = 844 * esc;
  const atual = [...AJUSTE].reverse().find(([de]) => t >= de)?.[1] ?? "00";
  const recua = mola(t, 30.95, 140, 20);
  return (
    <AbsoluteFill style={{ opacity: interpolate(t, [31.9, 32.1], [1, 0], lim) }}>
      <Selo t={t} de={27.85} top={232} texto="o preço continua sendo seu" ate={30.95} />
      <Cartao t={t} de={27.8} x={(1080 - W) / 2} y={330 - recua * 70} w={W} h={H} escala={1 - 0.1 * recua}>
        <Img src={staticFile(`v2/telas/ajuste/${atual}.png`)} style={{ width: "100%", height: "100%" }} />
        <Toque t={t} em={29.6} x={95 * esc} y={524 * esc} />
        <Anel t={t} de={29.85} ate={30.95} x={125 * esc} y={502 * esc} w={232 * esc} h={44 * esc} raio={14} />
        <Anel t={t} de={30.3} ate={31.0} x={10 * esc} y={735 * esc} w={122 * esc} h={34 * esc} raio={14} />
      </Cartao>
      <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${0.35 * recua})` }} />
      <Cartao t={t} de={30.95} x={(1080 - 780) / 2} y={820} w={780} h={(1256 * 780) / 1170} raio={40}>
        <Img src={staticFile("v2/telas/mensagem.png")} style={{ width: "100%", height: "100%" }} />
      </Cartao>
    </AbsoluteFill>
  );
};

const Cena8: React.FC<{ t: number }> = ({ t }) => {
  if (t < 32.0 || t > 37.9) return null;
  const pula = Math.abs(Math.sin((t - 33.3) * Math.PI * 1.6)) * 26;
  const seta = mola(t, 33.3, 170, 14);
  const minuto = mola(t, 36.75, 190, 14);
  return (
    <AbsoluteFill style={{ opacity: interpolate(t, [37.55, 37.75], [1, 0], lim) }}>
      <Titulo t={t} de={32.2} top={430} texto={"Teste\n*agora.*"} tamanho={170} />
      <div style={{ position: "absolute", top: 880, left: 110, right: 110, textAlign: "center", fontFamily: BRICOLAGE, fontWeight: 600, fontSize: 44, lineHeight: 1.2, color: C.off, textShadow: "0 4px 20px rgba(0,0,0,0.6)", opacity: fade(t, 33.2, 0.3) }}>
        monte um orçamento como se fosse o seu cliente
      </div>
      <div style={{ position: "absolute", top: 1040, width: "100%", display: "flex", justifyContent: "center", opacity: minuto, scale: `${0.7 + 0.3 * minuto}` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, backgroundColor: C.limao, color: C.preto, borderRadius: 99, padding: "14px 46px 22px" }}>
          <span style={{ fontFamily: BRICOLAGE, fontWeight: 800, fontSize: 92, letterSpacing: -3 }}>1</span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 92 }}>minuto</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1330 + pula, width: "100%", textAlign: "center", fontSize: 150, opacity: seta, scale: `${0.5 + 0.5 * seta}`, filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))" }}>
        👇
      </div>
    </AbsoluteFill>
  );
};

const OFERTA: [number, string][] = [
  [38.7, "Sua página com os seus pacotes"],
  [40.1, "Eu configuro com você em 20 minutos"],
  [41.8, "14 dias grátis, sem cartão"],
];
const Check: React.FC = () => (
  <div style={{ width: 76, height: 76, borderRadius: 99, backgroundColor: C.limao, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <svg width="44" height="44" viewBox="0 0 24 24">
      <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke={C.preto} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);
const Cena9: React.FC<{ t: number }> = ({ t }) => {
  if (t < 37.7 || t > 44.1) return null;
  return (
    <AbsoluteFill style={{ opacity: interpolate(t, [43.75, 43.95], [1, 0], lim) }}>
      <Titulo t={t} de={37.95} top={360} texto={"*Gostou?*"} tamanho={130} />
      {OFERTA.map(([de, texto], i) => {
        const k = mola(t, de, 180, 17);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 90,
              right: 90,
              top: 640 + i * 220,
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: "34px 40px",
              borderRadius: 40,
              backgroundColor: "rgba(10,10,10,0.55)",
              border: "1px solid rgba(192,240,90,0.28)",
              backdropFilter: "blur(14px)",
              opacity: interpolate(k, [0, 0.5], [0, 1], lim),
              translate: `${(1 - k) * -80}px 0px`,
            }}
          >
            <div style={{ scale: `${interpolate(k, [0, 1], [0.3, 1])}` }}>
              <Check />
            </div>
            <div style={{ fontFamily: BRICOLAGE, fontWeight: 800, fontSize: 50, lineHeight: 1.12, letterSpacing: -1, color: C.off }}>{texto}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Cena10: React.FC<{ t: number }> = ({ t }) => {
  if (t < 43.9) return null;
  const marca = mola(t, 44.45, 150, 20);
  return (
    <AbsoluteFill>
      <Titulo t={t} de={44.1} top={1090} texto={"Antes da próxima\n*sexta à noite.*"} tamanho={100} />
      <div style={{ position: "absolute", top: 1420, width: "100%", display: "flex", justifyContent: "center", opacity: marca, translate: `0px ${(1 - marca) * 24}px` }}>
        <Img src={staticFile("marca/orkestra-branco.png")} style={{ width: 360 }} />
      </div>
    </AbsoluteFill>
  );
};

export const VendasV2: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ backgroundColor: C.preto }}>
      <Fundo />
      <Cena1 t={t} />
      <Cena2 t={t} />
      <Cena3 t={t} />
      <Cena4 t={t} />
      <Cena5 t={t} />
      <Cena6 t={t} />
      <Cena7 t={t} />
      <Cena8 t={t} />
      <Cena9 t={t} />
      <Cena10 t={t} />
      <Legenda />
      <Audio src={staticFile("v2/audio/mix.wav")} />
    </AbsoluteFill>
  );
};
